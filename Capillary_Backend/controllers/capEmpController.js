const jwt = require("jsonwebtoken");

const addPanelUsers = require("../models/addPanelUsers");
const Employee = require("../models/empModel");
const sendLoginEmail = require("../utils/sendEmail");

const { CAPILLARY_JWT_SECRET } = require("../config/variables");
console.log(CAPILLARY_JWT_SECRET);

const verifyUser = async (req, res) => {
  try {
    console.log(req.body);
    const { email } = req.body;
    let consolidatedData;

    const panelUserData = await addPanelUsers
      .findOne(
        { company_email_id: email },
        { _id: 1, full_name: 1, department: 1, role: 1 }
      )
      .lean();
    console.log("panelUserData", panelUserData);

    const employeeData = await Employee.findOne(
      { company_email_id: email },
      { _id: 1, full_name: 1, department: 1, hod_email_id: 1 }
    ).lean();

    const isEmpHod = await Employee.findOne({ hod_email_id: email }).lean();
    console.log("isEmpHod", isEmpHod);

    if (panelUserData) {
      consolidatedData = panelUserData;
    } else {
      if (employeeData && !employeeData.role) {
        consolidatedData = {
          ...employeeData,
          role: isEmpHod ? "HOD Department" : "Employee",
        };
      }
    }

    const full_name = consolidatedData?.full_name || "Unknown User";

    console.log("Consolidated Employee Data:", consolidatedData);

    const subject = "Login Notification from PO Request Portal";
    const textContent = "";
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <body>
          <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; text-align: center;">
            <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
              <div style="background-color: #007bff; color: #ffffff; padding: 20px;">
                <h1>Capillary Technologies - PO Request Portal</h1>
              </div>
              <div style="padding: 20px; color: #333;">
                <p>Hi <strong>${full_name}</strong>,</p>
                <p>You have successfully logged in to PO Request Portal!</p>
                <p>If you did not perform this action, please sign out immediately and notify us.</p>
                <p>Thank you,<br>Capillary Finance</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

    if (consolidatedData) {
      const token = jwt.sign(
        {
          id: consolidatedData._id,
          email: email,
          role: consolidatedData.role,
          department: consolidatedData.department,
          capEmpId: consolidatedData.employee_id,
        },
        CAPILLARY_JWT_SECRET,
        { expiresIn: "10h" }
      );
      console.log("Token", token);

        await sendLoginEmail(email, subject, textContent, htmlContent);

      return res.status(200).json({
        success: true,
        message: "Employee verified successfully.",
        data: consolidatedData,
        token,
      });
    } else {
        console.log("else")
      return res.status(401).json({
        success: false,
        message: "Employee not found.",
      });
    }
  } catch (err) {
    console.log("Error in verifying the employee", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = {
  verifyUser,
};
