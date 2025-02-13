import React, { useState } from "react";
import { Copy } from "lucide-react";
import { generateApiCrediantial } from "../../../../api/service/adminServices";

const Toast = ({ message, type, onClose }) => (
  <div
    className={`fixed top-20 right-4 py-2 px-4 rounded-md shadow-lg z-50 
    ${type === "success" ? "bg-green-500" : "bg-red-500"}
    text-white animate-fade-in-down`}
    style={{
      animation: "slideIn 0.5s ease-out",
    }}
  >
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-white hover:text-gray-200 focus:outline-none"
      >
        ×
      </button>
    </div>
  </div>
);

const DarwinBoxPage = () => {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast(null);

    setTimeout(() => {
      setToast({ message, type });
    }, 100);

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await generateApiCrediantial(email);
      console.log(response);
      if (response.status === 201) {
        setPassword(response.data.password);
        setToken(response.data.secretKey);
        showToast("Credentials generated successfully!");
      } else if (response.status === 400) {
        showToast(response.response.data.message,"error");
      }
    } catch (error) {
      // Display the error message from the response if available
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to generate credentials";
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard!");
    } catch (error) {
      showToast("Failed to copy to clipboard", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 relative">
      {/* Toast Portal Container - Moved down */}
      <div className="fixed top-16 right-0 p-4 z-50">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>

      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-primary">
          Token Generator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Token"}
          </button>
        </form>

        {token && password && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg relative">
              <label className="block text-sm font-medium mb-1">Token:</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={token}
                  readOnly
                  className="w-full bg-transparent pr-10"
                />
                <button
                  onClick={() => copyToClipboard(token)}
                  className="absolute right-2 text-primary hover:text-primary/80"
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg relative">
              <label className="block text-sm font-medium mb-1">
                Password:
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={password}
                  readOnly
                  className="w-full bg-transparent pr-10"
                />
                <button
                  onClick={() => copyToClipboard(password)}
                  className="absolute right-2 text-primary hover:text-primary/80"
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DarwinBoxPage;
