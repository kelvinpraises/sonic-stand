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

// TODO: if audio errors move on...
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
        { error: "Invalid or empty IpfsHash array" },
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
            console.log(`Skipping non-string IpfsHash: ${ipfsHash}`);
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
              `Skipping unsupported content type for IpfsHash: ${ipfsHash}`
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
            console.log(
              `Unexpected Object data type for image IpfsHash: ${ipfsHash}`
            );
            return null;
          } else {
            console.log(`Unsupported data type for IpfsHash: ${ipfsHash}`);
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
      tool_choice: { type: "tool", name: "analyze_media_context" },
      tools: [
        {
          name: "analyze_media_context",
          description:
            "Analyze images and audio from the current context and provide structured analysis",
          input_schema: {
            type: "object",
            properties: {
              summary: {
                type: "string",
                description:
                  "Overall summary of the media content and their relationship",
              },
              scenes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    keywords: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                      description:
                        "Key terms or concepts identified in the image",
                    },
                    description: {
                      type: "string",
                      description:
                        "Detailed description of the image incorporating relevant audio context",
                    },
                  },
                  required: ["keywords", "description"],
                },
              },
            },
            required: ["summary", "scenes"],
          },
        },
      ],
      max_tokens: 1024,
      system:
        "You are an AI assistant tasked with creating concise, visually impaired-friendly descriptions for a series of video stills, considering both the visual content and associated audio context.",
      messages: [
        {
          role: "user",
          content: [
            ...imageContents,
            {
              type: "text",
              text: `Audio transcription: "${audioTranscription}"

                Analyze each image sequentially, considering both the visual content and the provided audio transcription. Create a brief, one-sentence description for each image that summarizes the key visual aspects and incorporates relevant audio context.

                Provide your output as a JSON array of strings, with each string being a concise description of one image. Describe directly without using phrases like 'this image shows'. Ensure your descriptions are clear, specific, and accessible to visually impaired individuals, integrating audio context where relevant.
              `,
            },
          ],
        },
      ],
    });

    if (message.content[0].type === "text") {
      const upload = await pinata.upload.json(message);
      return NextResponse.json({ ipfsHash: upload.IpfsHash }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "Unexpected response format" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error processing images with Anthropic API" },
      { status: 500 }
    );
  }
}
