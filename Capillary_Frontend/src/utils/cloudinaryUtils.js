import axios from "axios";

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export const uploadCloudinary = async (file, fileType) => {
  console.log("Selected file:", file);
  console.log("File type:", file.type);

  // Get today's date in "YYYY-MM-DD" format
  const today = new Date().toISOString().split("T")[0];

  // Define the folder structure: main folder > date > file type (or general category)
  const folderPath = `Capilary_tech/${today}/${fileType}`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "Capilary_tech"); // Replace with your Cloudinary upload preset
  formData.append("folder", folderPath);

  try {
    const { data } = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      formData
    );
    console.log("Cloudinary Response:", data);

    return { url: data.secure_url, format: data.format, folder: data.folder };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};
