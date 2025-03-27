import {
    Send,
    UserCircle2,
    Paperclip,
    FileText,
    Image,
    File,
    Download,
    Loader2, // Added Loader icon for spinning
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import {
    fetcAllChats,
    fetchEmployeesByTopic,
    sendMessageComments,
} from "../../../api/service/adminServices";
import uploadFiles from "../../../utils/s3BucketConfig";

const ChatComments = ({ reqId, reqid }) => {
    const userId = localStorage.getItem("capEmpId");
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [activeChatTopic, setActiveChatTopic] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false); // New state for loading
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    // New state for employee tagging
    const [topicEmployees, setTopicEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const chatTopics = [
        "Head of Dept",
        "Business Finance",
        "Vendor Management",
        "Legal Team",
        "Info Security",
        "Head of Finance",
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const response = await fetcAllChats(reqId);
                if (response.status === 200) {
                    setChatMessages(response.data.chatData.commentLogs);
                    setTimeout(scrollToBottom, 100);
                }
            } catch (error) {
                console.error("Error fetching chats:", error);
            }
        };
        fetchChats();
    }, [reqId]);

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    // Fetch employees when a topic is selected
    useEffect(() => {
        const fetchEmployees = async () => {
            if (activeChatTopic) {
                console.log(activeChatTopic);
                try {
                    const response = await fetchEmployeesByTopic(
                        activeChatTopic,
                        reqId
                    );
                    if (response.status === 200) {
                        setTopicEmployees(response.data.empData || []);
                        // Reset selected employee when topic changes
                        setSelectedEmployee(null);
                    }
                } catch (error) {
                    console.error("Error fetching employees for topic:", error);
                    setTopicEmployees([]);
                }
            } else {
                // Reset employees when no topic is selected
                setTopicEmployees([]);
                setSelectedEmployee(null);
            }
        };

        fetchEmployees();
    }, [activeChatTopic]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const convertUrlToBase64 = async (url) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error("Error converting to base64:", error);
            throw error;
        }
    };

    const downloadFile = async (url, filename) => {
        try {
            const base64Data = await convertUrlToBase64(url);
            const link = document.createElement("a");
            link.href = base64Data;
            link.download = filename || "download";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error downloading file:", error);
            window.open(url, "_blank");
        }
    };

    const handleSendMessage = async () => {
        if ((!newMessage.trim() && !selectedFile) || isUploading || isSendingMessage) return;

        try {
            setIsUploading(true);
            setIsSendingMessage(true); // Set loading state
            let attachmentUrl = null;
            let attachmentType = null;
            let attachmentName = null;

            if (selectedFile) {
                try {
                    const uploadResponse = await uploadFiles(
                        selectedFile,
                        "chat",
                        reqid
                    );
                    if (uploadResponse && uploadResponse.data.fileUrls[0]) {
                        attachmentUrl = uploadResponse.data.fileUrls[0];
                        attachmentType = selectedFile.type;
                        attachmentName = selectedFile.name;
                    } else {
                        throw new Error("Upload response is invalid");
                    }
                } catch (error) {
                    console.error("Error uploading file:", error);
                    setIsUploading(false);
                    setIsSendingMessage(false);
                    return;
                }
            }

            const newMsg = {
                reqId: reqId,
                senderId: userId,
                senderName: "You",
                userImage: null,
                message: newMessage.trim(),
                attachmentUrl,
                attachmentType,
                attachmentName,
                timestamp: new Date().toISOString(),
                topic: activeChatTopic || "General Discussion",
                // Add tagged employee information
                taggedEmployeeId: selectedEmployee?._id || null,
                taggedEmployeeName: selectedEmployee?.full_name || selectedEmployee?.hodName || null,
                taggedEmployeeEmail: selectedEmployee?.company_email_id || selectedEmployee?.hodEmail
            };

            console.log("New message", newMsg);

            const response = await sendMessageComments(newMsg);
            if (response.status === 200) {
                setChatMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        ...newMsg,
                        timestamp: new Date(newMsg.timestamp),
                    },
                ]);

                setNewMessage("");
                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsUploading(false);
            setIsSendingMessage(false); // Reset loading state
        }
    };

    const getFileIcon = (fileType) => {
        if (!fileType) return File;
        if (fileType.startsWith("image/")) return Image;
        if (fileType.includes("pdf")) return FileText;
        return File;
    };

    const renderAttachment = (url, fileType, fileName) => {
        const isImage = fileType?.startsWith("image/");
        const isPDF = fileType?.includes("pdf");
        const FileIcon = getFileIcon(fileType);
        const displayName = fileName || "Attachment";

        const handleDownload = async (e) => {
            e.preventDefault();
            await downloadFile(url, fileName);
        };

        const downloadButton = (
            <button
                onClick={handleDownload}
                className="flex items-center space-x-2 text-primary hover:text-primary/80 mt-2"
            >
                <Download size={16} />
                <span className="text-sm">
                    Download {isImage ? "Image" : isPDF ? "PDF" : "File"}
                </span>
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
                        <div className="text-sm text-gray-600 truncate">
                            {displayName}
                        </div>
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
                            <span className="text-sm font-medium truncate">
                                {displayName}
                            </span>
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
                    <span className="text-sm font-medium truncate">
                        {displayName}
                    </span>
                </div>
                {downloadButton}
            </div>
        );
    };

    const filteredMessages = activeChatTopic
        ? chatMessages.filter((msg) => msg.topic === activeChatTopic)
        : chatMessages;

    return (
        <div className="flex h-screen">
            <div className="w-1/4 bg-gray-100 border-r p-4 overflow-y-auto">
                <h3 className="text-xl font-semibold text-primary mb-4">
                    Chat Topics
                </h3>
                <div className="space-y-2">
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
            </div>

            <div className="w-3/4 flex flex-col h-full">
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
                                    <span className="font-semibold">
                                        {msg.senderName}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(
                                            msg.timestamp
                                        ).toLocaleString()}
                                    </span>
                                </div>
                                <div className="bg-gray-100 p-3 rounded-lg mt-1">
                                    <p>{msg.message}</p>
                                    {msg.attachmentUrl && (
                                        <div className="mt-2">
                                            {renderAttachment(
                                                msg.attachmentUrl,
                                                msg.attachmentType,
                                                msg.attachmentName
                                            )}
                                        </div>
                                    )}
                                    {msg.topic && (
                                        <span className="text-xs text-primary mt-1 block">
                                            Tag to: {msg.topic}
                                        </span>
                                    )}
                                    {msg.taggedEmployeeName && (
                                        <span className="text-xs text-green-600 mt-1 block">
                                            Tagged: {msg.taggedEmployeeName}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="border-t p-4 bg-white">
                    <div className="flex items-center space-x-3">
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
                                className={`${
                                    selectedFile
                                        ? "text-primary"
                                        : "text-gray-500"
                                } ${isUploading ? "animate-pulse" : ""}`}
                            />
                        </label>
                        {selectedFile && (
                            <span className="text-xs text-gray-500 truncate max-w-[100px]">
                                {selectedFile.name}
                            </span>
                        )}

                        {activeChatTopic && topicEmployees.length > 0 && (
                            <select
                                value={selectedEmployee?._id || ""}
                                onChange={(e) => {
                                    const selectedEmp = topicEmployees.find(
                                        (emp) => (emp._id === e.target.value || emp.company_email_id === e.target.value)
                                    );
                                    setSelectedEmployee(selectedEmp || null);
                                }}
                                className="p-2 border rounded-lg"
                            >
                                <option value="">Tag Employee</option>
                                {topicEmployees.map((employee) => (
                                    <option
                                        key={employee._id || employee.company_email_id}
                                        value={employee._id || employee.company_email_id}
                                    >
                                        {employee.full_name}
                                    </option>
                                ))}
                            </select>
                        )}

                        <button
                            onClick={handleSendMessage}
                            disabled={
                                isUploading ||
                                isSendingMessage ||
                                (!newMessage.trim() && !selectedFile)
                            }
                            className={`${
                                isUploading ||
                                isSendingMessage ||
                                (!newMessage.trim() && !selectedFile)
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-primary hover:bg-primary/90"
                            } text-white p-2 rounded-lg flex items-center justify-center`}
                        >
                            {isSendingMessage ? (
                                <Loader2 
                                    size={20} 
                                    className="animate-spin" 
                                />
                            ) : (
                                <Send size={20} />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatComments;