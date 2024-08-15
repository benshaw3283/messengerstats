import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest, res: NextResponse) {
  const uploadsDirectory = path.join(process.cwd(), "server", "uploads");
  const files = fs
    .readdirSync(uploadsDirectory)
    .filter((file) => file.endsWith(".json"));
  console.log("files in api route", files);

  const fileObjects = files.map((fileName) => {
    const filePath = path.join(uploadsDirectory, fileName);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    return {
      fileName,
      content: JSON.parse(fileContent),
    };
  });

  return NextResponse.json({ fileObjects }, { status: 200 });
}
