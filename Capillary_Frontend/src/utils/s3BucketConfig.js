// import axios from "axios";

// const uploadFiles = async (files, fileType,reqId) => {
//   try {
//     console.log("files", files);
//     const formData = new FormData();

//     formData.append("files", files);

//     formData.append("fileType", fileType);

//     const response = await axios.post(
//       `${import.meta.env.VITE_BASE_URL}/upload-s3/upload?reqId=${reqId}`,
      
//       formData,
//       {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       }
//     );

//     const { fileUrls } = response.data;
//     console.log("response", response);

//     console.log("Uploaded file URLs:", fileUrls);
//     return response;
//   } catch (error) {
//     console.error("Error uploading files:", error);
//     throw new Error("Failed to upload files");
//   }
// };

// export default uploadFiles;



import axios from "axios";

const uploadFiles = async (files, fileType, reqId) => {
  try {
    console.log("Starting upload with files:", files);
    const formData = new FormData();

    // Handle multiple files
    if (Array.isArray(files)) {
      files.forEach((file) => {
        formData.append("files", file);
      });
    } else if (files instanceof FileList) {
      // Handle FileList object
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });
    } else if (files instanceof File) {
      // Handle single file
      formData.append("files", files);
    } else {
      throw new Error("Invalid file format");
    }

    formData.append("fileType", fileType);

    // Log FormData contents for debugging
    for (let pair of formData.entries()) {
      console.log('FormData content:', pair[0], pair[1]);
    }

    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/upload-s3/upload?reqId=${reqId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // Add timeout and size configurations
        timeout: 300000, // 5 minutes
        maxContentLength: 500 * 1024 * 1024, // 500MB
        maxBodyLength: 500 * 1024 * 1024, // 500MB
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log('Upload progress:', percentCompleted, '%');
        },
      }
    );

    const { fileUrls, newReqId } = response.data;
    console.log("Upload successful:", {
      fileUrls,
      newReqId,
      status: response.status
    });

    return response;
  } catch (error) {
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    // Handle specific error cases
    if (error.response?.status === 413) {
      throw new Error("File size too large. Maximum size allowed is 100MB per file or 500MB total.");
    }
    if (error.code === "ECONNABORTED") {
      throw new Error("Upload timeout - please try again with a smaller file or better connection");
    }
    if (error.response?.status === 400) {
      throw new Error(error.response.data.error || "Invalid upload request");
    }

    throw new Error(`Failed to upload files: ${error.message}`);
  }
};

export default uploadFiles;