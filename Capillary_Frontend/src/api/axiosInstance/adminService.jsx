import axios from "axios";

export const adminServices = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

adminServices.interceptors.request.use(
  (config) => {
    const empToken = localStorage.getItem("empAccessToken");
    const extractedToken = empToken ? empToken.accessToken : null;

    if (extractedToken) {
      config.headers.Authorization = `Bearer ${extractedToken}`;
      console.log("Adding token to headers:", extractedToken); // Debugging token
    }

    return config;
  },
  (error) => {
    console.log("Error in Axios interceptor request", error);
    return Promise.reject(error);
  }
);

adminServices.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.log("Error in Axios interceptor response", error);
      const { status, message } = error.response;
      if (status === 401 && message === "Session Time Out") {
        localStorage.removeItem("empAccessToken");
        console.log("Token removed due to session timeout.");
       
      } else {
        console.log("Error:", error.response.data);
      }
    } else {
      console.log("Error:", error.message);
    }
    return Promise.reject(error);
  }
);
