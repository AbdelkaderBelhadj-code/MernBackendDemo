require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const PORT = process.env.PORT || 3500;
const { logger } = require("./Middleware/logger");
const errorHandler = require("./Middleware/errorHandler");
const cookieParser = require("cookie-parser");
//const cores = require('cores')
const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/dbConn");
const mongoose = require("mongoose");
const { logEvents } = require("./Middleware/logger");

console.log(process.env.NODE_ENV);

connectDB();

app.use(express.json());

app.use(logger);

//app.use(cores())

//app.use(corsOptions())

app.use(cookieParser()); //third-party middleware

app.use("/", express.static(path.join(__dirname, "/public")));

app.use("/", require("./routes/root"));

app.use("/users",require("./routes/userRoutes"))
app.use("/notes",require("./routes/noteRoutes"))

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 not found " });
  } else {
    res.type("txt").send("404 not found");
  }
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`server listening on port ${PORT} yesss`));
});

mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}:${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrorLog.log"
  );
});
