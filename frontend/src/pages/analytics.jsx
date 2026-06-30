import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ModalContext } from "../context/modalContext";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import axios from "axios";
import analyticLogo from "./../assets/analytic-Logo.svg";
import { toast } from "sonner";
import { GoPlus } from "react-icons/go";

const Analytics = () => {
  const { dark } = useContext(ModalContext);
  const token = localStorage.getItem("token");
  const [departmentStats, setDepartmentStats] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const Navigate = useNavigate();
  const handleNavigation = () => {
    Navigate("/taskManagement");
  };
  const fetchEmployeeCountByDepartment = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/employee/department-stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setDepartmentStats(response.data?.departmentStats);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };
  const fetchEmployeeCount = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/employee/employee-count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setTotalEmployees(response.data?.totalEmployees);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };
  useEffect(() => {
    fetchEmployeeCountByDepartment();
    fetchEmployeeCount();
  }, [token]);
  return (
    <div className="w-full min-h-screen flex justify-center items-start px-4 sm:px-6 md:px-10 lg:px-20 xl:px-30 py-6 md:py-10">
      <div className="flex flex-col w-full max-w-7xl gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1
              className={`${dark ? "text-white" : "text-black"} text-xl sm:text-2xl font-bold`}
            >
              Analytics
            </h1>

            {/* <div className="flex flex-wrap text-sm font-semibold gap-1">
              <Link to="/" className="text-blue-500 hover:text-blue-600">
                Dashboard
              </Link>
              <p className="text-gray-400">/ Analytics</p>
            </div> */}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Total Employees Card  */}
          <div className="bg-[#FDEDCB] rounded-2xl pt-4 px-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex-1 text-center p-2 md:text-left">
              <p className="text-lg font-semibold text-gray-700">
                Employee Satisfaction
              </p>

              <h1 className="mt-2 text-3xl md:text-4xl font-bold text-[#F78510]">
                97.05%
              </h1>

              <p className="mt-4 text-gray-700 font-bold leading-6">
                There are currently{" "}
                <span className="font-semibold text-blue-600">
                  {totalEmployees} employees
                </span>{" "}
                who are satisfied with working in your office, an increase from
                last month.
              </p>
            </div>

            <div className="flex justify-center shrink-0">
              <img
                src={analyticLogo}
                alt="Employee Satisfaction"
                className="w-44   object-contain"
              />
            </div>
          </div>
          {/* Task Card  */}
          <div className="rounded-2xl border border-slate-200 bg-[#C3EBFC] p-6 shadow-sm flex items-center justify-center">
            <div className="flex-1 flex flex-col justify-between text-center p-2 md:text-left">
              <p className="text-lg font-semibold text-black">Task Status</p>

              <p className="mt-2 text-gray-700 font-bold leading-6">
                {" "}
                <span className="font-semibold text-blue-400">90%</span> of the
                work was completed last week, a significant portion of the total
                task.
              </p>
              <div className=" mt-4">
                <button
                  onClick={handleNavigation}
                  className="flex justify-center cursor-pointer items-center transition-colors duration-300 bg-blue-400 text-white px-4 py-2 rounded-lg gap-2 hover:bg-blue-600 w-full md:w-auto"
                >
                  <GoPlus className="text-xl" />
                  Add Task
                </button>
              </div>
            </div>

            <div className="flex justify-center shrink-0">
              {/* <img
                src={analyticLogo}
                alt="Employee Satisfaction"
                className="w-44   object-contain"
              /> */}
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col justify-start items-start h-full">
          <h1 className="text-2xl mb-4 text-blue-500 font-bold  ">
            Department Statistics
          </h1>
          <div className="xl:w-2/5 lg:w-1/2 h-[400px] w-full border p-2 border-gray-300 lg:p-8 rounded-xl bg-white ">
            <ResponsiveContainer>
              <PieChart width="100%" height="100%">
                <Pie
                  data={departmentStats}
                  dataKey="totalEmployees"
                  nameKey="department"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {departmentStats.map((entry, index) => {
                    const colors = [
                      "#3C83F6",
                      "#ef4444",
                      "#f59e0b",
                      "#10b981",
                      "#8b5cf6",
                      "#ec4899",
                    ];

                    return (
                      <Cell key={index} fill={colors[index % colors.length]} />
                    );
                  })}
                </Pie>

                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;

                    const data = payload[0].payload;

                    return (
                      <div className="bg-gray-100 text-black px-3 py-2 rounded-md text-sm shadow-lg">
                        <p className="text-xs">{data.department}</p>
                        <p className="text-xs">Count: {data.totalEmployees}</p>
                      </div>
                    );
                  }}
                />
                <Legend
                  layout="vertical"
                  align="left"
                  verticalAlign="middle"
                  iconSize={10}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
