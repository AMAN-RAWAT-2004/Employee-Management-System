const express = require("express");
const app = express();
const dotEnv = require("dotenv");
const DB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const taskRoutes = require("./routes/taskRoutes");
const attendanceRoutes = require("./routes/attendanceRoute");
const leaveRoutes = require("./routes/leaveRoutes");
const cors = require("cors");
const compression = require("compression");
dotEnv.config({});
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://employee-hub-frontend-lime.vercel.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(compression());
DB();

app.get("/", (req, res) => {
  res.end("Welcome to Employee Managment System");
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/employee", employeeRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/leave", leaveRoutes);

const Port = process.env.PORT || 8000;
app.listen(Port, () => {
  console.log(`Server is listning to the ${Port}`);
});
