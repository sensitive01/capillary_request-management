import { useEffect, useState } from "react";
import axios from "axios";

import { useNavigate } from "react-router-dom";
import {
  generateEmployeeUniqueId,
  getAllEntityData,
  regNewEmployee,
} from "../../../api/service/adminServices";

const EmployeeReg = () => {
  const navigate = useNavigate();
  const [empid, setEmpId] = useState();
  const [name, setName] = useState();
  const [contact, setContact] = useState();
  const [email, setEmail] = useState();
  const [gender, setGender] = useState();
  const [dob, setDob] = useState();
  const [joinDate, setJoinDate] = useState();
  const [role, setRole] = useState();
  const [reportingTo, setReportingTo] = useState();
  const [entity, setEntity] = useState();
  const [location, setLocation] = useState();
  const [workType, setWorkType] = useState();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isStartTimeInput, setIsStartTimeInput] = useState(false);
  const [isEndTimeInput, setIsEndTimeInput] = useState(false);
  const [isDateInput, setIsDateInput] = useState(false);
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [adressLine, setAdressLine] = useState("");
  const [landMark, setLandMark] = useState("");
  const [area, setArea] = useState("");
  const [department, setDepartment] = useState("");

  useEffect(() => {
    const fetchEmpId = async () => {
      console.log("generating id");

      const response = await generateEmployeeUniqueId();
      console.log(response);
      if (response.status === 200) {
        setEmpId(response?.data?.empId);
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
    if (!pincode) {
      alert("Please enter a valid pincode.");
      return;
    }

    try {
      const response = await axios.get(
        `https://api.postalpincode.in/pincode/${pincode}`
      );

      if (response.data && response.data[0].Status === "Success") {
        const { District, State } = response.data[0].PostOffice[0];
        setCity(District);
        setState(State);
      } else {
        alert("Invalid pincode or data not found!");
      }
    } catch (error) {
      console.error("Error fetching city and state:", error);
      alert("Failed to fetch city and state. Please try again later.");
    }
  };

  const handleSubmit = async () => {
    const data = {
      empid,
      name,
      contact,
      email,
      gender,
      dob,
      joinDate,
      role,
      reportingTo,
      entity,
      location,
      workType,
      startTime,
      endTime,
      pincode,
      city,
      state,
      adressLine,
      landMark,
      area,
    };
    console.log(data);
    const response = await regNewEmployee(data);
    console.log(response);
    if (response.status === 201) {
      navigate("/employee-list-table");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Employee</h2>
      {/* Personal Information Section */}
      <div className="p-4 border rounded-lg border-primary">
        <div>
          <input
            value={empid}
            type="text"
            placeholder="Employee ID"
            onChange={(e) => setEmpId(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary mb-3"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Name"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <input
              type="text"
              name="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Contact"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <select
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
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
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                onBlur={() => !dob && setIsDateInput(false)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            ) : (
              <input
                type="text"
                value={dob}
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
                name="joinDate"
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
                onBlur={() => !joinDate && setIsDateInput(false)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            ) : (
              <input
                type="text"
                value={dob}
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
      <div>
        <h2 className="text-lg text-primary mb-2">Entity</h2>
        <div className="p-4 border rounded-lg border-primary">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* First Row */}
            <div>
              <input
                type="text"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Role"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <input
                type="text"
                name="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Department"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <input
                type="text"
                name="reportingTo"
                value={reportingTo}
                onChange={(e) => setReportingTo(e.target.value)}
                placeholder="Reporting To"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <select
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                name="entity"
                value={entity}
                onChange={(e) => setEntity(e.target.value)}
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
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                type="text"
                placeholder="Location"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <select
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                name="workType"
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
              >
                <option value="">Work Type</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
            <div>
              <div className="flex space-x-5">
                {/* Start Time Input */}
                {isStartTimeInput ? (
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    onBlur={() => !startTime && setIsStartTimeInput(false)} // Revert to text input if no time is selected
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <input
                    type="text"
                    placeholder="Start Time"
                    readOnly
                    value={startTime}
                    onFocus={() => setIsStartTimeInput(true)} // Switch to time input on focus
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  />
                )}
                <span className="text-gray-600 self-center">to</span>
                {/* End Time Input */}
                {isEndTimeInput ? (
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    onBlur={() => !endTime && setIsEndTimeInput(false)} // Revert to text input if no time is selected
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <input
                    type="text"
                    placeholder="End Time"
                    readOnly
                    value={endTime}
                    onFocus={() => setIsEndTimeInput(true)} // Switch to time input on focus
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Details Section */}
      <div>
        <h2 className="text-lg text-primary mb-2">Address Details</h2>
        <div className="p-4 border rounded-lg border-primary">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                onBlur={fetchCityState}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="City"
                name="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                readOnly
                className="w-full p-2 border rounded bg-gray-100"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                readOnly
                className="w-full p-2 border rounded bg-gray-100"
              />
            </div>
            <div>
              <input
                type="text"
                name="adressLine"
                value={adressLine}
                onChange={(e) => setAdressLine(e.target.value)}
                placeholder="Address Line"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <input
                type="text"
                name="area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Area"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <input
                type="text"
                value={landMark}
                onChange={(e) => setLandMark(e.target.value)}
                placeholder="Landmark"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-primary text-white rounded hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          SUBMIT
        </button>
      </div>
    </div>
  );
};

export default EmployeeReg;
