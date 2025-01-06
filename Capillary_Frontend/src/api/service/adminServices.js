import { adminServices } from "../axiosInstance/adminService";

// ............................VENDOR SIDE..........................................................

export const getNewVendorId = async () => {
  try {
    const response = await adminServices.get(`/vendors/get-new-vendorid`);
    return response;
  } catch (err) {
    return err;
  }
};

export const createNewVendor = async (formData) => {
  try {
    const response = await adminServices.post(
      `/auth/create-newvendor`,
      formData
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const getVendorList = async () => {
  try {
    const response = await adminServices.get(`/vendors/get-all`);
    return response;
  } catch (err) {
    return err;
  }
};

export const RegVendorData = async (formData) => {
  try {
    const response = await adminServices.post(`/vendors/create`, formData);
    return response;
  } catch (err) {
    return err;
  }
};

export const fetchAllVendorData = async () => {
  try {
    const response = await adminServices.get(`/vendors/get-all`);
    return response;
  } catch (err) {
    return err;
  }
};

export const deleteVendor = async (id) => {
  try {
    const response = await adminServices.delete(`/vendors/delete/${id}`);
    return response;
  } catch (err) {
    return err;
  }
};
export const getVendorData = async (id) => {
  try {
    const response = await adminServices.get(`/vendors/get/${id}`);
    return response;
  } catch (err) {
    return err;
  }
};

export const updateVendorData = async (id, formData) => {
  try {
    const response = await adminServices.put(`/vendors/update/${id}`, formData);
    return response;
  } catch (err) {
    return err;
  }
};

export const getVenorIndividualData = async (vendorId) => {
  try {
    console.log("loading....");
    const response = await adminServices.get(
      `/vendors/get-vendor-data/${vendorId}`
    );
    return response;
  } catch (err) {
    return err;
  }
};

// ............................VENDOR SIDE..........................................................

// ............................EMPLOYEE SIDE..........................................................

export const generateEmployeeUniqueId = async () => {
  try {
    const response = await adminServices.get(`/employees/generate-empid`);
    return response;
  } catch (err) {
    return err;
  }
};

export const getSyncEmployeeTable = async () => {
  try {
    const response = await adminServices.post(`/employees/sync-emp-data`);
    return response;
  } catch (err) {
    return err;
  }
};

export const regNewEmployee = async (formData) => {
  try {
    const response = await adminServices.post(
      `/employees/create-new-employee`,
      formData
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const deleteEmployee = async (id) => {
  try {
    const response = await adminServices.delete(`/employees/delete/${id}`);
    return response;
  } catch (err) {
    return err;
  }
};

export const getEmployeeList = async () => {
  try {
    const response = await adminServices.get(`/employees/get-all`);
    return response;
  } catch (err) {
    return err;
  }
};

export const createNewRequest = async (id, formData) => {
  try {
    const response = await adminServices.post(
      `/employees/create-newrequest/${id}`,
      formData
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const getEmployeeData = async (id) => {
  try {
    const response = await adminServices.get(`/employees/get/${id}`);
    return response;
  } catch (err) {
    return err;
  }
};

export const updateEmployeeData = async (id, formData) => {
  try {
    const response = await adminServices.put(
      `/employees/update/${id}`,
      formData
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const isDisplayButton = async (id) => {
  try {
    const response = await adminServices.get(
      `/request/is-display-button/${id}`
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const generatePo = async (id) => {
  try {
    const response = await adminServices.get(`/request/generate-po/${id}`);
    return response;
  } catch (err) {
    return err;
  }
};

export const updateRequest = async (id, formData) => {
  try {
    const response = await adminServices.put(
      `/request/update-request/${id}`,
      formData
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const addNewQuestion = async (userId, newQuestion) => {
  try {
    const response = await adminServices.post(
      `/questions/create-new-question/${userId}`,
      newQuestion
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const fetchMyQuestions = async (userId) => {
  try {
    const response = await adminServices.get(
      `/questions/get-my-question/${userId}`
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const changeQuestionVisibility = async (questionId) => {
  try {
    const response = await adminServices.put(
      `/questions/update-question-visibility/${questionId}`
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const getAllLegalQuestions = async () => {
  try {
    const response = await adminServices.get(
      `/questions/get-all-legal-questions`
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const verifyToken = async (crediantial) => {
  try {
    const response = await adminServices.post(`/verify-token`, {
      token: crediantial,
    });
    return response;
  } catch (err) {
    return err;
  }
};

// ............................EMPLOYEE SIDE..........................................................

// ............................DOMAIN SIDE..........................................................

export const allowedDomain = async (domain) => {
  try {
    const response = await adminServices.post(`/auth/admin-allow-domain`, {
      domain,
    });
    return response;
  } catch (err) {
    return err;
  }
};

export const listDomains = async (domain) => {
  try {
    const response = await adminServices.get(`/auth/admin-domain-list`, {
      domain,
    });
    return response;
  } catch (err) {
    return err;
  }
};

export const deleteDomain = async (id) => {
  try {
    const response = await adminServices.delete(
      `/auth/admin-delete-domain/${id}`
    );
    return response;
  } catch (err) {
    return err;
  }
};

// ............................DOMAIN SIDE..........................................................

// ............................REQUEST SIDE..........................................................

export const submitRequest = async (id, formData) => {
  try {
    const response = await adminServices.post(
      `/auth/create-request/${id}`,
      formData
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const getReqListEmployee = async (id) => {
  try {
    console.log("Loading....");
    const response = await adminServices.get(`/employees/get-all-req/${id}`);
    return response;
  } catch (err) {
    return err;
  }
};

export const fetchIndividualReq = async (id) => {
  try {
    console.log(id);
    const response = await adminServices.get(
      `/employees/get-individual-req/${id}`
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const deleteReq = async (id) => {
  try {
    const response = await adminServices.delete(`/employees/delete-req/${id}`);
    return response;
  } catch (err) {
    return err;
  }
};

export const getReqListHR = async () => {
  try {
    const response = await adminServices.get(`/employees/get-all-req-admin`);
    return response;
  } catch (err) {
    return err;
  }
};

export const getAdminReqListEmployee = async () => {
  try {
    const response = await adminServices.get(`/employees/get-all-req-admin`);
    return response;
  } catch (err) {
    return err;
  }
};

export const hodApproveRequest = async (userId, role, reqId, status) => {
  try {
    const response = await adminServices.post(
      `/request/accept-request-hod/${userId}`,
      { role, reqId, status }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const businessFinanceApproveRequest = async (
  userId,
  role,
  reqId,
  status
) => {
  try {
    const response = await adminServices.post(
      `/request/accept-request-business/${userId}`,
      { role, reqId, status }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const vendorManagementApproveRequest = async (
  userId,
  role,
  reqId,
  status
) => {
  try {
    const response = await adminServices.post(
      `/request/accept-request-vendor/${userId}`,
      { role, reqId, status }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const legalTeamApproveRequest = async (userId, role, reqId, status) => {
  try {
    const response = await adminServices.post(
      `/request/accept-request-legal/${userId}`,
      { role, reqId, status }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const infoSecurityApproveRequest = async (
  userId,
  role,
  reqId,
  status
) => {
  try {
    const response = await adminServices.post(
      `/request/accept-request-info-security/${userId}`,
      { role, reqId, status }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const poTeamApproveRequest = async (userId, role, reqId, status) => {
  try {
    const response = await adminServices.post(
      `/request/accept-request-po-team/${userId}`,
      { role, reqId, status }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const hofApproveRequest = async (userId, role, reqId, status) => {
  try {
    const response = await adminServices.post(
      `/request/accept-request-hof-team/${userId}`,
      { role, reqId, status }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const getNewNotification = async (userId) => {
  try {
    const response = await adminServices.get(
      `/request/get-new-notification/${userId}`
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const getApprovedReq = async (userId) => {
  try {
    const response = await adminServices.get(
      `/request/get-approved-req/${userId}`
    );
    return response;
  } catch (err) {
    return err;
  }
};

// api/service/adminServices.js
export const downloadInvoicePdf = async (id) => {
  try {
    const response = await adminServices.get(`/request/invoice/download/${id}`, {
      responseType: "blob",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/pdf",
      },
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true };
  } catch (error) {
    console.error("Error downloading PDF:", error);
    return { success: false, error: error.message };
  }
};

// ............................REQUEST SIDE..........................................................

// ............................ENTITY SIDE..........................................................

export const getAllEntityData = async () => {
  try {
    const response = await adminServices.get(`/entity/get-all`);
    return response;
  } catch (err) {
    return err;
  }
};

export const addEntityData = async (data) => {
  try {
    const response = await adminServices.post(`/entity/create`, { data });
    return response;
  } catch (err) {
    return err;
  }
};

export const deleteEntity = async (id) => {
  try {
    const response = await adminServices.delete(`/entity/delete/${id}`);
    return response;
  } catch (err) {
    return err;
  }
};

export const getEntityData = async (id) => {
  try {
    const response = await adminServices.get(`/entity/get/${id}`);
    return response;
  } catch (err) {
    return err;
  }
};

export const updateEntityData = async (id, data) => {
  try {
    const response = await adminServices.put(`/entity/update/${id}`, {
      data: data,
    });
    return response;
  } catch (err) {
    return err;
  }
};

// ............................ENTITY SIDE..........................................................

export const sendMessageComments = async (message) => {
  try {
    const response = await adminServices.put(
      `/request/chats/${message.reqId}`,
      {
        data: message,
      }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const fetcAllChats = async (id) => {
  try {
    const response = await adminServices.get(
      `/request/get-all-chats/${id}`,
      {}
    );
    return response;
  } catch (err) {
    return err;
  }
};
