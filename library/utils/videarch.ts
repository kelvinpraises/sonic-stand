import elasticlunr from "elasticlunr";
import { Kysely } from "kysely";

import { DB } from "@/db/config";

type VideoMetadata = {
  id: string; // IPFS hash
  summary: string;
  scenes: Array<{
    keywords: string[];
    description: string;
  }>;
};

function createSearchIndex() {
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
}

async function indexVideo(db: Kysely<DB>, videoMetadata: VideoMetadata) {
  // Store in Postgres
  await db
    .insertInto("videos")
    .onConflict((oc) => oc.column("id").doNothing())
    .values({
      id: videoMetadata.id, // Using IPFS hash as ID
      metadata: JSON.stringify(videoMetadata),
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
}

async function loadSearchIndex(db: Kysely<DB>) {
  const index = createSearchIndex();

  // Load all videos from DB into search index
  const videos = await db
    .selectFrom("videos")
    .select(["id", "metadata"])
    .execute();

  for (const video of videos) {
    const metadata = JSON.parse(
      JSON.stringify(video.metadata)
    ) as VideoMetadata;
    const searchDoc = {
      id: metadata.id,
      summary: metadata.summary,
      keywords: metadata.scenes.map((s) => s.keywords.join(" ")).join(" "),
      descriptions: metadata.scenes.map((s) => s.description).join(" "),
    };
    index.addDoc(searchDoc);
  }

  return index;
}

const initVideoSearchEngine = async (db: Kysely<DB>) => {
  const searchIndex = await loadSearchIndex(db);

  return {
    indexVideo: async (metadata: VideoMetadata) => {
      const searchDoc = await indexVideo(db, metadata);
      searchIndex.addDoc(searchDoc);
      return metadata.id;
    },

    search: (query: string, limit = 5) => {
      const results = searchIndex.search(query, {
        fields: {
          summary: { boost: 2 },
          keywords: { boost: 1.5 },
          descriptions: { boost: 1 },
        },
        expand: true,
      });

      return results.slice(0, limit).map((result) => {
        const doc = searchIndex.documentStore.getDoc(result.ref);
        return {
          id: doc.id,
          score: result.score,
          summary: doc.summary,
        };
      });
    },
  };
};

export default initVideoSearchEngine;
