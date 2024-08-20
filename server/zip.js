const express = require("express");
const multer = require("multer");
const unzipper = require("unzipper");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const upload = multer({ dest: path.join(__dirname, "uploads/tmp") }); // Use a temporary folder

app.use(cors());
let progressClient = null;

app.post("/upload", upload.single("file"), async (req, res) => {
  const zipPath = req.file.path;
  const outputDir = path.join(__dirname, "uploads");
  const convoName = req.body.convoName;

  let extractedFilesCount = 0;
  let totalJsonFiles = 0;

  console.log("zipPath:", zipPath);
  console.log("outputDir:", outputDir);

  try {
    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // First, count the total number of JSON files
    const countStream = fs.createReadStream(zipPath).pipe(unzipper.Parse());
    countStream.on("entry", function (entry) {
      const fileName = entry.path;
      const isJson = fileName.endsWith(".json");

      if (
        fileName.includes(
          `your_facebook_activity/messages/inbox/${convoName}`
        ) &&
        isJson
      ) {
        totalJsonFiles++;
      }
      entry.autodrain(); // Discard entries during the count pass
    });

    await new Promise((resolve) => countStream.on("close", resolve));

    console.log("Total JSON files to extract:", totalJsonFiles);

    // Now extract files and folders
    const extractStream = fs.createReadStream(zipPath).pipe(unzipper.Parse());

    extractStream.on("entry", function (entry) {
      const fileName = entry.path;
      const isJson = fileName.endsWith(".json");
      const isPhotoFolder = fileName.includes("photos/");
      const isAudioFolder = fileName.includes("audio/");
      const isVideoFolder = fileName.includes("videos/");

      if (
        fileName.includes(`your_facebook_activity/messages/inbox/${convoName}`)
      ) {
        const fullOutputPath = path.join(outputDir, path.basename(fileName));

        const outputDirPath = path.dirname(fullOutputPath);

        if (!fs.existsSync(outputDirPath)) {
          fs.mkdirSync(outputDirPath, { recursive: true });
        }

        if (
          entry.type === "Directory" &&
          !fileName.includes(
            `your_facebook_activity/messages/inbox/${convoName}/files/`
          ) &&
          !fileName.includes(
            `your_facebook_activity/messages/inbox/${convoName}/gifs/`
          )
        ) {
          // Handle folder entries
          console.log("Creating directory:", fullOutputPath);
          if (!fs.existsSync(fullOutputPath)) {
            fs.mkdirSync(fullOutputPath);
          }
          entry.autodrain(); // Just create the directory, no need to pipe
        } else if (isJson || isPhotoFolder || isAudioFolder || isVideoFolder) {
          // Handle file entries (JSON files, images, audio, video, etc.)
          console.log("Extracting file:", fullOutputPath);
          const outputStream = fs.createWriteStream(fullOutputPath);
          entry.pipe(outputStream).on("finish", () => {
            console.log("Extraction finished for:", fileName);
          });

          outputStream.on("error", (err) => {
            console.error("Stream error:", err);
          });

          outputStream.on("close", () => {
            if (isJson) extractedFilesCount++;
            const progress =
              Math.round((extractedFilesCount / totalJsonFiles) * 100 * 100) /
              100;

            console.log("Sending progress update:", progress);
            if (progressClient) {
              progressClient?.write(
                `data: ${JSON.stringify({ progress })}\n\n`
              );
              progressClient?.flushHeaders();
            }
          });
        } else {
          entry.autodrain(); // Skip unwanted files and folders
        }
      } else {
        entry.autodrain(); // Discard other entries
      }
    });

    extractStream.on("close", async () => {
      try {
        // Delete the ZIP file after extraction
        await fs.promises.unlink(zipPath);

        // Optionally, clean up the temporary upload directory
        fs.readdir(tempUploadDir, (err, files) => {
          if (err) {
            console.error("Error reading temporary directory:", err.message);
            return;
          }
          for (const file of files) {
            fs.unlink(path.join(tempUploadDir, file), (err) => {
              if (err) {
                console.error("Error deleting temporary file:", err.message);
              }
            });
          }
        });

        // Close the SSE connection
        if (progressClient) {
          progressClient.write(
            `data: ${JSON.stringify({ progress: 100 })}\n\n`
          );
          progressClient.end();
          progressClient = null;
        }

        const jsonFiles = await Promise.all(
          extractedFiles.map(async (filePath) => {
            const content = await fs.promises.readFile(filePath, "utf-8");
            return {
              fileName: path.basename(filePath),
              content: JSON.parse(content),
            };
          })
        );

        res.status(200).json({
          message: "Files extracted successfully.",
          files: jsonFiles,
        });
      } catch (err) {
        res
          .status(500)
          .send("Error deleting temporary ZIP file: " + err.message);
      }
    });

    extractStream.on("error", (err) => {
      res.status(500).send("Error processing ZIP file: " + err.message);
    });
  } catch (err) {
    res.status(500).send("Server error: " + err.message);
  }
});

app.get("/progress", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  console.log("Client connected to /progress");
  // Send initial progress
  res.write(`data: ${JSON.stringify({ progress: 0 })}\n\n`);

  // Store the response to use in the extractStream
  progressClient = res;
  console.log("progressClient - should be set to res");

  req.on("close", () => {
    console.log("Client disconnected");
    progressClient = null; // Handle client disconnect
  });
});

app.listen(3001, () => {
  console.log("Server started on http://localhost:3001");
});
