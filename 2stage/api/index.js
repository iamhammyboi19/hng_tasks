const express = require("express");
require("dotenv").config();
const sequelize = require("../src/db-config/db-config");
const CustomError = require("../src/utils/CustomError");
const authRoute = require("../src/routes/authRoute");
const userRoute = require("../src/routes/userRoute");

app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// sequelize
//   .authenticate()
//   .then(() => {
//     console.log("Database connected successfully");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

app.get("/", (req, res) => {
  res.send({ status: "success", message: "Welcome to this postgres ORM db" });
});

app.use("/auth", authRoute);
app.use("/api", userRoute);

app.all("*", (req, res, next) => {
  return next(
    new CustomError(
      `Sorry this route ${req.protocol}://${req.get("host")}${
        req.originalUrl
      } doesn't exist`,
      404
    )
  );
});

app.use((err, req, res, next) => {
  console.log("err", err);
  err.statusCode = err.statusCode || 500;
  let error = Object.assign(err);
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    res.status(error.statusCode).json({
      status: "fail",
      message: "Something really went wrong",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Listening on port ", PORT);
});

module.exports = app;
