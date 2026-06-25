const mongoose = require("mongoose");
const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    leaveType: {
      type: String,
      enum: ["Sick", "Casual", "Paid", "Unpaid", "HalfDay", "Other"],
      default: undefined,
      required: true,
    },
    startDate: Date,
    endDate: Date,

    startTime: String,
    endTime: String,
    reason: {
      type: String,
      default: " ",
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: Date,
  },
  {
    timestamps: true,
  },
);

leaveSchema.pre("validate", function () {
  if (this.leaveType === "HalfDay") {
    if (!this.startDate || !this.startTime || !this.endTime) {
      return next(
        new Error("Half Day leave requires date, start time and end time"),
      );
    }
  } else {
    if (!this.startDate || !this.endDate) {
      return next(new Error("Leave requires start date and end date"));
    }
  }
});

const Leave = mongoose.model("Leave", leaveSchema);
module.exports = Leave;
