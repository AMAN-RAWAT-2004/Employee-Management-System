import React, { useContext, useEffect, useState } from "react";
import { MdSupervisorAccount } from "react-icons/md";
import { FaArrowUp, FaArrowDown } from "react-icons/fa6";
import { IoPersonAdd, IoBag } from "react-icons/io5";
import { BsPersonXFill } from "react-icons/bs";
import axios from "axios";
import { toast } from "sonner";
import { ModalContext } from "../context/modalContext";
const Home = () => {
  const [users, setUsers] = useState([]);
  const [newUsers, setNewUsers] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [onLeaveToday, setOnLeaveToday] = useState(0);
  const token = localStorage.getItem("token");
  const { dark, loggedInUser } = useContext(ModalContext);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (loggedInUser.role === "admin") {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/v1/employee`,
            {
              headers: {
                authorization: `Bearer ${token}`,
              },
            },
          );

          setUsers(response.data.employees);
        }
        return;
      } catch (error) {
        console.log(error.message);
        toast.error(error?.response?.data?.message);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchRecentUsers = async () => {
      try {
        if (loggedInUser.role === "admin") {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/v1/employee/recent-employee`,
            {
              headers: {
                authorization: `Bearer ${token}`,
              },
            },
          );

          setRecentUsers(response.data.recentEmployees);
          setNewUsers(response.data.CountNewEmployees);
          setOnLeaveToday(response.data.onLeaveToday);
        }
        return;
      } catch (error) {
        console.log(error.message);
        toast.error(error?.response?.data?.message);
      }
    };

    fetchRecentUsers();
  }, []);
  return (
    <div
      className={`min-h-screen  p-4 md:p-8 lg:p-10 transition-colors duration-200 ${dark ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-3">
          <div>
            <h1
              className={`text-3xl font-bold transition-colors duration-200 ${dark ? "text-white" : "text-gray-900"}`}
            >
              Dashboard
            </h1>
            <p
              className={`transition-colors duration-200 ${dark ? "text-white" : "text-gray-500"} mt-1`}
            >
              Mon, Aug 01, 2024 - Sep 01, 2024
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* TOTAL EMPLOYEE  */}
          <div
            className={`bg-orange-50 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100`}
          >
            <div
              className={`bg-orange-500 w-14 h-14 rounded-full flex items-center justify-center text-white text-3xl mb-5`}
            >
              <MdSupervisorAccount />
            </div>

            <h2 className="text-3xl font-bold text-gray-900">{users.length}</h2>

            <p className="text-gray-700 font-semibold mt-2">Total Employees</p>

            <div className="flex items-center gap-2 mt-3 text-sm">
              <span
                className={`flex items-center gap-1 font-semibold  text-green-600 `}
              >
                <FaArrowUp />
                +5%
              </span>

              <span className="text-gray-500">vs last month</span>
            </div>
          </div>
          {/* NEW EMPLOYEE  */}
          <div
            className={`bg-blue-50 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100`}
          >
            <div
              className={`bg-blue-500 w-14 h-14 rounded-full flex items-center justify-center text-white text-3xl mb-5`}
            >
              <IoPersonAdd />
            </div>

            <h2 className="text-3xl font-bold text-gray-900">{newUsers}</h2>

            <p className="text-gray-700 font-semibold mt-2">New Employees</p>

            <div className="flex items-center gap-2 mt-3 text-sm">
              <span
                className={`flex items-center gap-1 font-semibold  text-green-600 `}
              >
                <FaArrowUp />
                +3.2%
              </span>

              <span className="text-gray-500">vs last month</span>
            </div>
          </div>
          {/* ON LEAVE  */}
          <div
            className={`bg-yellow-50 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100`}
          >
            <div
              className={`bg-yellow-500 w-14 h-14 rounded-full flex items-center justify-center text-white text-3xl mb-5`}
            >
              <BsPersonXFill />
            </div>

            <h2 className="text-3xl font-bold text-gray-900">{onLeaveToday}</h2>

            <p className="text-gray-700 font-semibold mt-2">On Leave</p>

            <div className="flex items-center gap-2 mt-3 text-sm">
              <span
                className={`flex items-center gap-1 font-semibold  text-red-600 `}
              >
                <FaArrowDown />
                -2%
              </span>

              <span className="text-gray-500">vs last month</span>
            </div>
          </div>
          {/* JOB APPLICATIONS  */}
          <div
            className={`bg-green-50 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100`}
          >
            <div
              className={`bg-green-500 w-14 h-14 rounded-full flex items-center justify-center text-white text-3xl mb-5`}
            >
              <IoBag />
            </div>

            <h2 className="text-3xl font-bold text-gray-900">776</h2>

            <p className="text-gray-700 font-semibold mt-2">Job Applicants</p>

            <div className="flex items-center gap-2 mt-3 text-sm">
              <span
                className={`flex items-center gap-1 font-semibold  text-green-600 `}
              >
                <FaArrowUp />
                +8%
              </span>

              <span className="text-gray-500">vs last month</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm p-6 min-h-87.5">
            <h3 className="text-lg font-semibold mb-4">Employee Analytics</h3>
            <div className="flex items-center justify-center h-62.5 text-gray-400">
              Chart Area
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 min-h-87.5">
            <h3 className="text-lg font-semibold mb-4 ">Recent Employees</h3>
            <div className="flex flex-col items-center justify-center gap-1 h-auto">
              {recentUsers.map((user) => (
                <div
                  key={user._id}
                  className="w-full flex gap-2 justify-start p-2 items-center  duration-150 transition-all  hover:bg-gray-100 rounded-lg"
                >
                  <div>
                    <img
                      src={user.profilePhoto}
                      alt=""
                      className="w-12 h-12 rounded-full object-center object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-center items-start gap-0">
                    <h2 className="text-sm capitalize font-bold">
                      {user.name}
                    </h2>
                    <p className="text-xs text-gray-400 font-semibold">
                      {user.designation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
