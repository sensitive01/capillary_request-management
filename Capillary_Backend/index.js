const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const dotenv = require("dotenv");
const db = require("./config/db");
const cors = require("cors");
const path = require("path");
const userRoutes = require("./routes/userRoutes");
const empRoutes = require("./routes/empRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const questionRoutes = require("./routes/questionRoutes");
const entityRoutes = require("./routes/entityRoutes");
const domainRoutes = require("./routes/domainRoutes");
const addReqRoutes = require("./routes/reqRoutes");
const reqRoutes = require("./routes/reqRoutes");
const s3Router = require("./routes/preSignedUrl");
const crediantialRoute = require("./routes/crediantialsRoute")

dotenv.config();

const app = express();
const port = 3001;

db(); // Initialize database connection

// CORS headers (optional, consider removing if not needed)
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

// Basic middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "dist")));

// Routes
app.use("/", userRoutes);
app.use("/employees", empRoutes);
app.use("/vendors", vendorRoutes);
app.use("/questions", questionRoutes);
app.use("/entity", entityRoutes);
app.use("/domains", domainRoutes);
app.use("/users", addReqRoutes);
app.use("/request", reqRoutes);
app.use("/upload-s3", s3Router);
app.use("/credantials", crediantialRoute);



// Catch-all route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
