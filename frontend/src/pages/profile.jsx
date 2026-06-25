import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ModalContext } from "../context/modalContext";
import { toast } from "sonner";
const Profile = () => {
  const [user, setUser] = useState({});
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const { dark } = useContext(ModalContext);
  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/employee/${id}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );

      setUser(response.data);
    } catch (error) {
      console.log(error.message);
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  return (
    <div
      className={`w-full min-h-screen flex justify-center transition-colors duration-200 items-start px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 md:py-10  ${dark ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="flex flex-col w-full max-w-7xl gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1
              className={`${dark ? "text-white" : "text-black"} text-xl sm:text-2xl font-bold`}
            >
              Profile
            </h1>

            <div className="flex flex-wrap text-sm font-semibold gap-1">
              <Link to="/" className="text-blue-500 hover:text-blue-600">
                Dashboard
              </Link>
              <p className="text-gray-400">/ Profile</p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="w-full border bg-white border-gray-300 rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <img
              src={user.profilePhoto}
              alt={user.name}
              className="rounded-full w-24 h-24 sm:w-28 sm:h-28 object-cover "
            />

            <div className="flex flex-col items-center sm:items-start gap-2 text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold capitalize">
                {user.name}
              </h1>

              <p className="text-gray-500 font-medium">{user.designation}</p>

              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <span
                  className={`text-xs font-semibold capitalize text-white px-3 py-1 rounded-full ${
                    user.role === "admin" ? "bg-red-600" : "bg-blue-600"
                  }`}
                >
                  {user.role === "admin" ? "Administrator" : "Employee"}
                </span>

                <span className="text-xs font-semibold capitalize text-white bg-orange-500 px-3 py-1 rounded-full">
                  {user.department}
                </span>

                <span
                  className={`text-xs font-semibold capitalize text-white px-3 py-1 rounded-full ${
                    user.status === "Active" ? "bg-green-600" : "bg-yellow-500"
                  }`}
                >
                  {user.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full">
          {/* Basic Information */}
          <div className="w-full lg:w-1/3 border border-gray-300 rounded-xl bg-white shadow-sm">
            <div className="border-b border-gray-300 px-5 py-4">
              <p className="font-semibold">Basic Information</p>
            </div>

            <div className="flex flex-col gap-5 p-5">
              <div>
                <span className="text-gray-400 text-sm font-semibold">
                  Full Name
                </span>
                <p className="text-sm font-semibold capitalize">{user.name}</p>
              </div>

              <div>
                <span className="text-gray-400 text-sm font-semibold">
                  Email
                </span>
                <p className="text-sm font-semibold break-all">{user.email}</p>
              </div>

              <div>
                <span className="text-gray-400 text-sm font-semibold">
                  Phone
                </span>
                <p className="text-sm font-semibold">{user.phone}</p>
              </div>

              <div>
                <span className="text-gray-400 text-sm font-semibold">
                  Date of Birth
                </span>
                <p className="text-sm font-semibold">
                  {user.dateOfBirth
                    ? new Date(user.dateOfBirth).toLocaleDateString("en-GB", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "-"}
                </p>
              </div>

              <div>
                <span className="text-gray-400 text-sm font-semibold">
                  Joined Date
                </span>
                <p className="text-sm font-semibold">
                  {user.joiningDate
                    ? new Date(user.joiningDate).toLocaleDateString("en-GB", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="w-full lg:w-2/3 border border-gray-300 rounded-xl bg-white shadow-sm">
            <div className="border-b border-gray-300 px-5 py-4">
              <p className="font-semibold">Additional Information</p>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400 text-sm font-semibold">
                    Employee ID
                  </span>

                  <div className="inline-flex items-center w-fit px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
                    <span className="text-xs font-mono font-bold tracking-wider text-blue-700">
                      EMP-{user?._id?.toUpperCase() || "N/A"}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 text-sm font-semibold">
                    Department
                  </span>
                  <p className="text-sm font-semibold capitalize">
                    {user.department || "-"}
                  </p>
                </div>

                <div>
                  <span className="text-gray-400 text-sm font-semibold">
                    Designation
                  </span>
                  <p className="text-sm font-semibold capitalize">
                    {user.designation || "-"}
                  </p>
                </div>

                <div>
                  <span className="text-gray-400 text-sm font-semibold">
                    Role
                  </span>
                  <p className="text-sm font-semibold capitalize">
                    {user.role || "-"}
                  </p>
                </div>

                <div>
                  <span className="text-gray-400 text-sm font-semibold">
                    Status
                  </span>
                  <p className="text-sm font-semibold capitalize">
                    {user.status || "-"}
                  </p>
                </div>

                <div>
                  <span className="text-gray-400 text-sm font-semibold">
                    Address
                  </span>
                  <p className="text-sm font-semibold">{user.address || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
