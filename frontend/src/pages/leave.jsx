import React, { useContext, useEffect, useRef, useState } from "react";
import { GoPlus } from "react-icons/go";
import { Link } from "react-router-dom";
import { ModalContext } from "../context/modalContext";
import { BsThreeDots } from "react-icons/bs";
import axios from "axios";
import { toast } from "sonner";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";

const Leave = () => {
  const {
    refreshEmployee,
    setRefreshEmployee,
    openAddLeaveForm,
    setOpenAddLeaveForm,
    editLeave,
    setEditLeave,
    loggedInUser,
  } = useContext(ModalContext);
  const menuRef = useRef(null);
  const [openMenuId, setOpenMenuId] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [particularLeaves, setParticularLeaves] = useState([]);
  const [stats, setStats] = useState({});

  const { dark } = useContext(ModalContext);
  const [leaves, setLeaves] = useState([]);
  let token = localStorage.getItem("token");

  // Function For Fetching Particular LoggedInUser Leaves
  const fetchLoggedInUserLeaves = async () => {
    try {
      if (loggedInUser.role !== "admin") {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/leave/${loggedInUser._id}/leaves?page=${page}&limit=6`,
        );
        setParticularLeaves(response.data.leave);
        setTotalPages(response.data.pagination.totalPages);
      }
      return;
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };
  // Function for Fetching Stats of Leaves
  const fetchStats = async () => {
    try {
      if (loggedInUser.role === "admin") {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/leave/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setStats(response.data.stats);
      }
      return;
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  //  Function for Fetching Leaves
  const fetchLeaves = async () => {
    try {
      if (loggedInUser.role === "admin") {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/leave?page=${page}&limit=6`,
        );
        setLeaves(response.data.leaves);
        setTotalPages(response.data.pagination.totalPages);
      }
      return;
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  // Function for handling Status Update
  const handleUpdateStatus = async (taskId, status) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/leave/${taskId}/status`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setRefreshEmployee((prev) => !prev);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };
  // Fetching Data
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchLeaves();
      fetchLoggedInUserLeaves();
    }, 500);

    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    fetchLeaves();
    fetchStats();
    fetchLoggedInUserLeaves();
  }, [refreshEmployee, page, token]);

  // Toggle Edit Menu

  const toggleEditMenu = (id) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  // Closing Edit and Delete Menu Functions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/leave/${id}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );

      setOpenMenuId(null);
      setOpenAddLeaveForm(false);
      setLeaves((prevLeaves) => prevLeaves.filter((leave) => leave._id !== id));
      fetchLeaves();
      fetchStats();
    } catch (error) {
      console.log(error?.response?.data?.message);
      toast.error(error?.response?.data?.message);
    }
  };

  const handleEdit = (leave) => {
    setEditLeave(leave);
    setOpenAddLeaveForm(true);
  };
  const formatTime = (time) => {
    if (!time) return "-";

    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(hours, minutes);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="w-full min-h-screen flex justify-center px-3 sm:px-6 md:px-10 lg:px-20 py-6">
      <div className="flex flex-col w-full max-w-7xl gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1
              className={`text-xl sm:text-2xl ${dark ? " text-white" : "text-black "} font-bold`}
            >
              Leaves
            </h1>

            <div className="flex flex-wrap text-sm font-semibold gap-1">
              <Link
                to="/"
                className={` ${dark ? "text-blue-400 hover:text-blue-500" : "text-blue-500 hover:text-blue-600"}`}
              >
                Dashboard
              </Link>
              <p className={`${dark ? "text-white" : "text-gray-400"}`}>
                / Leaves
              </p>
            </div>
          </div>

          <button
            onClick={() => setOpenAddLeaveForm(true)}
            className="flex justify-center items-center bg-blue-500 text-white px-4 py-2 rounded-lg gap-2 hover:bg-blue-600 w-full md:w-auto"
          >
            <GoPlus className="text-xl" />
            {loggedInUser.role === "admin" ? "Add Leave" : "Apply Leave"}
          </button>
        </div>
        {loggedInUser && loggedInUser.role === "admin" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 p-4">
            {/* Total Presents */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-2 transition-all duration-300 hover:border-blue-600">
              <p className="text-3xl font-bold text-gray-900">
                {stats.todayPresent}
                <span className="text-base font-medium text-gray-400">
                  {" "}
                  / {stats.totalEmployees}
                </span>
              </p>
              <p className="mt-2 text-sm font-medium text-blue-600">
                Today Presents
              </p>
            </div>

            {/* Planned Leaves */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-2 transition-all duration-300 hover:border-red-600">
              <p className="text-3xl font-bold text-gray-900">
                {stats.plannedLeaves}
                <span className="text-base font-medium text-gray-400">
                  {" "}
                  / {stats.totalEmployees}
                </span>
              </p>
              <p className="mt-2 text-sm font-medium text-red-500">
                Planned Leaves
              </p>
            </div>

            {/* Unplanned Leaves */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-2 transition-all duration-300 hover:border-cyan-500">
              <p className="text-3xl font-bold text-gray-900">
                {stats.unplannedLeaves}
                <span className="text-base font-medium text-gray-400">
                  {" "}
                  / {stats.totalEmployees}
                </span>
              </p>
              <p className="mt-2 text-sm font-medium text-cyan-500">
                Unplanned Leaves
              </p>
            </div>

            {/* Pending Requests */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm hover:border-2 transition-all duration-300 hover:border-orange-600 hover:shadow-md ">
              <p className="text-3xl font-bold text-gray-900">
                {stats.pendingLeaves}
                <span className="text-base font-medium text-gray-400">
                  {" "}
                  / {stats.totalRequests}
                </span>
              </p>
              <p className="mt-2 text-sm font-medium text-orange-500">
                Pending Requests
              </p>
            </div>
          </div>
        ) : (
          ""
        )}

        {/* Leaves DashBoard */}

        <div className="flex flex-col gap-5 w-full border border-gray-300 bg-white p-3 sm:p-4 md:p-6 rounded-xl">
          <div className="w-full flex justify-between items-center">
            <h1 className="font-bold">Employee's Leave</h1>
          </div>
          {loggedInUser && loggedInUser.role === "admin" ? (
            <div className="w-full overflow-x-auto">
              <table className="min-w-[1000px] w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-600">
                      Name
                    </th>

                    <th className="text-left px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-600">
                      Leave Type
                    </th>

                    <th className="text-left px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-600">
                      Department
                    </th>

                    <th className="text-left px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-600">
                      Days
                    </th>

                    <th className="text-left px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-600">
                      Start Date
                    </th>

                    <th className="text-left px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-600">
                      End Date
                    </th>
                    <th className="text-left px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-600">
                      Start Time
                    </th>

                    <th className="text-left px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-600">
                      End Time
                    </th>

                    <th className="text-left px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-600">
                      Status
                    </th>

                    <th className="text-center px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-600">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {leaves.map((leave) => (
                    <tr
                      key={leave._id}
                      className="border-b border-gray-100 text-xs md:text-sm hover:bg-blue-50 transition"
                    >
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <div className="flex items-center gap-2 md:gap-3">
                          <img
                            src={leave.employee.profilePhoto}
                            alt={leave.employee.name}
                            className="w-8 h-8 md:w-12 md:h-12 rounded-full object-cover"
                          />

                          <div>
                            <h4 className="font-semibold capitalize text-gray-900 whitespace-nowrap">
                              {leave.employee.name}
                            </h4>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        {leave.leaveType}
                      </td>

                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        {leave.employee.department}
                      </td>

                      <td className="px-3 md:px-6 py-3 md:py-4">
                        {leave.leaveDays}
                      </td>

                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        {new Date(leave.startDate).toLocaleDateString("en-GB", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-3 md:px-6 py-3 text-center md:py-4 whitespace-nowrap">
                        {leave.endDate
                          ? new Date(leave.endDate).toLocaleDateString(
                              "en-GB",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                          : "-"}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-center whitespace-nowrap">
                        {leave.leaveType === "HalfDay"
                          ? formatTime(leave.startTime)
                          : "-"}
                      </td>

                      <td className="px-3 md:px-6 py-3 md:py-4 text-center whitespace-nowrap">
                        {leave.leaveType === "HalfDay"
                          ? formatTime(leave.endTime)
                          : "-"}
                      </td>

                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <select
                          className={`text-xs md:text-sm p-2 rounded-lg ${
                            leave.status === "Pending"
                              ? "text-orange-700 bg-orange-100"
                              : leave.status === "Approved"
                                ? "text-blue-700 bg-blue-100"
                                : "text-red-700 bg-red-100"
                          }`}
                          value={leave.status}
                          onChange={(e) =>
                            handleUpdateStatus(leave._id, e.target.value)
                          }
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>

                      <td className="px-3 md:px-6 py-3 md:py-4 text-center relative">
                        <div ref={openMenuId === leave._id ? menuRef : null}>
                          <button
                            onClick={() => toggleEditMenu(leave._id)}
                            className="p-2 rounded-lg hover:bg-gray-100"
                          >
                            <BsThreeDots />
                          </button>

                          {openMenuId === leave._id && (
                            <div className="absolute right-0 top-10 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                              <button
                                onClick={() => handleEdit(leave)}
                                className="w-full text-sm text-left px-4 py-2 hover:bg-gray-100"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => handleDelete(leave._id)}
                                className="w-full text-sm text-left px-4 py-2 text-red-500 hover:bg-red-100"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="min-w-[1000px] w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-600">
                      Name
                    </th>

                    <th className="text-left px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-600">
                      Leave Type
                    </th>

                    <th className="text-left px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-600">
                      Department
                    </th>

                    <th className="text-left px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-600">
                      Days
                    </th>

                    <th className="text-left px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-600">
                      Start Date
                    </th>

                    <th className="text-left px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-600">
                      End Date
                    </th>
                    <th className="text-left px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-600">
                      Start Time
                    </th>

                    <th className="text-left px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-600">
                      End Time
                    </th>

                    <th className="text-left px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {particularLeaves.map((leave) => (
                    <tr
                      key={leave._id}
                      className="border-b border-gray-100 text-xs md:text-sm hover:bg-blue-50 transition"
                    >
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <div className="flex items-center gap-2 md:gap-3">
                          <img
                            src={leave.employee.profilePhoto}
                            alt={leave.employee.name}
                            className="w-8 h-8 md:w-12 md:h-12 rounded-full object-cover"
                          />

                          <div>
                            <h4 className="font-semibold capitalize text-gray-900 whitespace-nowrap">
                              {leave.employee.name}
                            </h4>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        {leave.leaveType}
                      </td>

                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        {leave.employee.department}
                      </td>

                      <td className="px-3 md:px-6 py-3 md:py-4">
                        {leave.leaveDays}
                      </td>

                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        {new Date(leave.startDate).toLocaleDateString("en-GB", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-3 md:px-6 py-3 text-center md:py-4 whitespace-nowrap">
                        {leave.endDate
                          ? new Date(leave.endDate).toLocaleDateString(
                              "en-GB",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                          : "-"}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-center whitespace-nowrap">
                        {leave.leaveType === "HalfDay"
                          ? formatTime(leave.startTime)
                          : "-"}
                      </td>

                      <td className="px-3 md:px-6 py-3 md:py-4 text-center whitespace-nowrap">
                        {leave.leaveType === "HalfDay"
                          ? formatTime(leave.endTime)
                          : "-"}
                      </td>

                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <p
                          className={`text-xs md:text-sm p-2 text-center rounded-lg ${
                            leave.status === "Pending"
                              ? "text-orange-700 bg-orange-100"
                              : leave.status === "Approved"
                                ? "text-blue-700 bg-blue-100"
                                : "text-red-700 bg-red-100"
                          }`}
                        >
                          {leave.status}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className=" w-full flex items-center justify-center md:justify-end gap-4 mt-8 xl:mr-60">
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
              className={`px-2 py-1 text-sm  rounded flex border items-center justify-center  transition-all duration-150  bg-white text-blue-600 border-blue-500 hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed  `}
            >
              <MdArrowBackIos /> Previous
            </button>

            <span className={`text-black" text-xs md:text-[14px]`}>
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className={`px-2 py-1 text-sm  bg-white text-blue-600 border-blue-500 hover:bg-blue-600 hover:text-white flex  border  items-center justify-center rounded transition-all duration-150  disabled:cursor-not-allowed  `}
            >
              Next <MdArrowForwardIos />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leave;
