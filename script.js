document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('cityInput');
    const searchBtn = document.getElementById('searchBtn');
    const errorMessage = document.getElementById('errorMessage');
    const weatherInfo = document.getElementById('weatherInfo');
    const favoritesList = document.getElementById('favoritesList');
    const toggleModeBtn = document.getElementById('toggleMode');
    const noFavorites = document.getElementById('noFavorites');

    // Load favorites from localStorage
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    updateFavoritesList();

    // Toggle dark mode
    toggleModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });

    // Load dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    // Search weather data
    searchBtn.addEventListener('click', searchWeather);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchWeather();
        }
    });

    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    async function searchWeather() {
        const city = cityInput.value.trim();
        if (!city) {
            showError('Please enter a city name');
            return;
        }

        try {
            const response = await fetch(`https://www.freetestapi.com/api/v1/weathers`);
            const data = await response.json();
            
            // Find the city in the response (case-insensitive)
            const cityData = data.find(item => 
                item.city.toLowerCase() === city.toLowerCase()
            );

            if (!cityData) {
                showError('City not found in the API!');
                return;
            }

            displayWeather(cityData);
            errorMessage.textContent = '';
        } catch (error) {
            showError('Error fetching weather data. Please try again.');
            console.error('Error:', error);
        }
    }

    function displayWeather(data) {
        const isFavorite = favorites.some(fav => fav.city.toLowerCase() === data.city.toLowerCase());
        
        weatherInfo.innerHTML = `
            <div class="weather-main">
                <h2>${data.city}, ${data.country}</h2>
                <p class="temperature">${data.temperature}°C</p>
                <p class="description">${data.weather_description}</p>
                ${!isFavorite ? `<button onclick="addToFavorites('${data.city}', ${data.temperature}, '${data.weather_description}')">Add to Favorites</button>` : ''}
            </div>
            <div class="weather-details">
                <div class="weather-detail">
                    <h3>Humidity</h3>
                    <p>${data.humidity}%</p>
                </div>
                <div class="weather-detail">
                    <h3>Wind Speed</h3>
                    <p>${data.wind_speed} km/h</p>
                </div>
            </div>
        `;
        weatherInfo.classList.add('active');
    }

    // Add to favorites
    window.addToFavorites = (city, temperature, description) => {
        const newFavorite = { city, temperature, description };
        if (!favorites.some(fav => fav.city.toLowerCase() === city.toLowerCase())) {
            favorites.push(newFavorite);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            updateFavoritesList();
            searchWeather(); // Refresh weather display to update the "Add to Favorites" button
        }
    };

    // Remove from favorites
    window.removeFromFavorites = (city) => {
        favorites = favorites.filter(fav => fav.city.toLowerCase() !== city.toLowerCase());
        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavoritesList();
        if (cityInput.value.toLowerCase() === city.toLowerCase()) {
            searchWeather(); // Refresh weather display to update the "Add to Favorites" button
        }
    };

    function updateFavoritesList() {
        if (favorites.length === 0) {
            noFavorites.style.display = 'block';
            favoritesList.innerHTML = '<p id="noFavorites">No favorites yet!</p>';
            return;
        }

        noFavorites.style.display = 'none';
        favoritesList.innerHTML = favorites.map(fav => `
            <div class="favorite-item">
                <div>
                    <h3>${fav.city}</h3>
                    <p>${fav.temperature}°C - ${fav.description}</p>
                </div>
                <button onclick="removeFromFavorites('${fav.city}')">Remove</button>
            </div>
        `).join('');
    }

    function showError(message) {
        errorMessage.textContent = message;
        weatherInfo.classList.remove('active');
    }
});