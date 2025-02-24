const AWS = require("aws-sdk");
const express = require("express");
const multer = require("multer");
require("dotenv").config();

const s3Router = express();

// Configure multer with file size limits
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit per file
    files: 10, // Maximum 10 files at once
  },
});

// Configure body parser limits
s3Router.use(express.json({ limit: "100mb" }));
s3Router.use(express.urlencoded({ extended: true, limit: "100mb" }));

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3({
  // Configure S3 client with higher timeout
  httpOptions: {
    timeout: 300000, // 5 minutes
    connectTimeout: 5000, // 5 seconds
  },
  maxRetries: 3,
});

// Error handling middleware
s3Router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        error: "File size is too large. Maximum size allowed is 100MB",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(413).json({
        error: "Too many files. Maximum 10 files allowed",
      });
    }
  }
  next(error);
});

s3Router.post("/upload", upload.array("files"), async (req, res) => {
  try {
    const files = req.files;
    const { fileType } = req.body;
    const date = new Date();
    let newReqId;
    const { reqId } = req.query;

    console.log("Received ReqId:", reqId);

    // Generate new reqId if not provided
    if (!reqId || reqId === "undefined") {
      const reqid = `INBH${String(date.getDate()).padStart(2, "0")}${String(
        date.getMonth() + 1
      ).padStart(2, "0")}${String(date.getFullYear()).slice(-2)}${
        Math.floor(Math.random() * 100) + 1
      }`;
      newReqId = reqid;
    } else {
      newReqId = reqId;
    }

    // Validate files
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files provided for upload" });
    }

    // Check total size of all files
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    if (totalSize > 500 * 1024 * 1024) {
      // 500MB total limit
      return res.status(413).json({
        error: "Total file size exceeds 500MB limit",
      });
    }

    const folder = `PO-Uploads/${newReqId}/${fileType}`;
    console.log("Folder Path:", folder);

    // Upload files to S3 with better error handling
    const uploadPromises = files.map(async (file) => {
      try {
        const uniqueFileName = `${Date.now()}_${file.originalname}`;
        const s3Params = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: `${folder}/${uniqueFileName}`,
          Body: file.buffer,
          ContentType: file.mimetype,
          // Add server-side encryption
          ServerSideEncryption: "AES256",
        };

        return await s3.upload(s3Params).promise();
      } catch (error) {
        console.error(`Error uploading file ${file.originalname}:`, error);
        throw new Error(
          `Failed to upload ${file.originalname}: ${error.message}`
        );
      }
    });

    const results = await Promise.allSettled(uploadPromises);

    // Check for failed uploads
    const failedUploads = results.filter(
      (result) => result.status === "rejected"
    );
    if (failedUploads.length > 0) {
      console.error("Some files failed to upload:", failedUploads);
      return res.status(500).json({
        error: "Some files failed to upload",
        details: failedUploads.map((f) => f.reason.message),
      });
    }

    // Generate pre-signed URLs only for successful uploads
    const fileUrls = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => {
        const params = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: result.value.Key,
          Expires: 60 * 60 * 24 * 7, // 7 days
        };
        return s3.getSignedUrl("getObject", params);
      });

    res.status(200).json({
      message: "Files uploaded successfully",
      fileUrls,
      newReqId,
    });
  } catch (error) {
    console.error("Error in upload route:", error);
    res.status(500).json({
      error: "Failed to upload files",
      details: error.message,
    });
  }
});

module.exports = s3Router;
