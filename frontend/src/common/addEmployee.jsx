import React, { useContext, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { ModalContext } from "../context/modalContext";
import { useRef } from "react";
import { useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

const AddEmployee = () => {
  const [uploading, setUploading] = useState(false);
  const token = localStorage.getItem("token");

  const {
    setIsAddEmployeeOpen,
    editingEmployee,
    setEditingEmployee,
    refreshEmployee,
    setRefreshEmployee,
  } = useContext(ModalContext);
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    profilePhoto: "",
    department: "",
    designation: "",
    status: "Active",
    address: "",
    dateOfBirth: "",
    gender: "",
    weeklyOffs: [],
  });
  useEffect(() => {
    if (editingEmployee) {
      setFormData({
        name: editingEmployee.name || "",
        email: editingEmployee.email || "",
        password: "",
        phone: editingEmployee.phone || "",
        profilePhoto: editingEmployee.profilePhoto || "",
        department: editingEmployee.department || "",
        designation: editingEmployee.designation || "",
        status: editingEmployee.status || "Active",
        address: editingEmployee.address || "",
        dateOfBirth: editingEmployee.dateOfBirth
          ? editingEmployee.dateOfBirth.split("T")[0]
          : "",
        gender: editingEmployee.gender || "",
        weeklyOffs: editingEmployee.weeklyOffs || [],
      });
    }
  }, [editingEmployee]);

  useEffect(() => {
    const clickOutsideFunction = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setIsAddEmployeeOpen(false);
        setEditingEmployee(null);
      }
    };

    document.addEventListener("mousedown", clickOutsideFunction);

    return () => {
      document.removeEventListener("mousedown", clickOutsideFunction);
    };
  }, [setIsAddEmployeeOpen]);

  // Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageData = new FormData();
    imageData.append("image", file);

    try {
      setUploading(true);

      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/upload`,
        imageData,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );

      setFormData((prev) => ({
        ...prev,
        profilePhoto: data.imageUrl,
      }));
    } catch (error) {
      console.error("Image Upload Error:", error);
      toast.error(error?.response?.data?.message);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingEmployee) {
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/employee/${editingEmployee._id}`,
          formData,
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          },
        );

        toast.success("Employee updated successfully");
        setRefreshEmployee((prev) => !prev);
        setFormData({
          name: "",
          email: "",
          password: "",
          phone: "",
          profilePhoto: "",
          department: "",
          designation: "",
          status: "",
          address: "",
          dateOfBirth: "",
          gender: "",
          weeklyOffs: [],
        });
        setIsAddEmployeeOpen(false);
        setEditingEmployee(null);
      } else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/employee/add-employee`,
          formData,
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          },
        );

        toast.success("Employee added successfully");
        setRefreshEmployee((prev) => !prev);
        setFormData({
          name: "",
          email: "",
          password: "",
          phone: "",
          profilePhoto: "",
          department: "",
          designation: "",
          status: "",
          address: "",
          dateOfBirth: "",
          gender: "",
          weeklyOffs: [],
        });
        setIsAddEmployeeOpen(false);
        setEditingEmployee(null);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message);
    }
  };

  const handleCancel = () => {
    setIsAddEmployeeOpen(false);
    setEditingEmployee(null);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 z-50">
      <div
        ref={formRef}
        className="relative max-w-137.5 mx-auto h-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8"
      >
        <RxCross1
          onClick={handleCancel}
          className="absolute top-5 right-5 text-black hover:cursor-pointer font-bold"
        />
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800  mb-6">
          {editingEmployee ? "Edit Employee" : "Add Employee"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 text-gray-400 gap-3"
        >
          {/* Name */}
          <div className="md:col-span-2">
            <label className="block  font-medium text-gray-500">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 placeholder:text-sm placeholder:text-gray-400 outline-none"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block  font-medium text-gray-500">Email</label>
            <input
              type="email"
              name="email"
              placeholder="info@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 placeholder:text-sm placeholder:text-gray-400 outline-none"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block  font-medium text-gray-500">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 placeholder:text-sm placeholder:text-gray-400 outline-none"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block  font-medium text-gray-500">Phone</label>
            <input
              type="text"
              name="phone"
              placeholder="+918876543289"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 placeholder:text-sm placeholder:text-gray-400 outline-none"
              required
            />
          </div>

          {/* Department */}
          <div>
            <label className="block  font-medium text-gray-500">
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 text-sm placeholder:text-gray-400 outline-none"
              required
            >
              <option value="">Select Department</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Operations">Operations</option>
            </select>
          </div>

          {/* Designation */}
          <div>
            <label className="block  font-medium text-gray-500">
              Designation
            </label>
            <input
              type="text"
              name="designation"
              placeholder="Frontend Developer"
              value={formData.designation}
              onChange={handleChange}
              className="w-full border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 placeholder:text-sm placeholder:text-gray-400 outline-none"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block  font-medium text-gray-500">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 text-sm placeholder:text-gray-400 outline-none"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          {/* DOB */}
          <div>
            <label className="block  font-medium text-gray-500">
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 placeholder:text-sm placeholder:text-gray-400 outline-none"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block  font-medium text-gray-500">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 text-sm placeholder:text-gray-400 outline-none"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {/* WeeklyOffs  */}
          <div className="md:col-span-2">
            <label className="block font-medium text-gray-500 mb-2">
              Weekly Offs
            </label>

            <div className="flex flex-wrap gap-4">
              {[
                "Sunday",
                // "Monday",
                // "Tuesday",
                // "Wednesday",
                // "Thursday",
                // "Friday",
                "Saturday",
              ].map((day) => (
                <label key={day} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.weeklyOffs.includes(day)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData((prev) => ({
                          ...prev,
                          weeklyOffs: [...prev.weeklyOffs, day],
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          weeklyOffs: prev.weeklyOffs.filter(
                            (item) => item !== day,
                          ),
                        }));
                      }
                    }}
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>
          {/* Address */}
          <div className="md:col-span-2">
            <label className="block  font-medium text-gray-500">Address</label>
            <textarea
              rows="4"
              name="address"
              placeholder="Enter address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 placeholder:text-sm placeholder:text-gray-400 outline-none resize-none"
            />
          </div>
          {/* Profile Photo */}
          <div className="md:col-span-2">
            <label className="block  font-medium text-gray-500">
              Profile Photo
            </label>

            <input
              type="file"
              name="profilePhoto"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full border rounded-lg px-2 py-1 text-gray-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0
            file:bg-blue-50 file:text-blue-600 file:font-medium hover:file:bg-blue-100 cursor-pointer"
            />
          </div>
          {/* Submit */}
          <div className="md:col-span-2 flex items-center mt-6 gap-4 md:gap-0 px-6 justify-around">
            <button
              onClick={handleCancel}
              type="button"
              className="w-full md:w-auto px-4 py-2 md:px-8 md:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm md:text-lg  font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="w-full md:w-auto px-4 py-2 md:px-8 md:py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm md:text-lg font-semibold transition-all"
            >
              {uploading
                ? "Uploading..."
                : editingEmployee
                  ? "Update Employee"
                  : "Add "}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
