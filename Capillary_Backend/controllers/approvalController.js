const CreateNewReq = require("../models/createNewReqSchema");
const Employee = require("../models/empModel");
const panelUserData = require("../models/addPanelUsers");
const { sendIndividualEmail } = require("../utils/otherTestEmail");
const entityModel = require("../models/entityModel");
const sendEmail = require("../utils/sendEmail");


const approveRequest = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const { id } = req.params;
    const { reqId, status, email, reason,role } = req.body;
    console.log(reqId, status, email, reason)
    const remarks = reason;

    // Fetch required data
    const reqData = await CreateNewReq.findOne(
      { _id: reqId },
      {
        firstLevelApproval: 1,
        userId: 1,
        approvals: 1,
        procurements: 1,
        hasDeviations: 1,
        createdAt: 1,
        status:1,
        commercials:1

      }
    );
    console.log("reqData====>", reqData);

    if (!reqData) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    const approverData =
      (await panelUserData.findOne({ employee_id: id })) ||
      (await Employee.findOne({ employee_id: id }));

    if (!approverData) {
      return res.status(404).json({
        success: false,
        message: "Approver not found",
      });
    }

    const requesterData = await Employee.findOne(
      { employee_id: reqData.userId },
      { full_name: 1, company_email_id: 1, department: 1, employee_id: 1 }
    );

    if (!requesterData) {
      return res.status(404).json({
        success: false,
        message: "Requester not found",
      });
    }

    const isHeHod = reqData.firstLevelApproval.hodEmail === email;
    const { department } = approverData;

    // Handle Hold or Rejected status
    if (status === "Hold" || status === "Rejected") {
      const latestApproval = reqData.approvals[reqData.approvals.length - 1];

      const approvalRecord = {
        departmentName: approverData.department,
        status: status,
        approverName: approverData.full_name,
        approvalId: approverData.employee_id,
        approvalDate: new Date(),
        remarks: remarks || "",
        nextDepartment: null,
        receivedOn: isHeHod
          ? reqData.createdAt
          : latestApproval?.approvalDate || new Date(),
      };

      if (isHeHod) {
        reqData.firstLevelApproval.approved = false;
        reqData.firstLevelApproval.status = status;
        reqData.status = status;
        reqData.approvals.push(approvalRecord);
        await reqData.save();
      } else {
        reqData.status = status;
        reqData.approvals.push(approvalRecord);
        await reqData.save();
      }

      // Send emails for Hold/Reject status
      // await sendIndividualEmail(
      //   "EMPLOYEE",
      //   requesterData.company_email_id,
      //   requesterData.full_name,
      //   requesterData.department,
      //   reqId,
      //   approvalRecord
      // );

      // await sendIndividualEmail(
      //   "AUTHORITY",
      //   approverData.company_email_id,
      //   approverData.full_name,
      //   approverData.department,
      //   reqId,
      //   approvalRecord
      // );

      return res.status(200).json({
        success: true,
        message: `Request ${status.toLowerCase()} successfully`,
        data: approvalRecord,
      });
    } else {
      console.log("reqData.status" ,reqData.status)
      if (reqData.status === "Hold" || reqData.status === "Rejected") {
        console.log("A checkigm")
        reqData.status = "Pending";
        await reqData.save();
      }

      const departmentOrder = [
        reqData.firstLevelApproval.hodEmail,
        "Business Finance",
        "Vendor Management",
        "Legal Team",
        "Info Security",
        "Head of Finance",
        "Proceed the PO invoice",
      ];

      let currentDeptIndex;
      if (email === reqData.firstLevelApproval.hodEmail) {
        currentDeptIndex = departmentOrder.indexOf(email);
      } else {
        currentDeptIndex = departmentOrder.indexOf(role);
      }

      const nextDepartment = departmentOrder[currentDeptIndex + 1] || null;
      const latestApproval = reqData.approvals[reqData.approvals.length - 1];
      console.log("last level approvals",latestApproval)

      const approvalRecord = {
        departmentName: approverData.department,
        status: status,
        approverName: approverData.full_name,
        approvalId: approverData.employee_id,
        approvalDate: new Date(),
        remarks: remarks || "",
        nextDepartment: status === "Approved" ? nextDepartment : null,
        receivedOn: isHeHod
          ? reqData.createdAt
          : latestApproval?.approvalDate || new Date(),
      };

      if (
        (latestApproval?.status === "Rejected" ||
        latestApproval?.status === "Hold") && latestApproval.length>0
      ) {
        const approvalRecords = {
          departmentName: approverData.department,
          status: status,
          approverName: approverData.full_name,
          approvalId: approverData.employee_id,
          approvalDate: new Date(),
          remarks: remarks || "",
          nextDepartment: status === "Approved" ? nextDepartment : null,

          receivedOn: isHeHod
            ? reqData.createdAt
            : latestApproval?.approvalDate || new Date(),
        };

        reqData.approvals.push(approvalRecords);
        await reqData.save();
      }

      if (isHeHod) {
        reqData.firstLevelApproval.approved = true;
        reqData.firstLevelApproval.status = status;
        reqData.status = "Pending";
        reqData.approvals.push(approvalRecord);
        await reqData.save();
      }

      // Business Finance Auto-approval flow
      if (
        role === "Business Finance" &&
        !reqData.procurements.isNewVendor &&
        status === "Approved"
      ) {
        if (reqData.hasDeviations === 1) {
          const autoApproveDepartments = ["Vendor Management", "Legal Team"];
          const remarks = "Auto-approved";

          for (let i = 0; i < autoApproveDepartments.length - 1; i++) {
            const autoDepartment = autoApproveDepartments[i];
            const isLastDepartment = i === autoApproveDepartments.length - 1;
            const nextAutoDepartment = isLastDepartment
              ? null
              : autoApproveDepartments[i + 1];

            const autoApproverData = await panelUserData.findOne(
              { role: autoDepartment },
              { full_name: 1, employee_id: 1, company_email_id: 1 }
            );

            if (autoApproverData) {
              const autoApprovalRecord = {
                departmentName: autoDepartment,
                status: "Approved",
                approverName: autoApproverData.full_name,
                approvalId: autoApproverData.employee_id,
                approvalDate: new Date(),
                remarks: remarks,
                nextDepartment: nextAutoDepartment,
                receivedOn: new Date(),
              };

              await CreateNewReq.updateOne(
                { _id: reqId },
                {
                  $push: { approvals: autoApprovalRecord },
                  $set: {
                    currentStatus: "Approved",
                    currentDepartment: nextAutoDepartment || autoDepartment,
                  },
                }
              );

              // await sendIndividualEmail(
              //   "EMPLOYEE",
              //   requesterData.company_email_id,
              //   requesterData.full_name,
              //   requesterData.department,
              //   reqId,
              //   autoApprovalRecord
              // );

              // await sendIndividualEmail(
              //   "AUTHORITY",
              //   autoApproverData.company_email_id,
              //   autoApproverData.full_name,
              //   autoApproverData.department,
              //   reqId,
              //   autoApprovalRecord
              // );


            } else {
              console.error(
                `No approver found for department: ${autoDepartment}`
              );
              break;
            }
          }
        } else {
          const autoApproveDepartments = [
            "Vendor Management",
            "Legal Team",
            "Info Security",
            "Head of Finance",
          ];
          const remarks = "Auto-approved";

          for (let i = 0; i < autoApproveDepartments.length; i++) {
            const autoDepartment = autoApproveDepartments[i];
            const isLastDepartment = i === autoApproveDepartments.length - 1;
            const nextAutoDepartment = isLastDepartment
              ? null
              : autoApproveDepartments[i + 1];

            const autoApproverData = await panelUserData.findOne(
              { role: autoDepartment },
              { full_name: 1, employee_id: 1, company_email_id: 1 }
            );

            if (autoApproverData) {
              const autoApprovalRecord = {
                departmentName: autoDepartment,
                status: "Approved",
                approverName: autoApproverData.full_name,
                approvalId: autoApproverData.employee_id,
                approvalDate: new Date(),
                remarks: remarks,
                nextDepartment: nextAutoDepartment,
                receivedOn: new Date(),
              };

              await CreateNewReq.updateOne(
                { _id: reqId },
                {
                  $push: { approvals: autoApprovalRecord },
                  $set: {
                    currentStatus: "Approved",
                    currentDepartment: nextAutoDepartment || autoDepartment,
                  },
                }
              );

              // await sendIndividualEmail(
              //   "EMPLOYEE",
              //   requesterData.company_email_id,
              //   requesterData.full_name,
              //   requesterData.department,
              //   reqId,
              //   autoApprovalRecord
              // );

              // await sendIndividualEmail(
              //   "AUTHORITY",
              //   autoApproverData.company_email_id,
              //   autoApproverData.full_name,
              //   autoApproverData.department,
              //   reqId,
              //   autoApprovalRecord
              // );

              if (autoDepartment === "Info Security") {
                await CreateNewReq.updateOne(
                  { _id: reqId },
                  {
                    $set: {
                      currentDepartment: "Head of Finance",
                    },
                  }
                );
                break;
              }
            } else {
              console.error(
                `No approver found for department: ${autoDepartment}`
              );
              break;
            }
          }
        }
      }

      // HOF Approval flow
      if (role === "Head of Finance" && status === "Approved") {
        await CreateNewReq.updateOne(
          { _id: reqId },
          {
            $set: {
              status: "PO-Pending",
              approvedOn: new Date(),
            },
          }
        );

        const entityMail = await entityModel.findOne(
          { _id: reqData.commercials.entityId },
          { poMailId: 1 }
        );

        // if (entityMail?.poMailId) {
        //   await sendEmail(entityMail.poMailId, "financeApprovalEmail", {
        //     reqId,
        //   });
        // }
      }

      // Vendor Management Auto-approval flow
      if (
        role === "Vendor Management" &&
        reqData.hasDeviations === 0 &&
        status === "Approved"
      ) {
        const autoApproveDepartments = ["Legal Team", "Info Security", "Head of Finance"];
        const remarks = "Auto-approved: No violations in the legal compliance";

        for (let i = 0; i < autoApproveDepartments.length; i++) {
          const autoDepartment = autoApproveDepartments[i];
          const isLastDepartment = i === autoApproveDepartments.length - 1;
          const nextAutoDepartment = isLastDepartment
            ? null
            : autoApproveDepartments[i + 1];

          const autoApproverData = await panelUserData.findOne(
            { role: autoDepartment },
            { full_name: 1, employee_id: 1, company_email_id: 1 }
          );

          if (autoApproverData) {
            const autoApprovalRecord = {
              departmentName: autoDepartment,
              status: "Approved",
              approverName: autoApproverData.full_name,
              approvalId: autoApproverData.employee_id,
              approvalDate: new Date(),
              remarks: remarks,
              nextDepartment: nextAutoDepartment,
              receivedOn: new Date(),
            };

            await CreateNewReq.updateOne(
              { _id: reqId },
              {
                $push: { approvals: autoApprovalRecord },
                $set: {
                  currentStatus: "Approved",
                  currentDepartment: nextAutoDepartment || autoDepartment,
                },
              }
            );

            // await sendIndividualEmail(
            //   "EMPLOYEE",
            //   requesterData.company_email_id,
            //   requesterData.full_name,
            //   requesterData.department,
            //   reqId,
            //   autoApprovalRecord
            // );

            // await sendIndividualEmail(
            //   "AUTHORITY",
            //   autoApproverData.company_email_id,
            //   autoApproverData.full_name,
            //   autoApproverData.department,
            //   reqId,
            //   autoApprovalRecord
            // );

            if (autoDepartment === "Info Security") {
              await CreateNewReq.updateOne(
                { _id: reqId },
                {
                  $set: {
                    currentDepartment: "Head of Finance",
                  },
                }
              );
              break;
            }
          } else {
            console.error(
              `No approver found for department: ${autoDepartment}`
            );
            break;
          }
        }
      } else {
        // Regular email notifications for non-auto-approval cases
        // await sendIndividualEmail(
        //   "EMPLOYEE",
        //   requesterData.company_email_id,
        //   requesterData.full_name,
        //   requesterData.department,
        //   reqId,
        //   approvalRecord
        // );

        if (status === "Approved") {
          // await sendIndividualEmail(
          //   "AUTHORITY",
          //   approverData.company_email_id,
          //   approverData.full_name,
          //   approverData.department,
          //   reqId,
          //   approvalRecord
          // );
        }
      }

      // Send success response
      return res.status(200).json({
        success: true,
        message: "Request processed successfully",
        data: {
          status,
          department,
          approvalRecord,
          updatedRequest: reqData,
        },
      });
    }
  } catch (err) {
    console.error("Error in approving the request:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports = {
  approveRequest,
};
