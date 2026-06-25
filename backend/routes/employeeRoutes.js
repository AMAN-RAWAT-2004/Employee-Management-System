const express = require("express");
const router = express.Router();
const employeeController = require("./../controllers/employeeController");
const authMiddleware = require("./../middlewares/authMiddleware");
router.post(
  "/add-employee",
  authMiddleware.protect,
  authMiddleware.admin,
  employeeController.addEmployee,
);

router.get(
  "/recent-employee",
  authMiddleware.protect,
  authMiddleware.admin,
  employeeController.recentEmployee,
);
router
  .route("/:id")
  .delete(
    authMiddleware.protect,
    authMiddleware.admin,
    employeeController.deleteEmployee,
  )
  .put(
    authMiddleware.protect,
    authMiddleware.admin,
    employeeController.updateEmployee,
  )
  .get(
    authMiddleware.protect,
    // authMiddleware.admin,
    employeeController.employeeDetails,
  );
router
  .route("/")
  .get(
    authMiddleware.protect,
    authMiddleware.admin,
    employeeController.fetchEmployeeOnly,
  );

module.exports = router;
