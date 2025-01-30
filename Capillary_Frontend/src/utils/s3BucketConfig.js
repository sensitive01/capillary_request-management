import axios from "axios";

const uploadFiles = async (files, fileType) => {
  try {
    console.log("files", files);
    const formData = new FormData();

    formData.append("files", files);

    formData.append("fileType", fileType);

    const response = await axios.post(
      `https://porequests.corp.capillarytech.com/upload-s3/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const { fileUrls } = response.data;

    console.log("Uploaded file URLs:", fileUrls);
    return fileUrls;
  } catch (error) {
    console.error("Error uploading files:", error);
    throw new Error("Failed to upload files");
  }
};

export default uploadFiles;
