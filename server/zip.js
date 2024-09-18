const express = require("express");
const multer = require("multer");
const unzipper = require("unzipper");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const rimraf = require("rimraf");
const upload = multer({ dest: path.join(__dirname, "uploads/tmp") });

app.use(cors({ origin: "*" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.options("/upload", cors());

app.use((req, res, next) => {
  if (!req.timedout) next();
});
app.post("/upload", upload.single("file"), async (req, res) => {
  console.log("Reached upload route.");
  if (!req.file) {
    console.error("No file uploaded.");
    return res.status(400).json({ message: "No file uploaded." });
  }
  const zipPath = req.file.path;
  const outputDir = path.join(__dirname, "uploads");
  const tempUploadDir = path.join(__dirname, "uploads/tmp");
  const convoName = req.body.convoName;

  console.log(`Received ZIP file: ${zipPath}`);
  try {
    console.log("Starting extraction...");
    const extractStream = fs.createReadStream(zipPath).pipe(unzipper.Parse());
    extractStream.on("entry", async function (entry) {
      const fileName = entry.path;
      const isJson = fileName.endsWith(".json");
      const isPhotoFolder = fileName.includes("photos/");
      const isAudioFolder = fileName.includes("audio/");
      const isVideoFolder = fileName.includes("videos/");
      let outputPath;

      if (
        fileName.includes(`your_facebook_activity/messages/inbox/${convoName}`)
      ) {
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
          await fs.promises.mkdir(outputDirPath, { recursive: true });
        }
        if (entry.type === "Directory") {
          if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath);
          }
          entry.autodrain();
        } else {
          console.log(`Extracting file: ${outputPath}`);
          const outputStream = fs.createWriteStream(outputPath);
          entry.pipe(outputStream).on("finish", () => {});
          outputStream.on("error", (err) => {
            console.error("Stream error:", err);
          });
        }
      } else {
        entry.autodrain();
      }
    });

    const cleanupTempFiles = async () => {
      try {
        await rimraf(tempUploadDir);
        console.log("Temporary files cleaned up.");
      } catch (err) {
        console.error("Error during cleanup:", err);
      }
    };

    extractStream.on("close", async () => {
      try {
        console.log("Extraction complete. Cleaning up...");
        await fs.promises.unlink(zipPath);
        await cleanupTempFiles();
        res.status(200).json({ message: "Files extracted successfully." });
      } catch (err) {
        console.error("Error during cleanup:", err.message);
        res.status(500).send("Error during cleanup: " + err.message);
      }
    });

    extractStream.on("error", (err) => {
      console.error("Extraction error:", err);
      res.status(500).send("Error processing ZIP file: " + err.message);
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).send("Server error: " + err.message);
    console.log("error" + err.message);
  }
});
const server = app.listen(3001, "0.0.0.0", () => {
  console.log("Server started on http://34.129.91.231:3001");
});
server.timeout = 20 * 60 * 1000;
