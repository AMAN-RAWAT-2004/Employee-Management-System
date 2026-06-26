import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CiSettings, CiMail } from "react-icons/ci";
import { GiHamburgerMenu } from "react-icons/gi";
import { RiSunLine } from "react-icons/ri";
import { IoMdHelpCircleOutline } from "react-icons/io";
import { PiNewspaperThin } from "react-icons/pi";
import {
  IoNotificationsOutline,
  IoPersonSharp,
  IoCalendarOutline,
} from "react-icons/io5";
import { FaAngleDown } from "react-icons/fa6";
import { LuLogOut } from "react-icons/lu";
import { MdDarkMode } from "react-icons/md";

import Searchbar from "./searchbar";
import MenuItem from "./menuItem";
import { ModalContext } from "../context/modalContext";

const Navbar = () => {
  const { isNavOpen, setIsNavOpen, dark, setDark } = useContext(ModalContext);

  const [loggedInUser, setLoggedInUser] = useState({});
  const [openProfile, setOpenProfile] = useState(false);

  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setOpenProfile(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    try {
      const user = localStorage.getItem("user");

      if (user) {
        setLoggedInUser(JSON.parse(user));
      }
    } catch (error) {
      console.error("Invalid user data");
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const iconBtn = `
    p-2 rounded-full transition-all duration-200
    ${dark ? "hover:bg-zinc-800" : "hover:bg-gray-100"}
  `;

  return (
    <nav
      className={`fixed top-0 right-0 z-40 flex w-full xl:w-5/6 items-center justify-between px-4 py-3 transition-colors duration-200
      ${
        dark
          ? "bg-gray-900 border-b border-gray-700 text-white"
          : "bg-white border-b border-gray-200 text-gray-700"
      }`}
    >
      {/* Left Side */}
      <div className="flex items-center gap-3 lg:gap-5">
        <button
          onClick={() => setIsNavOpen(!isNavOpen)}
          className={`xl:hidden text-2xl transition-colors duration-200 ${
            dark
              ? "text-gray-300 hover:text-white"
              : "text-gray-600 hover:text-blue-600"
          }`}
        >
          <GiHamburgerMenu />
        </button>

        <div className="hidden sm:block">
          <Searchbar />
        </div>

        <div className="hidden lg:flex items-center gap-5">
          {/* <Link
            to="/analytics"
            className={`text-sm font-medium transition-colors duration-200 ${
              dark ? "hover:text-gray-300" : "hover:text-blue-600"
            }`}
          >
            Reports & Analytics
          </Link> */}

          <Link
            to="/help"
            className={`text-sm font-medium transition-colors duration-200 ${
              dark ? "hover:text-gray-300" : "hover:text-blue-600"
            }`}
          >
            Help
          </Link>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3 lg:gap-5">
        {/* Theme Toggle */}
        <button onClick={() => setDark(!dark)} className={iconBtn}>
          {dark ? (
            <RiSunLine className="text-xl text-yellow-400" />
          ) : (
            <MdDarkMode className="text-xl text-gray-600" />
          )}
        </button>

        {/* Action Icons */}
        <div
          className={`hidden sm:flex items-center gap-4 px-4 transition-colors duration-200 border-x ${
            dark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <button className={iconBtn}>
            <CiMail className="text-xl" />
          </button>

          <button className={`${iconBtn} relative`}>
            <IoNotificationsOutline className="text-xl" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <button className={iconBtn}>
            <IoCalendarOutline className="text-xl" />
          </button>
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <div
            onClick={() => setOpenProfile(!openProfile)}
            className="flex cursor-pointer items-center gap-2"
          >
            <div className="hidden md:flex flex-col items-start">
              <p
                className={`text-sm font-semibold transition-colors duration-200 ${
                  dark ? "text-white" : "text-gray-800"
                }`}
              >
                {loggedInUser?.name}
              </p>

              <p
                className={`flex items-center gap-1 text-xs transition-colors duration-200 font-medium ${
                  dark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {loggedInUser?.designation}

                <FaAngleDown
                  className={`transition-transform duration-200 ${
                    openProfile ? "rotate-180" : ""
                  }`}
                />
              </p>
            </div>

            <img
              src={loggedInUser?.profilePhoto}
              alt="profile"
              className="h-10 w-10 rounded-full object-cover border-2 border-gray-300 dark:border-zinc-700"
            />
          </div>

          {/* Dropdown */}
          <div
            className={`absolute top-full right-0 mt-3 w-64 rounded-xl border shadow-xl transition-all duration-300
            ${dark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}
            ${
              openProfile
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <div
              className={`flex items-center gap-3 p-4 border-b ${
                dark ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <img
                src={loggedInUser?.profilePhoto}
                alt="profile"
                className="h-12 w-12 rounded-full object-cover"
              />

              <div>
                <p
                  className={`font-semibold ${
                    dark ? "text-white" : "text-gray-800"
                  }`}
                >
                  {loggedInUser?.name}
                </p>

                <p
                  className={`text-xs ${
                    dark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {loggedInUser?.email}
                </p>
              </div>
            </div>

            <div className="py-2">
              <MenuItem
                icon={<IoPersonSharp />}
                title="View Profile"
                url={`/profile/${loggedInUser?._id}`}
                setOpenProfile={setOpenProfile}
              />

              <MenuItem
                icon={<PiNewspaperThin />}
                title="My Tasks"
                url="/taskManagement"
                setOpenProfile={setOpenProfile}
              />

              <MenuItem
                icon={<IoMdHelpCircleOutline />}
                title="Help Center"
                url="/help"
                setOpenProfile={setOpenProfile}
              />

              <MenuItem
                icon={<CiSettings />}
                title="Account Settings"
                setOpenProfile={setOpenProfile}
              />
            </div>

            <div
              className={`p-2 border-t ${
                dark ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-red-500 hover:bg-red-500/10 transition"
              >
                <LuLogOut />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
