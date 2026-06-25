import axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import { GoPlus } from "react-icons/go";
import { Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ModalContext } from "../context/modalContext";
import { BsThreeDots } from "react-icons/bs";
import { FiPlus } from "react-icons/fi";
import { toast } from "sonner";
import { IoSearchOutline } from "react-icons/io5";

const TaskManagement = () => {
  const {
    setOpenAddTaskForm,
    setRefreshEmployee,
    refreshEmployee,
    dark,
    setEditingTask,
    loggedInUser,
  } = useContext(ModalContext);
  const [tasks, setTasks] = useState([]);
  const [loggedInTasks, setLoggedInTasks] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showAssignPopup, setShowAssignPopup] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const token = localStorage.getItem("token");
  const menuRef = useRef(null);
  const [search, setSearch] = useState("");
  const assignUserRef = useRef(null);
  const fetchTasks = async () => {
    try {
      if (loggedInUser.role === "admin") {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/tasks/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setTasks(response.data);
      }
      return;
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };
  useEffect(() => {
    fetchTasks();
    loggedInUserTasks();
  }, [refreshEmployee, token]);

  const handleEdit = (user) => {
    setEditingTask(user);
    setOpenAddTaskForm(true);
  };
  const fetchUsers = async () => {
    try {
      if (loggedInUser.role === "admin") {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/employee`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setUsers(response.data.employees);
      }
      return;
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };
  const columns = [
    {
      id: "New",
      title: "New",
      color: "bg-purple-50",
      border: "border-purple-600",
      text: "text-purple-600",
      bg: "bg-purple-400",
    },
    {
      id: "Pending",
      title: "Pending",
      color: "bg-blue-50",
      border: "border-blue-600",
      text: "text-blue-600",
      bg: "bg-blue-400",
    },
    {
      id: "In Progress",
      title: "In Progress",
      color: "bg-orange-50",
      border: "border-orange-600",
      text: "text-orange-600",
      bg: "bg-orange-400",
    },
    {
      id: "Completed",
      title: "Completed",
      color: "bg-green-50",
      border: "border-green-600",
      text: "text-green-600",
      bg: "bg-green-400",
    },
  ];

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;

    const updatedTasks = tasks.map((task) =>
      task._id === draggableId ? { ...task, status: newStatus } : task,
    );

    setTasks(updatedTasks);

    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/tasks/${draggableId}/status`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);

      fetchTasks();
    }
  };
  const handleOpenAddTaskForm = () => {
    setOpenAddTaskForm(true);
  };
  const handleDelete = async (taskId) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/tasks/${taskId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200) {
        setTasks((prevTasks) =>
          prevTasks.filter((task) => task._id !== taskId),
        );
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error(error?.response?.data?.message);
    }
  };
  const toggleEditMenu = (id) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        assignUserRef.current &&
        !assignUserRef.current.contains(event.target)
      ) {
        setShowAssignPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAssignTasksToUsers = async (task) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/tasks/${task._id}/assign`,
        {
          assignTo: selectedUsers,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchTasks();
      setShowAssignPopup(null);
      setSelectedUsers([]);
    } catch (error) {
      console.error(error);
      // showError(error.response?.data?.message);
      toast.error(error?.response?.data?.message);
    }
  };

  const handleEditdueDate = async (taskId, newDueDate) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/tasks/${taskId}/due-date`,
        {
          dueDate: newDueDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === taskId ? { ...task, dueDate: newDueDate } : task,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating due date:", error);
      toast.error(error?.response?.data?.message);
    }
  };

  const handleOpenAssignPopup = (task) => {
    setSelectedUsers(task.assignTo?.map((user) => user._id) || []);

    setShowAssignPopup(showAssignPopup === task._id ? null : task._id);
  };

  const handlePriorityChange = async (taskId, priority) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/tasks/${taskId}/priority`,
        {
          priority,
        },
      );

      setRefreshEmployee((prev) => !prev);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };
  const handleStatusUpdate = async (taskId, status) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/tasks/${taskId}/status`,
        {
          status,
        },
      );

      setRefreshEmployee((prev) => !prev);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };
  const filteredTasks = tasks.filter((task) =>
    task?.title?.toLowerCase()?.includes(search?.toLowerCase()),
  );

  const loggedInUserTasks = async () => {
    try {
      if (loggedInUser.role === "employee") {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/tasks/logged-In/tasks`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        // console.log(response.data.tasks);
        setLoggedInTasks(response.data.tasks);
      }
      return;
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };
  return (
    <div className="w-full min-h-screen flex justify-center items-start px-4 sm:px-6 md:px-10 lg:px-20 xl:px-20 py-6 md:py-10">
      <div className="flex flex-col w-full max-w-7xl gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1
              className={`text-xl sm:text-2xl font-bold ${dark ? "text-white" : "text-black"}`}
            >
              Task Management
            </h1>

            <div className="flex flex-wrap text-sm font-semibold gap-1">
              <Link
                to="/"
                className={`${dark ? "text-blue-400 hover:text-blue-500" : "text-blue-500 hover:text-blue-600"}`}
              >
                Dashboard
              </Link>
              <p className="text-gray-400">/ Task Management</p>
            </div>
          </div>
          {loggedInUser.role === "admin" ? (
            <button
              onClick={handleOpenAddTaskForm}
              className="flex justify-center items-center bg-blue-500 text-white px-4 py-2 rounded-lg gap-2 hover:bg-blue-600 w-full md:w-auto"
            >
              <GoPlus className="text-xl" />
              Add Task
            </button>
          ) : (
            " "
          )}
        </div>
        {/* Search Bar */}

        <div
          className={`rounded-2xl p-4 border shadow-sm transition-colors duration-200 ${
            dark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div
              className={`flex items-center gap-2 rounded-xl px-3 py-2 w-full lg:w-80 border transition-colors duration-200 ${
                dark
                  ? "bg-gray-800 border-gray-600"
                  : "bg-white border-gray-300"
              }`}
            >
              <IoSearchOutline
                className={`text-lg shrink-0 ${
                  dark ? "text-gray-400" : "text-gray-500"
                }`}
              />

              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full outline-none bg-transparent ${
                  dark
                    ? "text-white placeholder:text-gray-400"
                    : "text-gray-900 placeholder:text-gray-500"
                }`}
              />
            </div>
          </div>
        </div>
        {loggedInUser && loggedInUser?.role === "admin" ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {columns.map((column) => {
                const columnTasks = filteredTasks.filter(
                  (task) => task.status === column.id,
                );

                return (
                  <Droppable droppableId={column.id} key={column.id}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`${column.color} border-t-3 ${column.border} rounded-xl p-4 min-h-175`}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="font-semibold text-lg">
                            {column.title}
                          </h2>

                          <span
                            className={`${column.bg} text-white px-3 py-1.5 rounded-full text-sm`}
                          >
                            {columnTasks.length}
                          </span>
                        </div>

                        <div className="space-y-5">
                          {columnTasks.map((task, index) => (
                            <Draggable
                              key={task._id}
                              draggableId={task._id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white relative rounded-xl p-4 border border-gray-100 transition-all duration-200 ${
                                    snapshot.isDragging
                                      ? "shadow-2xl rotate-2"
                                      : "shadow-sm hover:shadow-md  "
                                  }`}
                                >
                                  <div
                                    ref={
                                      openMenuId === task._id ? menuRef : null
                                    }
                                    className="w-full flex justify-between items-end mb-2"
                                  >
                                    <select
                                      value={task.priority}
                                      onChange={(e) =>
                                        handlePriorityChange(
                                          task._id,
                                          e.target.value,
                                        )
                                      }
                                      className={`text-xs rounded-lg px-3 py-1 border-none outline-none cursor-pointer ${
                                        task.priority === "High"
                                          ? "bg-red-100 text-red-600"
                                          : task.priority === "Medium"
                                            ? "bg-yellow-100 text-yellow-600"
                                            : "bg-green-100 text-green-600"
                                      }`}
                                    >
                                      <option
                                        className="bg-white text-gray-400"
                                        value="Low"
                                      >
                                        Low
                                      </option>
                                      <option
                                        className="bg-white text-gray-400"
                                        value="Medium"
                                      >
                                        Medium
                                      </option>
                                      <option
                                        className="bg-white text-gray-400"
                                        value="High"
                                      >
                                        High
                                      </option>
                                    </select>
                                    <button
                                      onClick={() => toggleEditMenu(task._id)}
                                      className="p-1 rounded-lg border border-gray-200 hover:bg-gray-100"
                                    >
                                      <BsThreeDots />
                                    </button>
                                  </div>

                                  {openMenuId === task._id && (
                                    <div className="absolute top-11 right-5 w-32 bg-white border border-gray-300 rounded-xl shadow-lg overflow-hidden z-20">
                                      <button
                                        onClick={() => handleEdit(task)}
                                        className="w-full text-sm text-left px-4 py-3 hover:bg-gray-100"
                                      >
                                        Edit
                                      </button>

                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(task._id);
                                        }}
                                        className="w-full text-sm text-left px-4 py-3 text-red-500 hover:bg-red-100"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                  <h3 className="font-semibold capitalize">
                                    {task.title}
                                  </h3>

                                  <p className="text-[12px] font-semibold text-gray-500 mt-2 line-clamp-3">
                                    {task.description}
                                  </p>
                                  <div className=" flex justify-between items-center mt-4">
                                    <div className="flex flex-col gap-1">
                                      <h2 className="text-gray-500 text-xs ">
                                        Start Date
                                      </h2>

                                      <p className="text-xs font-semibold">
                                        {new Date(
                                          task.startDate,
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div>
                                      <h2 className="text-gray-500 text-xs ">
                                        End Date
                                      </h2>
                                      <input
                                        type="date"
                                        className="text-xs w-auto font-semibold"
                                        value={
                                          task.dueDate?.split("T")[0] || ""
                                        }
                                        onChange={(e) =>
                                          handleEditdueDate(
                                            task._id,
                                            e.target.value,
                                          )
                                        }
                                        name="dueDate"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-end ">
                                    <div className="flex w-full gap-1 flex-col mt-4">
                                      <p className="text-sm font-semibold">
                                        AssignTo:
                                      </p>
                                      <div className="  flex flex-wrap gap-1 items-center justify-start ">
                                        <div className="relative flex ">
                                          {task.assignTo
                                            ?.slice(0, 3)
                                            .map((user, index) => (
                                              <img
                                                key={user._id}
                                                src={
                                                  user.profilePhoto ||
                                                  `https://ui-avatars.com/api/?name=${user.name}`
                                                }
                                                alt={user.name}
                                                title={user.name}
                                                className="w-10 h-10 rounded-full border-2 border-white object-cover -ml-5 first:ml-0"
                                                style={{ zIndex: index + 1 }}
                                              />
                                            ))}
                                          {task.assignTo?.length > 3 && (
                                            <div className="w-5 h-5 absolute -top-1 -right-1 z-30 flex justify-center items-center text-white rounded-full text-xs -ml-6 bg-red-400">
                                              +{task.assignTo.length - 3}
                                            </div>
                                          )}
                                        </div>

                                        <div className="relative z-30">
                                          <button
                                            onClick={() =>
                                              handleOpenAssignPopup(task)
                                            }
                                            className={`w-10 h-10 rounded-full ${column.color} border-2 border-white flex justify-center items-center -ml-5`}
                                          >
                                            <FiPlus
                                              className={`text-xl ${column.text}`}
                                            />
                                          </button>

                                          {showAssignPopup === task._id && (
                                            <div
                                              ref={assignUserRef}
                                              className="absolute left-0 top-12 z-50 bg-white  border border-gray-200 rounded-lg shadow-xl p-3 w-56"
                                            >
                                              <h4 className="font-semibold text-sm mb-2">
                                                Assign Users
                                              </h4>

                                              <div className="max-h-30 overflow-y-auto">
                                                {users.map((user) => (
                                                  <label
                                                    key={user._id}
                                                    className="flex items-center text-sm gap-2 py-1"
                                                  >
                                                    <input
                                                      type="checkbox"
                                                      checked={selectedUsers.includes(
                                                        user._id,
                                                      )}
                                                      onChange={() =>
                                                        handleUserSelection(
                                                          user._id,
                                                        )
                                                      }
                                                    />
                                                    <span>{user.name}</span>
                                                  </label>
                                                ))}
                                              </div>

                                              <button
                                                onClick={() =>
                                                  handleAssignTasksToUsers(task)
                                                }
                                                className="mt-2 text-sm w-full bg-blue-500 text-white py-1 rounded-lg"
                                              >
                                                Assign
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="w-auto flex justify-center mb-4 items-center">
                                      <select
                                        value={task.status}
                                        onChange={(e) =>
                                          handleStatusUpdate(
                                            task._id,
                                            e.target.value,
                                          )
                                        }
                                        className={`text-xs rounded-lg px-2 py-2 border-none outline-none cursor-pointer ${column.color} ${column.text}`}
                                      >
                                        <option
                                          className="bg-white text-gray-400"
                                          value="New"
                                        >
                                          New
                                        </option>
                                        <option
                                          className="bg-white text-gray-400"
                                          value="Pending"
                                        >
                                          Pending
                                        </option>
                                        <option
                                          className="bg-white text-gray-400"
                                          value="In Progress"
                                        >
                                          In Progress
                                        </option>
                                        <option
                                          className="bg-white text-gray-400"
                                          value="Completed"
                                        >
                                          Completed
                                        </option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}

                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
        ) : (
          <div className="w-full border border-gray-300 rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  xl:grid-cols-4 h-full bg-white px-10 py-8 gap-6 ">
            <h1 className="text-center font-bold text-4xl text-gray-400 mb-6 col-span-4">Your Tasks</h1>
            {loggedInTasks.map((task) => (
              <div
                key={task._id}
                className={`bg-white relative rounded-xl p-4 border border-gray-300 transition-all duration-200 `}
              >
                <div className="w-full flex justify-between items-end mb-2">
                  <span
                    className={`text-xs rounded-lg px-3 py-1 border-none outline-none cursor-pointer ${
                      task.priority === "High"
                        ? "bg-red-100 text-red-600"
                        : task.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-green-100 text-green-600"
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>

                <h3 className="font-semibold capitalize">{task.title}</h3>

                <p className="text-[12px] font-semibold text-gray-500 mt-2 line-clamp-3">
                  {task.description}
                </p>
                <div className=" flex justify-between items-center mt-4">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-gray-500 text-xs ">Start Date</h2>

                    <p className="text-xs font-semibold">
                      {new Date(task.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h2 className="text-gray-500 text-xs ">End Date</h2>
                    <p className="text-xs w-auto font-semibold" name="dueDate">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-end ">
                  <div className="flex w-full gap-1 flex-col mt-4">
                    <p className="text-sm font-semibold">AssignTo:</p>
                    <div className="  flex flex-wrap gap-1 items-center justify-start ">
                      <div className="relative flex ">
                        {task.assignTo?.slice(0, 3).map((user, index) => (
                          <img
                            key={user._id}
                            src={
                              user.profilePhoto ||
                              `https://ui-avatars.com/api/?name=${user.name}`
                            }
                            alt={user.name}
                            title={user.name}
                            className="w-10 h-10 rounded-full border-2 border-white object-cover -ml-5 first:ml-0"
                            style={{ zIndex: index + 1 }}
                          />
                        ))}
                        {task.assignTo?.length > 3 && (
                          <div className="w-5 h-5 absolute -top-1 -right-1 z-30 flex justify-center items-center text-white rounded-full text-xs -ml-6 bg-red-400">
                            +{task.assignTo.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-auto flex justify-center mb-4 items-center">
                    <span
                      className={`text-xs rounded-lg px-2 py-2 border-none outline-none ${
                        task.status === "New"
                          ? "bg-green-100 text-green-700"
                          : task.status === "Pending"
                            ? "bg-blue-100 text-blue-700"
                            : task.status === "In Progress"
                              ? "bg-yellow-100 text-yellow-700"
                              : "text-purple-700 bg-purple-100"
                      } cursor-pointer `}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManagement;
