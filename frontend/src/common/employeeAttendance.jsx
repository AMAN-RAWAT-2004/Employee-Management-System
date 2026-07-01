import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { FiClock, FiLogIn, FiLogOut, FiCalendar } from "react-icons/fi";
import { IoCheckmarkCircle } from "react-icons/io5";
import { ModalContext } from "../context/modalContext";
import { MdCancel } from "react-icons/md";

const EmployeeAttendance = () => {
  const { loggedInUser } = useContext(ModalContext);
  const token = localStorage.getItem("token");
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);

  const fetchTodayAttendance = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/attendance/today`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setAttendance(res.data.attendance);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const handleCheckIn = async () => {
    try {
      setButtonLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/attendance/check-in`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data.message);

      fetchTodayAttendance();
    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      setButtonLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setButtonLoading(true);

      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/attendance/check-out`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data.message);

      fetchTodayAttendance();
    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      setButtonLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return "--";

    return new Date(time).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "--";
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${hrs}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        Loading...
      </div>
    );
  }

  const handleResumeAttendance = async (attendanceId) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/attendance/resume/${attendanceId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success(response?.data?.message);
      fetchTodayAttendance();
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div className="h-full border rounded-2xl bg-white border-gray-300 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}

        <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl text-white p-8 mb-8 shadow-lg">
          <h1 className="text-3xl font-bold">Welcome, {loggedInUser?.name}</h1>

          <p className="mt-2 flex items-center gap-2 text-blue-100">
            <FiCalendar />
            {new Date().toDateString()}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Attendance Card */}

          <div className="lg:col-span-2 bg-white border border-gray-300 rounded-2xl shadow-md p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl text-center font-bold ">
                Today's Attendance
              </h2>
              {attendance?.checkIn !== null &&
                attendance?.checkOut !== null &&
                attendance?.checkOut !== "" &&
                attendance?.checkOut !== "" &&
                attendance?.workDuration <= 510 && (
                  <button
                    className="bg-red-500 text-white px-3 py-1.5 text-sm rounded cursor-pointer transition-all duration-300 hover:bg-red-700"
                    onClick={() => handleResumeAttendance(attendance?._id)}
                  >
                    Resume
                  </button>
                )}
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex justify-between border-b pb-3">
                  <span>Status</span>

                  <span className="flex items-center gap-2 font-semibold text-red-600">
                    {attendance ? (
                      <div className="text-green-600 flex  items-center justify-center gap-2">
                        <IoCheckmarkCircle className="text-lg" />
                        {attendance.status}
                      </div>
                    ) : (
                      "Not Marked"
                    )}
                  </span>
                </div>

                <div className="flex justify-between border-b pb-3">
                  <span>Check In</span>

                  <span>
                    <p>{formatTime(attendance?.checkIn)}</p>
                  </span>
                </div>

                <div className="flex justify-between border-b pb-3">
                  <span>Check Out</span>

                  <span>
                    <p>{formatTime(attendance?.checkOut)}</p>
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Working Hours</span>

                  <span>{formatDuration(attendance?.workDuration)}</span>
                </div>
              </div>

              <div className="flex justify-center items-center">
                {!attendance ? (
                  <button
                    disabled={buttonLoading}
                    onClick={handleCheckIn}
                    className="bg-green-600 hover:bg-green-700 cursor-pointer text-white px-10 py-4 rounded-xl flex items-center gap-3"
                  >
                    <FiLogIn size={22} />
                    Check In
                  </button>
                ) : attendance && !attendance.checkOut ? (
                  <button
                    disabled={buttonLoading}
                    onClick={handleCheckOut}
                    className="bg-red-600 hover:bg-red-700 cursor-pointer text-white px-10 py-4 rounded-xl flex items-center gap-3"
                  >
                    <FiLogOut size={22} />
                    Check Out
                  </button>
                ) : attendance.workDuration > 510 ? (
                  <div className="text-center">
                    <IoCheckmarkCircle
                      className="text-green-600 mx-auto"
                      size={70}
                    />

                    <h3 className="mt-4 font-bold text-xl">
                      Attendance Completed
                    </h3>

                    <p className="text-gray-500 mt-2">Have a great day 🎉</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <MdCancel className="text-red-600 mx-auto" size={70} />

                    <h3 className="mt-4 font-bold text-xl">
                      Attendance InCompleted
                    </h3>

                    <p className="text-gray-500 mt-2">
                      You can have Trouble Later !!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}

          <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-2xl shadow p-6">
              <div className="flex items-center gap-3">
                <FiClock className="text-blue-600" size={26} />

                <div>
                  <p className="text-gray-500">Working Time</p>

                  <h2 className="text-2xl font-bold mt-2">
                    {formatDuration(attendance?.workDuration)}
                  </h2>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow p-6">
              <p className="text-gray-500">Attendance Status</p>

              <h2 className="text-3xl font-bold mt-3 text-green-600">
                {attendance ? attendance.status : "Not Marked"}
              </h2>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow p-6">
              <p className="text-gray-500">Today's Timeline</p>

              <div className="mt-5 space-y-3">
                {attendance?.checkIn && (
                  <div className="flex items-center gap-2 text-green-600">
                    <IoCheckmarkCircle />
                    Checked In at <p>{formatTime(attendance?.checkIn)}</p>
                  </div>
                )}

                {attendance?.checkOut && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <IoCheckmarkCircle />
                    Checked Out at <p>{formatTime(attendance?.checkOut)}</p>
                  </div>
                )}

                {!attendance && (
                  <p className="text-gray-400">No activity yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
