import { Send, UserCircle2, Paperclip } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { fetcAllChats, sendMessageComments } from "../../../api/service/adminServices";

const ChatComments = ({ reqId }) => {
  const userId = localStorage.getItem("userId");
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeChatTopic, setActiveChatTopic] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
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

  const handleSendMessage = async () => {
    try {
      let attachmentUrl = null;
      
      // Upload file if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        // const uploadResponse = await uploadAttachment(formData);
        // if (uploadResponse.status === 200) {
        //   attachmentUrl = uploadResponse.data.fileUrl;
        // }
      }

      // Prepare message object
      if (newMessage.trim() || attachmentUrl) {
        const newMsg = {
          reqId: reqId,
          senderId: userId,
          username: "Current User",
          userImage: null,
          message: newMessage,
          attachmentUrl: attachmentUrl,
          timestamp: new Date(),
          topic: activeChatTopic || "General Discussion",
        };

        const response = await sendMessageComments(newMsg);
        
        // Update chat messages
        setChatMessages([...chatMessages, newMsg]);
        
        // Reset states
        setNewMessage("");
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex h-full">
      {/* Topics Sidebar */}
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
          {filteredMessages.map((msg) => (
            <div key={msg._id} className="flex items-start space-x-3">
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
                      <a 
                        href={msg.attachmentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary hover:underline"
                      >
                        View Attachment
                      </a>
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
            <Paperclip size={20} className={selectedFile ? "text-primary" : "text-gray-500"} />
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
            className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComments;