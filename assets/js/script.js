const today = dayjs();
const searchColumn = $("#searchDiv");
const searchInputEl = $("#searchInput");
const searchBtn = $("#searchBtn");
const searchHistoryEl = $("#searchHistory");
const resultsColumn = $("#resultsDiv");
const currentCityEl = $("#currentCity");
const currentIconEl = $("#currentIcon");
const currentDateEl = $('#currentDate');
const currentTempEl = $("#temp");
const currentHumidityEl = $("#humidity");
const currentWindSpeedEl = $("#windSpeed");
const currentUviEl = $("#uvIndex");

const MAX_HISTORY_ITEMS = 10;
let searchHistoryArray;
let lastSearchedCity;

// Event listener for searchBtn
searchBtn.click(() => {
    let cityName = searchInputEl.val();
    handleSearch(cityName);
    searchInputEl.val(''); // Clear search field
});

$(document).ready(() => {
    // Get search history from storage
    searchHistoryArray = JSON.parse(localStorage.getItem('searchHistory')) || [];
    lastSearchedCity = searchHistoryArray[0];
    updateSearchHistory();
    // Load data for most recent search
    if (lastSearchedCity) {
        getCurrentWeather(lastSearchedCity);
        getForecastWeather(lastSearchedCity);
    } else {
        resultsColumn.addClass('d-none');
        searchColumn.addClass('col-lg-12')
    };
});

function handleSearch(cityName) {
    // Update search history
    if (searchHistoryArray.includes(cityName)) {
        let rptIndex = searchHistoryArray.indexOf(cityName);
        searchHistoryArray.splice(rptIndex, 1);
    };
    searchHistoryArray.unshift(cityName);
    updateSearchHistory();
    // Execute search, unhide results
    getCurrentWeather(cityName);
    getForecastWeather(cityName);
    resultsColumn.removeClass('d-none');
    searchColumn.removeClass('col-lg-12')
};

function updateSearchHistory() {
    if (searchHistoryArray.length > MAX_HISTORY_ITEMS) {
        searchHistoryArray.pop(); // If array returns more than 10 results, "pop" or remove extra results
    };
    localStorage.setItem('searchHistory', JSON.stringify(searchHistoryArray));

    searchHistoryEl.html('');
    for (const city of searchHistoryArray) {
        const newHistoryItem = $('<button type="button" class="list-group-item list-group-item-action">');
        newHistoryItem.text(city);
        newHistoryItem.click((event) => {
            handleSearch(event.target.textContent);
        });
        searchHistoryEl.append(newHistoryItem);
    };
};

function getCurrentWeather(cityName) {
    const queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&appid=d805afa702cbd0d0da430b05b58308fc`
    $.ajax({
        url: queryURL,
        method: 'GET'
    }).then((response) => {
        const city = response.name;
        const icon = getIconElement(response.weather[0].icon);
        const temp = response.main.temp;
        const humidity = response.main.humidity;
        const windSpeed = response.wind.speed;
        const lat = response.coord.lat;
        const lon = response.coord.lon;

        currentCityEl.text(city);
        currentIconEl.html(icon);
        currentDateEl.text(today.format('M/DD/YYYY'));
        currentTempEl.text(temp);
        currentHumidityEl.text(humidity);
        currentWindSpeedEl.text(windSpeed);
        getUVIndex(lat, lon);
    });
};

function getForecastWeather(cityName) {
    const queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&cnt=5&units=imperial&appid=d805afa702cbd0d0da430b05b58308fc`;
    $.ajax({
        url: queryURL,
        method: 'GET'
    }).then((response) => {
        const daysArray = response.list
        // FOR loop over API data array:
        for (let i = 0; i < daysArray.length; i++) {
            // get relevant data
            const date = today.add(i + 1, 'day').format('M/DD');
            const temp = daysArray[i].main.temp;
            const humidity = daysArray[i].main.humidity;
            // create elements to append
            const dateEl = $("<h5>").text(date);
            const iconEl = getIconElement(daysArray[i].weather[0].icon);
            const tempEl = $("<p>").html(`Temp: ${temp}&deg;F`)
            const humidityEl = $("<p>").html(`Humidity: ${humidity}%`)
            // clear card content
            $(`#day-${i + 1}`).html('');
            // append elements to card
            $(`#day-${i + 1}`).append(dateEl).append(iconEl).append(tempEl).append(humidityEl)
        };
    });
};

function getIconElement(code) {
    const iconUrl = `http://openweathermap.org/img/wn/${code}@2x.png`;
    return `<img src="${iconUrl}" style="width:100px">`
};

function getUVIndex(lat, lon) {
    const queryURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=d805afa702cbd0d0da430b05b58308fc`;
    $.ajax({
        url: queryURL,
        method: 'GET'
    }).then((response) => {
        const uvi = response.value;
        currentUviEl.text(uvi);
        colorUVIndex(uvi);
    });
};

function colorUVIndex(value) {
    // Values based on EPA UV Index scale
    if (value < 3) {
        currentUviEl.attr('class', 'btn btn-sm btn-success')
    } else if (value < 7) {
        currentUviEl.attr('class', 'btn btn-sm btn-warning')
    } else {
        currentUviEl.attr('class', 'btn btn-sm btn-danger')
    };
};