const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const db = require("./config/db");
const cors = require("cors");
const path = require("path"); // Import path module
const userRoutes = require("./routes/userRoutes");
const empRoutes = require("./routes/empRoutes"); // Import empRoutes
const vendorRoutes = require("./routes/vendorRoutes");
const questionRoutes = require("./routes/questionRoutes");
const entityRoutes = require("./routes/entityRoutes");
const domainRoutes = require("./routes/domainRoutes");
const addReqRoutes = require("./routes/reqRoutes");
const reqRoutes = require("./routes/reqRoutes");

dotenv.config();

const app = express();
const port = 3001;

db(); // Initialize database connection
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

app.use(bodyParser.json());
app.use(cors());

// Serve static files from the "dist" folder
app.use(express.static(path.join(__dirname, "dist")));

// Route configuration
app.use("/", userRoutes);
app.use("/employees", empRoutes); // Add empRoutes with a base path
app.use("/vendors", vendorRoutes);
app.use("/questions", questionRoutes);
app.use("/entity", entityRoutes);
app.use("/domains", domainRoutes);
app.use("/users", addReqRoutes);
app.use("/request", reqRoutes);

// Catch-all route to serve the frontend for any other request
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
