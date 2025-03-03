import { useEffect, useState } from "react";
import {
    CheckCircle2,
    Package,
    Send,
    File,
    XCircle,
    PauseCircle,
    FileIcon,
    Loader2,
    Bell,
    Upload,
    FileText,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
    addInvoiceDocument,
    addPODocument,
    dispalyIsApproved,
    fetchIndividualReq,
    generatePDF,
    releseReqStatus,
    sendReminder,
} from "../../../api/service/adminServices";
import { toast, ToastContainer } from "react-toastify";
import ChatComments from "./ChatComments";
import handleApprove from "./handleApprove";
import RequestLogs from "./RequestLogs";
import pfdIcon from "../../../assets/images/pdfIcon.png";
import uploadFiles from "../../../utils/s3BucketConfig";
import { formatDateToDDMMYY } from "../../../utils/dateFormat";
import DocumentsDisplay from "./DocumentsDisplay";
import FilePreview from "./FilePreview";
import { extractDateAndTime } from "../../../utils/extractDateAndTime";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const currencies = [
    { code: "USD", symbol: "$", locale: "en-US" },
    { code: "EUR", symbol: "€", locale: "de-DE" },
    { code: "GBP", symbol: "£", locale: "en-GB" },
    { code: "INR", symbol: "₹", locale: "en-IN" },
    { code: "AED", symbol: "د.إ", locale: "ar-AE" },
    { code: "IDR", symbol: "Rp", locale: "id-ID" },
    { code: "MYR", symbol: "RM", locale: "ms-MY" },
    { code: "SGD", symbol: "S$", locale: "en-SG" },
    { code: "PHP", symbol: "₱", locale: "fil-PH" },
];

const PreviewTheReq = () => {
    const navigate = useNavigate();
    const params = useParams();
    const userId = localStorage.getItem("capEmpId");
    const role = localStorage.getItem("role");
    const department = localStorage.getItem("department");
    const email = localStorage.getItem("email");
    const [showDialog, setShowDialog] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showSubmissionDialog, setSubmissionDialog] = useState(false);
    const [approveStatus, setApproveStatus] = useState();
    const [newStatus, setNewStatus] = useState();
    const [reason, setReason] = useState("");
    const needsReason = ["Hold", "Reject"].includes(approveStatus);

    const [isLoading, setIsLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState("");
    const [disable, setIsDisable] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const [request, setRequest] = useState(null);
    const [activeSection, setActiveSection] = useState("preview");

    useEffect(() => {
        const fetchReq = async () => {
            try {
                const response = await fetchIndividualReq(params.id);
                console.log("response", response);

                if (response.status === 200) {
                    setRequest(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching request:", error);
            }
        };
        fetchReq();
    }, [params.id]);

    useEffect(() => {
        const isApprove = async () => {
            const response = await dispalyIsApproved(userId, params.id, role);
            if (response.status === 200) {
                setIsDisable(response.data.isDisplay);
            }
            console.log("isDisable", disable);
        };
        isApprove();
    }, [disable]);

    const formatCurrency = (value) => {
        const currency = currencies.find(
            (c) => c.code === request.supplies.selectedCurrency
        );
        if (!currency || !value) return "N/A";

        return new Intl.NumberFormat(currency.locale, {
            style: "currency",
            currency: currency.code,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

   

    const handleGeneratePDF = async () => {
        if (!request) return;
    
        try {
            // Show loading indicator
            setIsGeneratingPDF(true);
    
            // Define margins (in mm)
            const margin = 20; // Increased from 15mm to 20mm for better spacing
            
            // Create a PDF document
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
                compress: true,
            });
    
            // Get page dimensions
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const contentWidth = pdfWidth - (margin * 2);
            const contentHeight = pdfHeight - (margin * 2);
    
            // Define sections to be on separate pages
            const sections = [
                { id: "commercial-details", title: "Commercial Details" },
                { id: "procurement-details", title: "Procurement Details" },
                { id: "supplies-details", title: "Product/Services Details" },
                { id: "compliance-details", title: "Compliance Details" },
                { id: "approval-logs", title: "Approval Logs" }, // Added logs section
            ];
    
            // Create a temporary container for the content
            const tempContainer = document.createElement("div");
            tempContainer.style.position = "absolute";
            tempContainer.style.left = "-9999px";
            tempContainer.style.width = contentWidth + "mm"; // Content width accounting for margins
            tempContainer.style.padding = "0";
            tempContainer.style.boxSizing = "border-box";
            document.body.appendChild(tempContainer);
    
           
            
            // Center alignment for requestor information
            const centerX = pdfWidth / 2;
            const startY = pdfHeight / 2 - 40; // Start position for centered content
            
            // Title (if available)
            if (request.title) {
                pdf.setFontSize(18);
                pdf.setFont("helvetica", "bold");
                // Calculate text width to center it
                const titleWidth = pdf.getStringUnitWidth(request.title) * 18 / pdf.internal.scaleFactor;
                pdf.text(request.title, centerX - (titleWidth / 2), startY);
            }
            
            // Requestor Information (all centered)
            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.text("Requestor Information", centerX, startY + 25, { align: "center" });
            
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(12);
            
            // Request ID (centered)
            const reqIdText = `Request ID: ${request.reqid || "N/A"}`;
            pdf.text(reqIdText, centerX, startY + 40, { align: "center" });
            
            // Created At (centered)
            const createdAtText = `Created At: ${extractDateAndTime(request.createdAt) || "N/A"}`;
            pdf.text(createdAtText, centerX, startY + 55, { align: "center" });
            
            // Requestor ID (centered)
            const requestorIdText = `Requestor ID: ${request.userId || "N/A"}`;
            pdf.text(requestorIdText, centerX, startY + 70, { align: "center" });
            
            // Requestor Name (centered)
            const requestorNameText = `Requestor: ${request.userName  || "N/A"}`;
            pdf.text(requestorNameText, centerX, startY + 80, { align: "center" });
            
           
            
            // Add page footer
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(100, 100, 100);
            pdf.text(
                `Generated on: ${new Date().toLocaleDateString()}`,
                centerX,
                pdfHeight - margin,
                { align: "center" }
            );
            
            // Add divider line above footer
            pdf.setDrawColor(128, 194, 66); // Theme color for divider
            pdf.setLineWidth(0.5);
            pdf.line(margin, pdfHeight - margin - 10, pdfWidth - margin, pdfHeight - margin - 10);

            
            // Generate each section on a separate page
            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                
                // Add a new page for each section
                pdf.addPage();
    
                // Add section header with styling
                pdf.setFillColor(128, 194, 66); // Theme color #80c242
                pdf.rect(0, 0, pdfWidth, 25, 'F');
                
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(16);
                pdf.setTextColor(255, 255, 255); // White text on green background
                pdf.text(section.title, margin, margin);
                
                // Create content for this section
                tempContainer.innerHTML = "";
                tempContainer.innerHTML = generateSectionHTML(section.id, section.title);
    
                // Convert this section to canvas
                const canvas = await html2canvas(tempContainer, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: "#ffffff",
                });
    
                // Add the image to the PDF with proper margins
                const imgData = canvas.toDataURL("image/jpeg", 1.0);
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = Math.min(
                    contentWidth / imgWidth,
                    (contentHeight - 30) / imgHeight // Subtract header height
                );
    
                pdf.addImage(
                    imgData,
                    "JPEG",
                    margin,
                    margin + 20, // Add content below the header
                    imgWidth * ratio,
                    imgHeight * ratio
                );
    
                // Add page number and footer
                pdf.setFontSize(10);
                pdf.setFont("helvetica", "normal");
                pdf.setTextColor(100, 100, 100);
                pdf.text(
                    `Page ${i + 1} of ${sections.length}`,
                    pdfWidth - margin - 30,
                    pdfHeight - margin
                );
                
                // Add divider line above footer
                pdf.setDrawColor(128, 194, 66); // Theme color for divider
                pdf.setLineWidth(0.5);
                pdf.line(margin, pdfHeight - margin - 10, pdfWidth - margin, pdfHeight - margin - 10);
            }
    
            // Download the PDF
            pdf.save(
                `Request_${request.reqid || "Details"}_${new Date()
                    .toISOString()
                    .slice(0, 10)}.pdf`
            );
    
            // Clean up
            document.body.removeChild(tempContainer);
            setIsGeneratingPDF(false);
    
            // Show success message
            if (toast?.success) {
                toast.success("PDF generated successfully");
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
            setIsGeneratingPDF(false);
            if (toast?.error) {
                toast.error("Error generating PDF");
            }
        }
    };
    
    // Helper function to generate HTML for each section
    const generateSectionHTML = (sectionId, sectionTitle) => {
        // Base styles for all sections - updated with theme color and better spacing
        const styles = `
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 25px; }
            .section-container { max-width: 210mm; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #80c242; padding-bottom: 15px; margin-bottom: 25px; }
            h1 { color: #80c242; font-size: 24px; margin: 0; }
            h2 { color: #80c242; font-size: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; margin-top: 30px; margin-bottom: 20px; }
            .info-box { background-color: #f9fafb; border-radius: 8px; padding: 15px; margin-bottom: 15px; border-left: 4px solid #80c242; }
            .info-label { color: #4b5563; font-weight: 600; margin-bottom: 6px; }
            .info-value { color: #1f2937; font-weight: 500; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 25px; }
            th { background-color: #eef7e6; color: #3d611f; padding: 12px; text-align: left; font-weight: 600; }
            td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
            .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px; }
            .status-approved { background-color: #d1fae5; color: #065f46; border-radius: 12px; padding: 4px 10px; font-size: 12px; font-weight: 600; }
            .status-rejected { background-color: #fee2e2; color: #b91c1c; border-radius: 12px; padding: 4px 10px; font-size: 12px; font-weight: 600; }
            .status-pending { background-color: #fef3c7; color: #92400e; border-radius: 12px; padding: 4px 10px; font-size: 12px; font-weight: 600; }
            .remarks-box { background-color: #f3f4f6; border-radius: 6px; padding: 10px; margin-top: 8px; font-size: 13px; }
          </style>
        `;
    
        // Header with logo and request information
        const header = `
          <div class="header">
            <div>
              <h1>${sectionTitle}</h1>
              <p>Request ID: ${request.reqid || "N/A"}</p>
            </div>
            <div>
              <p>Generated: ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
        `;
    
        let sectionContent = "";
    
        // Generate content based on section ID
        switch (sectionId) {
            case "commercial-details":
                sectionContent = generateCommercialDetailsHTML();
                break;
            case "procurement-details":
                sectionContent = generateProcurementDetailsHTML();
                break;
            case "supplies-details":
                sectionContent = generateSuppliesDetailsHTML();
                break;
            case "compliance-details":
                sectionContent = generateComplianceDetailsHTML();
                break;
            case "approval-logs":
                sectionContent = generateApprovalLogsHTML();
                break;
            default:
                sectionContent = "<p>No content available</p>";
        }
    
        return `
          <div class="section-container">
            ${styles}
            ${header}
            ${sectionContent}
          </div>
        `;
    };
    
    // Generate HTML for Approval Logs section
    const generateApprovalLogsHTML = () => {
        if (!request || !request.approvals || request.approvals.length === 0) {
            return `
            <div class="section-content">
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; background-color: #f9fafb; border-radius: 8px; text-align: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <p style="color: #6b7280; margin-top: 16px;">No approval logs available</p>
                </div>
            </div>`;
        }
    
        const calculateDuration = (startDate, endDate) => {
            if (!startDate || !endDate) return { days: "-", hours: "-", minutes: "-" };
    
            const start = new Date(startDate);
            const end = new Date(endDate);
    
            const diffInMs = end - start;
    
            if (diffInMs < 0) return { days: "-", hours: "-", minutes: "-" };
    
            const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
                (diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
    
            return { days, hours, minutes };
        };
    
        const formatDuration = (duration) => {
            if (duration.days === "-") return "Pending";
    
            const parts = [];
            if (duration.days > 0) parts.push(`${duration.days}d`);
            if (duration.hours > 0) parts.push(`${duration.hours}h`);
            if (duration.minutes > 0) parts.push(`${duration.minutes}m`);
    
            return parts.length > 0 ? parts.join(" ") : "Less than 1m";
        };
    
        const getStatusStyleClass = (status) => {
            if (!status) return "status-pending";
            
            switch (status.toLowerCase()) {
                case "approved":
                    return "status-approved";
                case "rejected":
                    return "status-rejected";
                case "pending":
                    return "status-pending";
                default:
                    return "status-pending";
            }
        };
    
        // Format the date/time
        const formatDateTime = (dateTimeStr) => {
            if (!dateTimeStr) return { date: "N/A", time: "N/A" };
            
            try {
                const date = new Date(dateTimeStr);
                return {
                    date: date.toLocaleDateString(),
                    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
            } catch (e) {
                return { date: "N/A", time: "N/A" };
            }
        };
    
        let logsHTML = `
        <div class="section-content" style="width: 100%;">
            <h2>Approval Timeline</h2>
            <table style="width: 100%;">
                <thead>
                    <tr>
                        <th style="width: 5%;">#</th>
                        <th style="width: 20%;">Approver</th>
                        <th style="width: 20%;">Status & Remarks</th>
                        <th style="width: 15%;">Received On</th>
                        <th style="width: 15%;">Updated On</th>
                        <th style="width: 10%;">Turn Around Time</th>
                        <th style="width: 20%;">Proceeded To</th>
                    </tr>
                </thead>
                <tbody>
        `;
    
        request.approvals.forEach((log, index) => {
            const receivedDateTime = formatDateTime(log.receivedOn);
            const approvalDateTime = formatDateTime(log.approvalDate);
            const duration = calculateDuration(log.receivedOn, log.approvalDate);
            const formattedDuration = formatDuration(duration);
    
            logsHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <div>
                        <div style="font-weight: 600;">${log.approverName || "N/A"}</div>
                        <div style="font-size: 12px; color: #6b7280;">${log.departmentName || "N/A"}</div>
                        <div style="font-size: 12px; color: #6b7280;">${log.approvalId || "N/A"}</div>
                    </div>
                </td>
                <td>
                    <div>
                        <span class="${getStatusStyleClass(log.status)}">${log.status || "Pending"}</span>
                        ${log.remarks ? `<div class="remarks-box">${log.remarks}</div>` : ''}
                    </div>
                </td>
                <td>
                    <div style="font-weight: 500;">${receivedDateTime.date}</div>
                    <div style="font-size: 12px; color: #6b7280;">${receivedDateTime.time}</div>
                </td>
                <td>
                    <div style="font-weight: 500;">${approvalDateTime.date}</div>
                    <div style="font-size: 12px; color: #6b7280;">${approvalDateTime.time}</div>
                </td>
                <td style="font-weight: 500;">${formattedDuration}</td>
                <td>${log.nextDepartment || "N/A"}</td>
            </tr>
            `;
        });
    
        logsHTML += `
                </tbody>
            </table>
            
            <div style="margin-top: 25px; font-size: 12px; color: #6b7280; font-style: italic; background-color: #f8f9fa; padding: 10px; border-radius: 6px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; vertical-align: text-bottom; margin-right: 4px;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                Note: Turn Around Time includes non-working hours
            </div>
        </div>
        `;
    
        return logsHTML;
    };
    
    // Generate HTML for Commercial Details section
    const generateCommercialDetailsHTML = () => {
        if (!request || !request.commercials)
            return "<p>No commercial details available</p>";
    
        let commercialHTML = `
          <div class="section-content">
            <h2>Commercials</h2>
            <div class="grid-3">
              ${createInfoBox("Request ID", request.reqid)}
              ${createInfoBox(
                  "Business Unit",
                  request.commercials.businessUnit
              )}
              ${createInfoBox(
                  "Created At",
                  extractDateAndTime(request.createdAt)
              )}
            </div>
            
            <div class="grid-3">
              ${createInfoBox("Entity", request.commercials.entity)}
              ${createInfoBox("City", request.commercials.city)}
              ${createInfoBox("Site", request.commercials.site)}
            </div>
            
            <div class="grid-2">
              ${createInfoBox("Department", request.commercials.department)}
              ${createInfoBox("Head of Department", request.commercials.hod)}
            </div>
            
            <div class="grid-2">
              ${createInfoBox("Bill To", request.commercials.billTo)}
              ${createInfoBox("Ship To", request.commercials.shipTo)}
            </div>
        `;
    
        // Add payment terms if available
        if (request.commercials?.paymentTerms?.length > 0) {
            commercialHTML += `
            <h2>Payment Terms</h2>
            <table>
              <thead>
                <tr>
                  <th>Percentage</th>
                  <th>Payment Term</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                ${request.commercials.paymentTerms
                    .map(
                        (term) => `
                  <tr>
                    <td>${term.percentageTerm}%</td>
                    <td>${(term.paymentTerm || "").toLowerCase()}</td>
                    <td>${(term.paymentType || "").toLowerCase()}</td>
                  </tr>
                `
                    )
                    .join("")}
              </tbody>
            </table>
          `;
        }
    
        commercialHTML += "</div>";
        return commercialHTML;
    };
    
    // Generate HTML for Procurement Details section
    const generateProcurementDetailsHTML = () => {
        if (!request || !request.procurements)
            return "<p>No procurement details available</p>";
    
        let procurementHTML = `
          <div class="section-content">
            <h2>Vendor Information</h2>
            <div class="grid-2">
              ${createInfoBox("Vendor ID", request.procurements.vendor)}
              ${createInfoBox("Vendor Name", request.procurements.vendorName)}
            </div>
            
            <div class="grid-2">
              ${createInfoBox(
                  "Quotation Number",
                  request.procurements.quotationNumber
              )}
              ${createInfoBox(
                  "Quotation Date",
                  request.procurements.quotationDate
                      ? formatDateToDDMMYY(request.procurements.quotationDate)
                      : "N/A"
              )}
            </div>
            
            <div class="grid-3">
              ${createInfoBox(
                  "Service Period",
                  request.procurements.servicePeriod
              )}
              ${createInfoBox(
                  "PO Valid From",
                  request.procurements.poValidFrom
                      ? formatDateToDDMMYY(request.procurements.poValidFrom)
                      : "N/A"
              )}
              ${createInfoBox(
                  "PO Valid To",
                  request.procurements.poValidTo
                      ? formatDateToDDMMYY(request.procurements.poValidTo)
                      : "N/A"
              )}
            </div>
        `;
    
        // Add uploaded files if available
        if (request.procurements?.uploadedFiles) {
            procurementHTML += `
            <h2>Uploaded Files</h2>
            <div class="info-box">
          `;
    
            if (Object.keys(request.procurements.uploadedFiles).length > 0) {
                procurementHTML += `
              <p class="info-value" style="color: #80c242;">✓ Files uploaded successfully</p>
              
            `;
            } else {
                procurementHTML += `<p class="info-value">No files uploaded</p>`;
            }
    
            procurementHTML += "</div>";
        }
    
        procurementHTML += "</div>";
        return procurementHTML;
    };
    
    // Generate HTML for Supplies/Services Details section
    const generateSuppliesDetailsHTML = () => {
        if (!request || !request.supplies)
            return "<p>No product/services details available</p>";
    
        let suppliesHTML = `<div class="section-content">`;
    
        // Add services table if available
        if (request.supplies?.services?.length > 0) {
            suppliesHTML += `
            <h2>Products and Services</h2>
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Description</th>
                  <th>Purpose</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Tax (%)</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${request.supplies.services
                    .map((service) => {
                        const quantity = parseFloat(service.quantity) || 0;
                        const price = parseFloat(service.price) || 0;
                        const tax = parseFloat(service.tax) || 0;
                        const total = quantity * price * (1 + tax / 100);
    
                        return `
                    <tr>
                      <td>${service.productName || "N/A"}</td>
                      <td>${service.productDescription || "N/A"}</td>
                      <td>${service.productPurpose || "N/A"}</td>
                      <td>${service.quantity}</td>
                      <td>${formatCurrency(service.price)}</td>
                      <td>${service.tax || "N/A"}</td>
                      <td>${formatCurrency(total)}</td>
                    </tr>
                  `;
                    })
                    .join("")}
              </tbody>
            </table>
          `;
        }
    
        // Add total value if available
        if (request.supplies?.totalValue !== undefined) {
            suppliesHTML += `
            <div class="info-box" style="margin-top: 20px; font-weight: bold; background-color: #eef7e6; border-left: 4px solid #80c242;">
              <div class="info-label" style="color: #3d611f;">Total Value</div>
              <div class="info-value" style="font-size: 18px; color: #3d611f;">${formatCurrency(
                  request.supplies.totalValue
              )}</div>
            </div>
          `;
        }
    
        // Add remarks if available
        if (request.supplies?.remarks) {
            suppliesHTML += `
            <h2>Remarks</h2>
            <div class="info-box">
              <p style="margin: 0;">${request.supplies.remarks}</p>
            </div>
          `;
        }
    
        suppliesHTML += "</div>";
        return suppliesHTML;
    };
    
    // Generate HTML for Compliance Details section
    const generateComplianceDetailsHTML = () => {
        if (!request || !request.complinces)
            return "<p>No compliance details available</p>";
    
        let complianceHTML = `
          <div class="section-content">
            <h2>Compliance Answers</h2>
        `;
    
        if (Object.keys(request.complinces).length > 0) {
            complianceHTML += `<div style="display: grid; grid-template-columns: 1fr; gap: 20px;">`;
    
            Object.entries(request.complinces).forEach(
                ([questionId, compliance]) => {
                    const isCompliant =
                        compliance.expectedAnswer === compliance.answer;
    
                    complianceHTML += `
              <div style="padding: 18px; border-radius: 8px; ${
                  isCompliant
                      ? "background-color: #d1fae5; border: 1px solid #a7f3d0;"
                      : "background-color: #fee2e2; border: 1px solid #fecaca;"
              }">
                <h3 style="margin-top: 0; margin-bottom: 12px; ${
                    isCompliant ? "color: #065f46;" : "color: #b91c1c;"
                }">${compliance.question}</h3>
                <p style="font-weight: 600; ${
                    isCompliant ? "color: #047857;" : "color: #dc2626;"
                }; margin-bottom: 10px;">
                  ${compliance.answer ? "Yes" : "No"}
                </p>
                
                ${
                    compliance.department
                        ? `
                  <p style="margin-top: 12px; font-size: 14px; color: #4b5563;">
                    <strong>Department:</strong> ${compliance.department}
                  </p>
                `
                        : ""
                }
                
                ${
                    compliance.deviation && !isCompliant
                        ? `
                  <div style="margin-top: 15px; padding: 12px; background-color: #fef2f2; border-radius: 6px;">
                    <p style="margin: 0; font-size: 14px; color: #b91c1c;">
                      <strong>Deviation Reason:</strong> ${compliance.deviation.reason}
                    </p>
                  </div>
                `
                        : ""
                }
                
                ${
                    compliance?.deviation?.attachments?.length > 0
                        ? `
                  <div style="margin-top: 15px;">
                    <strong style="color: #b91c1c;">Attachments:</strong>
                    <ul style="margin-top: 8px; padding-left: 20px;">
                      ${compliance.deviation.attachments
                          .map(
                              (attachment, i) => `
                        <li>Attachment ${i + 1}</li>
                      `
                          )
                          .join("")}
                    </ul>
                  </div>
                `
                        : ""
                }
              </div>
            `;
                }
            );
    
            complianceHTML += "</div>";
        } else {
            complianceHTML += `
            <div style="padding: 20px; background-color: #f9fafb; border-radius: 8px; text-align: center;">
              <p style="color: #6b7280; margin: 0;">No compliance details available</p>
            </div>`;
        }
    
        complianceHTML += "</div>";
        return complianceHTML;
    };
    
    // Helper function to create info boxes
    const createInfoBox = (label, value) => {
        return `
          <div class="info-box">
            <div class="info-label">${label}</div>
            <div class="info-value">${value || "N/A"}</div>
          </div>
        `;
    };

    const LoadingOverlay = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-semibold text-gray-700">
                    Please wait...
                </p>
            </div>
        </div>
    );
    const renderUploadedFiles = (uploadedFiles) => {
        if (!uploadedFiles || uploadedFiles.length === 0) {
            return null;
        }

        // Transform the data structure
        const fileCategories = uploadedFiles.reduce((acc, fileGroup) => {
            // Get all keys (categories) from the file group
            Object.entries(fileGroup).forEach(([category, urls]) => {
                acc[category] = urls;
            });
            return acc;
        }, {});

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(fileCategories).map(
                    ([category, files], index) => (
                        <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                        >
                            <h4 className="text-sm font-semibold text-gray-800 mb-3 capitalize border-b pb-2">
                                {category.replace(/_/g, " ")}
                            </h4>
                            <div className="grid grid-cols-3 gap-2">
                                {files.map((file, fileIndex) => (
                                    <div
                                        key={fileIndex}
                                        className="flex flex-col items-center bg-gray-50 rounded p-2"
                                    >
                                        <a
                                            href={file}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-primary hover:text-blue-800 truncate max-w-full text-center"
                                        >
                                            <img
                                                src={pfdIcon}
                                                alt={`${category} file ${
                                                    fileIndex + 1
                                                }`}
                                                className="w-10 h-10 object-cover mb-2"
                                            />
                                            <span className="block">
                                                File {fileIndex + 1}
                                            </span>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                )}
            </div>
        );
    };
    const SectionNavigation = () => {
        const sections = [
            {
                key: "preview",
                icon: Package,
                label: "Request Preview",
                color: "text-primary hover:bg-primary/10",
            },
            {
                key: "chat",
                icon: Send,
                label: "Discussions",
                color: "text-primary hover:bg-primary/10",
            },
            {
                key: "logs",
                icon: File,
                label: "Logs",
                color: "text-primary hover:bg-primary/10",
            },
        ];

        return (
            <div className="flex border-b">
                {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <button
                            key={section.key}
                            onClick={() => setActiveSection(section.key)}
                            className={`
                flex-1 p-4 flex items-center justify-center 
                ${
                    activeSection === section.key
                        ? "bg-primary/10 border-b-2 border-primary"
                        : "hover:bg-gray-100"
                }
                ${section.color} 
                transition-all duration-300
              `}
                        >
                            <Icon className="mr-2" size={20} />
                            <span className="font-semibold">
                                {section.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderRequestPreview = () => {
        if (!request) return null;

        return (
            <div className="space-y-8" id="request-preview-content">
                {/* Commercial Details Section */}

                <div className="p-5 space-y-6">
                    <h2 className="text-2xl font-bold text-primary border-b pb-2">
                        Commercial Details
                    </h2>
                    {request.commercials &&
                        Object.values(request.commercials).some(
                            (value) => value
                        ) && (
                            <div className="grid gap-6 p-4">
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Request ID
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {request.reqid}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Business Unit
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {request.commercials.businessUnit}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Created At
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {extractDateAndTime(
                                                request.createdAt
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Entity
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {request.commercials.entity}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            City
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {request.commercials.city}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Site
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {request.commercials.site}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Department
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {request.commercials.department}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Head of Department
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {request.commercials.hod}
                                        </div>
                                    </div>
                                </div>

                                {/* <div className="grid md:grid-cols-4 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Payment Mode
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {request.commercials.paymentMode}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Credit Card Selected
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {request.commercials
                                                .isCreditCardSelected
                                                ? "Yes"
                                                : "No"}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 w-a p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Bill To
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {request.commercials.billTo}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Ship To
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {request.commercials.shipTo}
                                        </div>
                                    </div>
                                </div> */}
                                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-6 rounded-lg w-full">
                                        <span className="text-gray-600 font-medium">
                                            Bill To
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {request.commercials.billTo}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-lg w-full">
                                        <span className="text-gray-600 font-medium">
                                            Ship To
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {request.commercials.shipTo}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    {request.commercials?.paymentTerms?.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-xl font-semibold text-primary mb-4">
                                Payment Terms
                            </h3>
                            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-primary/10">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-primary font-semibold">
                                                Percentage
                                            </th>
                                            <th className="px-6 py-4 text-left text-primary font-semibold">
                                                Payment Term
                                            </th>
                                            <th className="px-6 py-4 text-left text-primary font-semibold">
                                                Type
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {request.commercials.paymentTerms.map(
                                            (term, index) => (
                                                <tr
                                                    key={index}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-6 py-4 text-left font-medium">
                                                        {term.percentageTerm}%
                                                    </td>
                                                    <td className="px-6 py-4 capitalize">
                                                        {term.paymentTerm?.toLowerCase()}
                                                    </td>
                                                    <td className="px-6 py-4 capitalize">
                                                        {term.paymentType?.toLowerCase()}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Procurement Details Section */}
                <div className="p-5 space-y-6">
                    <h2 className="text-2xl font-bold text-primary border-b pb-3">
                        Procurement Details
                    </h2>

                    {request.procurements &&
                        Object.values(request.procurements).some(
                            (value) => value
                        ) && (
                            <div className="grid md:grid-cols-2 gap-4">
                                {[
                                    {
                                        label: "Vendor ID",
                                        value: request.procurements.vendor,
                                    },
                                    {
                                        label: "Vendor Name",
                                        value: request.procurements.vendorName,
                                    },
                                    {
                                        label: "Quotation Number",
                                        value: request.procurements
                                            .quotationNumber,
                                    },
                                    {
                                        label: "Quotation Date",
                                        value: request.procurements
                                            .quotationDate
                                            ? formatDateToDDMMYY(
                                                  request.procurements
                                                      .quotationDate
                                              )
                                            : null,
                                    },
                                    {
                                        label: "Service Period",
                                        value: request.procurements
                                            .servicePeriod,
                                    },
                                    {
                                        label: "PO Valid From",
                                        value: request.procurements.poValidFrom
                                            ? formatDateToDDMMYY(
                                                  request.procurements
                                                      .poValidFrom
                                              )
                                            : null,
                                    },
                                    {
                                        label: "PO Valid To",
                                        value: request.procurements.poValidTo
                                            ? formatDateToDDMMYY(
                                                  request.procurements.poValidTo
                                              )
                                            : null,
                                    },
                                ]
                                    .filter((item) => item.value) // Ensures only non-empty values are displayed
                                    .map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <span className="text-gray-600 font-medium">
                                                {item.label}
                                            </span>
                                            <span className="text-gray-800 font-semibold">
                                                {item.value}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        )}

                    {request.procurements?.uploadedFiles && (
                        <div className="mt-6">
                            <h3 className="text-xl font-semibold text-primary mb-4">
                                Uploaded Files
                            </h3>
                            <div className="bg-white shadow-md rounded-lg p-4">
                                {Object.keys(request.procurements.uploadedFiles)
                                    .length > 0 ? (
                                    <div className="text-green-600 flex items-center mb-4">
                                        <CheckCircle2
                                            className="mr-2"
                                            size={20}
                                        />
                                        Files uploaded successfully
                                    </div>
                                ) : (
                                    <div className="text-gray-500 flex items-center">
                                        No files uploaded
                                    </div>
                                )}
                                {renderUploadedFiles(
                                    request.procurements.uploadedFiles
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Product/Services Section */}
                <div className="p-6 space-y-6">
                    <h2 className="text-2xl font-bold text-primary border-b pb-3">
                        Product/Services Details
                    </h2>
                    {request.supplies?.services?.length > 0 && (
                        <div className="mt-6">
                            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-primary/10">
                                        <tr>
                                            <th className="p-3 text-left text-primary">
                                                Product Names
                                            </th>
                                            <th className="p-3 text-left text-primary">
                                                Description
                                            </th>
                                            <th className="p-3 text-left text-primary">
                                                Purpose
                                            </th>
                                            <th className="p-3 text-left text-primary">
                                                Quantity
                                            </th>
                                            <th className="p-3 text-left text-primary">
                                                Price
                                            </th>
                                            <th className="p-3 text-left text-primary">
                                                Tax (%)
                                            </th>
                                            <th className="p-3 text-left text-primary">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {request.supplies.services.map(
                                            (service, index) => {
                                                const quantity =
                                                    parseFloat(
                                                        service.quantity
                                                    ) || 0;
                                                const price =
                                                    parseFloat(service.price) ||
                                                    0;
                                                const tax =
                                                    parseFloat(service.tax) ||
                                                    0;
                                                const total =
                                                    quantity *
                                                    price *
                                                    (1 + tax / 100);

                                                return (
                                                    <tr
                                                        key={index}
                                                        className="border-b hover:bg-gray-50"
                                                    >
                                                        <td className="p-3">
                                                            {service.productName ||
                                                                "N/A"}
                                                        </td>
                                                        <td className="p-3">
                                                            {service.productDescription ||
                                                                "N/A"}
                                                        </td>
                                                        <td className="p-3">
                                                            {service.productPurpose ||
                                                                "N/A"}
                                                        </td>
                                                        <td className="p-3">
                                                            {service.quantity}
                                                        </td>
                                                        <td className="p-3">
                                                            {formatCurrency(
                                                                service.price
                                                            )}
                                                        </td>
                                                        <td className="p-3">
                                                            {service.tax ||
                                                                "N/A"}
                                                        </td>
                                                        <td className="p-3 font-semibold">
                                                            {formatCurrency(
                                                                total
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {request.supplies?.totalValue !== undefined && (
                        <div className="p-3 bg-gray-50 rounded-lg flex justify-between">
                            <span className="text-gray-600 font-medium">
                                Total Value
                            </span>
                            <span className="text-gray-800 font-semibold">
                                {formatCurrency(request.supplies.totalValue)}
                            </span>
                        </div>
                    )}

                    {request.supplies?.remarks && (
                        <div className="mt-6">
                            <h3 className="text-xl font-semibold text-primary mb-4">
                                Remarks
                            </h3>
                            <p>{request.supplies.remarks}</p>
                        </div>
                    )}
                </div>

                {/* Compliance Details Section */}
                <div className="p-6 space-y-6">
                    <h2 className="text-2xl font-bold text-primary border-b pb-3">
                        Compliance Details
                    </h2>
                    {request.complinces && request?.complinces ? (
                        <div className="grid grid-cols-2 gap-4">
                            {Object.keys(request?.complinces)?.length > 0 ? (
                                Object.entries(request?.complinces)?.map(
                                    ([questionId, compliance], index) => (
                                        <div
                                            key={questionId}
                                            className={`p-4 rounded-lg ${
                                                compliance.expectedAnswer !==
                                                compliance.answer
                                                    ? "bg-red-50 border border-red-200"
                                                    : "bg-green-50 border border-green-200"
                                            }`}
                                        >
                                            <h3
                                                className={`text-lg font-semibold ${
                                                    compliance.expectedAnswer !==
                                                    compliance.answer
                                                        ? "text-red-800"
                                                        : "text-green-800"
                                                }`}
                                            >
                                                {compliance.question}
                                            </h3>
                                            <p
                                                className={`mt-2 font-medium ${
                                                    compliance.expectedAnswer !==
                                                    compliance.answer
                                                        ? "text-red-600"
                                                        : "text-green-600"
                                                }`}
                                            >
                                                {compliance.answer
                                                    ? "Yes"
                                                    : "No"}
                                            </p>
                                            {compliance.department && (
                                                <p className="mt-2 text-sm text-gray-600">
                                                    <strong>Department:</strong>{" "}
                                                    {compliance.department}
                                                </p>
                                            )}
                                            {compliance.deviation &&
                                                compliance.expectedAnswer !==
                                                    compliance.answer && (
                                                    <div className="mt-2 p-3 bg-red-100 rounded">
                                                        <p className="text-sm text-red-700">
                                                            <strong>
                                                                Deviation
                                                                Reason:
                                                            </strong>{" "}
                                                            {
                                                                compliance
                                                                    .deviation
                                                                    .reason
                                                            }
                                                        </p>
                                                    </div>
                                                )}

                                            {compliance?.deviation?.attachments
                                                ?.length > 0 && (
                                                <div className="mt-4">
                                                    <strong className="text-red-700">
                                                        Attachments:
                                                    </strong>
                                                    <ul className="list-disc pl-6 mt-2">
                                                        {compliance?.deviation?.attachments.map(
                                                            (attachment, i) => (
                                                                <li key={i}>
                                                                    <a
                                                                        href={
                                                                            attachment
                                                                        }
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-red-600 hover:text-red-800 underline"
                                                                    >
                                                                        Attachment{" "}
                                                                        {i + 1}
                                                                    </a>
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )
                                )
                            ) : (
                                <div className="text-gray-500 col-span-2">
                                    No compliance details available
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-gray-500">
                            No compliance data available
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderSectionContent = () => {
        if (!request) return null;

        switch (activeSection) {
            case "preview":
                return renderRequestPreview();
            case "chat":
                return <ChatComments reqId={params.id} reqid={request.reqid} />;
            case "logs":
                return (
                    <RequestLogs
                        createdAt={request.createdAt}
                        logData={request.approvals}
                        // poUploadData = {request.poDocuments||""}
                        // invoiceUploadData = {request.invoiceDocumets||""}
                    />
                );
            default:
                return null;
        }
    };

    const approveRequest = async (status) => {
        setIsLoading(true); // Show loading overlay
        console.log(reason);

        try {
            const response = await handleApprove(
                userId,
                role,
                params.id,
                status,
                email,
                reason
            );
            if (response.status === 200) {
                toast.success(response.data.message);
                setTimeout(() => {
                    navigate("/approval-request-list");
                }, 1500);
            } else if (response.status === 400) {
                console.log("response", response.response);
                toast.info(response.response.data.message);
            } else if (response.status === 401) {
                console.log("response", response.response);
                toast.info(response.response.data.message);
            }
        } catch (err) {
            console.log("Error in approve the request", err);
            toast.error("Invalid workflow order");
        } finally {
            setIsLoading(false);
            setLoadingAction("");
        }
    };

    const handleRelese = async (status) => {
        setIsLoading(true); // Show loading overlay

        try {
            const response = await releseReqStatus(
                status,
                department,
                userId,
                request._id,
                role,
                email
            );
            console.log("response", response);
            if (response.status === 200) {
                toast.success(response.data.message);
                setTimeout(() => {
                    navigate("/approval-request-list");
                }, 1500);
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("An error occurred while processing your request");
        } finally {
            setIsLoading(false);
            setLoadingAction("");
        }
    };

    const handleNotify = async () => {
        try {
            console.log("Notification");
            const response = await sendReminder(request._id); // Assuming sendReminder is your API call

            console.log(response);

            if (response.status === 200) {
                toast.success("Notification sent successfully!");
                setShowDialog(false);
            } else {
                toast.error("Failed to send notification.");
            }
        } catch (error) {
            console.log("Error:", error);
            // Show an error toast in case of failure
            toast.error("An error occurred while sending the notification.");
        }
    };

    const handleUploadPo = async () => {
        if (!selectedImage) {
            return;
        }

        try {
            setIsUploading(true);

            // Create FormData to send the file
            const formData = new FormData();
            formData.append("poImage", selectedImage);
            formData.append("requestId", request.id); // Assuming you have request.id

            const response = await uploadFiles(
                selectedImage,
                "PO-Documets",
                request.reqid
            );
            console.log("response", response);

            const response2 = await addPODocument(
                userId,
                params.id,
                response.data.fileUrls[0]
            );
            console.log(response2);
            if (response2.status === 200) {
                toast.success(response2.data.message);
                navigate("/approval-request-list");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to upload PO");
        } finally {
            setIsUploading(false);
        }
    };

    const handleStatus = async (status) => {
        try {
            if (status === "Approve") {
                setNewStatus("Approved");
            } else if (status === "Reject") {
                setNewStatus("Rejected");
            } else if (status === "Hold") {
                setNewStatus("Hold");
            }
            console.log("status", status);
            setApproveStatus(status);
            setSubmissionDialog(true);
        } catch (err) {
            console.log("Error in handleStatus", err);
        }
    };

    const handleUploadInvoice = async () => {
        if (!selectedImage) {
            return;
        }

        try {
            setIsUploading(true);

            // Create FormData to send the file
            const formData = new FormData();
            formData.append("poImage", selectedImage);
            formData.append("requestId", request.id); // Assuming you have request.id

            const response = await uploadFiles(
                selectedImage,
                "Invoice-Documets",
                request.reqid
            );
            console.log("response", response);

            const response2 = await addInvoiceDocument(
                userId,
                params.id,
                response.data.fileUrls[0]
            );
            console.log(response2);
            if (response2.status === 200) {
                toast.success(response2.data.message);
                navigate("/req-list-table");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to upload PO");
        } finally {
            setIsUploading(false);
        }
    };

    const renderApprovalButtons = (request) => {
        return (
            <div className="bg-white p-4 flex justify-between items-center border-t shadow-md">
                {request.status !== "Approved" && (
                    <button
                        onClick={() => setShowDialog(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium text-sm shadow-sm active:scale-95 transform"
                    >
                        <Bell size={16} className="animate-bounce" />
                        <span>Nudge</span>
                    </button>
                )}

                {role !== "Employee" && !disable && (
                    <div className="flex space-x-4">
                        {/* Status: Pending → Reject, Hold, Submit */}
                        {request.status === "Pending" && (
                            <>
                                <button
                                    // onClick={() => approveRequest("Rejected")}
                                    onClick={() => handleStatus("Reject")}
                                    disabled={isLoading}
                                    className="px-6 py-2 rounded-lg flex items-center bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <XCircle className="mr-2" /> Reject
                                </button>
                                <button
                                    // onClick={() => approveRequest("Hold")}
                                    onClick={() => handleStatus("Hold")}
                                    disabled={isLoading}
                                    className="px-6 py-2 rounded-lg flex items-center bg-yellow-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <PauseCircle className="mr-2" /> Hold
                                </button>
                                <button
                                    // onClick={() => approveRequest("Approved")}
                                    onClick={() => handleStatus("Approve")}
                                    disabled={isLoading}
                                    className="px-6 py-2 rounded-lg flex items-center bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle2 className="mr-2" /> Approve
                                </button>
                            </>
                        )}

                        {/* Status: Hold → Reject, Release Hold, Submit */}
                        {request.status === "Hold" && (
                            <>
                                {/* <button
                                    onClick={() => handleRelese("Pending")}
                                    disabled={isLoading}
                                    className="px-6 py-2 rounded-lg flex items-center bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <PauseCircle className="mr-2" /> Release
                                    Hold
                                </button> */}
                                <button
                                    onClick={() => handleStatus("Reject")}
                                    disabled={isLoading}
                                    className="px-6 py-2 rounded-lg flex items-center bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <XCircle className="mr-2" /> Reject
                                </button>
                                <button
                                    onClick={() => handleStatus("Approve")}
                                    disabled={isLoading}
                                    className="px-6 py-2 rounded-lg flex items-center bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle2 className="mr-2" /> Approve
                                </button>
                            </>
                        )}

                        {/* Status: Rejected → Release Reject, Hold, Submit */}
                        {request.status === "Rejected" && (
                            <>
                                {/* <button
                                    onClick={() => handleRelese("Pending")}
                                    disabled={isLoading}
                                    className="px-6 py-2 rounded-lg flex items-center bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <XCircle className="mr-2" /> Release Reject
                                </button> */}
                                <button
                                    // onClick={() => approveRequest("Hold")}
                                    onClick={() => handleStatus("Hold")}
                                    disabled={isLoading}
                                    className="px-6 py-2 rounded-lg flex items-center bg-yellow-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <PauseCircle className="mr-2" /> Hold
                                </button>
                                <button
                                    // onClick={() => approveRequest("Approved")}
                                    onClick={() => handleStatus("Approve")}
                                    disabled={isLoading}
                                    className="px-6 py-2 rounded-lg flex items-center bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle2 className="mr-2" /> Approve
                                </button>
                            </>
                        )}
                    </div>
                )}

                {request.status === "PO-Pending"||request.status === "Approved" &&
                    role === "Head of Finance" && (
                        <div className="flex items-center justify-between w-full">
                            {/* Left side - Preview Image */}

                            <div className="ml-5">
                                <button
                                    onClick={handleGeneratePDF}
                                    disabled={isGeneratingPDF}
                                    className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
                                >
                                    {isGeneratingPDF ? (
                                        <>
                                            <svg
                                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Generating PDF...
                                        </>
                                    ) : (
                                        <>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 mr-2"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                                />
                                            </svg>
                                            Download PDF
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="flex items-center gap-4">
                                <FilePreview
                                    selectedFile={selectedImage}
                                    onClear={() => setSelectedImage(null)}
                                />

                                <label className="flex items-center px-6 py-2 rounded-lg border border-gray-300 cursor-pointer bg-white hover:bg-gray-50">
                                    <Upload className="w-5 h-5 text-gray-500 mr-2" />
                                    <span className="text-sm text-gray-600">
                                        Select PO
                                    </span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*,.pdf,application/pdf"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setSelectedImage(file);
                                            }
                                        }}
                                    />
                                </label>

                                <button
                                    onClick={handleUploadPo}
                                    disabled={!selectedImage || isUploading}
                                    className="px-6 py-2 rounded-lg flex items-center bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FileText className="w-5 h-5 mr-2" />
                                    {isUploading ? "Uploading..." : "Submit"}
                                </button>
                            </div>
                        </div>
                    )}

                {request.status === "Invoice-Pending" &&
                    (role === "Employee" || role === "HOD Department") && (
                        <div className="flex items-center gap-4">
                            <FilePreview
                                selectedFile={selectedImage}
                                onClear={() => setSelectedImage(null)}
                            />

                            <label className="flex items-center px-6 py-2 rounded-lg border border-gray-300 cursor-pointer bg-white hover:bg-gray-50">
                                <Upload className="w-5 h-5 text-gray-500 mr-2" />
                                <span className="text-sm text-gray-600">
                                    Select Invoice
                                </span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*,.pdf,application/pdf"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setSelectedImage(file);
                                        }
                                    }}
                                />
                            </label>

                            <button
                                onClick={handleUploadInvoice}
                                disabled={!selectedImage || isUploading}
                                className="px-6 py-2 rounded-lg flex items-center bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FileText className="w-5 h-5 mr-2" />
                                {isUploading ? "Uploading..." : "Submit"}
                            </button>
                        </div>
                    )}
            </div>
        );
    };

    if (!request) {
        return <div className="text-center py-10">Loading...</div>;
    }

    return (
        <div className="flex flex-col bg-white">
            {isLoading && <LoadingOverlay />}

            <div className="bg-primary text-white p-4 text-center shadow-md">
                <h1 className="text-2xl font-bold">Purchase Order Preview</h1>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <SectionNavigation />
                <div className="flex-1 overflow-y-auto">
                    {renderSectionContent()}
                    <DocumentsDisplay request={request} />
                </div>
            </div>
            {renderApprovalButtons(request)}

            <ToastContainer position="top-right" autoClose={5000} />
            {showDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <Bell className="text-primary w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold">Notify</h3>
                            <p className="mt-2 text-gray-600 text-center">
                                Do you want to make a reminder?
                            </p>
                        </div>

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowDialog(false)}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition-colors duration-200"
                            >
                                No
                            </button>

                            <button
                                onClick={handleNotify}
                                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium flex items-center gap-2"
                            >
                                <Bell size={16} />
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showSubmissionDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 md:w-[32rem]">
                        <h3 className="text-xl font-semibold mb-4">
                            Confirm Submission
                        </h3>
                        <p className="mb-4">
                            {`Are you sure you want to ${approveStatus.toLowerCase()} the request?`}
                        </p>

                        {needsReason && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Please provide a reason
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                                    rows={4}
                                    placeholder={`Enter reason for ${approveStatus.toLowerCase()}ing the request...`}
                                    required
                                />
                            </div>
                        )}

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setSubmissionDialog(false);
                                    setReason("");
                                }}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => {
                                    approveRequest(newStatus);
                                    setSubmissionDialog(false);
                                }}
                                disabled={needsReason && !reason.trim()}
                                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {approveStatus}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PreviewTheReq;
