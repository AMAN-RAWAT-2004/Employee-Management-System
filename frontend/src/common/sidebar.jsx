import React, { useState } from "react";
import { RxDashboard } from "react-icons/rx";
import { FaChevronDown } from "react-icons/fa6";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { ModalContext } from "../context/modalContext";
import { useRef } from "react";
import { useEffect } from "react";
import logo from "./../assets/logo.png";
const Sidebar = () => {
  const { isAddEmployeeOpen, dark, isNavOpen, setIsNavOpen, loggedInUser } =
    useContext(ModalContext);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const clickOutsideFunction = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsNavOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutsideFunction);

    return () => {
      document.removeEventListener("mousedown", clickOutsideFunction);
    };
  }, []);

  return (
    <aside
      ref={sidebarRef}
      className={`md:w-2/5 lg:w-2/6 xl:w-1/6 z-50 fixed left-0 top-0 h-screen
    ${dark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}
    border-r transform transition-transform duration-400 lg:transition-colors lg:duration-200
    ${isNavOpen ? "translate-x-0" : "-translate-x-full"}
    xl:translate-x-0 shadow-sm flex flex-col`}
    >
      {/* Logo */}
      <div
        className={`flex items-center transition-colors duration-200 gap-3 px-5 py-3 border-b ${
          dark ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <img src={logo} alt="logo" className="w-10 h-10" />

        <h1
          className={`text-xl font-bold transition-colors duration-200 ${
            dark ? "text-white" : "text-gray-800"
          }`}
        >
          EmployeeHub
        </h1>
      </div>

      <div className="lg:p-8">
        <div className="overflow-hidden transition-colors duration-200 ease-in-out max-h-96 opacity-100 mt-4">
          {loggedInUser.role === "admin" ? (
            <nav className="flex flex-col gap-4 font-semibold">
              <NavLink
                to="/"
                onClick={() => setIsNavOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? `px-4 py-2 rounded-lg text-blue-500 ${
                        dark ? "bg-gray-800" : "bg-blue-50"
                      }`
                    : `px-4 py-2 rounded-lg transition-colors duration-200 ${
                        dark
                          ? "text-gray-300 hover:bg-gray-800 hover:text-blue-400"
                          : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                      }`
                }
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/employee"
                onClick={() => setIsNavOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? `px-4 py-2 rounded-lg text-blue-500 ${
                        dark ? "bg-gray-800" : "bg-blue-50"
                      }`
                    : `px-4 py-2 rounded-lg transition-colors duration-200 ${
                        dark
                          ? "text-gray-300 hover:bg-gray-800 hover:text-blue-400"
                          : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                      }`
                }
              >
                Employee
              </NavLink>

              <NavLink
                to="/taskManagement"
                onClick={() => setIsNavOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? `px-4 py-2 rounded-lg text-blue-500 ${
                        dark ? "bg-gray-800" : "bg-blue-50"
                      }`
                    : `px-4 py-2 rounded-lg transition-colors duration-200 ${
                        dark
                          ? "text-gray-300 hover:bg-gray-800 hover:text-blue-400"
                          : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                      }`
                }
              >
                Task Management
              </NavLink>

              <NavLink
                to="/attendance"
                onClick={() => setIsNavOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? `px-4 py-2 rounded-lg text-blue-500 ${
                        dark ? "bg-gray-800" : "bg-blue-50"
                      }`
                    : `px-4 py-2 rounded-lg transition-colors duration-200 ${
                        dark
                          ? "text-gray-300 hover:bg-gray-800 hover:text-blue-400"
                          : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                      }`
                }
              >
                Attendance
              </NavLink>

              <NavLink
                to="/leave"
                onClick={() => setIsNavOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? `px-4 py-2 rounded-lg text-blue-500 ${
                        dark ? "bg-gray-800" : "bg-blue-50"
                      }`
                    : `px-4 py-2 rounded-lg transition-colors duration-200 ${
                        dark
                          ? "text-gray-300 hover:bg-gray-800 hover:text-blue-400"
                          : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                      }`
                }
              >
                Leave
              </NavLink>
            </nav>
          ) : (
            <nav className="flex flex-col gap-4 font-semibold">
              <NavLink
                to="/taskManagement"
                onClick={() => setIsNavOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? `px-4 py-2 rounded-lg text-blue-500 ${
                        dark ? "bg-gray-800" : "bg-blue-50"
                      }`
                    : `px-4 py-2 rounded-lg transition-colors duration-200 ${
                        dark
                          ? "text-gray-300 hover:bg-gray-800 hover:text-blue-400"
                          : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                      }`
                }
              >
                Task Management
              </NavLink>

              <NavLink
                to="/attendance"
                onClick={() => setIsNavOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? `px-4 py-2 rounded-lg text-blue-500 ${
                        dark ? "bg-gray-800" : "bg-blue-50"
                      }`
                    : `px-4 py-2 rounded-lg transition-colors duration-200 ${
                        dark
                          ? "text-gray-300 hover:bg-gray-800 hover:text-blue-400"
                          : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                      }`
                }
              >
                Attendance
              </NavLink>

              <NavLink
                to="/leave"
                onClick={() => setIsNavOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? `px-4 py-2 rounded-lg text-blue-500 ${
                        dark ? "bg-gray-800" : "bg-blue-50"
                      }`
                    : `px-4 py-2 rounded-lg transition-colors duration-200 ${
                        dark
                          ? "text-gray-300 hover:bg-gray-800 hover:text-blue-400"
                          : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                      }`
                }
              >
                Leave
              </NavLink>
            </nav>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
