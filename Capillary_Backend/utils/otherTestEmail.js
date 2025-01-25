const nodemailer = require("nodemailer");

const sendLoginEmail = async (userEmail, subject, textContent, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: '"Your App" <your-email@example.com>',
      to: userEmail,
      subject: subject,
      text: textContent,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${userEmail} successfully!`);
  } catch (error) {
    console.error(`Error sending email to ${userEmail}:`, error);
  }
};

// const sendBulkEmails = async ( emails, empName, department, reqId ) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       service: "Gmail",
//       auth: {
//         user: process.env.EMAIL_ADDRESS,
//         pass: process.env.EMAIL_PASSWORD,
//       },
//     });

//     const mailPromises = emails.map((email) => {
//       const subject = "Request Generated";
//       const textContent = `Dear User, a request has been generated by ${empName} from the ${department} department with request ID: ${reqId}. Please log in to the app and accept the request.`;
//       const htmlContent = `<p>Dear User,</p><p>A request has been generated by <strong>${empName}</strong> from the <strong>${department}</strong> department with request ID: <strong>${reqId}</strong>.</p><p>Please log in to the app and accept the request.</p>`;

//       const mailOptions = {
//         from:`"Capillary Technology" ${process.env.EMAIL_ADDRESS}`,
//         to: email,
//         subject: subject,
//         text: textContent,
//         html: htmlContent,
//       };

//       return transporter.sendMail(mailOptions);
//     });

//     await Promise.all(mailPromises);
//     console.log("Bulk emails sent successfully!");
//   } catch (error) {
//     console.error("Error sending bulk emails:", error);
//   }
// };

const sendBulkEmails = async (emails, empName, department, reqId) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailPromises = emails.map((email) => {
      const subject = "Request Generated";
      const textContent = `Dear User, a request has been generated by ${empName} from the ${department} department with request ID: ${reqId}. Please log in to the app and accept the request.`;
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            .header {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .content {
              line-height: 1.6;
              color: #333;
            }
            .highlight {
              color: #0056b3;
              font-weight: bold;
            }
            .login-button {
              display: inline-block;
              background-color: #0056b3;
              color: white;
              padding: 12px 25px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h2 style="margin: 0; color: #333;">New Request Notification</h2>
            </div>
            
            <div class="content">
              <p>Dear User,</p>
              
              <p>A new request has been generated with the following details:</p>
              
              <ul style="list-style: none; padding-left: 0;">
                <li>🧑‍💼 Employee: <span class="highlight">${empName}</span></li>
                <li>🏢 Department: <span class="highlight">${department}</span></li>
                <li>🔢 Request ID: <span class="highlight">${reqId}</span></li>
              </ul>

              <p>Please review and take action on this request.</p>
              
              <a href="https://porequests.corp.capillarytech.com" class="login-button">
                Login to Review Request
              </a>
              
              <p style="font-size: 14px; color: #666;">
                If you're unable to click the button, you can copy and paste this link in your browser:<br>
                https://porequests.corp.capillarytech.com
              </p>
            </div>

            <div class="footer">
              <p>This is an automated message from Capillary Technology. Please do not reply to this email.</p>
              <p>© ${new Date().getFullYear()} Capillary Technology. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"Capillary Technology" <${process.env.EMAIL_ADDRESS}>`,
        to: email,
        subject: subject,
        text: textContent,
        html: htmlContent,
      };

      return transporter.sendMail(mailOptions);
    });

    await Promise.all(mailPromises);
    console.log("Bulk emails sent successfully!");
  } catch (error) {
    console.error("Error sending bulk emails:", error);
  }
};

const sendIndividualEmail = async (
  type,
  userEmail,
  empName,
  department,
  reqId,
  approvalRecord
) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    let subject, textContent, htmlContent;

    switch (type) {
      case "EMPLOYEE": // Notification to employee
        subject = "Request Status Update";
        textContent = `Your request (ID: ${reqId}) has been approved by ${approvalRecord.departmentName} department on ${approvalRecord.approvalDate} and is now awaiting approval from ${approvalRecord.nextDepartment} department.`;
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              .email-container {
                max-width: 600px;
                margin: 0 auto;
                font-family: Arial, sans-serif;
                padding: 20px;
              }
              .header {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 5px;
                margin-bottom: 20px;
              }
              .content {
                line-height: 1.6;
                color: #333;
              }
              .highlight {
                color: #0056b3;
                font-weight: bold;
              }
              .status-box {
                background-color: #e8f4fd;
                border-left: 4px solid #0056b3;
                padding: 15px;
                margin: 20px 0;
              }
              .track-button {
                display: inline-block;
                background-color: #0056b3;
                color: white;
                padding: 12px 25px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                font-size: 12px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="header">
                <h2 style="margin: 0; color: #333;">Request Status Update</h2>
              </div>
              
              <div class="content">
                <p>Dear ${empName},</p>
                
                <div class="status-box">
                  <p>Your request has been processed with the following status:</p>
                  <ul style="list-style: none; padding-left: 0;">
                    <li>📝 Request ID: <span class="highlight">${reqId}</span></li>
                    <li>✅ Approved by: <span class="highlight">${
                      approvalRecord.departmentName
                    } Department</span></li>
                    <li>📅 Approval Date: <span class="highlight">${
                      approvalRecord.approvalDate
                    }</span></li>
                    <li>⏳ Awaiting approval from: <span class="highlight">${
                      approvalRecord.nextDepartment
                    } Department</span></li>
                  </ul>
                </div>

                <p>You can track your request status using the button below:</p>
                
               
                
                
              </div>

              <div class="footer">
                <p>This is an automated message from Capillary Technology. Please do not reply to this email.</p>
                <p>© ${new Date().getFullYear()} Capillary Technology. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      case "AUTHORITY": // Notification to next authority
        subject = "Request Pending Approval";
        textContent = `A request (ID: ${reqId}) from ${empName} in ${department} department has been approved by ${approvalRecord.approvedDept} department and requires your approval.`;
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              .email-container {
                max-width: 600px;
                margin: 0 auto;
                font-family: Arial, sans-serif;
                padding: 20px;
              }
              .header {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 5px;
                margin-bottom: 20px;
              }
              .content {
                line-height: 1.6;
                color: #333;
              }
              .highlight {
                color: #0056b3;
                font-weight: bold;
              }
              .status-box {
                background-color: #fff3e0;
                border-left: 4px solid #ff9800;
                padding: 15px;
                margin: 20px 0;
              }
              .review-button {
                display: inline-block;
                background-color: #ff9800;
                color: white;
                padding: 12px 25px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                font-size: 12px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="header">
                <h2 style="margin: 0; color: #333;">Request Pending Your Approval</h2>
              </div>
              
              <div class="content">
                <p>Dear Authority,</p>
                
                <div class="status-box">
                  <p>A request requires your review with the following details:</p>
                  <ul style="list-style: none; padding-left: 0;">
                    <li>👤 Employee Name: <span class="highlight">${empName}</span></li>
                    <li>🏢 Department: <span class="highlight">${department}</span></li>
                    <li>📝 Request ID: <span class="highlight">${reqId}</span></li>
                    <li>✅ Approved by: <span class="highlight">${
                      approvalRecord.departmentName
                    } Department</span></li>
                    <li>📅 Approval Date: <span class="highlight">${
                      approvalRecord.approvalDate
                    }</span></li>
                  </ul>
                </div>

                <p>Please review and process this request at your earliest convenience.</p>
                
               
              </div>

              <div class="footer">
                <p>This is an automated message from Capillary Finance. Please do not reply to this email.</p>
                <p>© ${new Date().getFullYear()} Capillary Finance. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      default:
        console.error("Invalid email type");
        return;
    }

    const mailOptions = {
      from: `"Capillary Technology" <${process.env.EMAIL_ADDRESS}>`,
      to: userEmail,
      subject: subject,
      text: textContent,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${userEmail}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = { sendLoginEmail, sendBulkEmails, sendIndividualEmail };
