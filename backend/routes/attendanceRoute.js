const express = require("express");
const router = express.Router();
const attendanceController = require("./../controllers/attendanceController");
const authMiddleware = require("./../middlewares/authMiddleware");

router.post(
  "/add-attendance",
  authMiddleware.protect,

  attendanceController.addAttendance,
);
router.get(
  "/monthly/:year/:month",
  authMiddleware.protect,
  authMiddleware.admin,
  attendanceController.getMonthlyAttendance,
);

router.post("/check-in", authMiddleware.protect, attendanceController.checkIn);

router.post(
  "/check-out",
  authMiddleware.protect,
  attendanceController.checkOut,
);

router.get(
  "/statistics",

  attendanceController.getAttendanceStatistics,
);

router.get(
  "/employee/:employeeId/date-range",
  authMiddleware.protect,
  attendanceController.getAttendanceByDateRange,
);

router.get(
  "/employee/:employeeId",
  authMiddleware.protect,
  attendanceController.getAttendanceByEmployee,
);

router
  .route("/:id")
  .get(
    authMiddleware.protect,
    authMiddleware.admin,
    attendanceController.getAttendanceById,
  )
  .put(
    authMiddleware.protect,
    authMiddleware.admin,
    attendanceController.updateAttendance,
  )
  .delete(
    authMiddleware.protect,
    authMiddleware.admin,
    attendanceController.deleteAttendance,
  );

router
  .route("/")
  .get(
    authMiddleware.protect,
    authMiddleware.admin,
    attendanceController.getAllAttendance,
  );

module.exports = router;
