const express = require("express");
const geoip = require("geoip-lite");
const fetch = require("node-fetch");
// const { IPinfoWrapper } = require("node-ipinfo");
const IPData = require("ipdata").default;
require("dotenv").config();

app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true, limit: "10kb" }));

const cacheConfig = {
  max: 1000, // max size
  maxAge: 10 * 60 * 1000, // max age in ms (i.e. 10 minutes)
};

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

    const ipdata = new IPData(process.env.IPDATA_API_KEY, cacheConfig);
    const fields = ["city"];
    const location = await ipdata?.lookup(client_ip, null, fields);

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
