const User = require("../model/userModel");
const Attendance = require("../model/attendanceModel");
const Leave = require("../model/leaveModel");

exports.addLeave = async (req, res) => {
  try {
    const {
      employee,
      startDate,
      endDate,
      startTime,
      endTime,
      leaveType,
      reason,
    } = req.body;

    // Validation
    if (!employee || !leaveType || !startDate) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    if (leaveType === "HalfDay") {
      if (!startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message: "Start time and End time are required",
        });
      }
    } else {
      if (!endDate) {
        return res.status(400).json({
          success: false,
          message: "End date is required",
        });
      }
    }

    // Employee validation
    const employeeExists = await User.findById(employee);

    if (!employeeExists) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
    const weeklyOffs = employeeExists.weeklyOffs || [];
    let start;
    let end;
    let totalDays = 0;

    if (leaveType === "HalfDay") {
      start = new Date(startDate);
      end = new Date(startDate);

      const dayName = start.toLocaleDateString("en-US", {
        weekday: "long",
      });

      if (weeklyOffs.includes(dayName)) {
        return res.status(400).json({
          success: false,
          message: `Half Day leave cannot be applied on ${dayName} because it is a weekly off`,
        });
      }
      totalDays = 0.5;

      // Check existing half/full day leave on same date
      const existingLeave = await Leave.findOne({
        employee,
        startDate: {
          $gte: new Date(startDate + "T00:00:00.000Z"),
          $lte: new Date(startDate + "T23:59:59.999Z"),
        },
      });

      if (existingLeave) {
        return res.status(400).json({
          success: false,
          message: "Leave already exists for this date",
        });
      }
    } else {
      start = new Date(startDate);
      end = new Date(endDate);

      if (end < start) {
        return res.status(400).json({
          success: false,
          message: "End date cannot be before start date",
        });
      }

      // Calculate working days excluding weekends
      for (
        let current = new Date(start);
        current <= end;
        current.setDate(current.getDate() + 1)
      ) {
        const dayName = current.toLocaleDateString("en-US", {
          weekday: "long",
        });

        if (!weeklyOffs.includes(dayName)) {
          totalDays++;
        }
      }

      if (totalDays === 0) {
        return res.status(400).json({
          success: false,
          message: "Selected dates contain only weekly offs",
        });
      }

      // Check overlapping leave
      const existingLeave = await Leave.findOne({
        employee,
        startDate: { $lte: end },
        endDate: { $gte: start },
      });

      if (existingLeave) {
        return res.status(400).json({
          success: false,
          message: "Leave already exists for the selected dates",
        });
      }
    }

    const leave = await Leave.create({
      employee,
      leaveType,
      startDate: start,
      endDate: leaveType === "HalfDay" ? null : end,
      startTime: leaveType === "HalfDay" ? startTime : null,
      endTime: leaveType === "HalfDay" ? endTime : null,
      reason,
      totalDays,
      status: "Pending",
      approvedBy: null,
      approvedAt: null,
    });

    return res.status(201).json({
      success: true,
      message: "Leave added successfully",
      leave,
    });
  } catch (error) {
    console.error("Add Leave Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.fetchLeaves = async (req, res) => {
  try {
    const page = req.query.page ? Number(req.query.page) : null;
    const limit = req.query.limit ? Number(req.query.limit) : null;

    const totalLeaves = await Leave.countDocuments();

    let query = Leave.find({})
      .populate("employee", "name profilePhoto department designation")
      .sort({ createdAt: -1 });
    if (page && limit) {
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
    }
    const leaves = await query;
    const formattedLeaves = leaves.map((leave) => {
      let leaveDays;

      if (leave.leaveType === "HalfDay") {
        leaveDays = 0.5;
      } else {
        leaveDays =
          Math.ceil(
            (new Date(leave.endDate) - new Date(leave.startDate)) /
              (1000 * 60 * 60 * 24),
          ) + 1;
      }

      return {
        ...leave.toObject(),
        leaveDays,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Successfully fetched leaves",
      totalLeaves,
      leaves: formattedLeaves,
      pagination:
        page && limit
          ? {
              totalLeaves,
              currentPage: page,
              totalPages: Math.ceil(totalLeaves / limit),
              limit,
              hasNextPage: page < Math.ceil(totalLeaves / limit),
              hasPrevPage: page > 1,
            }
          : null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.updateLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status, startDate, endDate, leaveType, reason } = req.body;

    const leave = await Leave.findById(leaveId).populate("employee");

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave not found",
      });
    }

    const updatedStartDate = startDate || leave.startDate;
    const updatedEndDate = endDate || leave.endDate;
    const updatedLeaveType = leaveType || leave.leaveType;

    // Date validation
    if (updatedLeaveType !== "HalfDay") {
      if (new Date(updatedEndDate) < new Date(updatedStartDate)) {
        return res.status(400).json({
          success: false,
          message: "End date must be after start date",
        });
      }
    }

    // Half Day validation against employee weekly offs
    if (updatedLeaveType === "HalfDay") {
      const leaveDate = new Date(updatedStartDate);

      const dayName = leaveDate.toLocaleDateString("en-US", {
        weekday: "long",
      });

      const weeklyOffs = leave.employee.weeklyOffs || [];

      if (weeklyOffs.includes(dayName)) {
        return res.status(400).json({
          success: false,
          message: `Half Day leave cannot be applied on ${dayName} (Weekly Off)`,
        });
      }
    }

    leave.startDate = updatedStartDate;
    leave.endDate = updatedEndDate;
    leave.status = status || leave.status;
    leave.leaveType = updatedLeaveType;
    leave.reason = reason || leave.reason;

    await leave.save();

    res.status(200).json({
      success: true,
      message: "Leave updated successfully",
      leave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const leave = await Leave.findByIdAndDelete(leaveId);
    if (!leave) {
      return res.status(404).json({
        message: "Leave not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Leave deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status } = req.body;
    let approvedBy;
    let approvedAt;
    const allowedStatuses = ["Pending", "Approved", "Rejected"];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }
    if (status === "Approved") {
      approvedBy = req.user;
      approvedAt = Date.now();
    }
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const leave = await Leave.findByIdAndUpdate(
      leaveId,
      { status, approvedBy, approvedAt },
      { new: true, runValidators: true },
    );

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      leave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getLeaveDashboardStats = async (req, res) => {
  try {
    const totalRequests = await Leave.countDocuments();

    const approvedLeaves = await Leave.countDocuments({
      status: "Approved",
    });

    const pendingLeaves = await Leave.countDocuments({
      status: "Pending",
    });

    const rejectedLeaves = await Leave.countDocuments({
      status: "Rejected",
    });

    const totalEmployees = await User.countDocuments({
      role: "employee",
    });

    const approvedLeaveRecords = await Leave.find({
      status: "Approved",
    });

    let plannedLeaves = 0;
    let unplannedLeaves = 0;
    let totalLeaveDays = 0;

    approvedLeaveRecords.forEach((leave) => {
      const diffDays =
        (new Date(leave.startDate) - new Date(leave.createdAt)) /
        (1000 * 60 * 60 * 24);

      if (diffDays >= 1) {
        plannedLeaves++;
      } else {
        unplannedLeaves++;
      }

      totalLeaveDays +=
        Math.ceil(
          (new Date(leave.endDate) - new Date(leave.startDate)) /
            (1000 * 60 * 60 * 24),
        ) + 1;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayPresent = await Attendance.countDocuments({
      status: "Present",
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });
    const todayAbsent = await Attendance.countDocuments({
      status: "Absent",
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    const todayLeave = await Attendance.countDocuments({
      status: "Leave",
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });
    res.status(200).json({
      success: true,
      stats: {
        totalRequests,
        approvedLeaves,
        pendingLeaves,
        rejectedLeaves,
        plannedLeaves,
        unplannedLeaves,
        totalLeaveDays,
        todayPresent,
        todayAbsent,
        todayLeave,
        totalEmployees,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.fetchLeavesByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const page = req.query.page ? Number(req.query.page) : null;
    const limit = req.query.limit ? Number(req.query.limit) : null;

    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        message: "Employee not Found",
      });
    }
    const totalLeaves = await Leave.countDocuments({ employee: employeeId });
    let query =  Leave.find({ employee: employeeId }).populate(
      "employee",
      "name profilePhoto department designation",
    );
    if(page && limit){
      const skip=(page-1)*limit;
      query.skip(skip).limit(limit)
    }

    const leave =await query;
    if (leave.length === 0) {
      return res.status(404).json({
        message: "Leaves not Found",
      });
    }
    const formattedLeaves = leave.map((leave) => {
      let leaveDays;

      if (leave.leaveType === "HalfDay") {
        leaveDays = 0.5;
      } else {
        leaveDays =
          Math.ceil(
            (new Date(leave.endDate) - new Date(leave.startDate)) /
              (1000 * 60 * 60 * 24),
          ) + 1;
      }

      return {
        ...leave.toObject(),
        leaveDays,
      };
    });

    res.status(200).json({
      success: true,
      message: "Employee Leaves Found Successfully",
      totalLeaves,
      leave: formattedLeaves,
       pagination:
        page && limit
          ? {
              totalLeaves,
              currentPage: page,
              totalPages: Math.ceil(totalLeaves / limit),
              limit,
              hasNextPage: page < Math.ceil(totalLeaves / limit),
              hasPrevPage: page > 1,
            }
          : null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
