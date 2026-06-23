import React, { useState } from "react";
import axios from "axios";
import { useContext } from "react";
import { ModalContext } from "../context/modalContext";
import { useRef } from "react";
import { useEffect } from "react";
import { toast } from "sonner";

const AddAttendance = () => {
  const {
    loggedInUser,
    setOpenAddAttendanceForm,
    refreshAttendance,
    setRefreshAttendance,
  } = useContext(ModalContext);
  const token = localStorage.getItem("token");
  const [employees, setEmployees] = useState([]);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    employee: loggedInUser?.role === "admin" ? "" : loggedInUser?._id,
    date: "",
    checkIn: "",
    checkOut: "",
    status: "Present",
    leaveType: "",
  });
  const today = new Date().toISOString().split("T")[0];
  const fetchEmployees = async () => {
    try {
      if (loggedInUser.role === "admin") {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/employee`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setEmployees(response.data.employees);
      }
      return;
    } catch (error) {
      //   console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [setRefreshAttendance]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "status" && value !== "Leave" ? { leaveType: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loggedInUser?.role !== "admin" && formData.date !== today) {
      toast.error("You can only mark attendance for today");
      return;
    }

    const attendanceData = {
      employee: formData.employee,
      date: formData.date,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      status: formData.status,
    };

    if (formData.status === "Leave") {
      attendanceData.leaveType = formData.leaveType;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/attendance/add-attendance`,
        attendanceData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data.message);
      setRefreshAttendance((prev) => !prev);
      setOpenAddAttendanceForm(false);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    const clickOutsideFunction = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setOpenAddAttendanceForm(false);
        //   setEditingEmployee(null);
      }
    };

    document.addEventListener("mousedown", clickOutsideFunction);

    return () => {
      document.removeEventListener("mousedown", clickOutsideFunction);
    };
  }, [setOpenAddAttendanceForm]);

  useEffect(() => {
    if (loggedInUser && loggedInUser.role !== "admin") {
      setFormData((prev) => ({
        ...prev,
        employee: loggedInUser._id,
        date: today,
      }));
    }
  }, [loggedInUser]);

  return (
    <div
      ref={formRef}
      className="max-w-lg mx-auto bg-white rounded-xl min-h-150 shadow-md p-6"
    >
      <h2 className="text-2xl font-bold mb-6">Add Attendance</h2>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Employee ID */}
        <div>
          <label className="block text-sm font-medium mb-2">Employee</label>
          {loggedInUser && loggedInUser.role === "admin" ? (
            <select
              name="employee"
              value={formData.employee}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select Employee</option>

              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={loggedInUser?.name || ""}
              disabled
              className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 cursor-not-allowed"
            />
          )}
        </div>
        {/* Date */}
        <div>
          <label className="block text-sm font-medium mb-2">Date</label>
          {loggedInUser?.role === "admin" ? (
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              required
            />
          ) : (
            <input
              type="date"
              value={today}
              disabled
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
            />
          )}
        </div>

        {/* Check In & Check Out */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Check In</label>
            <input
              type="time"
              name="checkIn"
              value={formData.checkIn}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Check Out</label>
            <input
              type="time"
              name="checkOut"
              value={formData.checkOut}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Leave">Leave</option>
          </select>
        </div>

        {/* Leave Type */}
        {formData.status === "Leave" && (
          <div>
            <label className="block text-sm font-medium mb-2">Leave Type</label>
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">Select Leave Type</option>
              <option value="Sick">Sick Leave</option>
              <option value="Casual">Casual Leave</option>
              <option value="Paid">Paid Leave</option>
              <option value="Unpaid">Unpaid Leave</option>
              <option value="Other">Others</option>
            </select>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-around items-center">
          <button
            type="button"
            onClick={() => {
              setOpenAddAttendanceForm(false);
              setRefreshAttendance((prev) => !prev);
            }}
            className=" bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition"
          >
            cancel
          </button>
          <button
            type="submit"
            className=" bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAttendance;
