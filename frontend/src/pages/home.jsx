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
  const [recentTasks, setRecentTasks] = useState([]);
  const [onLeaveToday, setOnLeaveToday] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const token = localStorage.getItem("token");
  const { dark, loggedInUser } = useContext(ModalContext);
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

  const fetchRecentTasks = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/tasks/recent-tasks`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );
      setRecentTasks(response.data);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };
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
        setPresentToday(response.data.todayPresent);
      }
      return;
    } catch (error) {
      console.log(error.message);
      toast.error(error?.response?.data?.message);
    }
  };
  useEffect(() => {
    fetchUsers();
    fetchRecentTasks();
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
              {`Today, ${new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}`}
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

            <h2 className="text-3xl font-bold text-gray-900">{presentToday}</h2>

            <p className="text-gray-700 font-semibold mt-2">Present Today</p>

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
          {/* Recent Tasks  */}

          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm p-6 min-h-87.5">
            <h3 className="text-lg font-semibold mb-4">Recent Tasks</h3>
            <div className="flex items-center justify-center  text-gray-400">
              <div className="overflow-x-auto">
                <table className="w-full ">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-3 whitespace-nowrap py-2.5 text-sm font-semibold text-gray-600">
                        Sr No.
                      </th>
                      <th className="text-left px-3 py-2.5 text-sm font-semibold text-gray-600">
                        Title
                      </th>

                      <th className="text-left px-3 py-2.5 text-sm font-semibold text-gray-600">
                        Description
                      </th>

                      <th className="text-left px-3 py-2.5 text-sm whitespace-nowrap font-semibold text-gray-600">
                        Assigned to
                      </th>

                      <th className="text-left px-3 py-2.5 text-sm font-semibold text-gray-600">
                        Assigned at
                      </th>

                      <th className="text-left px-3 py-2.5 text-sm font-semibold text-gray-600">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentTasks?.map((task, index) => (
                      <tr
                        key={task._id}
                        className="border-b border-gray-100 hover:bg-blue-50 transition"
                      >
                        <td className="px-3 py-2.5 text-xs  text-gray-700">
                          {index + 1}
                        </td>
                        <td className="px-3 py-2.5">
                          <h4 className=" text-xs capitalize line-clamp-2 text-gray-900">
                            {task.title}
                          </h4>
                        </td>

                        <td className="px-3 py-2.5 w-70 text-xs line-clamp-2 text-gray-700">
                          {task.description}
                        </td>

                        <td className="px-3 py-2.5 text-xs text-left ">
                          <div className="relative flex ">
                            {task.assignTo?.slice(0, 3).map((user, index) => (
                              <img
                                key={user._id}
                                src={
                                  user.profilePhoto ||
                                  `https://ui-avatars.com/api/?name=${user.name}`
                                }
                                alt={user.name}
                                title={user.name}
                                className="w-9 h-9 rounded-full border-2 border-white object-cover -ml-4 first:ml-0"
                                style={{ zIndex: index + 1 }}
                              />
                            ))}
                            {task.assignTo?.length > 3 && (
                              <div className="w-5 h-5 absolute -top-1 right-0 z-30 flex justify-center items-center text-white rounded-full text-xs -ml-6 bg-red-400">
                                +{task.assignTo.length - 3}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-sm whitespace-nowrap text-gray-700">
                          {new Date(task.startDate).toLocaleDateString(
                            "en-GB",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </td>

                        <td className="px-3 py-2.5 text-left">
                          <span
                            className={` whitespace-nowrap ${task.status === "Completed" ? "text-green-700 bg-green-100" : task.status === "New" ? "text-purple-600 bg-purple-50" : task.status === "Pending" ? "text-blue-700 bg-blue-50" : "text-yellow-600 bg-yellow-50"}  px-3 py-2 rounded-lg text-xs font-semibold`}
                          >
                            {task.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Recent Employees  */}

          <div className="bg-white rounded-2xl shadow-sm p-6 min-h-87.5">
            <h3 className="text-lg font-semibold mb-4 ">Recent Employees</h3>
            <div className="flex flex-col items-center justify-center gap-1 h-auto">
              {recentUsers.map((user) => (
                <div
                  key={user._id}
                  className="w-full flex gap-2 justify-between p-2 items-center  duration-150 transition-all  hover:bg-gray-100 rounded-lg"
                >
                  <div className="flex justify-between items-center gap-4">
                    <img
                      src={user.profilePhoto}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-center object-cover"
                    />
                    <div className="flex flex-col justify-center items-start gap-0">
                      <h2 className="text-sm capitalize font-bold">
                        {user.name}
                      </h2>
                      <p className="text-xs text-gray-400 font-semibold">
                        {user.designation}
                      </p>
                    </div>
                  </div>
                  <div className="flex  flex-col justify-start items-start ">
                    <h2 className="text-xs capitalize font-bold">
                      Joining Date
                    </h2>

                    <p className="text-xs text-gray-400 font-semibold">
                      {new Date(user.joiningDate).toLocaleDateString("en-GB", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
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
