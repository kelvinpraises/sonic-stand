import { type NextRequest, NextResponse } from "next/server";

import { db as dbInstance } from "@/db";
import initVideoSearchEngine from "@/utils/videarch";

export async function POST(req: NextRequest) {
  try {
    // const query = req.query.query as string;
    // const limit = parseInt(req.query.limit as string) || 10;

    const db = dbInstance();

    console.log(req.body);

    const formData = await req.formData();
    const query = formData.get("query")?.toString() ?? "";
    const limit = Number(formData.get("limit") ?? 0);

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    const searchEngine = await initVideoSearchEngine(db);
    await searchEngine.indexVideo({
      id: "0xcc",
      summary:
        "A collection of letter representations showcasing different styles and formats, including uppercase and lowercase letters. The sequence includes letters 'Z', 'C', 'A', and 'b' in various designs from minimalist black text to animated cartoon-style characters. The images appear to be educational or design-oriented, demonstrating different ways to represent alphabet letters.",
      scenes: [
        {
          keywords: [
            "letter Z",
            "orange background",
            "black letter",
            "typography",
            "square format",
          ],
          description:
            "Black letter Z displayed prominently against a bright orange background in a square format",
        },
        {
          keywords: ["letter C", "pink", "curved", "cartoon style", "rounded"],
          description:
            "Pink curved letter C rendered in a cartoon style with smooth, rounded edges",
        },
        {
          keywords: [
            "letter A",
            "red",
            "cartoon",
            "animated",
            "character",
            "eyes",
            "mouth",
            "3D",
          ],
          description:
            "Red three-dimensional letter A designed as an animated character with expressive green eyes and an open mouth, showing personality",
        },
        {
          keywords: [
            "letter A",
            "outline",
            "typography",
            "uppercase",
            "lowercase",
            "educational",
          ],
          description:
            "Simple black outline of both uppercase and lowercase letter A in a clean, educational format",
        },
        {
          keywords: [
            "letter b",
            "lowercase",
            "black",
            "minimalist",
            "typography",
          ],
          description:
            "Minimalist black lowercase letter b on white background, showing clean typography design",
        },
        {
          keywords: [
            "letter Z",
            "orange background",
            "black letter",
            "typography",
            "square format",
          ],
          description:
            "Repeated image of black letter Z on orange background in square format",
        },
      ],
    });
    const results = searchEngine.search(query, limit);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
