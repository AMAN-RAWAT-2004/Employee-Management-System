import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { ModalContext } from "../context/modalContext";
import { toast } from "sonner";

const AddLeave = () => {
  const {
    setOpenAddLeaveForm,
    setRefreshEmployee,
    editLeave,
    loggedInUser,
    setEditLeave,
  } = useContext(ModalContext);

  const token = localStorage.getItem("token");
  const formRef = useRef(null);

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    employee: loggedInUser?.role === "admin" ? "" : loggedInUser?._id,
    leaveType: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    reason: "",
  });

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const fetchEmployees = async () => {
    try {
      if (loggedInUser.role === "admin") {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/employee`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setEmployees(res.data.employees || []);
      }
      return;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch employees",
      );
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setOpenAddLeaveForm(false);
        setEditLeave(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setOpenAddLeaveForm]);

  const handleSubmit = async (e) => {
    const payload = {
      ...formData,
      employee:
        loggedInUser?.role === "admin" ? formData.employee : loggedInUser._id,
    };
    e.preventDefault();
    setLoading(true);

    try {
      if (editLeave) {
        const res = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/leave/${editLeave._id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        toast.success(res.data.message);
        setFormData({
          employee: loggedInUser?.role === "admin" ? "" : loggedInUser?._id,
          leaveType: "",
          startDate: "",
          endDate: "",
          startTime: "",
          endTime: "",
          reason: "",
        });
        setRefreshEmployee((prev) => !prev);
        setEditLeave(null);
        setOpenAddLeaveForm(false);
      } else {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/leave/add-leave`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        toast.success(res.data.message);

        setFormData({
          employee: loggedInUser?.role === "admin" ? "" : loggedInUser?._id,
          leaveType: "",
          startDate: "",
          endDate: "",
          startTime: "",
          endTime: "",
          reason: "",
        });

        setRefreshEmployee((prev) => !prev);
        setEditLeave(null);
        setOpenAddLeaveForm(false);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to apply leave");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!editLeave) return;

    setFormData({
      employee:
        typeof editLeave.employee === "object"
          ? editLeave.employee?._id
          : editLeave.employee || "",
      leaveType: editLeave.leaveType || "",
      startDate: editLeave.startDate
        ? new Date(editLeave.startDate).toISOString().split("T")[0]
        : "",
      endDate: editLeave.endDate
        ? new Date(editLeave.endDate).toISOString().split("T")[0]
        : "",
      startTime: editLeave.startTime || "",
      endTime: editLeave.endTime || "",
      reason: editLeave.reason || "",
    });
  }, [editLeave]);

  useEffect(() => {
    if (loggedInUser && loggedInUser.role !== "admin") {
      setFormData((prev) => ({
        ...prev,
        employee: loggedInUser._id,
      }));
    }
  }, [loggedInUser]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div
        ref={formRef}
        className="w-full max-w-2xl bg-white rounded-xl shadow-xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            {editLeave ? "Edit Leave" : "Apply Leave"}
          </h2>

          <button
            onClick={() => {
              setEditLeave(null);
              setOpenAddLeaveForm(false);
            }}
            className="text-gray-500 hover:text-red-500 text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Employee */}
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

          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Leave Type</label>

            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select Leave Type</option>
              <option value="Sick">Sick</option>
              <option value="Casual">Casual</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="HalfDay">Half Day</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Dates */}
          {formData.leaveType === "HalfDay" ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Start Date
                </label>

                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Start Time
                </label>

                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  End Time
                </label>

                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Start Date
                </label>

                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  End Date
                </label>

                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium mb-2">Reason</label>

            <textarea
              rows={4}
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Enter leave reason..."
              className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => {
                setEditLeave(null);
                setOpenAddLeaveForm(false);
              }}
              className="w-full sm:w-1/2 border border-gray-300 py-3 rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-1/2 ${editLeave ? "bg-green-600 hover:bg-green-700" : "bg-blue-600  hover:bg-blue-700"}  disabled:opacity-50 text-white py-3 rounded-lg transition`}
            >
              {loading
                ? "Saving..."
                : editLeave
                  ? "Update Leave"
                  : "Apply Leave"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeave;
