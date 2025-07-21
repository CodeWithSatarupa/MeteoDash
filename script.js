// 🌦️ Open-Meteo weather code mapping
const weatherCodeMap = {
    0:  { desc: "Clear sky", icon: "☀️" },
    1:  { desc: "Mainly clear", icon: "🌤️" },
    2:  { desc: "Partly cloudy", icon: "⛅" },
    3:  { desc: "Overcast", icon: "☁️" },
    45: { desc: "Fog", icon: "🌫️" },
    48: { desc: "Depositing rime fog", icon: "🌫️" },
    51: { desc: "Light drizzle", icon: "🌦️" },
    53: { desc: "Moderate drizzle", icon: "🌦️" },
    55: { desc: "Dense drizzle", icon: "🌧️" },
    61: { desc: "Slight rain", icon: "🌦️" },
    63: { desc: "Moderate rain", icon: "🌧️" },
    65: { desc: "Heavy rain", icon: "🌧️" },
    71: { desc: "Slight snow", icon: "🌨️" },
    73: { desc: "Moderate snow", icon: "🌨️" },
    75: { desc: "Heavy snow", icon: "❄️" },
    80: { desc: "Rain showers", icon: "🌧️" },
    95: { desc: "Thunderstorm", icon: "⛈️" },
    99: { desc: "Hailstorm", icon: "🌩️" }
};

// ⚠️ Alert-triggering weather codes
const alertCodes = [65, 75, 95, 99];

async function getWeather() {
    const cityInput = document.getElementById('cityInput');
    const weatherInfoDiv = document.getElementById('weather-info');
    const city = cityInput.value.trim();

    if (!city) {
        weatherInfoDiv.innerHTML = '❗ Please enter a city name.';
        return;
    }

    weatherInfoDiv.innerHTML = '🔄 Loading...';

    try {
        // 📍 Step 1: Get location coordinates
        const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`;
        const geoResponse = await fetch(geoURL);
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('City not found.');
        }

        const { latitude, longitude, name, country, admin1 } = geoData.results[0];
        const locationDisplay = `${name}, ${admin1 || ''}, ${country}`;

        // 🌡️ Step 2: Fetch current weather data
        const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
        const weatherResponse = await fetch(weatherURL);
        const weatherData = await weatherResponse.json();

        if (!weatherData.current_weather) {
            throw new Error('Weather data not available.');
        }

        const current = weatherData.current_weather;
        const weatherCode = current.weathercode;
        const weather = weatherCodeMap[weatherCode] || { desc: "Unknown", icon: "❓" };

        // 🕒 Step 3: Format time to IST
        const dateTime = new Date(current.time + "Z"); // Force UTC parsing
        const formattedTime = dateTime.toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Asia/Kolkata"
        });

        // ⚠️ Step 4: Detect weather alert
        const alertMsg = alertCodes.includes(weatherCode)
            ? `<p><strong>⚠️ Weather Alert:</strong> Severe conditions expected. Stay safe!</p>`
            : "";

        // 📊 Step 5: Display result
        weatherInfoDiv.innerHTML = `
            <h3>${weather.icon} Weather in ${locationDisplay}</h3>
            <p><strong>Temperature:</strong> ${current.temperature}°C</p>
            <p><strong>Wind Speed:</strong> ${current.windspeed} km/h</p>
            <p><strong>Condition:</strong> ${weather.desc} (Code: ${weatherCode})</p>
            <p><strong>Time:</strong> ${formattedTime}</p>
            ${alertMsg}
        `;
    } catch (error) {
        weatherInfoDiv.innerHTML = `❌ Error: ${error.message}`;
    }
}

// ⌨️ Trigger weather check with Enter key
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('cityInput');
    input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            getWeather();
        }
    });
});