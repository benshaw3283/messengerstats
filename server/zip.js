const express = require("express");
const multer = require("multer");
const unzipper = require("unzipper");
const cors = require("cors");
const { Storage } = require("@google-cloud/storage");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver"); // Library to zip files
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables from .env file

const app = express();
const upload = multer({ dest: path.join(__dirname, "uploads/tmp") }); // Temporary local folder for uploads

// Google Cloud Storage setup
const bucketName = "messenger_stats";
const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION,
});
const bucket = storage.bucket(bucketName);

app.use(cors({ origin: "http://localhost:3000" }));

app.post("/upload", upload.single("file"), async (req, res) => {
  const zipPath = req.file.path;

  // Generate a unique folder name using timestamp and random string
  const uniqueFolderName = `${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 15)}`;
  const tempDir = path.join(__dirname, `uploads/${uniqueFolderName}/`);

  const convoName = req.body.convoName;

  try {
    // Step 1: Extract only the folder with convoName from the uploaded ZIP file
    await fs.promises.mkdir(tempDir, { recursive: true });

    const extractStream = fs.createReadStream(zipPath).pipe(unzipper.Parse());
    extractStream.on("entry", async (entry) => {
      const fileName = entry.path;
      if (
        fileName.startsWith(
          `your_facebook_activity/messages/inbox/${convoName}`
        )
      ) {
        const outputPath = path.join(tempDir, path.basename(fileName));
        entry.pipe(fs.createWriteStream(outputPath));
      } else {
        entry.autodrain(); // Discard other entries
      }
    });

    await new Promise((resolve, reject) => {
      extractStream.on("close", resolve);
      extractStream.on("error", reject);
    });

    // Step 2: Zip the extracted folder (convoName)
    const outputZipPath = path.join(__dirname, `${uniqueFolderName}.zip`);
    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputZipPath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      archive.pipe(output);

      archive.directory(tempDir, false); // Zip the entire extracted folder
      archive.finalize();

      output.on("close", resolve);
      archive.on("error", reject);
    });

    // Step 3: Upload the ZIP archive to Google Cloud Storage
    const file = bucket.file(`${uniqueFolderName}.zip`);
    await bucket.upload(outputZipPath, {
      destination: file,
      gzip: true,
      metadata: {
        cacheControl: "no-cache",
      },
    });

    // Step 4: Clean up: delete temporary files and directories
    fs.rmSync(tempDir, { recursive: true, force: true });
    fs.unlinkSync(zipPath); // delete uploaded zip file
    fs.unlinkSync(outputZipPath); // delete created zip archive

    // Respond to client with the URL to access the uploaded file
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${uniqueFolderName}.zip`;

    res.status(200).json({
      message: "Files extracted, compressed, and uploaded successfully.",
      fileUrl: publicUrl, // You can use this URL on the client side to access the file
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error: " + err.message);
  }
});

app.listen(3001, () => {
  console.log("Server started on http://localhost:3001");
});
