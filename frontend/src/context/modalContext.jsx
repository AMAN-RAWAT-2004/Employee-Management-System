import { createContext, useState } from "react";

export const ModalContext = createContext();
export const ModalProvider = ({ children }) => {
  const [dark, setDark] = useState(false);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [error, setError] = useState("");
  const [refreshEmployee, setRefreshEmployee] = useState(false);
  const [refreshAttendance, setRefreshAttendance] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [openAddTaskForm, setOpenAddTaskForm] = useState(false);
  const [openAddAttendanceForm, setOpenAddAttendanceForm] = useState(false);
  const [openAddLeaveForm, setOpenAddLeaveForm] = useState(false);
  const [editLeave, setEditLeave] = useState(null);
  const loggedInUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;
  return (
    <ModalContext.Provider
      value={{
        loggedInUser,
        isAddEmployeeOpen,
        setIsAddEmployeeOpen,
        isNavOpen,
        setIsNavOpen,
        editingEmployee,
        setEditingEmployee,
        refreshEmployee,
        setRefreshEmployee,
        openAddTaskForm,
        setOpenAddTaskForm,
        editingTask,
        setEditingTask,
        error,
        setError,
        openAddAttendanceForm,
        setOpenAddAttendanceForm,
        refreshAttendance,
        setRefreshAttendance,
        dark,
        setDark,
        openAddLeaveForm,
        setOpenAddLeaveForm,
        editLeave,
        setEditLeave,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};
