const express = require("express");
const multer = require("multer");
const unzipper = require("unzipper");
const cors = require("cors");
const { Storage } = require("@google-cloud/storage");
const path = require("path");

const app = express();
const upload = multer({ dest: path.join(__dirname, "uploads/tmp") }); // Temporary local folder for uploads
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();
// Google Cloud Storage setup
const bucketName = "messenger_stats";

const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION,
});
const bucket = storage.bucket(bucketName);

app.use(cors({ origin: "http://localhost:3000" }));

let progressClient = null;

app.post("/upload", upload.single("file"), async (req, res) => {
  const zipPath = req.file.path;

  // Generate a unique folder name using timestamp and random string
  const uniqueFolderName = `${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 15)}`;
  const userFolder = `uploads/${uniqueFolderName}/`;

  const convoName = req.body.convoName;
  let extractedFilesCount = 0;
  let totalJsonFiles = 0;

  try {
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

    // Now extract files and upload them to Google Cloud Storage
    const extractStream = fs.createReadStream(zipPath).pipe(unzipper.Parse());

    extractStream.on("entry", async function (entry) {
      const fileName = entry.path;
      const isJson = fileName.endsWith(".json");
      const isPhotoFolder = fileName.includes("photos/");
      const isAudioFolder = fileName.includes("audio/");
      const isVideoFolder = fileName.includes("videos/");

      if (
        fileName.includes(`your_facebook_activity/messages/inbox/${convoName}`)
      ) {
        let outputPath;

        // Determine the correct output path for different file types in Google Cloud Storage
        if (isJson) {
          outputPath = path.join(userFolder, path.basename(fileName));
        } else if (isPhotoFolder) {
          outputPath = path.join(userFolder, "photos", path.basename(fileName));
        } else if (isAudioFolder) {
          outputPath = path.join(userFolder, "audio", path.basename(fileName));
        } else if (isVideoFolder) {
          outputPath = path.join(userFolder, "videos", path.basename(fileName));
        } else {
          entry.autodrain();
          return;
        }

        if (entry.type === "Directory") {
          entry.autodrain(); // Just create the directory, no need to pipe
        } else {
          const file = bucket.file(outputPath);
          const outputStream = file.createWriteStream();

          entry.pipe(outputStream).on("finish", () => {
            if (isJson) extractedFilesCount++;
            const progress =
              Math.round((extractedFilesCount / totalJsonFiles) * 100 * 100) /
              100;

            console.log("Sending progress update:", progress);
            if (progressClient) {
              progressClient.write(`data: ${JSON.stringify({ progress })}\n\n`);
              progressClient.flushHeaders();
            }
          });

          outputStream.on("error", (err) => {
            console.error("Stream error:", err);
          });
        }
      } else {
        entry.autodrain(); // Discard other entries
      }
    });

    extractStream.on("close", async () => {
      try {
        // Delete the temporary ZIP file after extraction
        await fs.promises.unlink(zipPath);

        // Close the SSE connection
        if (progressClient) {
          progressClient.write(
            `data: ${JSON.stringify({ progress: 100 })}\n\n`
          );
          progressClient.end();
          progressClient = null;
        }

        res.status(200).json({
          message: "Files extracted and uploaded successfully.",
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
