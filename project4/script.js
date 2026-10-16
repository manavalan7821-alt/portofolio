
"use strict";

// ===== 1. Select DOM elements =====
const searchForm = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const searchButton = document.querySelector("#search-button");
const statusMessage = document.querySelector("#status-message");
const weatherPanel = document.querySelector("#weather-panel");

const ui = {
  location: document.querySelector("#location-name"),
  localTime: document.querySelector("#local-time"),
  icon: document.querySelector("#weather-icon"),
  temperature: document.querySelector("#temperature"),
  description: document.querySelector("#weather-description"),
  feelsLike: document.querySelector("#feels-like"),
  feelsMetric: document.querySelector("#feels-metric"),
  humidity: document.querySelector("#humidity"),
  wind: document.querySelector("#wind-speed"),
  precipitation: document.querySelector("#precipitation"),
  updatedAt: document.querySelector("#updated-at")
};

// ===== 2. Weather code descriptions =====
// Open-Meteo uses WMO weather interpretation codes.
function getWeatherInfo(code, isDay) {
  if (code === 0) {
    return { description: "Clear sky", icon: isDay ? "☀️" : "🌙" };
  }

  if (code === 1) {
    return { description: "Mainly clear", icon: isDay ? "🌤️" : "🌙" };
  }

  if (code === 2) {
    return { description: "Partly cloudy", icon: "⛅" };
  }

  if (code === 3) {
    return { description: "Overcast", icon: "☁️" };
  }

  if ([45, 48].includes(code)) {
    return { description: "Foggy", icon: "🌫️" };
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return { description: "Drizzle", icon: "🌦️" };
  }

  if ([61, 63, 65, 66, 67].includes(code)) {
    return { description: "Rain", icon: "🌧️" };
  }

  if ([71, 73, 75, 77].includes(code)) {
    return { description: "Snow", icon: "❄️" };
  }

  if ([80, 81, 82].includes(code)) {
    return { description: "Rain showers", icon: "🌦️" };
  }

  if ([85, 86].includes(code)) {
    return { description: "Snow showers", icon: "🌨️" };
  }

  if (code === 95 || [96, 99].includes(code)) {
    return { description: "Thunderstorm", icon: "⛈️" };
  }

  return { description: "Conditions unavailable", icon: "🌡️" };
}

// ===== 3. Update status messages =====
function setStatus(message, type = "info") {
  statusMessage.textContent = message;
  statusMessage.className = "status-message";

  if (type === "error") {
    statusMessage.classList.add("error");
  }
}

// ===== 4. Request city coordinates =====
async function getCityCoordinates(cityName) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");

  url.search = new URLSearchParams({
    name: cityName,
    count: "5",
    language: "en",
    format: "json"
  }).toString();

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `City search failed (HTTP ${response.status}). Please try again.`
    );
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.reason || "The city search service returned an error.");
  }

  if (!Array.isArray(data.results) || data.results.length === 0) {
    throw new Error(
      `We couldn't find "${cityName}". Check the spelling or try another city.`
    );
  }

  // Choose the first matching result.
  return data.results[0];
}

// ===== 5. Request current weather =====
async function getWeather(latitude, longitude) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");

  url.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "precipitation",
      "weather_code",
      "wind_speed_10m"
    ].join(","),
    timezone: "auto"
  }).toString();

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Weather request failed (HTTP ${response.status}). Please try again.`
    );
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.reason || "The weather service returned an error.");
  }

  if (!data.current) {
    throw new Error("Weather data is unavailable for this location.");
  }

  return data;
}

// ===== 6. Safely format numbers =====
function formatNumber(value, digits = 0) {
  const number = Number(value);

  if (value === null || value === undefined || !Number.isFinite(number)) {
    return "--";
  }

  return number.toFixed(digits);
}

// ===== 7. Render the API response =====
function renderWeather(place, data) {
  const current = data.current;
  const units = data.current_units || {};

  // Process nested API data: data.current.temperature_2m, etc.
  const weatherInfo = getWeatherInfo(
    current.weather_code,
    current.is_day === 1
  );

  const locationParts = [
    place.name,
    place.admin1 && place.admin1 !== place.name ? place.admin1 : null,
    place.country
  ].filter(Boolean);

  ui.location.textContent = [...new Set(locationParts)].join(", ");
  ui.localTime.textContent =
    `Local time: ${current.time || "Unavailable"} (${data.timezone || "local timezone"})`;

  ui.icon.textContent = weatherInfo.icon;
  ui.description.textContent = weatherInfo.description;

  ui.temperature.textContent =
    `${formatNumber(current.temperature_2m)}${units.temperature_2m || "°C"}`;

  ui.feelsLike.textContent =
    `Feels like ${formatNumber(current.apparent_temperature)}${units.apparent_temperature || "°C"}`;

  ui.feelsMetric.textContent = formatNumber(current.apparent_temperature);
  ui.humidity.textContent = formatNumber(current.relative_humidity_2m);
  ui.wind.textContent = formatNumber(current.wind_speed_10m, 1);
  ui.precipitation.textContent = formatNumber(current.precipitation, 1);

  ui.updatedAt.textContent =
    `Weather observation time: ${current.time || "not supplied"} · Source: Open-Meteo`;

  weatherPanel.hidden = false;
}

// ===== 8. Main async search function =====
async function searchWeather(cityName) {
  const cleanCity = cityName.trim();

  if (!cleanCity) {
    setStatus("Please enter a city name.", "error");
    cityInput.focus();
    return;
  }

  searchButton.disabled = true;
  searchButton.textContent = "Loading...";
  cityInput.disabled = true;

  setStatus(`Searching for weather in ${cleanCity}...`);
  weatherPanel.hidden = true;

  try {
    // Step 1: Find the city.
    const place = await getCityCoordinates(cleanCity);

    // Step 2: Fetch its current weather.
    const weatherData = await getWeather(
      place.latitude,
      place.longitude
    );

    // Step 3: Display the response.
    renderWeather(place, weatherData);
    setStatus(`Weather loaded successfully for ${place.name}.`);
  } catch (error) {
    console.error("Weather search error:", error);

    if (error instanceof TypeError) {
      setStatus(
        "Network error. Check your internet connection and try again.",
        "error"
      );
    } else {
      setStatus(
        error.message || "Something went wrong. Please try again.",
        "error"
      );
    }
  } finally {
    // Always restore the form, whether the request succeeds or fails.
    searchButton.disabled = false;
    searchButton.innerHTML = 'Search <span aria-hidden="true">→</span>';
    cityInput.disabled = false;
    cityInput.focus();
  }
}

// ===== 9. Handle form submission =====
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  searchWeather(cityInput.value);
});

// ===== 10. Initial state =====
weatherPanel.hidden = true;
setStatus("Search for a city to see its current weather.");

// Automatically load a sample city on the first visit.
searchWeather("Chennai");
