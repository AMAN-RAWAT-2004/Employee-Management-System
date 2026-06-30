import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF } from "react-icons/fa6";
import { PiXLogoBold } from "react-icons/pi";
import { FaGithub } from "react-icons/fa6";

const Register = () => {
  return (
    <div className="relative w-screen h-screen p-5  bg-[url('/bg-image.jpg')] opacity-95 bg-cover bg-center  ">
      <div className="absolute top-30 left-60  flex flex-col justify-center items-center gap-5 w-112.5  rounded-3xl bg-white/95 shadow-2xl px-6  py-10 ">
        <div className="flex items-center justify-center gap-4">
          <img src="logo.png" alt="logo" className="w-12 h-12 " />
          <h1 className="font-bold text-2xl">EmployeeHub</h1>
        </div>

        <div className="flex flex-col items-center justify-center">
          <h1 className="text-lg font-bold">Welcome to EmployeeHub</h1>
          <p className="text-gray-400">Sign up to create your secure admin.</p>
        </div>
        <form className="w-full flex flex-col gap-6">
          <div className="flex flex-col items-start justify-center gap-2 ">
            <label className="text-gray-500">Name</label>
            <input
              type="email"
              className="border border-gray-300 h-10 w-full px-3 py-2 rounded-lg placeholder:text-sm placeholder:font-bold"
              name="name"
              placeholder="Full Name"
            />
          </div>
          <div className="flex flex-col items-start justify-center gap-2 ">
            <label className="text-gray-500">Email Address</label>
            <input
              type="email"
              className="border border-gray-300 h-10 w-full px-3 py-2 rounded-lg placeholder:text-sm placeholder:font-bold"
              name="email"
              placeholder="info@example.com"
            />
          </div>
          <div className="flex flex-col items-start justify-center gap-2 ">
            <label className="text-gray-500">Password</label>
            <input
              type="password"
              className="border border-gray-300 h-10 w-full px-3 py-2 rounded-lg placeholder:text-sm "
              name="password"
              placeholder="********"
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex justify-center items-center gap-2">
              <input type="checkbox" className="w-4 h-4 border rounded-lg" />
              <label className="text-gray-500 text-sm">
                I agree to{" "}
                <span className="text-blue-600 text-sm">
                  privacy policy & terms
                </span>
              </label>
            </div>
          </div>
          <div className="w-full flex">
            <button className="bg-blue-500 w-full px-3 py-2 rounded-lg transition-all duration-150 hover:bg-blue-600  text-white">
              Sign up
            </button>
          </div>
          <div className="w-full flex justify-center items-center">
            <p className="text-sm text-gray-400">
              Have any account?{" "}
              <Link to="/login" className="text-blue-600">
                {" "}
                Sign In here
              </Link>
            </p>
          </div>
        </form>

        <div className="flex w-full items-center justify-center gap-2">
          <div className="w-full border-b border-gray-300"></div>
          <p className="text-sm w-full text-gray-400">Or Continue With</p>
          <div className="w-full border-b border-gray-300"></div>
        </div>
        <div className="flex justify-center items-center gap-2">
          <Link to="">
            <FaFacebookF className="text-xl bg-blue-200 text-blue-600 w-10 h-10 p-2 transition-all duration-150 hover:text-white hover:bg-blue-600 rounded-full" />
          </Link>
          <Link to="">
            <PiXLogoBold className="text-xl bg-gray-200 text-black w-10 h-10 p-2 transition-all duration-150 hover:text-white hover:bg-black rounded-full" />
          </Link>
          <Link to="">
            <FaGithub className="text-xl bg-gray-200 text-black w-10 h-10 p-2 transition-all duration-150 hover:text-white hover:bg-black rounded-full" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
