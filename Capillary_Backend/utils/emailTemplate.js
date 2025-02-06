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
    subject: "Vendor Onboarding Process - Capillary Technologies",
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
                <p>Dear <strong>{{vendorName}}</strong>,</p>
                <p>We are pleased to inform you that you are now providing services to Capillary Technology.</p>
                <p>As a new vendor, you must complete the onboarding process.</p>
                <p>Please contact the <strong>Capillary Technology Vendor Management Team</strong> to complete your onboarding.</p>
                <p>We look forward to working with you!</p>
                <p>Best Regards,<br>Capillary Technology Team</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
  },
};

module.exports = emailTemplates;
