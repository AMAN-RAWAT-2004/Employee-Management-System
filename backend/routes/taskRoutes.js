const express = require("express");
const router = express.Router();
const taskController = require("./../controllers/taskController");
const { protect, admin } = require("./../middlewares/authMiddleware");

router.get("/my-tasks", protect, taskController.getMyTasks);
router.patch("/:taskId/status", protect, taskController.updateTaskStatus);
router.post("/:taskId/add-comment", protect, taskController.addComment);
router.delete(
  "/:taskId/comment/:commentId",
  protect,
  taskController.deleteComment,
);
router.get("/recent-tasks", protect, admin, taskController.recentTasks);
router.put(
  "/:taskId/comments/:commentId",
  protect,
  taskController.updateComment,
);
router.post("/:taskId/assign", protect, taskController.assignTask);
router.use(protect, admin);
router.patch("/:taskId/due-date", taskController.updateDueDate);
router.patch("/:taskId/priority", taskController.updateTasksPriority);
router.post("/", taskController.addTasks);
router.route("/").get(taskController.fetchAllTasks);
router
  .route("/:taskId")
  .delete(taskController.deleteTask)
  .put(taskController.updateTasks);

module.exports = router;
