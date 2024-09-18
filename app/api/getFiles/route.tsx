import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  const uploadsDirectory = path.join(
    "/home/benshaw_dev/messengerstats/server",
    "uploads"
  );

  console.log("Looking for files in:", uploadsDirectory);

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
