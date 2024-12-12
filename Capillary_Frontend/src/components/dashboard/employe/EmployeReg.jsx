import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  generateEmployeeUniqueId,
  getAllEntityData,
  regNewEmployee,
} from "../../../api/service/adminServices";
import { toast, ToastContainer } from "react-toastify";

const EditEmployee = () => {
  const navigate = useNavigate();

  const { id } = useParams();

 
  const [isDateInput, setIsDateInput] = useState(false);
  const [isStartTimeInput, setIsStartTimeInput] = useState(false);
  const [isEndTimeInput, setIsEndTimeInput] = useState(false);

  const [formData, setFormData] = useState({
    empId: "",
    name: "",
    contact: "",
    email: "",
    dob: "",
    dateOfJoining: "",
    gender: "",
    role: "",
    entity: "",
    reportingTo: "",
    location: "",
    workType: "",
    department: "",
    pincode: "",
    city: "",
    state: "",
    addressLine: "",
    area: "",
    landmark: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    const fetchEmpId = async () => {
      console.log("generating id");
  
      const response = await generateEmployeeUniqueId();
      console.log(response);
      if (response.status === 200) {
        setFormData((prev) => ({
          ...prev,
          empId: response?.data?.empId,
        }));
      }
    };
  
    fetchEmpId();
  }, []);

  useEffect(() => {
    const fetchEntity = async () => {
      const response = await getAllEntityData();
      console.log("response entity", response);
    };
    fetchEntity();
  }, []);
  

  const fetchCityState = async () => {
    if (!formData.pincode) {
      alert("Please enter a valid pincode.");
      return;
    }

    try {
      const response = await axios.get(
        `https://api.postalpincode.in/pincode/${formData.pincode}`
      );

      if (response.data && response.data[0].Status === "Success") {
        const { District, State } = response.data[0].PostOffice[0];
        setFormData(prevData => ({
          ...prevData,
          city: District,
          state: State
        }));
      } else {
        alert("Invalid pincode or data not found!");
      }
    } catch (error) {
      console.error("Error fetching city and state:", error);
      alert("Failed to fetch city and state. Please try again later.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Employee Data:", formData);
    const response = await regNewEmployee(formData);
    console.log(response);
    if (response.status === 201) {
      toast.success(response.data.message)
      setTimeout(() => {
        
        navigate("/employee-list-table");
      }, 1500);
    }
  };



  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Employee</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="p-4 border rounded-lg border-primary">
          <div>
            <input
              name="empid"
              value={formData.empId}
              type="text"
              placeholder="Employee ID"
              readOnly
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary mb-3"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                name="name"
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <input
                name="contact"
                type="text"
                placeholder="Contact"
                value={formData.contact}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <select
                name="gender"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.gender}
                onChange={handleInputChange}
              >
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="relative">
              {isDateInput ? (
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  onBlur={() => !formData.dob && setIsDateInput(false)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <input
                  type="text"
                  value={formData.dob}
                  placeholder="Date of Birth"
                  readOnly
                  onFocus={() => setIsDateInput(true)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                />
              )}
            </div>
            <div className="relative">
              {isDateInput ? (
                <input
                  type="date"
                  name="dateOfJoining"
                  value={formData.dateOfJoining}
                  onChange={handleInputChange}
                  onBlur={() => !formData.dateOfJoining && setIsDateInput(false)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <input
                  type="text"
                  value={formData.dateOfJoining}
                  placeholder="Date of Joining"
                  readOnly
                  onFocus={() => setIsDateInput(true)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                />
              )}
            </div>
          </div>
        </div>

        {/* Entity Section */}
        <div className="mt-6">
          <h2 className="text-lg text-primary mb-2">Entity</h2>
          <div className="p-4 border rounded-lg border-primary">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <input
                  name="role"
                  type="text"
                  placeholder="Role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <input
                  name="department"
                  type="text"
                  placeholder="Department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <input
                  name="reportingTo"
                  type="text"
                  placeholder="Reporting To"
                  value={formData.reportingTo}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <select
                  name="entity"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.entity}
                  onChange={handleInputChange}
                >
                  <option value="">Entity</option>
                  {/* Add entity options here */}
                </select>
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <input
                  name="location"
                  type="text"
                  placeholder="Location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <select
                  name="workType"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.workType}
                  onChange={handleInputChange}
                >
                  <option value="">Work Type</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
              <div>
                <div className="flex space-x-5">
             
                  {isStartTimeInput ? (
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      onBlur={() => !formData.startTime && setIsStartTimeInput(false)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder="Start Time"
                      readOnly
                      value={formData.startTime}
                      onFocus={() => setIsStartTimeInput(true)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                    />
                  )}
                  <span className="text-gray-600 self-center">to</span>
                  {/* End Time Input */}
                  {isEndTimeInput ? (
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      onBlur={() => !formData.endTime && setIsEndTimeInput(false)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder="End Time"
                      readOnly
                      value={formData.endTime}
                      onFocus={() => setIsEndTimeInput(true)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Address Details Section */}
        <div className="mt-6">
          <h2 className="text-lg text-primary mb-2">Address Details</h2>
          <div className="p-4 border rounded-lg border-primary">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <input
                  name="pincode"
                  type="text"
                  placeholder="Pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  onBlur={fetchCityState}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <input
                  name="city"
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  readOnly
                  className="w-full p-2 border rounded bg-gray-100"
                />
              </div>
              <div>
                <input
                  name="state"
                  type="text"
                  placeholder="State"
                  value={formData.state}
                  readOnly
                  className="w-full p-2 border rounded bg-gray-100"
                />
              </div>
              <div>
                <input
                  name="addressLine"
                  type="text"
                  placeholder="Address Line"
                  value={formData.addressLine}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <input
                  name="area"
                  type="text"
                  placeholder="Area"
                  value={formData.area}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <input
                  name="landmark"
                  type="text"
                  placeholder="Landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            SUBMIT
          </button>
        </div>
      </form>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
      />
    </div>
  );
};

export default EditEmployee;