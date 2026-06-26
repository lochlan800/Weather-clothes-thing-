// What Should I Wear? — weather-based clothing advice for places in England.
// Uses the free Open-Meteo APIs (no API key required).

const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const statusEl = document.getElementById("status");
const result = document.getElementById("result");

const placeName = document.getElementById("place-name");
const weatherIcon = document.getElementById("weather-icon");
const temperature = document.getElementById("temperature");
const conditions = document.getElementById("conditions");
const feelsLike = document.getElementById("feels-like");
const windEl = document.getElementById("wind");
const rainEl = document.getElementById("rain");
const clothingList = document.getElementById("clothing-list");

// Map Open-Meteo WMO weather codes to a description + emoji icon.
const WEATHER_CODES = {
  0: { text: "Clear sky", icon: "☀️" },
  1: { text: "Mainly clear", icon: "🌤️" },
  2: { text: "Partly cloudy", icon: "⛅" },
  3: { text: "Overcast", icon: "☁️" },
  45: { text: "Foggy", icon: "🌫️" },
  48: { text: "Rime fog", icon: "🌫️" },
  51: { text: "Light drizzle", icon: "🌦️" },
  53: { text: "Drizzle", icon: "🌦️" },
  55: { text: "Heavy drizzle", icon: "🌧️" },
  56: { text: "Freezing drizzle", icon: "🌧️" },
  57: { text: "Freezing drizzle", icon: "🌧️" },
  61: { text: "Light rain", icon: "🌦️" },
  63: { text: "Rain", icon: "🌧️" },
  65: { text: "Heavy rain", icon: "🌧️" },
  66: { text: "Freezing rain", icon: "🌧️" },
  67: { text: "Freezing rain", icon: "🌧️" },
  71: { text: "Light snow", icon: "🌨️" },
  73: { text: "Snow", icon: "❄️" },
  75: { text: "Heavy snow", icon: "❄️" },
  77: { text: "Snow grains", icon: "🌨️" },
  80: { text: "Rain showers", icon: "🌦️" },
  81: { text: "Rain showers", icon: "🌧️" },
  82: { text: "Violent rain showers", icon: "⛈️" },
  85: { text: "Snow showers", icon: "🌨️" },
  86: { text: "Heavy snow showers", icon: "❄️" },
  95: { text: "Thunderstorm", icon: "⛈️" },
  96: { text: "Thunderstorm with hail", icon: "⛈️" },
  99: { text: "Thunderstorm with hail", icon: "⛈️" },
};

function describeWeather(code) {
  return WEATHER_CODES[code] || { text: "Unknown conditions", icon: "🌡️" };
}

// Decide what to wear from temperature, wind, rain and weather code.
function decideClothing({ temp, feels, windSpeed, rainChance, code }) {
  const items = [];

  // Base layers by how cold it feels.
  if (feels <= 0) {
    items.push("Heavy winter coat", "Thermal base layer", "Hat, gloves and a scarf");
  } else if (feels <= 8) {
    items.push("Warm coat", "Jumper or fleece", "Long trousers");
  } else if (feels <= 14) {
    items.push("Light jacket or hoodie", "Long-sleeved top", "Long trousers");
  } else if (feels <= 20) {
    items.push("Light jumper or long sleeves", "Trousers or jeans");
  } else if (feels <= 26) {
    items.push("T-shirt", "Light trousers or shorts");
  } else {
    items.push("Light, breathable T-shirt", "Shorts", "Stay hydrated");
  }

  // Rain / wet conditions.
  const isSnow = [71, 73, 75, 77, 85, 86].includes(code);
  const isRain = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code);
  if (isSnow) {
    items.push("Waterproof boots", "Waterproof coat");
  } else if (isRain || rainChance >= 40) {
    items.push("Waterproof jacket or umbrella");
  }

  // Wind.
  if (windSpeed >= 30) {
    items.push("Windproof outer layer");
  }

  // Sun.
  if ((code === 0 || code === 1) && temp >= 20) {
    items.push("Sunglasses", "Sun cream");
  }

  return items;
}

async function geocode(query) {
  const url =
    "https://geocoding-api.open-meteo.com/v1/search?count=1&language=en&format=json&name=" +
    encodeURIComponent(query);
  const res = await fetch(url);
  if (!res.ok) throw new Error("Could not look up that place.");
  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    throw new Error("No place found by that name. Try another spelling.");
  }
  return data.results[0];
}

async function getWeather(lat, lon) {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    "?current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m" +
    "&hourly=precipitation_probability" +
    "&timezone=auto" +
    "&latitude=" + lat +
    "&longitude=" + lon;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Could not get the weather right now.");
  return res.json();
}

function currentRainChance(weather) {
  // Find the precipitation probability for the hour closest to "now".
  const times = weather.hourly?.time || [];
  const probs = weather.hourly?.precipitation_probability || [];
  const nowHour = (weather.current?.time || "").slice(0, 13);
  const idx = times.findIndex((t) => t.slice(0, 13) === nowHour);
  if (idx >= 0 && probs[idx] != null) return probs[idx];
  return probs[0] ?? 0;
}

function render(place, weather) {
  const c = weather.current;
  const desc = describeWeather(c.weather_code);
  const rainChance = currentRainChance(weather);

  const locationParts = [place.name, place.admin1, place.country].filter(Boolean);
  placeName.textContent = locationParts.join(", ");
  weatherIcon.textContent = desc.icon;
  temperature.textContent = Math.round(c.temperature_2m) + "°C";
  conditions.textContent = desc.text;
  feelsLike.textContent = Math.round(c.apparent_temperature) + "°C";
  windEl.textContent = Math.round(c.wind_speed_10m) + " km/h";
  rainEl.textContent = rainChance + "%";

  const items = decideClothing({
    temp: c.temperature_2m,
    feels: c.apparent_temperature,
    windSpeed: c.wind_speed_10m,
    rainChance,
    code: c.weather_code,
  });

  clothingList.innerHTML = "";
  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = item;
    clothingList.appendChild(li);
  }

  result.hidden = false;
}

async function search(query) {
  statusEl.textContent = "Looking up the weather…";
  statusEl.classList.remove("error");
  result.hidden = true;

  try {
    const place = await geocode(query);
    const weather = await getWeather(place.latitude, place.longitude);
    render(place, weather);
    statusEl.textContent = "";
  } catch (err) {
    statusEl.textContent = err.message || "Something went wrong. Please try again.";
    statusEl.classList.add("error");
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = input.value.trim();
  if (query) search(query);
});

// Start with the weather in Horbury.
input.value = "Horbury";
search("Horbury");
