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

  const tempUploadDir = path.join(__dirname, "uploads/tmp");
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

    // Create a read stream and process the ZIP file
    const fileStream = fs.createReadStream(zipPath);
    const extractStream = unzipper.Parse();

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

    fileStream.pipe(extractStream);

    extractStream.on("entry", function (entry) {
      const fileName = entry.path;
      const isJson = fileName.endsWith(".json");

      if (
        fileName.includes(
          `your_facebook_activity/messages/inbox/${convoName}`
        ) &&
        isJson
      ) {
        console.log("Found matching JSON file:", fileName);
        const outputPath = path.join(outputDir, path.basename(fileName));
        console.log("Writing to:", outputPath);
        const outputStream = fs.createWriteStream(outputPath);

        entry.pipe(outputStream).on("finish", () => {
          console.log("Piping finished for:", fileName);
        });

        outputStream.on("error", (err) => {
          console.error("Stream error:", err);
        });

        // Track the size of extracted data
        outputStream.on("close", () => {
          extractedFilesCount++;
          const progress =
            Math.round((extractedFilesCount / totalJsonFiles) * 100 * 100) /
            100;

          console.log("Sending progress update:", progress);
          console.log("progressClient should be on - under progress update");
          if (progressClient) {
            progressClient?.write(`data: ${JSON.stringify({ progress })}\n\n`);
            progressClient?.flushHeaders();
          } else {
            console.log("progressClient is null, cannot send progress update");
          }
        });
      } else {
        entry.autodrain(); // Discard other entries
      }
    });

    extractStream.on("close", async () => {
      try {
        // Delay deletion of the ZIP file until processing is complete
        await fs.promises.unlink(zipPath);

        // Delete all files in the uploads/tmp directory
        setTimeout(() => {
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
        }, 300);

        // Close the SSE connection
        if (progressClient) {
          progressClient.write(
            `data: ${JSON.stringify({ progress: 100 })}\n\n`
          );
          progressClient.end();
          progressClient = null;
        }

        res.status(200).json({ message: "Files extracted successfully." });
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
