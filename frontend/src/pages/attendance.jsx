import React, { useEffect, useState } from "react";
import { GoPlus } from "react-icons/go";
import { Link } from "react-router-dom";
import { IoCheckmarkCircleOutline, IoSearchOutline } from "react-icons/io5";
import { FcLeave } from "react-icons/fc";
import {
  MdArrowBackIos,
  MdArrowForwardIos,
  MdOutlineCancel,
} from "react-icons/md";
import { useContext } from "react";
import { ModalContext } from "../context/modalContext";
import axios from "axios";
import { toast } from "sonner";
import { MdWeekend } from "react-icons/md";
import EmployeeAttendance from "../common/employeeAttendance";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
  PieChart,
  Pie,
  Legend,
} from "recharts";

const Attendance = () => {
  const { refreshAttendance, loggedInUser, dark, setRefreshAttendance } =
    useContext(ModalContext);
  const [statistics, setStatistics] = useState([]);
  const [particularStatistics, setParticularStatistics] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [attendanceData, setAttendanceData] = useState({
    success: false,
    daysInMonth: 0,
    totalEmployees: 0,
    data: [],
  });
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [yearCount, setYearCount] = useState(new Date().getFullYear());
  const [monthCount, setMonthCount] = useState(new Date().getMonth() + 1);
  const { setOpenAddAttendanceForm } = useContext(ModalContext);
  const token = localStorage.getItem("token");

  const days = Array.from({ length: attendanceData.daysInMonth }, (_, i) => {
    const date = new Date(year, month - 1, i + 1);
    const weekDay = date.getDay();

    return {
      day: i + 1,
      label: weekDay === 6 ? "Sat" : weekDay === 0 ? "Sun" : i + 1,
    };
  });
  const fetchStatistics = async () => {
    try {
      if (loggedInUser?.role === "admin") {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/attendance/statistics?month=${monthCount}&year=${yearCount}`,
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          },
        );
        setStatistics(response.data.statistics);
      }
      return;
    } catch (error) {
      console.log(error);
    }
  };

  const handleAttendancePopupForm = () => {
    setOpenAddAttendanceForm(true);
  };

  const fetchAttendanceData = async () => {
    try {
      if (loggedInUser?.role === "admin") {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/attendance/monthly/${year}/${month}?page=${page}&limit=7`,
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          },
        );

        setAttendanceData(res?.data);
        setTotalPages(res.data.pagination.totalPages);
      }
      return;
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };
  useEffect(() => {
    fetchAttendanceData();
    fetchStatistics();
    fetchParticularStatistics();
  }, [year, yearCount, monthCount, month, refreshAttendance, page]);

  const filteredEmployeeAttendance =
    attendanceData?.data?.filter((employee) =>
      employee?.employeeName?.toLowerCase()?.includes(search.toLowerCase()),
    ) || [];

  const colors = [
    "#06B6D4",
    "#0EA5E9",
    "#3B82F6",
    "#FACC15",
    "#F97316",
    "#BE185D",
    "#EF4444",
    "#22C55E",
    "#6366F1",
    "#EC4899",
  ];
  const fetchParticularStatistics = async () => {
    try {
      if (loggedInUser?.role !== "admin") {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/attendance/statistics?employeeId=${loggedInUser._id}&month=${month}&year=${year}`,
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          },
        );
        setParticularStatistics(response.data.statistics[0]);
      }
      return;
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  const totalDays = new Date(year, month, 0).getDate();

  const chartData = [
    {
      name: "Present",
      value: particularStatistics?.totalPresent || 0,
    },
    {
      name: "Absent",
      value: particularStatistics?.totalAbsent || 0,
    },
    {
      name: "Leave",
      value: particularStatistics?.totalLeave || 0,
    },
  ];
  const totalAttendance = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-full min-h-screen flex justify-center items-start px-4 sm:px-6 md:px-10 lg:px-20 xl:px-30 py-6 md:py-10">
      <div className="flex flex-col w-full max-w-7xl gap-8">
        {/* Header  */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1
              className={`${dark ? "text-white" : "text-black"} text-xl sm:text-2xl font-bold`}
            >
              {`Today, ${new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}`}
            </h1>
          </div>

          {loggedInUser && loggedInUser.role === "admin" ? (
            <button
              onClick={handleAttendancePopupForm}
              className="flex justify-center items-center hover:cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-xl gap-2 hover:bg-blue-600 w-full md:w-auto"
            >
              <GoPlus className="text-xl" />
              Add Attendance
            </button>
          ) : (
            " "
          )}
        </div>
        {loggedInUser && loggedInUser.role === "admin" ? (
          <div className="bg-white border border-gray-200 rounded-xl p-5 ">
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold">Employee Monthly Attendance</h2>

              {/* Date And Year Set  */}
              <div className="flex justify-center items-center  gap-5">
                {/* Search Bar  */}
                <div
                  className={`hidden md:flex items-center gap-2 rounded-xl px-3 py-2 w-full lg:w-80 border transition-colors duration-200 bg-white border-gray-300`}
                >
                  <IoSearchOutline
                    className={`text-lg shrink-0 text-gray-500
                  `}
                  />

                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`w-full outline-none bg-transparent text-gray-900 placeholder:text-gray-500`}
                  />
                </div>

                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg p-1 md:px-2 md:py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>January</option>
                  <option value={2}>February</option>
                  <option value={3}>March</option>
                  <option value={4}>April</option>
                  <option value={5}>May</option>
                  <option value={6}>June</option>
                  <option value={7}>July</option>
                  <option value={8}>August</option>
                  <option value={9}>September</option>
                  <option value={10}>October</option>
                  <option value={11}>November</option>
                  <option value={12}>December</option>
                </select>

                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg p-1 md:px-2 md:py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                  <option value={2024}>2024</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto mb-6">
              <table className="min-w-250 xl:min-w-0 xl:w-full table-fixed border-collapse text-center">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="w-45 px-3 py-3 font-medium text-left">
                      Employees
                    </th>

                    {days.map((d) => (
                      <th
                        key={d.day}
                        className={`text-center text-xs p-2 ${
                          d.label === "Sat" || d.label === "Sun"
                            ? "bg-gray-100 text-black"
                            : ""
                        }`}
                      >
                        {d.label}
                      </th>
                    ))}

                    <th className="w-22.5 px-3 py-3 font-medium">Leaves</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEmployeeAttendance.map((employee) => (
                    <tr
                      key={employee.employeeId}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <img
                            src={employee.profilePhoto}
                            alt={employee.employeeName}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />

                          <span className="font-medium text-sm capitalize truncate">
                            {employee.employeeName}
                          </span>
                        </div>
                      </td>

                      {Object.values(employee.attendance).map(
                        (record, index) => (
                          <td
                            key={index}
                            className={`h-10 ${record?.status === "Weekend" ? "bg-gray-100" : " "} `}
                          >
                            {record?.status === "Present" ? (
                              <IoCheckmarkCircleOutline className="text-blue-500 mx-auto text-lg" />
                            ) : record?.status === "Absent" ? (
                              <MdOutlineCancel className="text-red-500 mx-auto text-lg" />
                            ) : record?.status === "Leave" ? (
                              <FcLeave className="mx-auto text-lg" />
                            ) : record?.status === "Weekend" ? (
                              <span className="mx-auto text-xs  text-green-500">
                                WO
                              </span>
                            ) : record?.status === "HalfDay" ? (
                              <span className="mx-auto text-lg  text-red-500">
                                ½
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        ),
                      )}

                      <td className="px-3 py-3 text-red-500 text-xs font-semibold">
                        {employee.leaveCount} Day
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredEmployeeAttendance.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-10 mt-5 text-center">
                  <h3 className="text-lg font-semibold text-gray-700">
                    No Employees Found
                  </h3>
                  <p className="text-gray-500 mt-2">
                    Try searching with another name.
                  </p>
                </div>
              )}
            </div>
            <div className=" w-full flex items-center justify-center md:justify-end  gap-4 mt-5 ">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
                className="px-2 py-1 bg-white text-sm rounded flex hover:cursor-pointer text-blue-600 border border-blue-500 items-center justify-center  transition-all duration-150 hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed  "
              >
                <MdArrowBackIos /> Previous
              </button>

              <span className="text-xs md:text-[14px]">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((prev) => prev + 1)}
                className="px-2 py-1 bg-white text-sm flex hover:cursor-pointer text-blue-600 border border-blue-500 items-center justify-center rounded transition-all duration-150 hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed  "
              >
                Next <MdArrowForwardIos />
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col xl:flex-row gap-6">
            {/* Statistics Card */}
            <div className="flex-1">
              {statistics && (
                <div className="w-full border border-gray-300 rounded-xl min-h-92.5 bg-white shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-300 px-5 py-4">
                    <p className="font-semibold text-lg">
                      Attendance Statistics
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={1}>January</option>
                        <option value={2}>February</option>
                        <option value={3}>March</option>
                        <option value={4}>April</option>
                        <option value={5}>May</option>
                        <option value={6}>June</option>
                        <option value={7}>July</option>
                        <option value={8}>August</option>
                        <option value={9}>September</option>
                        <option value={10}>October</option>
                        <option value={11}>November</option>
                        <option value={12}>December</option>
                      </select>

                      <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={2026}>2026</option>
                        <option value={2025}>2025</option>
                        <option value={2024}>2024</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-5">
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                      <p className="text-sm font-semibold text-gray-500">
                        Present
                      </p>
                      <h2 className="text-2xl font-bold text-green-600">
                        {particularStatistics?.totalPresent}
                      </h2>
                    </div>

                    <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                      <p className="text-sm font-semibold text-gray-500">
                        Absent
                      </p>
                      <h2 className="text-2xl font-bold text-red-600">
                        {particularStatistics?.totalAbsent}
                      </h2>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                      <p className="text-sm font-semibold text-gray-500">
                        Leave
                      </p>
                      <h2 className="text-2xl font-bold text-yellow-600">
                        {particularStatistics?.totalLeave}
                      </h2>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <p className="text-sm font-semibold text-gray-500">
                        Records
                      </p>
                      <h2 className="text-2xl font-bold text-blue-600">
                        {particularStatistics?.totalRecords}
                      </h2>
                    </div>

                    {/* <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                      <p className="text-sm font-semibold text-gray-500">
                        Avg Hours
                      </p>
                      <h2 className="text-2xl font-bold text-purple-600">
                        {Math.ceil(particularStatistics?.averageWorkDuration) ||
                          0}
                        h
                      </h2>
                    </div> */}
                  </div>
                </div>
              )}
            </div>

            {/* Pie Chart */}
            <div className="w-full xl:w-[420px] shrink-0">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm h-full">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Attendance Distribution
                </h3>

                <div className="w-full flex-1 h-[280px] justify-center items-center min-w-0">
                  {totalAttendance === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      No attendance data available
                    </div>
                  ) : (
                    <PieChart width="100%" height="100%">
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ value }) =>
                          `${((value / totalDays) * 100).toFixed(0)}%`
                        }
                      >
                        <Cell fill="#3C83F6" />
                        <Cell fill="#ef4444" />
                        <Cell fill="#f59e0b" />
                      </Pie>

                      <Tooltip
                        formatter={(value, name) => [
                          `${value} (${((value / totalDays) * 100).toFixed(1)}%)`,
                          name,
                        ]}
                      />

                      <Legend />
                    </PieChart>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {loggedInUser && loggedInUser?.role === "admin" ? (
          <div className=" w-full lg:w-1/2  bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Employee Attendance Overview
                </h2>
                <p className="text-sm text-gray-500">
                  Total attendance records by employee
                </p>
              </div>
              <div className="flex justify-center items-center  gap-5">
                <select
                  value={monthCount}
                  onChange={(e) => setMonthCount(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>January</option>
                  <option value={2}>February</option>
                  <option value={3}>March</option>
                  <option value={4}>April</option>
                  <option value={5}>May</option>
                  <option value={6}>June</option>
                  <option value={7}>July</option>
                  <option value={8}>August</option>
                  <option value={9}>September</option>
                  <option value={10}>October</option>
                  <option value={11}>November</option>
                  <option value={12}>December</option>
                </select>

                <select
                  value={yearCount}
                  onChange={(e) => setYearCount(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                  <option value={2024}>2024</option>
                </select>
              </div>
            </div>
            <div className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statistics}
                  margin={{
                    top: 40,
                    right: 0,
                    left: 0,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="#f1f5f9"
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="employeeName"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />

                  <Tooltip
                    cursor={{ fill: "rgba(59,130,246,0.08)" }}
                    content={({ active, payload }) => {
                      if (active && payload?.length) {
                        const employee = payload[0].payload;

                        return (
                          <div className="bg-white rounded-2xl  shadow-xl p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <img
                                src={employee.employeePhoto}
                                alt=""
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div>
                                <h3 className="font-semibold">
                                  {employee.employeeName}
                                </h3>
                                <p className="text-xs text-gray-500">
                                  {employee.employeeEmail}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-0.5 text-xs">
                              <p>Present: {employee.totalPresent}</p>
                              <p>Absent: {employee.totalAbsent}</p>
                              <p>Leave: {employee.totalLeave}</p>
                              <p>HalfDay: {employee.totalHalfDay}</p>
                              <p>Records: {employee.totalRecords}</p>
                            </div>
                          </div>
                        );
                      }

                      return null;
                    }}
                  />

                  <Bar
                    dataKey="totalRecords"
                    radius={[12, 12, 0, 0]}
                    maxBarSize={40}
                  >
                    {statistics.map((entry, index) => (
                      <Cell key={index} fill={colors[index % colors.length]} />
                    ))}

                    <LabelList
                      dataKey="totalRecords"
                      position="top"
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        fill: "#374151",
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <EmployeeAttendance />
        )}
      </div>
    </div>
  );
};

export default Attendance;
