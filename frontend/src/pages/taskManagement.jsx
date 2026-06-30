import axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import { GoPlus } from "react-icons/go";
import { Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ModalContext } from "../context/modalContext";
import { BsThreeDots } from "react-icons/bs";
import { FiPlus } from "react-icons/fi";
import { toast } from "sonner";
import { IoClose, IoSearchOutline } from "react-icons/io5";
import { formatDistanceToNow } from "date-fns";
import { MdDeleteOutline } from "react-icons/md";
import { RiVerifiedBadgeFill } from "react-icons/ri";
const TaskManagement = () => {
  const {
    setOpenAddTaskForm,
    setRefreshEmployee,
    refreshEmployee,
    dark,
    setEditingTask,
    loggedInUser,
  } = useContext(ModalContext);
  const token = localStorage.getItem("token");
  const [isTaskBarOpen, setIsTaskBarOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loggedInTasks, setLoggedInTasks] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showAssignPopup, setShowAssignPopup] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [search, setSearch] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [searchMember, setSearchMember] = useState("");
  const menuRef = useRef(null);
  const assignUserRef = useRef(null);
  const deleteMenuRef = useRef(null);
  const [comment, setComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [openDeleteCommentMenu, setOpenDeleteCommentMenu] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Filter Assigned Members In TaskDetails Bar
  const filteredMembers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchMember.toLowerCase()) ||
      user.email.toLowerCase().includes(searchMember.toLowerCase()),
  );

  // Fetch Tasks Api Calls Function
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

  // Calling Fetch Tasks Function
  useEffect(() => {
    fetchTasks();
    loggedInUserTasks();
  }, [refreshEmployee, token, loggedInUser]);

  //  Handle Edit Function
  const handleEdit = (user) => {
    setEditingTask(user);
    setOpenAddTaskForm(true);
  };

  // Fetch Users For Assigning Tasks
  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/employee`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setUsers(response.data.employees);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  // Calling Fetch Users Function
  useEffect(() => {
    fetchUsers();
  }, [token, loggedInUser]);

  // Handle User Selection
  const handleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  // Tasks Priority Wise Filter Column
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

  // Handle Drag Function for Change Task Status
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

    if (loggedInUser.role === "admin") {
      setTasks((prev) =>
        prev.map((task) =>
          task._id === draggableId ? { ...task, status: newStatus } : task,
        ),
      );
    } else {
      setLoggedInTasks((prev) =>
        prev.map((task) =>
          task._id === draggableId ? { ...task, status: newStatus } : task,
        ),
      );
    }

    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/tasks/${draggableId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (error) {
      toast.error(error?.response?.data?.message);

      if (loggedInUser.role === "admin") {
        fetchTasks();
      } else {
        loggedInUserTasks();
      }
    }
  };

  // Function For Opening Task Form
  const handleOpenAddTaskForm = () => {
    setOpenAddTaskForm(true);
  };

  // Handle Delete Tasks Function
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

  // Toggle Edit Menu Function
  const toggleEditMenu = (id) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  // Click Outside Function For Closing Edit  menu
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
        deleteMenuRef.current &&
        !deleteMenuRef.current.contains(event.target)
      ) {
        setOpenDeleteCommentMenu(null);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Click Outside Function For Closing Assign User Popup
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

  // Handle Assign Tasks To User Function
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

      const updatedMembers = users.filter((user) =>
        selectedUsers.includes(user._id),
      );

      setSelectedTask((prev) => ({
        ...prev,
        assignTo: updatedMembers,
      }));

      fetchTasks();
      loggedInUserTasks();
      setShowAssignPopup(null);
      setShowMembers(false);
      setSelectedUsers([]);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message);
    }
  };

  //Handle  Edit Due Date Function
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

  // Handle Open Assign Popup
  const handleOpenAssignPopup = (task) => {
    setSelectedUsers(task.assignTo?.map((user) => user._id) ?? []);
    setShowAssignPopup(showAssignPopup === task._id ? null : task._id);
  };

  // Handle Priority Change Of Tasks
  const handlePriorityChange = async (taskId, priority) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/tasks/${taskId}/priority`,
        {
          priority,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setRefreshEmployee((prev) => !prev);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  // Handle Status Update Of Tasks
  const handleStatusUpdate = async (taskId, status) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/tasks/${taskId}/status`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setRefreshEmployee((prev) => !prev);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };
  // All Tasks Filtering
  const filteredTasks = tasks.filter((task) =>
    task?.title?.toLowerCase()?.includes(search?.toLowerCase()),
  );

  // Logged In User Tasks Filter
  const filteredMyTasks = loggedInTasks.filter((task) =>
    task?.title?.toLowerCase()?.includes(search?.toLowerCase()),
  );

  // Fetch Logged In User Tasks  Api Call
  const loggedInUserTasks = async () => {
    try {
      if (loggedInUser.role === "employee") {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/tasks/my-tasks`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setLoggedInTasks(response.data.tasks);
      }
      return;
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  // Opening Task Detail Bar
  const handleTaskSidebar = (task) => {
    setSelectedTask(task);
    setIsTaskBarOpen(true);
  };

  // Closing Task Detail Bar
  const closeSidebar = () => {
    setIsTaskBarOpen(false);
    setShowMembers(false);
    setOpenDeleteCommentMenu(null);

    setComment("");
    setSelectedTask(null);
  };

  // Date Formatter Function
  const formatDate = (date) => {
    return date
      ? new Date(date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-";
  };

  // Comments Adding Function
  const handleAddComment = async (taskId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/tasks/${taskId}/add-comment`,
        { comment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSelectedTask((prev) => ({
        ...prev,
        comments: response.data.comments,
      }));
      fetchTasks();
      loggedInUserTasks();
      setComment("");
      setEditingCommentId(null);

      toast.success(response.data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  // Handle Delete Tasks Comments Function
  const handleDeleteTaskComment = async (taskId, commentId) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/tasks/${taskId}/comment/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSelectedTask((prev) => ({
        ...prev,
        comments: response.data.comments,
      }));

      setTasks((prev) =>
        prev.map((task) =>
          task._id === taskId
            ? { ...task, comments: response.data.comments }
            : task,
        ),
      );

      toast.success(response.data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  // Handle Edit Tasks Comments Function
  const handleEditComment = async (taskId, commentId) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/tasks/${taskId}/comments/${commentId}`,
        {
          message: comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSelectedTask((prev) => ({
        ...prev,
        comments: response.data.comments,
      }));

      setEditingCommentId(null);
      setComment("");

      toast.success(response.data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  // Toggle Comment Menu Function
  const toggleDeleteCommentMenu = (id) => {
    setOpenDeleteCommentMenu((prev) => (prev === id ? null : id));
  };
  return (
    <div className="w-full relative min-h-screen flex justify-center overflow-x-hidden items-start px-4 sm:px-6 md:px-10 lg:px-20 xl:px-20 py-6 md:py-10">
      <div className="flex flex-col w-full max-w-7xl gap-8">
        {/* Header  */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1
              className={`text-xl sm:text-2xl font-bold ${dark ? "text-white" : "text-black"}`}
            >
              Task Management
            </h1>
          </div>
          {loggedInUser?.role === "admin" ? (
            <button
              onClick={handleOpenAddTaskForm}
              className="flex justify-center cursor-pointer items-center bg-blue-500 text-white px-4 py-2 rounded-lg gap-2 hover:bg-blue-600 w-full md:w-auto"
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

        {/* Drag And Drop   */}

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
                                  onClick={() => handleTaskSidebar(task)}
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
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handlePriorityChange(
                                          task._id,
                                          e.target.value,
                                        );
                                      }}
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
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleEditMenu(task._id);
                                      }}
                                      className="p-1 rounded-lg border cursor-pointer border-gray-200 hover:bg-gray-100"
                                    >
                                      <BsThreeDots />
                                    </button>
                                  </div>

                                  {openMenuId === task._id && (
                                    <div className="absolute top-11 right-5 w-32 bg-white border border-gray-300 rounded-xl shadow-lg overflow-hidden z-20">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEdit(task);
                                        }}
                                        className="w-full text-sm cursor-pointer text-left px-4 py-3 hover:bg-gray-100"
                                      >
                                        Edit
                                      </button>

                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(task._id);
                                        }}
                                        className="w-full text-sm cursor-pointer text-left px-4 py-3 text-red-500 hover:bg-red-100"
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
                                        className="text-xs w-auto cursor-pointer font-semibold"
                                        value={
                                          task.dueDate?.split("T")[0] || ""
                                        }
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          handleEditdueDate(
                                            task._id,
                                            e.target.value,
                                          );
                                        }}
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

                                        <div className="relative z-20">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();

                                              handleOpenAssignPopup(task);
                                            }}
                                            className={`w-10 h-10 rounded-full cursor-pointer ${column.color} border-2 border-white flex justify-center items-center -ml-5`}
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
                                                    onClick={(e) =>
                                                      e.stopPropagation()
                                                    }
                                                    className="flex items-center text-sm gap-2 py-1"
                                                  >
                                                    <input
                                                      type="checkbox"
                                                      checked={selectedUsers.includes(
                                                        user._id,
                                                      )}
                                                      onChange={(e) => {
                                                        e.stopPropagation();
                                                        handleUserSelection(
                                                          user._id,
                                                        );
                                                      }}
                                                    />
                                                    <span>{user.name}</span>
                                                  </label>
                                                ))}
                                              </div>

                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleAssignTasksToUsers(
                                                    task,
                                                  );
                                                }}
                                                className="mt-2 text-sm w-full bg-blue-500 text-white py-1 rounded-lg"
                                              >
                                                Assign
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className=" flex justify-center mb-4 items-center">
                                      <select
                                        value={task.status}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          handleStatusUpdate(
                                            task._id,
                                            e.target.value,
                                          );
                                        }}
                                        className={`text-xs rounded-lg px-1 py-2 border-none outline-none cursor-pointer ${column.color} ${column.text}`}
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
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {columns.map((column) => {
                const columnTasks = filteredMyTasks.filter(
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
                                  onClick={() => handleTaskSidebar(task)}
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
                                    <p
                                      className={`text-xs rounded-lg px-3 py-1 border-none outline-none cursor-pointer ${
                                        task.priority === "High"
                                          ? "bg-red-100 text-red-600"
                                          : task.priority === "Medium"
                                            ? "bg-yellow-100 text-yellow-600"
                                            : "bg-green-100 text-green-600"
                                      }`}
                                    >
                                      {task.priority}
                                    </p>
                                  </div>

                                  <h3 className="font-semibold capitalize">
                                    {task.title}
                                  </h3>

                                  <p className="text-[12px] font-semibold text-gray-500 mt-2 line-clamp-3">
                                    {task.description}
                                  </p>
                                  <div className=" flex justify-between items-center mt-4">
                                    <div className="flex flex-col gap-1">
                                      <h2 className="text-gray-500 text-xs ">
                                        Assigned At
                                      </h2>

                                      <p className="text-xs font-semibold">
                                        {new Date(
                                          task.startDate,
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      <h2 className="text-gray-500 text-xs ">
                                        Deadline
                                      </h2>

                                      <p className="text-xs font-semibold">
                                        {new Date(
                                          task.dueDate,
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-end ">
                                    <div className="flex w-full gap-1 flex-col mt-4">
                                      <p className="text-sm font-semibold">
                                        AssignTo:
                                      </p>
                                      <div className="flex items-center">
                                        <div className="relative flex items-center">
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
                                                className="object-cover rounded-full border-2 border-white w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 -ml-2 sm:-ml-3 md:-ml-4 lg:-ml-5 first:ml-0 "
                                                style={{ zIndex: index + 1 }}
                                              />
                                            ))}

                                          {task.assignTo?.length > 3 && (
                                            <div className="absolute -top-1 -right-1 z-30 flex items-center justify-center rounded-full bg-red-400 text-white border border-white w-5 h-5 text-[10px]  sm:text-xs   ">
                                              +{task.assignTo.length - 3}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="w-auto flex justify-center mb-4 items-center">
                                      <p
                                        className={`text-xs rounded-lg px-2 py-2 border-none whitespace-nowrap outline-none cursor-pointer ${column.color} ${column.text}`}
                                      >
                                        {task.status}
                                      </p>
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
        )}
      </div>
      <div
        className={`fixed top-0 right-0 h-screen
  w-full sm:w-125 lg:w-155
  bg-white shadow-2xl z-50
  transition-transform duration-300
  flex flex-col
  ${isTaskBarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-300 bg-white sticky top-0 z-20">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedTask?.title}
            </h2>
          </div>

          <button
            onClick={closeSidebar}
            className="p-2 rounded-full hover:bg-gray-100 cursor-pointer transition"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">
          {/* Description */}
          <section>
            <h3 className="font-semibold text-gray-700 mb-3">Description</h3>

            <div className="rounded-xl border border-gray-300 bg-gray-50 p-4 leading-7 text-gray-600">
              {selectedTask?.description || "No description"}
            </div>
          </section>

          {/* Info */}
          <section className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-300 p-4">
              <p className="text-xs uppercase text-gray-400 mb-1">Status</p>

              <p className="font-semibold text-blue-600">
                {selectedTask?.status}
              </p>
            </div>

            <div className="rounded-xl border border-gray-300 p-4">
              <p className="text-xs uppercase text-gray-400 mb-1">Priority</p>

              <p className="font-semibold text-red-500">
                {selectedTask?.priority}
              </p>
            </div>

            <div className="rounded-xl border border-gray-300 p-4">
              <p className="text-xs uppercase text-gray-400 mb-1">Start Date</p>

              <p>{formatDate(selectedTask?.startDate)}</p>
            </div>

            <div className="rounded-xl border border-gray-300 p-4">
              <p className="text-xs uppercase text-gray-400 mb-1">Due Date</p>

              <p>{formatDate(selectedTask?.dueDate)}</p>
            </div>
          </section>

          {/* Members */}
          <section className="relative">
            <h3 className="font-semibold mb-3">Assigned Members</h3>

            {/* Dropdown Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();

                if (!showMembers) {
                  setSelectedUsers(
                    selectedTask?.assignTo?.map((user) => user._id) || [],
                  );
                }

                setShowMembers(!showMembers);
              }}
              className="w-full flex justify-between cursor-pointer items-center border border-gray-300 rounded-xl px-4 py-3 hover:border-blue-500 transition"
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {selectedTask?.assignTo?.slice(0, 3).map((user) => (
                    <img
                      key={user._id}
                      src={
                        user.profilePhoto ||
                        `https://ui-avatars.com/api/?name=${user.name}`
                      }
                      alt={user.name}
                      className="w-9 h-9 rounded-full border-2 border-white object-cover"
                    />
                  ))}

                  {selectedTask?.assignTo?.length > 3 && (
                    <div className="w-9 h-9 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-semibold">
                      +{selectedTask.assignTo.length - 3}
                    </div>
                  )}
                </div>

                <span className="font-medium">
                  {selectedTask?.assignTo?.length} Members
                </span>
              </div>

              <svg
                className={`w-5 h-5 transition ${
                  showMembers ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {showMembers && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute z-50 mt-2 w-full bg-white border-gray-300 rounded-xl shadow-xl border"
              >
                {/* Search */}
                <div className="p-3 border-b border-gray-300">
                  <input
                    type="text"
                    placeholder="Search member..."
                    value={searchMember}
                    onChange={(e) => setSearchMember(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 outline-none  border-gray-300 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Members */}
                <div className="max-h-72 overflow-y-auto">
                  {filteredMembers.length ? (
                    filteredMembers.map((user) => (
                      <label
                        key={user._id}
                        className="flex items-center justify-between px-4 py-3 hover:bg-gray-100 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              user.profilePhoto ||
                              `https://ui-avatars.com/api/?name=${user.name}`
                            }
                            className="w-10 h-10 rounded-full object-cover"
                          />

                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleUserSelection(user._id)}
                        />
                      </label>
                    ))
                  ) : (
                    <p className="text-center py-6 text-gray-500">
                      No member found.
                    </p>
                  )}
                </div>
                <div className="p-3 border-t border-gray-300">
                  <button
                    onClick={() => handleAssignTasksToUsers(selectedTask)}
                    className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Comments */}
          <section>
            <h3 className="font-semibold mb-4">Comments</h3>

            <div className="space-y-5">
              {selectedTask?.comments?.length ? (
                selectedTask.comments.map((comment) => (
                  <div key={comment._id} className="flex items-start gap-3">
                    {/* Avatar */}
                    <img
                      src={
                        comment.user.profilePhoto ||
                        `https://ui-avatars.com/api/?name=${comment.user.name}`
                      }
                      alt={comment.user.name}
                      className="w-10 h-10 rounded-full object-cover "
                    />

                    {/* Comment */}
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col justify-start items-start">
                          <div className="flex justify-center items-center gap-4">
                            <h4 className="font-semibold text-gray-800">
                              {comment.user.name}
                            </h4>
                            {comment.user.role === "admin" && (
                              <RiVerifiedBadgeFill className="text-blue-600 text-lg " />
                            )}
                          </div>
                          <div className="flex justify-center items-center gap-4">
                            <p className="text-xs text-gray-400">
                              {formatDistanceToNow(
                                new Date(comment.createdAt),
                                {
                                  addSuffix: true,
                                },
                              )}
                            </p>
                            {comment.isEdited ? (
                              <span className="px-2 py-1 bg-gray-200 text-gray-500 rounded text-xs">
                                Edited
                              </span>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                        <div className="relative">
                          {loggedInUser?._id === comment.user._id && (
                            <button
                              onClick={() =>
                                toggleDeleteCommentMenu(comment._id)
                              }
                              className="bg-gray-100 p-1.5 rounded-lg hover:bg-gray-200 transition-colors duration-150 cursor-pointer"
                            >
                              <BsThreeDots className="text-lg" />
                            </button>
                          )}

                          {openDeleteCommentMenu === comment._id && (
                            <div className="absolute rounded-lg -top-17 right-6 shadow bg-white border border-gray-300">
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment._id);
                                  setComment(comment.message);
                                  setOpenDeleteCommentMenu(null);
                                }}
                                className="px-3 py-1.5 w-full text-sm rounded-t-lg text-green-500 hover:bg-green-50  cursor-pointer transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  handleDeleteTaskComment(
                                    selectedTask._id,
                                    comment._id,
                                  );
                                  setOpenDeleteCommentMenu(null);
                                }}
                                className="px-3 py-1.5   text-red-500 text-sm rounded-b-lg hover:bg-red-50 cursor-pointer transition"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bubble */}
                      <div className="mt-2 rounded-2xl rounded-tl-sm bg-gray-100 border border-gray-200 px-4 py-3">
                        <p className="text-sm leading-6 text-gray-700 whitespace-pre-wrap wrap-break-word">
                          {comment.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-12">
                  <p className="text-gray-400 text-sm">No comments yet</p>

                  <p className="text-xs text-gray-300 mt-1">
                    Be the first to start the discussion.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-300 bg-white p-5">
          <div className="flex gap-3">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={() => {
                if (editingCommentId) {
                  handleEditComment(selectedTask._id, editingCommentId);
                } else {
                  handleAddComment(selectedTask._id);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer
            text-white px-6 rounded-xl font-medium"
            >
              {editingCommentId ? "Update" : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskManagement;
