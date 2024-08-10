const express = require("express");
const multer = require("multer");
const unzipper = require("unzipper");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const upload = multer({ dest: path.join(__dirname, "uploads/tmp") }); // Use a temporary folder

app.use(cors());

app.post("/upload", upload.single("file"), async (req, res) => {
  const zipPath = req.file.path;
  const outputDir = path.join(__dirname, "uploads");

  const tempUploadDir = path.join(__dirname, "uploads/tmp");
  const convoName = req.body.convoName;

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
        const outputPath = path.join(outputDir, path.basename(fileName));
        entry.pipe(fs.createWriteStream(outputPath));
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

        res.status(200).send("Files extracted successfully.");
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

app.listen(3001, () => {
  console.log("Server started on http://localhost:3001");
});
