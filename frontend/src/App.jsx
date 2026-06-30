import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserLayout from "./layout/userLayout";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import PublicRoute from "./routes/publicRoute";
import Attendance from "./pages/attendance";
import Employee from "./pages/employee";
import Leave from "./pages/leave";
import TaskManagement from "./pages/taskManagement";
import AddEmployee from "./common/addEmployee";
import { ModalProvider } from "./context/modalContext";
import Profile from "./pages/profile";
import Help from "./pages/help";
import Analytics from "./pages/analytics";
import ProtectedRoute from "./routes/protectedRoute";
import { Toaster } from "sonner";
import RoleProtectedRoute from "./routes/roleProtectedRoute";

const App = () => {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-center" duration={2000} />

      <Routes>
        {/* Protected Route  Login Necessary */}
        <Route element={<ProtectedRoute />}>
          {/* User Layout With ModalContext Wrap  */}
          <Route
            path="/"
            element={
              <ModalProvider>
                <UserLayout />
              </ModalProvider>
            }
          >
            {/* RoleProtectedRoute Access to Only Admin  */}
            <Route element={<RoleProtectedRoute allowedRoles={["admin"]} />}>
              <Route index element={<Home />} />
              <Route path="/employee" element={<Employee />} />
            </Route>
            {/* Route Access to EveryOne  */}
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/leave" element={<Leave />} />
            <Route path="/taskManagement" element={<TaskManagement />} />
            <Route path="/addEmployee" element={<AddEmployee />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/help" element={<Help />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>
        </Route>

        {/* PublicRoute When Not Logged In  */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
