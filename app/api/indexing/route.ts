import Anthropic from "@anthropic-ai/sdk";
import { ImageBlockParam } from "@anthropic-ai/sdk/resources/index.mjs";
import { Livepeer } from "@livepeer/ai";
import { type NextRequest, NextResponse } from "next/server";

import { pinata } from "@/services/pinata";

const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;
type SupportedImageType = (typeof SUPPORTED_IMAGE_TYPES)[number];

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const capturedImages = formData.getAll("capturedImages");
    const extractedAudio = formData.get("extractedAudio") as Blob | null;

    if (!extractedAudio || !(extractedAudio instanceof File)) {
      return NextResponse.json(
        { error: "Invalid or missing audio data" },
        { status: 400 }
      );
    }

    if (!Array.isArray(capturedImages) || capturedImages.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty images array" },
        { status: 400 }
      );
    }

    const livepeer = new Livepeer({
      httpBearer: "c98baf31-5203-4b42-9b50-578a16342201",
    });

    const anthropic = new Anthropic();

    const result = await livepeer.generate.audioToText({
      audio: extractedAudio,
      modelId: "openai/whisper-large-v3",
    });
    const audioTranscription = result.textResponse?.text;

    const imageContents: ImageBlockParam[] = (
      await Promise.all(
        capturedImages.map(async (ipfsHash) => {
          if (typeof ipfsHash !== "string") {
            console.log(`Skipping non-string image: ${ipfsHash}`);
            return null;
          }

          const file = await pinata.gateways.get(ipfsHash);

          if (
            !file.data ||
            !file.contentType ||
            !SUPPORTED_IMAGE_TYPES.includes(
              file.contentType as SupportedImageType
            )
          ) {
            console.log(
              `Skipping unsupported content type for image: ${ipfsHash}`
            );
            return null;
          }

          let base64Data: string;

          if (file.data instanceof Blob) {
            const arrayBuffer = await file.data.arrayBuffer();
            base64Data = Buffer.from(arrayBuffer).toString("base64");
          } else if (typeof file.data === "string") {
            base64Data = Buffer.from(file.data).toString("base64");
          } else if (file.data instanceof Object) {
            console.log(`Unexpected Object data type for image: ${ipfsHash}`);
            return null;
          } else {
            console.log(`Unsupported data type for image: ${ipfsHash}`);
            return null;
          }

          return {
            type: "image",
            source: {
              type: "base64",
              media_type: file.contentType as SupportedImageType,
              data: base64Data,
            },
          };
        })
      )
    ).filter((content): content is ImageBlockParam => content !== null);

    if (imageContents.length === 0) {
      return NextResponse.json(
        { error: "No valid image content found" },
        { status: 400 }
      );
    }

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      tool_choice: { type: "tool", name: "create_video_index" },
      tools: [
        {
          name: "create_video_index",
          description:
            "Create a searchable index for video content based on images and audio",
          input_schema: {
            type: "object",
            properties: {
              metadata: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "Generated title for the video content",
                  },
                  description: {
                    type: "string",
                    description: "Overall summary of the video content",
                  },
                  duration: {
                    type: "number",
                    description:
                      "Estimated duration in seconds (if discernible)",
                  },
                  keywords: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                    description:
                      "Key terms or concepts identified in the video",
                  },
                },
                required: ["title", "description", "keywords"],
              },
              timestamps: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    time: {
                      type: "number",
                      description: "Estimated timestamp in seconds",
                    },
                    description: {
                      type: "string",
                      description: "Description of the scene at this timestamp",
                    },
                    keywords: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                      description: "Keywords relevant to this timestamp",
                    },
                  },
                  required: ["description", "keywords"],
                },
              },
              topics: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      description: "Topic name",
                    },
                    relevance: {
                      type: "number",
                      description: "Relevance score 0-1",
                    },
                    timestamps: {
                      type: "array",
                      items: {
                        type: "number",
                      },
                      description: "Timestamps where this topic appears",
                    },
                  },
                  required: ["name", "relevance"],
                },
              },
              transcript: {
                type: "string",
                description: "Cleaned and formatted transcript of the audio",
              },
            },
            required: ["metadata", "timestamps", "transcript"],
          },
        },
      ],
      max_tokens: 4096,
      system:
        "You are an advanced AI system that creates detailed, searchable indexes for video content based on video frames and audio transcripts.",
      messages: [
        {
          role: "user",
          content: [
            ...imageContents,
            {
              type: "text",
              text: `Audio transcription: "${audioTranscription}"

                Analyze these video frames and audio transcript to create a comprehensive, searchable index for this video. 
                
                Create a rich video index that includes:
                - Meaningful title and description
                - Key topics and concepts
                - Timestamps with descriptions
                - Organized transcript
                
                Focus on creating an index that would be useful for semantic search and content discovery.
              `,
            },
          ],
        },
      ],
    });

    // if (message.tool_calls && message.tool_calls.length > 0) {
    if (message.content[0].type === "text") {
      //   const indexData = JSON.parse(message.tool_calls[0].input);
      const indexData = JSON.parse(message.content[0].text);
      const upload = await pinata.upload.json(indexData);
      return NextResponse.json({ indexCID: upload.IpfsHash }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "No valid index data generated" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error processing video for indexing:", error);
    return NextResponse.json(
      { error: "Error processing video for indexing" },
      { status: 500 }
    );
  }
}
