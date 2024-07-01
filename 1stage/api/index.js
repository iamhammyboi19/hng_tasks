const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true, limit: "10kb" }));

async function getWeatherData(city) {
  const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&APPID=${process.env.WEATHER_API_KEY}`;
  try {
    const response = await fetch(weatherURL);
    const weatherData = await response.json();
    return weatherData;
  } catch (error) {
    console.log("Error fetching weather data:", error);
    throw error;
  }
}

async function getCity(ip) {
  try {
    const url = `https://ipinfo.io/${ip}?token=${process.env.IPINFO_API_TOKEN}`;
    const response = await fetch(url);
    const location = await response.json();
    return location;
  } catch (err) {
    throw err;
  }
}

app.get("/", (req, res) => {
  res.status(200).send({
    status: "success",
    message: `Navigate to the route https://${req.hostname}/api/hello?visitor_name=name to get a greeting from this api`,
  });
});

app.get("/api/hello", async (req, res) => {
  try {
    const client_ip =
      req.headers["cf-connecting-ip"] ||
      req.headers["x-real-ip"] ||
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress;

    const { visitor_name } = req.query;
    const location = await getCity(client_ip);

    console.log("location", location);

    const city = location?.city;

    const weather = await getWeatherData(city);

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
