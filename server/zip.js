const express = require("express");
const multer = require("multer");
const unzipper = require("unzipper");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const app = express();
const upload = multer({ dest: path.join(__dirname, "uploads/tmp") }); // Use a temporary folder

app.use(cors());
app.use(cors({ origin: "*" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
let progressClient = null;

app.post("/upload", upload.single("file"), async (req, res) => {
  const zipPath = req.file.path;
  const outputDir = path.join(__dirname, "uploads");
  const tempUploadDir = path.join(__dirname, "uploads/tmp");
  const convoName = req.body.convoName;
  let extractedFilesCount = 0;
  let totalJsonFiles = 0;
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
        let outputPath;
        // Determine the correct output path for different file types
        if (isJson) {
          outputPath = path.join(outputDir, path.basename(fileName));
        } else if (isPhotoFolder) {
          outputPath = path.join(outputDir, "photos", path.basename(fileName));
        } else if (isAudioFolder) {
          outputPath = path.join(outputDir, "audio", path.basename(fileName));
        } else if (isVideoFolder) {
          outputPath = path.join(outputDir, "videos", path.basename(fileName));
        } else {
          entry.autodrain();
          return;
        }
        const outputDirPath = path.dirname(outputPath);
        if (!fs.existsSync(outputDirPath)) {
          fs.mkdirSync(outputDirPath, { recursive: true });
        }
        if (entry.type === "Directory") {
          if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath);
          }
          entry.autodrain(); // Just create the directory, no need to pipe
        } else {
          console.log("Extracting file:", outputPath);
          const outputStream = fs.createWriteStream(outputPath);
          entry.pipe(outputStream).on("finish", () => {});
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
              progressClient.write(`data: ${JSON.stringify({ progress })}\n\n`);
              progressClient.flushHeaders();
            }
          });
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
        res.status(200).json({
          message: "Files extracted successfully.",
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
app.listen(3001, "0.0.0.0", () => {
  console.log("Server started on http://34.129.91.231:3001");
});
