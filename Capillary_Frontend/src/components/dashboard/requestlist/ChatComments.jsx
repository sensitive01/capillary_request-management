import { Send, UserCircle2, Paperclip, FileText, Image, File, Download } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { fetcAllChats, sendMessageComments } from "../../../api/service/adminServices";
import { uploadCloudinary } from "../../../utils/cloudinaryUtils";

const ChatComments = ({ reqId }) => {
  const userId = localStorage.getItem("userId");
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeChatTopic, setActiveChatTopic] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetcAllChats(reqId);
        if (response.status === 200) {
          setChatMessages(response.data.chatData.commentLogs);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };
    fetchChats();
  }, [reqId]);

  const chatTopics = [
    "Head of Dept",
    "Business Finance",
    "Vendor Management",
    "Legal",
    "Info Security",
    "PO Team",
    "Head of Finance",
    "Payments",
    "Other Queries",
  ];

  const filteredMessages = activeChatTopic
    ? chatMessages.filter((msg) => msg.topic === activeChatTopic)
    : chatMessages;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const downloadFile = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || isUploading) return;

    try {
      setIsUploading(true);
      let attachmentUrl = null;
      let attachmentType = null;
      let attachmentName = null;

      if (selectedFile) {
        try {
          const uploadResponse = await uploadCloudinary(selectedFile);
          if (uploadResponse.url) {
            attachmentUrl = uploadResponse.url;
            attachmentType = selectedFile.type;
            attachmentName = selectedFile.name;
          }
        } catch (error) {
          console.error("Error uploading file to Cloudinary:", error);
          return;
        }
      }

      const newMsg = {
        reqId: reqId,
        senderId: userId,
        username: "Current User",
        userImage: null,
        message: newMessage,
        attachmentUrl,
        attachmentType,
        attachmentName,
        timestamp: new Date(),
        topic: activeChatTopic || "General Discussion",
      };

      const response = await sendMessageComments(newMsg);
      if (response.status === 200) {
        setChatMessages(prevMessages => [...prevMessages, newMsg]);
        setNewMessage("");
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return File;
    if (fileType.startsWith('image/')) return Image;
    if (fileType.includes('pdf')) return FileText;
    return File;
  };

  const renderAttachment = (url, fileType, fileName) => {
    const isImage = fileType?.startsWith('image/');
    const isPDF = fileType?.includes('pdf');
    const FileIcon = getFileIcon(fileType);
    const displayName = fileName || 'Attachment';

    const downloadButton = (
      <button
        onClick={() => downloadFile(url, fileName)}
        className="flex items-center space-x-2 text-primary hover:text-primary/80 mt-2"
      >
        <Download size={16} />
        <span className="text-sm">Download {isImage ? 'Image' : isPDF ? 'PDF' : 'File'}</span>
      </button>
    );

    if (isImage) {
      return (
        <div className="max-w-xs bg-gray-50 p-2 rounded-lg">
          <img 
            src={url} 
            alt={displayName} 
            className="max-w-full max-h-48 rounded-lg object-contain"
          />
          <div className="mt-2">
            <div className="text-sm text-gray-600 truncate">{displayName}</div>
            {downloadButton}
          </div>
        </div>
      );
    }

    if (isPDF) {
      return (
        <div className="max-w-xs bg-gray-50 p-2 rounded-lg">
          <div className="border rounded-lg p-2 bg-white">
            <div className="flex items-center space-x-2 mb-2">
              <FileText size={20} className="text-primary" />
              <span className="text-sm font-medium truncate">{displayName}</span>
            </div>
            <iframe
              src={url}
              className="w-full h-48"
              title="PDF Preview"
            >
              <p>PDF preview not available</p>
            </iframe>
          </div>
          {downloadButton}
        </div>
      );
    }

    return (
      <div className="max-w-xs bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-3 mb-2">
          <FileIcon size={24} className="text-primary" />
          <span className="text-sm font-medium truncate">{displayName}</span>
        </div>
        {downloadButton}
      </div>
    );
  };

  return (
    <div className="flex h-full">
      <div className="w-1/4 bg-gray-100 border-r p-4 space-y-2">
        <h3 className="text-xl font-semibold text-primary mb-4">Chat Topics</h3>
        <div
          onClick={() => setActiveChatTopic(null)}
          className={`p-3 rounded-lg cursor-pointer ${
            activeChatTopic === null
              ? "bg-primary text-white"
              : "hover:bg-gray-200"
          }`}
        >
          All Discussions
        </div>
        {chatTopics.map((topic, index) => (
          <div
            key={index}
            onClick={() => setActiveChatTopic(topic)}
            className={`p-3 rounded-lg cursor-pointer ${
              activeChatTopic === topic
                ? "bg-primary text-white"
                : "hover:bg-gray-200"
            }`}
          >
            {topic}
          </div>
        ))}
      </div>

      <div className="w-3/4 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredMessages.map((msg, index) => (
            <div key={index} className="flex items-start space-x-3">
              {msg.userImage ? (
                <img
                  src={msg.userImage}
                  alt={msg.senderName}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <UserCircle2 className="w-10 h-10 text-gray-400" />
              )}
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{msg.senderName}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg mt-1">
                  <p>{msg.message}</p>
                  {msg.attachmentUrl && (
                    <div className="mt-2">
                      {renderAttachment(msg.attachmentUrl, msg.attachmentType, msg.attachmentName)}
                    </div>
                  )}
                  {msg.topic && (
                    <span className="text-xs text-primary mt-1 block">
                      Tag to: {msg.topic}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t p-4 flex items-center space-x-3">
          <input
            id="message"
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg"
            autoComplete="off"
          />

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label 
            htmlFor="file-upload" 
            className="cursor-pointer p-2 hover:bg-gray-100 rounded-lg"
          >
            <Paperclip 
              size={20} 
              className={`${selectedFile ? "text-primary" : "text-gray-500"} ${
                isUploading ? "animate-pulse" : ""
              }`} 
            />
          </label>
          {selectedFile && (
            <span className="text-xs text-gray-500 truncate max-w-[100px]">
              {selectedFile.name}
            </span>
          )}

          <select
            value={activeChatTopic || ""}
            onChange={(e) => setActiveChatTopic(e.target.value || null)}
            className="p-2 border rounded-lg"
          >
            <option value="">Select Department</option>
            {chatTopics.map((topic, index) => (
              <option key={index} value={topic}>
                {topic}
              </option>
            ))}
          </select>

          <button
            onClick={handleSendMessage}
            disabled={isUploading || (!newMessage.trim() && !selectedFile)}
            className={`${
              isUploading || (!newMessage.trim() && !selectedFile)
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90"
            } text-white p-2 rounded-lg`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComments;