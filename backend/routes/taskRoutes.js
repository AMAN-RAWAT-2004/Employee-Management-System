const express = require("express");
const router = express.Router();
const taskController = require("./../controllers/taskController");
const authMiddleware = require("./../middlewares/authMiddleware");

router.get(
  "/logged-In/tasks",
  authMiddleware.protect,
  taskController.fetchTaskByEmployeeId,
);

router.use(authMiddleware.protect, authMiddleware.admin);
router.post("/:taskId/assign", taskController.assignTask);
router.patch("/:taskId/status", taskController.updateTaskStatus);
router.patch("/:taskId/due-date", taskController.updateDueDate);
router.patch("/:taskId/priority", taskController.updateTasksPriority);
router.post(
  "/",
  authMiddleware.protect,
  authMiddleware.admin,
  taskController.addTasks,
);
router.route("/").get(taskController.fetchAllTasks);
router
  .route("/:taskId")
  .delete(taskController.deleteTask)
  .put(taskController.updateTasks);

module.exports = router;
