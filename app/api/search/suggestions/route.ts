import db from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";

type ProductSuggestion = RowDataPacket & {
  searchKeyword: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchWord = searchParams.get("q")?.trim();

    // search word exists?
    // N => Return empty array
    if (!searchWord) {
      return NextResponse.json([], { status: 200 });
    }

    // Search for all matching words
    const [rows] = await db.query<ProductSuggestion[]>(
      `SELECT DISTINCT
      search_keyword AS searchKeyword
      FROM products
      WHERE search_keyword
      LIKE ?`,
      [`${searchWord}%`],
    );

    return NextResponse.json(rows, { status: 200 });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
