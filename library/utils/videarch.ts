import elasticlunr from "elasticlunr";
import { Kysely, sql } from "kysely";

import { DB } from "@/db/config";

type VideoMetadata = {
  id: string; // IPFS hash
  title: string;
  uploadedBy: string;
  description: string;
  capturedImages: string[];
  cover: string;
  summary: string;
  scenes: Array<{
    keywords: string[];
    description: string;
  }>;
};

function createSearchIndex() {
  try {
    return elasticlunr<{
      id: string;
      summary: string;
      keywords: string;
      descriptions: string;
    }>(function () {
      this.addField("summary");
      this.addField("keywords");
      this.addField("descriptions");
      this.setRef("id");
    });
  } catch (error) {
    console.error("Error creating search index:", error);
    throw error;
  }
}

async function indexVideo(db: Kysely<DB>, videoMetadata: VideoMetadata) {
  try {
    // Store in search table
    await db
      .insertInto("search")
      .onConflict((oc) => oc.column("id").doNothing())
      .values({
        id: videoMetadata.id, // Using IPFS hash as ID
        metadata: JSON.stringify(videoMetadata),
      })
      .execute();

    // Store in metadata table
    await db
      .insertInto("metadata")
      .onConflict((oc) =>
        oc.column("id").doUpdateSet({
          title: videoMetadata.title,
          uploadedBy: videoMetadata.uploadedBy,
          description: videoMetadata.description,
          capturedImages: videoMetadata.capturedImages as any,
          cover: videoMetadata.cover,
          summary: videoMetadata.summary,
          scenes: videoMetadata.scenes as any,
          updateAt: sql`CURRENT_TIMESTAMP`,
        })
      )
      .values({
        id: videoMetadata.id,
        title: videoMetadata.title,
        uploadedBy: videoMetadata.uploadedBy,
        description: videoMetadata.description,
        capturedImages: videoMetadata.capturedImages as any,
        cover: videoMetadata.cover,
        summary: videoMetadata.summary,
        scenes: videoMetadata.scenes as any,
      })
      .execute();

    // Prepare search document
    const keywords = videoMetadata.scenes
      .map((scene) => scene.keywords.join(" "))
      .join(" ");

    const descriptions = videoMetadata.scenes
      .map((scene) => scene.description)
      .join(" ");

    // Return document in format for elasticlunr
    return {
      id: videoMetadata.id,
      summary: videoMetadata.summary,
      keywords: keywords,
      descriptions: descriptions,
    };
  } catch (error) {
    console.error("Error indexing video:", error);
    throw error;
  }
}

async function loadSearchIndex(db: Kysely<DB>) {
  try {
    const index = createSearchIndex();

    // Load all search index from DB into search index
    const searchIndexes = await db
      .selectFrom("search")
      .select(["id", "metadata"])
      .execute();

    for (const searchIndex of searchIndexes) {
      try {
        const metadata = JSON.parse(searchIndex.metadata) as VideoMetadata;
        const searchDoc = {
          id: metadata.id || searchIndex.id,
          summary: metadata.summary,
          keywords: metadata.scenes.map((s) => s.keywords.join(" ")).join(" "),
          descriptions: metadata.scenes.map((s) => s.description).join(" "),
        };

        index.addDoc(searchDoc);
      } catch (parseError) {
        console.error("Error parsing search index metadata:", parseError);
        // Continue with next item rather than failing entire load
        continue;
      }
    }

    return index;
  } catch (error) {
    console.error("Error loading search index:", error);
    throw error;
  }
}

const initVideoSearchEngine = async (db: Kysely<DB>) => {
  try {
    const searchIndex = await loadSearchIndex(db);

    return {
      indexVideo: async (metadata: VideoMetadata) => {
        try {
          const searchDoc = await indexVideo(db, metadata);
          searchIndex.addDoc(searchDoc);
          return metadata.id;
        } catch (error) {
          console.error("Error in indexVideo:", error);
          throw error;
        }
      },

      search: async (query: string, limit = 5) => {
        try {
          const results = searchIndex.search(query, {
            fields: {
              summary: { boost: 2 },
              keywords: { boost: 1.5 },
              descriptions: { boost: 1 },
            },
            expand: true,
          });

          // Get top results based on limit
          const topResults = results.slice(0, limit);

          // Fetch complete metadata for each result
          const completeResults = await Promise.all(
            topResults.map(async (result) => {
              try {
                // Get the document from search index
                const doc = searchIndex.documentStore.getDoc(result.ref);

                // Fetch the complete metadata from the database
                const metadataRecord = await db
                  .selectFrom("metadata")
                  .where("id", "=", result.ref)
                  .selectAll()
                  .executeTakeFirst();

                // Return combined result
                return {
                  id: doc.id,
                  score: result.score,
                  metadata: metadataRecord || null,
                };
              } catch (resultError) {
                console.error("Error processing search result:", resultError);
                return null;
              }
            })
          );

          return completeResults.filter(
            (result): result is NonNullable<typeof result> => result !== null
          );
        } catch (error) {
          console.error("Error in search:", error);
          throw error;
        }
      },
    };
  } catch (error) {
    console.error("Error initializing video search engine:", error);
    throw error;
  }
};

export default initVideoSearchEngine;
