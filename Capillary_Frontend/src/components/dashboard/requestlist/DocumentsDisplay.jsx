import { FaFilePdf } from "react-icons/fa";
import { formatDateToDDMMYY } from "../../../utils/dateFormat";

const DocumentsDisplay = ({ request }) => {
    const showDocuments = ["Invoice-Pending", "Approved"].includes(
        request.status
    );

    const getCleanFileName = (url) => {
        try {
            let fileName = url.split("/").pop();
            fileName = fileName.split("?")[0];
            fileName = decodeURIComponent(fileName);
            fileName = fileName
                .replace(/[-_]/g, " ")
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
            return fileName.replace(/\.[^/.]+$/, "");
        } catch (error) {
            console.error("Error parsing filename:", error);
            return "Document";
        }
    };

    if (!showDocuments) return null;

    const DocumentCard = ({ title, documents, isPO = false }) => (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-primary/10 px-6 py-4">
                <h3 className="text-xl font-semibold text-primary">{title}</h3>
            </div>
            <div className="p-6">
                {isPO ? (
                    documents?.poLink ? (
                        <DocumentItem
                            link={documents.poLink}
                            uploadInfo={documents.uploadedBy}
                            uploadDate={documents.uploadedOn}
                        />
                    ) : (
                        <p className="text-gray-500 italic">
                            No PO documents available
                        </p>
                    )
                ) : documents?.length > 0 ? (
                    <div className="space-y-6">
                        {documents.map((doc, index) => (
                            <DocumentItem
                                key={index}
                                link={doc.invoiceLink}
                                uploadInfo={doc.uploadedBy}
                                uploadDate={doc.uploadedOn}
                                showDivider={index !== documents.length - 1}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 italic">
                        No invoice documents available
                    </p>
                )}
            </div>
        </div>
    );

    const DocumentItem = ({
        link,
        uploadInfo,
        uploadDate,
        showDivider = false,
    }) => (
        <div className={`${showDivider ? "border-b pb-6" : ""}`}>
            <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-200"
            >
                <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                    <FaFilePdf className="text-red-500 text-xl" />
                </div>
                <span className="text-gray-700 font-medium group-hover:text-primary transition-colors">
                    {getCleanFileName(link)}
                </span>
            </a>
            <div className="mt-3 px-4 space-y-1">
                <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">
                        Uploaded by:
                    </span>
                    <span className="text-gray-700">{uploadInfo.empName}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">
                        Department:
                    </span>
                    <span className="text-gray-700">
                        {uploadInfo.department}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">Date:</span>
                    <span className="text-gray-700">
                        {formatDateToDDMMYY(uploadInfo.uploadedOn)}
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="border-b pb-2">
                <h2 className="text-2xl font-bold text-primary">Documents</h2>
            </div>
            <div className="grid grid-cols-2 gap-8">
                <DocumentCard
                    title="Purchase Order Document"
                    documents={request.poDocuments}
                    isPO={true}
                />
                <DocumentCard
                    title="Invoice Documents"
                    documents={request.invoiceDocumets}
                />
            </div>
        </div>
    );
};

export default DocumentsDisplay;
