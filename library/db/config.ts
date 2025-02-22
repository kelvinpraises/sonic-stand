import { Generated, Kysely, Selectable, sql } from "kysely";

export interface DB {
  videos: {
    id: string;
    metadata: string;
    createAt: Generated<Date>; // TODO: make as iso string
    updateAt: Generated<Date>; // TODO: make as iso string
  };
}

export type VideosTable = Selectable<DB["videos"]>;

export const syncSchema = async (db: Kysely<DB>) => {
  const tables = await db.introspection.getTables();
  const hasVideosTable = tables.some((t) => t.name === "videos");

  if (!hasVideosTable) {
    await db.schema
      .createTable("videos")
      .addColumn("id", "text", (col) => col.notNull().unique())
      .addColumn("metadata", "text", (col) => col.notNull())
      .addColumn("createAt", "timestamp", (col) =>
        col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
      )
      .addColumn("updateAt", "timestamp", (col) =>
        col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
      )
      .execute();
  }
};
