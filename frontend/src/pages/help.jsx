import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ModalContext } from "../context/modalContext";

const Help = () => {
  const { dark } = useContext(ModalContext);
  return (
    <div className="w-full min-h-screen flex justify-center items-start px-4 sm:px-6 md:px-10 lg:px-20 xl:px-30 py-6 md:py-10">
      <div className="flex flex-col w-full max-w-7xl gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1
              className={`${dark ? "text-white" : "text-black"} transition-colors duration-200 text-xl sm:text-2xl font-bold`}
            >
              FAQ
            </h1>

            {/* <div className="flex flex-wrap text-sm font-semibold gap-1">
              <Link to="/" className="text-blue-500 hover:text-blue-600">
                Dashboard
              </Link>
              <p
                className={`${dark ? "text-white" : "text-gray-400"} transition-colors duration-200 `}
              >
                / FAQ
              </p>
            </div> */}
          </div>
        </div>

        <div className="flex flex-col justify-center items-center bg-[url('/faq.png')] bg-center  bg-cover rounded-xl h-62.5 w-full">
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-white">
            Have a question? We’re ready to help?
          </h1>
          <p className="text-sm md:text-[15px] text-white">
            Or choose a section to find what you need in seconds.
          </p>
        </div>
        <div className="w-full mx-auto bg-white rounded-xl shadow-md border border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Help & Legal Information
          </h2>

          <div className="space-y-5 text-gray-600 leading-7">
            <p>
              Welcome to our Help Center. We are committed to providing a
              secure, reliable, and transparent experience for all users. If you
              encounter any issues while using our platform, our support team is
              available to assist you with account management, technical
              problems, billing inquiries, and general questions.
            </p>

            <p>
              By accessing and using this platform, you agree to comply with our
              Terms of Service and Privacy Policy. Users are responsible for
              maintaining the confidentiality of their account credentials and
              for all activities performed under their account.
            </p>

            <p>
              We take the protection of your personal information seriously.
              Your data is collected, processed, and stored in accordance with
              applicable privacy laws. We do not sell personal information to
              third parties and only share data when required to provide our
              services or comply with legal obligations.
            </p>

            <p>
              While we strive to ensure uninterrupted service, we cannot
              guarantee that the platform will always be available without
              interruptions, errors, or delays. Scheduled maintenance or
              unforeseen technical issues may temporarily affect accessibility.
            </p>

            <p>
              If you believe your account has been compromised or you notice
              suspicious activity, please contact our support team immediately.
              We recommend using a strong password and enabling additional
              security measures whenever available.
            </p>

            <p>
              For additional assistance, feedback, or legal inquiries, please
              reach out to our support team through the contact information
              provided within the application. We aim to respond to all requests
              as quickly as possible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
