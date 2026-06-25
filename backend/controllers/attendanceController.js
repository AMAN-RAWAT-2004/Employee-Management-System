const Attendance = require("../model/attendanceModel");
const Leave = require("../model/leaveModel");
const User = require("../model/userModel");
const mongoose = require("mongoose");

exports.addAttendance = async (req, res) => {
  try {
    const { employee, date, checkIn, checkOut, status, leaveType } = req.body;

    if (!employee || !date) {
      return res.status(400).json({
        message: "Employee and date are required",
      });
    }
    const attendanceDate = new Date(date);

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

    const existingRecord = await Attendance.findOne({
      employee,
      date: new Date(date),
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
      date: attendanceDate,
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

    attendance.checkIn = checkIn || attendance.checkIn;
    attendance.checkOut = checkOut || attendance.checkOut;
    attendance.status = status || attendance.status;
    attendance.leaveType = leaveType || attendance.leaveType;
    attendance.workDuration = workDuration || attendance.workDuration;

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

exports.getTodayAttendanceByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const page = req.query.page ? Number(req.query.page) : null;
    const limit = req.query.limit ? Number(req.query.limit) : null;
    const today = new Date();

    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999,
    );
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const totalRecords = await Attendance.countDocuments({
      employee: employeeId,
    });

    let query = Attendance.find({
      employee: employeeId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
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

exports.getAttendanceByDateRange = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Start date and end date are required",
      });
    }

    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      employee: employeeId,
      date: { $gte: start, $lte: end },
    })
      .populate("employee", "name email designation department")
      .sort({ date: -1 });

    res.status(200).json({
      count: attendance.length,
      startDate,
      endDate,
      attendance,
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
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

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
    const { employeeId, checkInTime } = req.body;

    if (!employeeId || !checkInTime) {
      return res.status(400).json({
        message: "Employee ID and check-in time are required",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });

    if (!attendance) {
      attendance = await Attendance.create({
        employee: employeeId,
        date: today,
        checkIn: checkInTime,
        status: "Present",
      });
    } else if (!attendance.checkIn) {
      attendance.checkIn = checkInTime;
      attendance.status = "Present";
      await attendance.save();
    } else {
      return res.status(409).json({
        message: "Employee already checked in today",
      });
    }

    const populatedAttendance = await attendance.populate(
      "employee",
      "name email designation department",
    );

    res.status(200).json({
      message: "Check-in successful",
      attendance: populatedAttendance,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const { employeeId, checkOutTime } = req.body;

    if (!employeeId || !checkOutTime) {
      return res.status(400).json({
        message: "Employee ID and check-out time are required",
      });
    }

    // Get today's attendance record
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });

    if (!attendance) {
      return res.status(404).json({
        message: "No check-in record found for today",
      });
    }

    if (!attendance.checkIn) {
      return res.status(400).json({
        message: "Employee has not checked in yet",
      });
    }

    if (attendance.checkOut) {
      return res.status(409).json({
        message: "Employee already checked out today",
      });
    }

    // Save checkout time
    attendance.checkOut = checkOutTime;

    // Calculate work duration in minutes
    const checkInDateTime = new Date(`2000-01-01T${attendance.checkIn}:00`);

    const checkOutDateTime = new Date(`2000-01-01T${checkOutTime}:00`);

    const durationInMinutes = Math.floor(
      (checkOutDateTime - checkInDateTime) / (1000 * 60),
    );

    attendance.workDuration = durationInMinutes > 0 ? durationInMinutes : 0;

    await attendance.save();

    const populatedAttendance = await attendance.populate(
      "employee",
      "name email designation department",
    );

    res.status(200).json({
      message: "Check-out successful",
      attendance: populatedAttendance,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getMonthlyAttendance = async (req, res) => {
  try {
    const { year, month } = req.params;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 7;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const daysInMonth = new Date(year, month, 0).getDate();
    let workingDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const weekDay = date.getDay();

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
      employee: { $in: employeeIds },
      date: {
        $gte: startDate,
        $lt: endDate,
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
        const currentDate = new Date(year, month - 1, day);

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
          const day = new Date(leave.startDate).getDate();

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
          const dayName = currentDate.toLocaleDateString("en-US", {
            weekday: "long",
          });

          const isWeeklyOff = employee.weeklyOffs?.includes(dayName);

          if (!isWeeklyOff) {
            const day = currentDate.getDate();

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
        const day = new Date(record.date).getDate();

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
        const dayName = new Date(record.date).toLocaleDateString("en-US", {
          weekday: "long",
        });

        return (
          !employee.weeklyOffs?.includes(dayName) && record.status === "Present"
        );
      }).length;

      const absentCount = employeeRecords.filter((record) => {
        const dayName = new Date(record.date).toLocaleDateString("en-US", {
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
