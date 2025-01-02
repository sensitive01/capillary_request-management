import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

// import Login from "./components/Login";
import Dashboard from "./components/Dasboard";
import HomePage from "./components/home/HomePage";


import SidebarLayout from "./components/dashboard/layout/SidebarLayout";
import UserRegistartion from "./components/dashboard/createuser/UserRegistartion";
import UserListTable from "./components/dashboard/createuser/UserListTable";
import AddUser from "./components/dashboard/createuser/AddUser";
import EditUser from "./components/dashboard/createuser/EditUser";
import AllowDomainList from "./components/dashboard/admin/AllowDomainList";
import DomainListTable from "./components/dashboard/admin/DomainListTable";
import CreateRequest from "./components/dashboard/requestlist/CreateRequest";
import ReqListTable from "./components/dashboard/requestlist/ReqListTable";
import VendorRegistration from "./components/dashboard/vendor/VendorRegistration";
import VendorListTable from "./components/dashboard/vendor/VendorListTable";
import Support from "./components/dashboard/support/Support";
import EmployeeReg from "./components/dashboard/employe/EmployeReg";
import AddEntity from "./components/dashboard/entity/AddEntity";
import Invoice from "./components/dashboard/requestlist/Invoice";
import EntityListTable from "./components/dashboard/entity/EntityListTable";
import EditEntity from "./components/dashboard/entity/EditEntity";
import EmployeListTable from "./components/dashboard/employe/EmployeListTable";
import EditEmploye from "./components/dashboard/employe/EditEmploye";
import EditVendor from "./components/dashboard/vendor/EditVendor";
import PreviewTheReq from "./components/dashboard/requestlist/PreviewTheReq";
import Approvals from "./components/dashboard/approvals/Approvals";
import EditRequestForm from "./components/dashboard/requestlist/edit/EditRequestForm";
import QuestionsDetails from "./components/questions/QuestionDetails";
import VendorPreview from "./components/dashboard/vendor/VendorPreview";


function App() {
  return (
    <Router>
      <Routes>
  
        {/* <Route path="/" element={<Login />} /> */}
          <Route path="/" element={<HomePage />} />
          <Route path="/" element={<SidebarLayout />}>

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/req-list-table" element={<ReqListTable/>} />
          <Route path="/req-list-table/create-request" element={<CreateRequest/>} />
          <Route path="/req-list-table/invoice/:id" element={<Invoice/>} />
          <Route path="/req-list-table/preview-one-req/:id" element={<PreviewTheReq/>} />
          <Route path="/req-list-table/edit-req/:id" element={<EditRequestForm/>} />


          <Route path="/approveal-request-list" element={<Approvals/>} />
          <Route path="/questions" element={<QuestionsDetails/>} />


          <Route path="/users/list" element={<UserListTable />} />
          <Route path="/create-user" element={<UserRegistartion />} />
          <Route path="/users/adduser" element={<AddUser/>} />
          <Route path="/users/edituser" element={<EditUser/>} />

          <Route path="/entity-list-table" element={<EntityListTable/>} />
          <Route path="/entity-list-table/entities" element={<AddEntity/>} />
          <Route path="/entity-list-table/edit-entities/:id" element={<EditEntity/>} />

          <Route path="/vendor-list-table" element={<VendorListTable/>} />
          <Route path="/vendor-list-table/vendor-registration" element={<VendorRegistration/>} />
          <Route path="/vendor-list-table/edit-vendor/:id" element={<EditVendor/>} />
          <Route path="/vendor-list-table/get-vendor/:vendorId" element={<VendorPreview/>} />


          <Route path="/employee-list-table" element={<EmployeListTable/>} />
          <Route path="/employee-list-table/employee-reg" element={<EmployeeReg/>} />
          <Route path="/employee-list-table/edit-employee/:id" element={<EditEmploye/>} />

          <Route path="/support" element={<Support/>} />
          <Route path="/invoice" element={<Invoice/>} />
          <Route path="/admin/domain" element={<AllowDomainList/>} />
          <Route path="/admin/domain-table" element={<DomainListTable/>} />

        </Route>
      </Routes>
    </Router>
  );
}

export default App;
