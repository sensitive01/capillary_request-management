const emailTemplates = {
  login: {
    subject: "Login Notification from PO Request Portal",
    html: `
        <!DOCTYPE html>
        <html>
        <body>
          <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; text-align: center;">
            <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
              <div style="background-color: #007bff; color: #ffffff; padding: 20px;">
                <h1>Capillary Technologies - PO Request Portal</h1>
              </div>
              <div style="padding: 20px; color: #333;">
                <p>Hi <strong>{{full_name}}</strong>,</p>
                <p>You have successfully logged in to PO Request Portal!</p>
                <p>If you did not perform this action, please sign out immediately and notify us.</p>
                <p>Thank you,<br>Capillary Finance</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
  },

  vendorOnboarding: {
    subject: "Vendor Onboarding Process - Capillary Finance",
    html: `
        <!DOCTYPE html>
        <html>
        <body>
          <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; text-align: center;">
            <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
              <div style="background-color: #007bff; color: #ffffff; padding: 20px;">
                <h1>Welcome, {{vendorName}}!</h1>
              </div>
              <div style="padding: 20px; color: #333;">
                <p>Hi <strong>{{vendorName}}</strong>,</p>
                <p>We are pleased to inform you that you are now providing services to Capillary Finance.</p>
                <p>As a new vendor, you must complete the onboarding process.</p>
                <p>Please contact the <strong>Capillary Finance Vendor Management Team</strong> to complete your onboarding.</p>
                <p>We look forward to working with you!</p>
                <p>Best Regards,<br>Capillary Finance Team</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
  },
  newVendorOnBoard: {
    subject: "Vendor Onboarding Process - Capillary Finance",
    html: `
      <!DOCTYPE html>
      <html>
      <body>
        <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; text-align: center;">
          <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #007bff; color: #ffffff; padding: 20px;">
              <h1>Vendor Onboarding Notification - Capillary Finance</h1>
            </div>
            <div style="padding: 20px; color: #333;">
              <p>Dear Team,</p>
              <p>A new vendor, <strong>{{vendorName}}</strong>, <strong>{{email}}</strong>,has been added to the system for the PO-Request {{reqid}} and is awaiting onboarding.</p>
              <p>Please review the vendor details and complete the necessary onboarding process. Ensure all details are accurate before proceeding.</p>
              <p>It is crucial to verify all the necessary information as soon as possible.</p>
              <p>Best Regards,<br>Capillary Finance Team</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  editRequest: {
    subject: `Edit Request for Employee`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; text-align: center;">
          <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #007bff; color: #ffffff; padding: 20px;">
              <h1>Request Edit Notification</h1>
            </div>
            <div style="padding: 20px; color: #333;">
              <p>Dear {{to_name}},</p>
              <p>This is to inform you that employee with ID <strong>{{empId}}</strong> {{empName}} has requested an edit for the request with Request Id <strong>{{reqid}}</strong>.</p>
              <p>Please review the request at your earliest convenience.</p>
              <p>Best regards,</p>
              <p><strong>{{empName}}</strong><br>{{empEmail}}</p>
              <p><strong>{{department}}</strong></p>

              <div style="text-align: center; margin-top: 20px;">
                <a href="https://porequests.corp.capillarytech.com" style="background-color: #007bff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Review Request</a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  },
  financeApprovalEmail: {
    subject: `Finance Approval Notification`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; text-align: center;">
          <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #28a745; color: #ffffff; padding: 20px;">
              <h1>Finance Approval Notification</h1>
            </div>
            <div style="padding: 20px; color: #333;">
              <p>Dear Team,</p>
              <p>The request with ID <strong>{{reqid}}</strong> has been approved by the <strong>Finance Department</strong>.</p>
              <p>The request is now awaiting PO upload. Please proceed with the next steps.</p>
              
              <div style="text-align: center; margin-top: 20px;">
                <a href="https://porequests.corp.capillarytech.com" style="background-color: #28a745; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Upload PO</a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  },
  nudgeNotification: {
    subject: `Reminder: Request ID {{reqid}} Pending Action`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; text-align: center;">
          <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #ff9800; color: #ffffff; padding: 20px;">
              <h1>Action Required: Pending Request</h1>
            </div>
            <div style="padding: 20px; color: #333;">
              <p>Dear Team,</p>
              <p>This is a gentle reminder that Request ID <strong>{{reqid}}</strong> is still pending from the user's side.</p>
              <p>Please review the request and take the necessary action at the earliest.</p>
              <p><strong>Requester:</strong> {{empName}} ({{empEmail}})</p>
              <p><strong>Department:</strong> {{department}}</p>
  
              <div style="text-align: center; margin-top: 20px;">
                <a href="https://porequests.corp.capillarytech.com" style="background-color: #ff9800; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Review Request</a>
              </div>
  
              <p style="margin-top: 20px; font-size: 12px; color: #777;">
                This is an automated reminder. If action has already been taken, please ignore this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  },
};

module.exports = emailTemplates;
