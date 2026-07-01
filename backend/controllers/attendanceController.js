const Attendance = require("../model/attendanceModel");
const Leave = require("../model/leaveModel");
const User = require("../model/userModel");
const mongoose = require("mongoose");
const { getISTDayRange } = require("./../utils/date");
const { toZonedTime } = require("date-fns-tz");

exports.addAttendance = async (req, res) => {
  try {
    const { employee, date, checkIn, checkOut, status, leaveType } = req.body;

    if (!employee || !date) {
      return res.status(400).json({
        message: "Employee and date are required",
      });
    }
    const attendanceDate = toZonedTime(new Date(date), "Asia/Kolkata");

    const employeeData = await User.findById(employee);

    if (!employeeData) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const dayName = attendanceDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    const isWeeklyOff = employeeData.weeklyOffs?.includes(dayName);

    if (isWeeklyOff) {
      return res.status(400).json({
        message: `${dayName} is a weekly off for this employee`,
      });
    }

    const { start, end } = getISTDayRange(attendanceDate);

    const existingRecord = await Attendance.findOne({
      employee,
      date: {
        $gte: start,
        $lte: end,
      },
    });

    if (existingRecord) {
      return res.status(409).json({
        message:
          "Attendance record already exists for this employee on this date",
      });
    }

    let workDuration = 0;

    if (checkIn && checkOut) {
      const [inHour, inMinute] = checkIn.split(":").map(Number);
      const [outHour, outMinute] = checkOut.split(":").map(Number);

      workDuration = outHour * 60 + outMinute - (inHour * 60 + inMinute);
    }

    const attendance = await Attendance.create({
      employee,
      date: start,
      checkIn,
      checkOut,
      status,
      leaveType,
      workDuration,
    });
    const populatedAttendance = await attendance.populate(
      "employee",
      "name email designation department",
    );

    res.status(201).json({
      message: "Attendance record added successfully",
      attendance: populatedAttendance,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getAllAttendance = async (req, res) => {
  try {
    const page = req.query.page ? Number(req.query.page) : null;
    const limit = req.query.limit ? Number(req.query.limit) : null;

    const totalRecords = await Attendance.countDocuments();

    let query = Attendance.find()
      .populate("employee", "name email designation department")
      .sort({ date: -1 });

    if (page && limit) {
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
    }

    const attendance = await query;

    res.status(200).json({
      totalRecords,
      attendance,
      pagination:
        page && limit
          ? {
              totalRecords,
              currentPage: page,
              totalPages: Math.ceil(totalRecords / limit),
              limit,
              hasNextPage: page < Math.ceil(totalRecords / limit),
              hasPrevPage: page > 1,
            }
          : null,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await Attendance.findById(id).populate(
      "employee",
      "name email designation department",
    );

    if (!attendance) {
      return res.status(404).json({
        message: "Attendance record not found",
      });
    }

    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut, status, leaveType, workDuration } = req.body;

    const attendance = await Attendance.findById(id);

    if (!attendance) {
      return res.status(404).json({
        message: "Attendance record not found",
      });
    }

    attendance.checkIn = checkIn ?? attendance.checkIn;
    attendance.checkOut = checkOut ?? attendance.checkOut;
    attendance.status = status ?? attendance.status;
    attendance.leaveType = leaveType ?? attendance.leaveType;
    attendance.workDuration = workDuration ?? attendance.workDuration;

    await attendance.save();

    const populatedAttendance = await attendance.populate(
      "employee",
      "name email designation department",
    );

    res.status(200).json({
      message: "Attendance record updated successfully",
      attendance: populatedAttendance,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await Attendance.findByIdAndDelete(id);

    if (!attendance) {
      return res.status(404).json({
        message: "Attendance record not found",
      });
    }

    res.status(200).json({
      message: "Attendance record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getAttendanceStatistics = async (req, res) => {
  try {
    const { employeeId, month, year } = req.query;

    let attendanceMatch = {};

    if (month && year) {
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(
        year,
        month - 1,
        new Date(year, month, 0).getDate(),
      );

      const { start: startDate } = getISTDayRange(firstDay);
      const { end: endDate } = getISTDayRange(lastDay);

      attendanceMatch = {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    let matchStage = {
      role: "employee",
    };

    if (employeeId) {
      matchStage._id = new mongoose.Types.ObjectId(employeeId);
    }

    const statistics = await User.aggregate([
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: "attendances",
          let: { employeeId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$employee", "$$employeeId"],
                },
                ...attendanceMatch,
              },
            },
          ],
          as: "attendanceRecords",
        },
      },
      {
        $lookup: {
          from: "leaves",
          let: { employeeId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$employee", "$$employeeId"],
                },
                status: "Approved",
              },
            },
          ],
          as: "approvedLeaves",
        },
      },
      {
        $project: {
          _id: 1,
          employeeId: "$_id",
          employeeName: "$name",
          employeePhoto: "$profilePhoto",
          employeeEmail: "$email",

          totalPresent: {
            $size: {
              $filter: {
                input: "$attendanceRecords",
                as: "record",
                cond: {
                  $eq: ["$$record.status", "Present"],
                },
              },
            },
          },

          totalAbsent: {
            $size: {
              $filter: {
                input: "$attendanceRecords",
                as: "record",
                cond: {
                  $eq: ["$$record.status", "Absent"],
                },
              },
            },
          },

          totalLeave: {
            $size: "$approvedLeaves",
          },
          totalHalfDay: {
            $size: {
              $filter: {
                input: "$approvedLeaves",
                as: "record",
                cond: {
                  $eq: ["$$record.leaveType", "HalfDay"],
                },
              },
            },
          },

          totalRecords: {
            $size: "$attendanceRecords",
          },

          averageWorkDuration: {
            $cond: [
              {
                $gt: [{ $size: "$attendanceRecords" }, 0],
              },
              {
                $avg: "$attendanceRecords.workDuration",
              },
              0,
            ],
          },
        },
      },
      {
        $sort: {
          employeeName: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: statistics.length,
      statistics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.checkIn = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const { start, end } = getISTDayRange();

    console.log("START:", start.toISOString());
    console.log("END:", end.toISOString());
    let attendance = await Attendance.findOne({
      employee: employeeId,
      date: {
        $gte: start,
        $lte: end,
      },
    });

    if (attendance && attendance.checkIn) {
      return res.status(409).json({
        success: false,
        message: "You have already checked in today.",
      });
    }

    if (!attendance) {
      attendance = await Attendance.create({
        employee: employeeId,
        date: start,
        checkIn: new Date(),
        status: "Present",
      });
    } else {
      attendance.checkIn = new Date();
      attendance.status = "Present";
      await attendance.save();
    }

    await attendance.populate("employee", "name email designation department");

    return res.status(200).json({
      success: true,
      message: "Checked in successfully.",
      attendance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.checkOut = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const { start, end } = getISTDayRange();

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: {
        $gte: start,
        $lte: end,
      },
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "You haven't checked in today.",
      });
    }

    if (!attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: "Please check in first.",
      });
    }

    if (attendance.checkOut) {
      return res.status(409).json({
        success: false,
        message: "You have already checked out today.",
      });
    }
    attendance.checkOut = new Date();

    const workDuration = Math.floor(
      (attendance.checkOut.getTime() - attendance.checkIn.getTime()) /
        (1000 * 60),
    );

    attendance.workDuration = workDuration;

    await attendance.save();

    await attendance.populate("employee", "name email designation department");

    res.status(200).json({
      success: true,
      message: "Checked out successfully.",
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.getTodayAttendance = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const today = new Date();
    const { start: startOfDay, end: endOfDay } = getISTDayRange();

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).populate("employee", "name email designation department profileImage");

    res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.getMonthlyAttendance = async (req, res) => {
  try {
    const { year, month } = req.params;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 7;

    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(
      year,
      month - 1,
      new Date(year, month, 0).getDate(),
    );

    const { start: startDate } = getISTDayRange(firstDay);
    const { end: endDate } = getISTDayRange(lastDay);

    const daysInMonth = new Date(year, month, 0).getDate();

    let workingDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const weekDay = toZonedTime(
        new Date(year, month - 1, day),
        "Asia/Kolkata",
      ).getDay();

      if (weekDay !== 0 && weekDay !== 6) {
        workingDays++;
      }
    }

    // Total active employees
    const totalEmployees = await User.countDocuments({
      role: "employee",
      status: { $ne: "Inactive" },
    });

    const totalPages = Math.ceil(totalEmployees / limit);

    // Paginated employees
    const employees = await User.find({
      role: "employee",
      status: { $ne: "Inactive" },
    })
      .select("_id employeeId name profilePhoto weeklyOffs")
      .skip((page - 1) * limit)
      .limit(limit);

    const employeeIds = employees.map((employee) => employee._id);

    // Attendance only for employees on current page
    const attendanceRecords = await Attendance.find({
      employee: {
        $in: employeeIds,
      },
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).populate("employee", "name employeeId profilePhoto");

    const approvedLeaves = await Leave.find({
      employee: { $in: employeeIds },
      status: "Approved",
      startDate: { $lt: endDate },
      $or: [{ endDate: { $gte: startDate } }, { leaveType: "HalfDay" }],
    });

    const result = employees.map((employee) => {
      const attendanceMap = {};

      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = toZonedTime(
          new Date(year, month - 1, day),
          "Asia/Kolkata",
        );

        const dayName = currentDate.toLocaleDateString("en-US", {
          weekday: "long",
        });

        const isWeeklyOff = employee.weeklyOffs?.includes(dayName);

        attendanceMap[day] = isWeeklyOff ? { status: "Weekend" } : null;
      }

      const employeeRecords = attendanceRecords.filter(
        (record) =>
          record.employee &&
          record.employee._id.toString() === employee._id.toString(),
      );

      const employeeLeaves = approvedLeaves.filter(
        (leave) => leave.employee.toString() === employee._id.toString(),
      );

      // Mark approved leaves
      employeeLeaves.forEach((leave) => {
        if (leave.leaveType === "HalfDay") {
          const day = toZonedTime(leave.startDate, "Asia/Kolkata").getDate();

          attendanceMap[day] = {
            status: "HalfDay",
            leaveType: leave.leaveType,
            leaveId: leave._id,
          };

          return;
        }
        let currentDate = new Date(
          Math.max(leave.startDate.getTime(), startDate.getTime()),
        );

        const leaveEndDate = new Date(
          Math.min(leave.endDate.getTime(), endDate.getTime()),
        );

        while (currentDate <= leaveEndDate) {
          const dayName = toZonedTime(
            currentDate,
            "Asia/Kolkata",
          ).toLocaleDateString("en-US", {
            weekday: "long",
          });

          const isWeeklyOff = employee.weeklyOffs?.includes(dayName);

          if (!isWeeklyOff) {
            const day = toZonedTime(currentDate, "Asia/Kolkata").getDate();

            if (leave.leaveType === "HalfDay") {
              attendanceMap[day] = {
                status: "HalfDay",
                leaveType: leave.leaveType,
                leaveId: leave._id,
              };
            } else {
              attendanceMap[day] = {
                status: "Leave",
                leaveType: leave.leaveType,
                leaveId: leave._id,
              };
            }
          }

          currentDate.setDate(currentDate.getDate() + 1);
        }
      });

      // Override leave with actual attendance if exists
      employeeRecords.forEach((record) => {
        const day = toZonedTime(record.date, "Asia/Kolkata").getDate();

        attendanceMap[day] = {
          attendanceId: record._id,
          status: record.status,
          checkIn: record.checkIn,
          checkOut: record.checkOut,
          workDuration: record.workDuration,
          leaveType: record.leaveType,
        };
      });

      const presentCount = employeeRecords.filter((record) => {
        const dayName = toZonedTime(
          record.date,
          "Asia/Kolkata",
        ).toLocaleDateString("en-US", {
          weekday: "long",
        });

        return (
          !employee.weeklyOffs?.includes(dayName) && record.status === "Present"
        );
      }).length;

      const absentCount = employeeRecords.filter((record) => {
        const dayName = toZonedTime(
          record.date,
          "Asia/Kolkata",
        ).toLocaleDateString("en-US", {
          weekday: "long",
        });

        return (
          !employee.weeklyOffs?.includes(dayName) && record.status === "Absent"
        );
      }).length;

      let leaveCount = 0;

      Object.values(attendanceMap).forEach((day) => {
        if (day?.status === "Leave") {
          leaveCount++;
        }
      });

      return {
        employeeId: employee._id,
        employeeCode: employee.employeeId,
        employeeName: employee.name,
        profilePhoto: employee.profilePhoto,
        attendance: attendanceMap,
        presentCount,
        absentCount,
        leaveCount,
      };
    });

    res.status(200).json({
      success: true,
      daysInMonth,
      workingDays,
      totalEmployees,
      data: result,
      pagination: {
        currentPage: page,
        totalPages,
        totalEmployees,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Monthly Attendance Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.resumeAttendance = async (req, res) => {
  try {
    const attendanceId = req.params.attendanceId;
    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    if (!attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: "Attendance is already active",
      });
    }

    attendance.checkOut = null;
    attendance.workDuration = 0;

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Attendance resumed successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
