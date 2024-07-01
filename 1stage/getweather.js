const fetch = require("node-fetch");
// import fetch from "node-fetch";
// Function to fetch weather data
async function getWeatherData(city, apiKey) {
  const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&APPID=${apiKey}`;
  try {
    const response = await fetch(weatherURL);
    const weatherData = await response.json();
    return weatherData;
  } catch (error) {
    console.log("Error fetching weather data:", error);
    throw error;
  }
}

module.exports = getWeatherData;
