const Task = require("./../model/taskModel");

exports.addTasks = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const createdBy = req.user._id;

    const {
      title,
      description,
      assignTo,
      startDate,
      dueDate,
      priority,
      remarks,
      status,
    } = req.body;
    if (
      !title ||
      !description ||
      !assignTo ||
      assignTo.length === 0 ||
      !startDate ||
      !dueDate
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    if (new Date(dueDate) < new Date(startDate)) {
      return res.status(400).json({
        message: "Due date must be after start date",
      });
    }

    const task = await Task.create({
      title,
      description,
      assignTo,
      startDate,
      dueDate,
      priority,
      remarks,
      createdBy,
      status,
    });

    res.status(201).json({
      message: "Task added successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.fetchAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({})
      .sort({ createdAt: -1 })
      .populate(
        "assignTo createdBy comments.user",
        "name role email profilePhoto",
      );
    if (!tasks) {
      return res.status(404).json({
        Error: "Tasks Not Found",
      });
    }
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.updateTasks = async (req, res) => {
  try {
    const { taskId } = req.params;
    const {
      title,
      status,
      description,
      priority,
      startDate,
      dueDate,
      assignTo,
    } = req.body;
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }
    if (new Date(dueDate) < new Date(startDate)) {
      return res.status(400).json({
        message: "Due date must be after start date",
      });
    }
    task.title = title || task.title;
    task.status = status || task.status;
    task.description = description || task.description;
    task.priority = priority || task.priority;
    task.dueDate = dueDate || task.dueDate;
    task.startDate = startDate || task.startDate;
    task.assignTo = assignTo || task.assignTo;

    await task.save();
    res.status(200).json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};
exports.assignTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { assignTo } = req.body;

    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        assignTo,
      },
      { returnDocument: "after" },
    ).populate("assignTo", "name email");

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { status },
      { returnDocument: "after" },
    ).populate("assignTo", "name email");

    res.status(200).json({
      success: true,
      task: updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateDueDate = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { dueDate } = req.body;

    if (!dueDate) {
      return res.status(400).json({
        message: "dueDate is required",
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const parsedDueDate = new Date(dueDate);

    if (isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({
        message: "Invalid due date",
      });
    }

    if (parsedDueDate < task.startDate) {
      return res.status(400).json({
        message: "Due date must be after start date",
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { dueDate: parsedDueDate },
      { returnDocument: "after" },
    ).populate("assignTo", "name email");

    return res.status(200).json({
      message: "Due date updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update due date",
      error: error.message,
    });
  }
};

exports.updateTasksPriority = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { priority } = req.body;

    if (!priority) {
      return res.status(400).json({
        message: "priority is required",
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        priority,
      },
      { returnDocument: "after" },
    ).populate("assignTo", "name email");

    res.status(200).json({
      success: true,
      task: updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMyTasks = async (req, res) => {
  try {
    const { id } = req.user;
    const totalTasks = await Task.countDocuments({ assignTo: id });
    const tasks = await Task.find({ assignTo: id })
      .sort({ createdAt: -1 })
      .populate(
        "assignTo createdBy comments.user",
        "name role email profilePhoto",
      );
    if (!tasks) {
      return res.status(404).json({
        Error: "Tasks Not Found",
      });
    }
    res.status(200).json({ totalTasks, tasks });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const message = req.body.comment;
    const userId = req.user._id;
    console.log(message);

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment is required.",
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    // Check if user is assigned to this task
    const isAssigned = task.assignTo.some(
      (id) => id.toString() === userId.toString(),
    );

    // Optional: Allow task creator as well
    const isCreator = task.createdBy.toString() === userId.toString();

    if (!isAssigned && !isCreator) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to comment on this task.",
      });
    }

    task.comments.push({
      user: userId,
      message: message.trim(),
    });

    await task.save();

    await task.populate("comments.user", "name role profilePhoto");

    return res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      comments: task.comments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    const comment = task.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    // Optional: Allow only the comment owner or admin
    if (
      req.user.role !== "admin" &&
      comment.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this comment.",
      });
    }

    comment.deleteOne();

    await task.save();

    await task.populate({
      path: "comments.user",
      select: "name email profilePhoto",
    });

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully.",
      comments: task.comments,
    });
  } catch (error) {
    console.error("Delete Comment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};
