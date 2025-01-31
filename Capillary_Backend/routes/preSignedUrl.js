const AWS = require("aws-sdk");
const express = require("express");
const multer = require("multer");
require("dotenv").config();
const s3Controller = require("../controllers/awsS3Controller")

const s3Router = express();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "ap-south-1",
});

const s3 = new AWS.S3();

s3Router.post("/upload", upload.array("files"), async (req, res) => {
  try {
    const files = req.files;
    const folder = req.body.folder || "uploads";

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files provided for upload" });
    }

    const uploadPromises = files.map((file) => {
      const s3Params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${folder}/${Date.now()}_${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      return s3.upload(s3Params).promise();
    });

    const results = await Promise.all(uploadPromises);
    const fileUrls = results.map((result) => result.Location);

    res.status(200).json({
      message: "Files uploaded successfully",
      fileUrls,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ error: "Failed to upload files" });
  }
});


s3Router.post("/delete-s3-image",s3Controller.deleteImageFromS3Bucket)


module.exports = s3Router;
