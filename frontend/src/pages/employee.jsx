import React, { useState, useContext, useRef, useEffect } from "react";
import { GoPlus } from "react-icons/go";
import { Link, useNavigate } from "react-router-dom";
import { BsThreeDots } from "react-icons/bs";
import { LuMail } from "react-icons/lu";
import { FiPhoneCall } from "react-icons/fi";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import { VscThreeBars } from "react-icons/vsc";
import { IoSearchOutline } from "react-icons/io5";
import { ModalContext } from "../context/modalContext";
import axios from "axios";
import { MdArrowForwardIos } from "react-icons/md";
import { MdArrowBackIos } from "react-icons/md";
import { toast } from "sonner";
const Employee = () => {
  const [users, setUsers] = useState([]);
  const {
    setIsAddEmployeeOpen,
    dark,
    setEditingEmployee,
    loggedInUser,
    refreshEmployee,
  } = useContext(ModalContext);
  const token = localStorage.getItem("token");
  const [totalEmployees, setTotalEmployees] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const menuRef = useRef(null);

  const fetchUsers = async () => {
    try {
      if (loggedInUser.role === "admin") {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/employee/?page=${page}&limit=8&search=${search}`,
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          },
        );

        setUsers(response.data.employees);
        setTotalEmployees(response.data.totalEmployees);
        setTotalPages(response.data.pagination.totalPages);
      }
      return;
    } catch (error) {
      console.log(error?.response?.data?.message);
      toast.error(error?.response?.data?.message);
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [page, refreshEmployee]);

  const handleEdit = (user) => {
    setEditingEmployee(user);
    setIsAddEmployeeOpen(true);
  };

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

  const toggleEditMenu = (id) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/employee/${id}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );

      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
      fetchUsers();
      setOpenMenuId(null);
    } catch (error) {
      console.log(error?.response?.data?.message);
      toast.error(error?.response?.data?.message);
    }
  };

  const handleViewProfile = (user) => {
    navigate(`/profile/${user._id}`);
  };

  return (
    <div
      className={` w-full min-h-screen flex flex-col justify-between items-center transition-colors duration-200 ${dark ? "bg-gray-900" : "bg-gray-50"}  p-4 md:p-6 lg:p-8`}
    >
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1
              className={`text-2xl md:text-3xl font-bold ${dark ? "text-white" : "text-gray-900"} `}
            >
              <span className={`${dark ? "text-blue-400" : "text-blue-600"}`}>
                {totalEmployees}
              </span>{" "}
              Employees
            </h1>
          </div>

          {loggedInUser.role === "admin" ? (
            <button
              onClick={() => setIsAddEmployeeOpen(true)}
              className={`flex items-center gap-2 cursor-pointer ${dark ? "bg-blue-400 hover:bg-blue-500" : "bg-blue-600 hover:bg-blue-700"}  text-white px-5 py-3 rounded-xl transition-all`}
            >
              <GoPlus className="text-lg" />
              Add Employee
            </button>
          ) : (
            ""
          )}
        </div>

        <div
          className={`rounded-2xl p-4 transition-colors duration-200
    ${
      dark
        ? "bg-gray-900 border border-gray-700 shadow-md"
        : "bg-white border border-gray-200 shadow-sm"
    }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div
              className={`flex items-center gap-2 rounded-xl px-3 py-2 w-full lg:w-80 transition-colors duration-300
        ${
          dark
            ? "border border-gray-700 bg-gray-800"
            : "border border-gray-300 bg-white"
        }`}
            >
              <IoSearchOutline
                className={`text-lg shrink-0 ${
                  dark ? "text-gray-400" : "text-gray-500"
                }`}
              />

              <input
                type="text"
                placeholder="Search employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full outline-none bg-transparent
          ${
            dark
              ? "text-white placeholder:text-gray-400"
              : "text-gray-800 placeholder:text-gray-500"
          }`}
              />
            </div>

            {/* View Toggle */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setView("grid")}
                className={`p-2 rounded-lg transition-all duration-200 cursor-pointer
          ${
            view === "grid"
              ? dark
                ? "bg-blue-600 text-white"
                : "bg-blue-100 text-blue-600"
              : dark
                ? "text-gray-400 hover:bg-gray-800"
                : "text-gray-500 hover:bg-gray-100"
          }`}
              >
                <HiOutlineSquares2X2 className="text-2xl" />
              </button>

              <button
                onClick={() => setView("list")}
                className={`p-2 rounded-lg transition-all duration-200 cursor-pointer
          ${
            view === "list"
              ? dark
                ? "bg-blue-600 text-white"
                : "bg-blue-100 text-blue-600"
              : dark
                ? "text-gray-400 hover:bg-gray-800"
                : "text-gray-500 hover:bg-gray-100"
          }`}
              >
                <VscThreeBars className="text-2xl" />
              </button>
            </div>
          </div>
        </div>
        {view === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {users?.map((user) => (
              <div
                key={user._id}
                className={`relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all p-5 ${
                  view === "list"
                    ? "flex flex-col md:flex-row md:items-center gap-6"
                    : ""
                }`}
              >
                <div className="flex justify-between items-center">
                  <span
                    className={`${user.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"} px-3.5 py-2 rounded-lg text-xs font-semibold`}
                  >
                    {user.status}
                  </span>

                  <div ref={openMenuId === user._id ? menuRef : null}>
                    <button
                      onClick={() => toggleEditMenu(user._id)}
                      className="p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100"
                    >
                      <BsThreeDots />
                    </button>

                    {openMenuId === user._id && (
                      <div className="absolute top-14 right-5 w-32 bg-white border border-gray-300  rounded-xl shadow-lg overflow-hidden z-20">
                        <button
                          onClick={() => handleEdit(user)}
                          className="w-full text-sm text-left px-4 py-2 cursor-pointer hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleViewProfile(user)}
                          className="w-full text-sm text-left px-4 py-2 cursor-pointer hover:bg-blue-100"
                        >
                          View Details
                        </button>

                        <button
                          onClick={() => handleDelete(user._id)}
                          className="w-full text-sm text-left px-4 py-2 cursor-pointer text-red-500 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`${
                    view === "grid"
                      ? "flex flex-col items-center mt-5"
                      : "flex items-center gap-5"
                  }`}
                >
                  <img
                    src={user.profilePhoto}
                    alt={user.name}
                    className={`object-cover border border-gray-100 ${
                      view === "grid"
                        ? "w-26 h-26 rounded-2xl"
                        : "w-22 h-22 rounded-xl"
                    }`}
                  />

                  <h2
                    className={`text-xl font-bold text-gray-900 capitalize ${
                      view === "grid" ? "mt-4 text-center" : ""
                    }`}
                  >
                    {user.name}
                  </h2>

                  <p
                    className={`text-blue-600 font-medium ${
                      view === "grid" ? "text-center" : ""
                    }`}
                  >
                    {user.designation}
                  </p>
                </div>

                <div
                  className={`bg-gray-50 rounded-xl p-4 ${
                    view === "grid" ? "mt-5" : "flex-1 md:ml-auto mt-4 md:mt-0"
                  }`}
                >
                  <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-4">
                    <div>
                      <p className="text-xs text-gray-500">Department</p>
                      <p className="font-semibold text-sm">{user.department}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Joined</p>
                      <p className="font-semibold text-sm">
                        {new Date(user.joiningDate).toLocaleDateString(
                          "en-GB",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <LuMail className="text-blue-600 text-lg shrink-0" />
                      <p className="text-sm text-gray-700 truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <FiPhoneCall className="text-blue-600 text-lg shrink-0" />
                      <p className="text-sm text-gray-700">{user.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {view === "list" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-225">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Employee
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Designation
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Department
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Email
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Phone
                    </th>

                    <th className="text-left px-0 py-4 text-sm font-semibold text-gray-600">
                      Status
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Joined
                    </th>

                    <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users?.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-gray-100 hover:bg-blue-50 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.profilePhoto}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-center object-cover"
                          />

                          <div>
                            <h4 className="font-semibold capitalize text-gray-900">
                              {user.name}
                            </h4>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {user.designation}
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {user.department}
                      </td>

                      <td className="px-6 py-4 text-gray-700">{user.email}</td>

                      <td className="px-6 py-4 text-gray-700">{user.phone}</td>

                      <td className="px-0 py-4">
                        <span
                          className={` ${user.status === "Active" ? "text-green-700 bg-green-100" : "text-red-600 bg-red-100"}  px-3 py-2 rounded-lg text-xs font-semibold`}
                        >
                          {user.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {new Date(user.joiningDate).toLocaleDateString(
                          "en-GB",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </td>

                      <td className="px-6 py-4 text-center relative">
                        <div ref={openMenuId === user._id ? menuRef : null}>
                          <button
                            onClick={() => toggleEditMenu(user._id)}
                            className="p-2 rounded-lg cursor-pointer hover:bg-gray-100"
                          >
                            <BsThreeDots />
                          </button>

                          {openMenuId === user._id && (
                            <div className="absolute right-8 top-12 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                              <button
                                onClick={() => handleEdit(user)}
                                className="w-full text-sm text-left px-4 py-2 cursor-pointer hover:bg-gray-100"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleViewProfile(user)}
                                className="w-full text-sm text-left px-4 py-2 cursor-pointer hover:bg-blue-100"
                              >
                                View Details
                              </button>

                              <button
                                onClick={() => handleDelete(user._id)}
                                className="w-full text-sm text-left px-4 py-2 cursor-pointer text-red-500 hover:bg-red-100"
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
          </div>
        )}

        {users?.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <h3 className="text-lg font-semibold text-gray-700">
              No Employees Found
            </h3>
            <p className="text-gray-500 mt-2">
              Try searching with another name.
            </p>
          </div>
        )}
      </div>
      <div className=" w-full flex items-center justify-center md:justify-end gap-4 mt-8 xl:mr-60">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className={`px-2 py-1 text-sm  rounded cursor-pointer flex border items-center justify-center  transition-all duration-150  ${dark ? "bg-black text-white border-white hover:bg-white hover:text-black" : " bg-white text-blue-600 border-blue-500 hover:bg-blue-600 hover:text-white"} disabled:cursor-not-allowed  `}
        >
          <MdArrowBackIos /> Previous
        </button>

        <span
          className={`${dark ? "text-white" : "text-black"} text-xs md:text-[14px]`}
        >
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className={`px-2 py-1 text-sm cursor-pointer ${dark ? "bg-black text-white border-white  hover:bg-white hover:text-black" : " bg-white text-blue-600 border-blue-500 hover:bg-blue-600 hover:text-white"} flex  border  items-center justify-center rounded transition-all duration-150  disabled:cursor-not-allowed  `}
        >
          Next <MdArrowForwardIos />
        </button>
      </div>
    </div>
  );
};

export default Employee;
