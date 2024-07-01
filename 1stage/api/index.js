const express = require("express");
const geoip = require("geoip-lite");
const getWeatherData = require("../getweather");
require("dotenv").config();

// import express from "express";
// import geoip from "geoip-lite";
// import getWeatherData from "../getweather";
// import dotevn from "dotenv";
// dotevn.config();

app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.get("/", (req, res) => {
  res.status(200).send({
    status: "success",
    message: `Navigate to the route https://${req.hostname}/api/hello?visitor_name=name to get a greeting from this api`,
  });
});

app.get("/api/hello", async (req, res) => {
  try {
    // const client_ip = ip.address();
    const client_ip =
      req.headers["cf-connecting-ip"] ||
      req.headers["x-real-ip"] ||
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress;
    const { visitor_name } = req.query;

    var geo = geoip.lookup(client_ip);

    const city = geo?.city;

    const weather = await getWeatherData(city, process.env.WEATHER_API_KEY);

    const temp = weather?.main?.temp;

    res.send({
      client_ip,
      location: city,
      greetings: `Hello, ${
        visitor_name + "!" || "from user!"
      } the temperature is ${temp} degrees Celcius in ${city}`,
    });
  } catch (err) {
    console.log(err);
    res.send({ status: "fail", err_msg: err.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Listenin on port ", PORT);
});
