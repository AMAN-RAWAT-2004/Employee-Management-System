const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Leave = require("../model/leaveModel");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECURE, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
exports.addEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      profilePhoto,
      phone,
      department,
      designation,
      status,
      dateOfBirth,
      address,
      gender,
      weeklyOffs,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !profilePhoto ||
      !phone ||
      !department ||
      !status ||
      !designation ||
      !dateOfBirth ||
      !address ||
      !gender
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const existingEmployee = await User.findOne({ email });

    if (existingEmployee) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const employee = await User.create({
      name,
      email,
      password: hashedPassword,
      profilePhoto,
      phone,
      department,
      designation,
      status,
      dateOfBirth,
      address,
      gender,
      weeklyOffs,
      role: "employee",
    });

    employee.password = undefined;

    res.status(200).json({
      message: "Employee added successfully",
      employee,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      password,
      profilePhoto,
      phone,
      department,
      designation,
      status,
      dateOfBirth,
      address,
      gender,
      weeklyOffs,
    } = req.body;

    const employee = await User.findById(id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    if (email && email !== employee.email) {
      const existingEmployee = await User.findOne({ email });

      if (existingEmployee) {
        return res.status(409).json({
          message: "Email already in use",
        });
      }
    }

    employee.name = name || employee.name;
    employee.email = email || employee.email;
    employee.profilePhoto = profilePhoto || employee.profilePhoto;
    employee.phone = phone || employee.phone;
    employee.department = department || employee.department;
    employee.designation = designation || employee.designation;
    employee.status = status || employee.status;
    employee.dateOfBirth = dateOfBirth || employee.dateOfBirth;
    employee.address = address || employee.address;
    employee.gender = gender || employee.gender;
    employee.weeklyOffs = weeklyOffs || employee.weeklyOffs;

    if (password) {
      employee.password = await bcrypt.hash(password, 12);
    }

    await employee.save();

    employee.password = undefined;

    res.status(200).json({
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await User.findByIdAndDelete(id);
    if (!employee) {
      return res.status(404).json({
        message: "employee not found",
      });
    }
    res.status(200).json({
      message: "Employee deleted Succesfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.fetchEmployeeOnly = async (req, res) => {
  try {
    const page = req.query.page ? Number(req.query.page) : null;
    const limit = req.query.limit ? Number(req.query.limit) : null;
    const search = req.query.search?.trim() || "";

    const filter = {
      role: "employee",
      status: { $ne: "Inactive" },
    };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const totalEmployees = await User.countDocuments(filter);

    let query = User.find(filter).sort({ createdAt: -1 });

    if (page && limit) {
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
    }

    const employees = await query;

    res.status(200).json({
      totalEmployees,
      employees,
      pagination:
        page && limit
          ? {
              totalEmployees,
              currentPage: page,
              totalPages: Math.ceil(totalEmployees / limit),
              limit,
              hasNextPage: page < Math.ceil(totalEmployees / limit),
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

exports.recentEmployee = async (req, res) => {
  try {
    const recentEmployees = await User.find({ role: "employee" })
      .sort({
        createdAt: -1,
      })
      .limit(5);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const onLeaveToday =
      (
        await Leave.distinct("employee", {
          status: "Approved",
          startDate: { $lt: tomorrow },
          $or: [
            {
              endDate: { $gte: today },
            },
            {
              leaveType: "HalfDay",
            },
          ],
        })
      ).length - 1;

    const CountNewEmployees = await User.countDocuments({
      role: "employee",
      createdAt: { $gte: oneMonthAgo },
    });

    if (recentEmployees.length === 0) {
      return res.status(404).json({
        error: "No employees found",
      });
    }
    res.status(200).json({
      recentEmployees,
      CountNewEmployees,
      onLeaveToday,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
exports.employeeDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await User.findById(id);
    if (!employee) {
      return res.status(404).json({
        message: "employee not found",
      });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
