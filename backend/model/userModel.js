const mongoose = require("mongoose");
const Validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!Validator.isEmail(value)) {
          throw new Error("Invalid Email");
        }
      },
    },

    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 Characters"],
      select: false,
    },

    phone: {
      type: String,
    },

    profilePhoto: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
    },

    department: {
      type: String,
    },

    designation: {
      type: String,
    },

    joiningDate: {
      type: Date,
      default: Date.now,
    },

    salary: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    address: {
      type: String,
    },

    dateOfBirth: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    weeklyOffs: {
      type: [String],
      enum: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      default: ["Sunday"],
    },

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

module.exports = User;
