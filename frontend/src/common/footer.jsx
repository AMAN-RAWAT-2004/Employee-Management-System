import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ModalContext } from "../context/modalContext";

const Footer = () => {
  const { dark } = useContext(ModalContext);
  return (
    <footer
      className={` w-full  flex flex-col md:flex-row gap-3 items-center justify-around border-t transition-colors duration-200 ${dark ? "bg-gray-900 border-gray-700" : "border-gray-200 bg-white"}  px-4 py-3  `}
    >
      <div>
        <p className={`text-sm w-70 md:w-full text-center ${dark ? "text-white" : "text-gray-500"}`}>
          © 2026 EmployeeHub. Proudly powered by{" "}
          <span className="font-medium text-blue-400">Amandeep Rawat</span>.
        </p>
      </div>
      <div
        className={`flex items-center gap-6 text-sm font-medium ${
          dark ? "text-gray-400" : "text-gray-500"
        }`}
      >
        <Link
          to="/"
          className={`transition ${
            dark ? "hover:text-white" : "hover:text-blue-600"
          }`}
        >
          Home
        </Link>

        <Link
          to="/help"
          className={`transition ${
            dark ? "hover:text-white" : "hover:text-blue-600"
          }`}
        >
          FAQ
        </Link>

        {/* <Link
          to="/help"
          className={`transition ${
            dark ? "hover:text-white" : "hover:text-blue-600"
          }`}
        >
          Support
        </Link> */}
      </div>
    </footer>
  );
};

export default Footer;
