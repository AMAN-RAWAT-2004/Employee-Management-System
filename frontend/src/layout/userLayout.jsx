import React, { useContext } from "react";
import { Outlet } from "react-router-dom";
import Header from "../common/header";
import Sidebar from "../common/sidebar";
import AddEmployee from "../common/addEmployee";
import { ModalContext } from "../context/modalContext";
import Footer from "../common/footer";
import AddTask from "../common/addTask";
import AddAttendance from "../common/addAttendance";
import AddLeave from "../common/addLeave";

const UserLayout = () => {
  const {
    isAddEmployeeOpen,
    openAddTaskForm,
    isNavOpen,
    dark,
    openAddAttendanceForm,
    openAddLeaveForm,
  } = useContext(ModalContext);

  return (
    <div
      className={`min-h-screen transition-colors duration-200  ${dark ? "bg-gray-900" : "bg-gray-50"} `}
    >
      <Sidebar />

      <div className="xl:ml-62.5 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 mt-17.5 ">
          <Outlet />
        </main>
        <Footer />
      </div>

      {isAddEmployeeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <AddEmployee />
          </div>
        </div>
      )}
      {openAddTaskForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <AddTask />
          </div>
        </div>
      )}
      {openAddAttendanceForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <AddAttendance />
          </div>
        </div>
      )}
      {openAddLeaveForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <AddLeave />
          </div>
        </div>
      )}

    </div>
  );
};

export default UserLayout;
