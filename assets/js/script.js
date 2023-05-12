var cityFormEl = $('#city-form');
var cityInputEl = $('#city-input');
var GEOCODE_URL = "http://api.openweathermap.org/geo/1.0/direct?";
var ONECALL_URL = "https://api.openweathermap.org/data/2.5/onecall?exclude=minutely,hourly,alerts&units=metric&"
var API_KEY = "&appid=b8c6e25479df1c50025297bb4e7a4d14";
var cityStorageListEl = $('#city-storage ul');
var todayEl = $('#today');
var weatherIcon = ["https://openweathermap.org/img/wn/",".png"];
var fiveDaysEl = $('#5-days div.row');

function showCityList(){
    if (window.localStorage.length > 0){
        for (let i=0; i < window.localStorage.length; i++){
            var cityItem = window.localStorage.key(i);
            console.log(cityItem);

            $(`<li id="${cityItem}" class="list-group-item">${cityItem}</li>`).appendTo(cityStorageListEl);

        };
    };
};

showCityList();

function onFormSubmit(event){
    event.preventDefault();

    var cityValue = cityInputEl.val();

    var apiCall = `${GEOCODE_URL}q=${cityValue}&limit=1${API_KEY}`;

    fetch(apiCall)
        .then(function (response){
            var responseJSON = response.json();
            return responseJSON;
        })
        .then(function (data){
            var geocodeData = data[0];

            var locLatLon = {
                name: geocodeData.name,
                lat: geocodeData.lat,
                lon: geocodeData.lon
            };

            if (window.localStorage.getItem(locLatLon.name) == null){
                window.localStorage.setItem(locLatLon.name, JSON.stringify(locLatLon));
                $(`<li id="${locLatLon.name}" class="list-group-item active">${locLatLon.name}</li>`).appendTo(cityStorageListEl);
            } else {
                $(`#${locLatLon.name}`).addClass("active");
            };
            
            getForecast(locLatLon.name, locLatLon.lat, locLatLon.lon);
        });
};

function getForecast(loc, lat, lon){

    $('.active').removeClass("active");
    todayEl.empty();
    fiveDaysEl.empty();

    var apiURL = `${ONECALL_URL}${API_KEY}&lat=${lat}&lon=${lon}`

    fetch(apiURL)
        .then( function(response){
            var responseJSON = response.json();
            return responseJSON;
        })
        .then(function(data){
            var forecastData = data;
            var currentForecast = forecastData.current;
            var iconURL = `${weatherIcon[0]}${currentForecast.weather[0].icon}${weatherIcon[1]}`;
            var date = dayjs.unix(currentForecast.dt).format('dddd D MMM');
            var temp = currentForecast.temp;
            var wind = currentForecast.wind_speed;
            var humidity = currentForecast.humidity;

            var forecastDayEl = $(`
                <h2>${loc}</h2>
                <h3>${date}</h3>
                <ul class="list-group">
                    <li class="list-group-item"><img src="${iconURL}"></li>
                    <li class="list-group-item">Temp: ${temp}</li>
                    <li class="list-group-item">Wind: ${wind}</li>
                    <li class="list-group-item">Humidity: ${humidity}</li>
                </ul>`);
        
            forecastDayEl.appendTo(todayEl);

            for ( let i=0; i<5; i++){
                
                var futureForecast = forecastData.daily[i];
                var iconURL = `${weatherIcon[0]}${futureForecast.weather[0].icon}${weatherIcon[1]}`;
                var date = dayjs.unix(futureForecast.dt).format('dddd D MMM');
                var temp = futureForecast.temp.day;
                var wind = futureForecast.wind_speed;
                var humidity = futureForecast.humidity;

                var dayCardEl = $(`
                    <div class="forecast-day col card m-3 p-3">
                        <h3>${date}</h3>
                        <ul class="list-group list-group-flush card-body">
                            <li class="list-group-item"><img src="${iconURL}"></li>
                            <li class="list-group-item">Temp: ${temp}</li>
                            <li class="list-group-item">Wind: ${wind}</li>
                            <li class="list-group-item">Humidity: ${humidity}</li>
                        </ul>
                    </div>`);

                dayCardEl.appendTo(fiveDaysEl);
            };
        });
};

function restoreCity(event){
    event.preventDefault();

    $('.active').removeClass("active");

    var retrieve = window.localStorage.getItem(event.target.id);
    var retrievedCities = JSON.parse(retrieve);

    getForecast(retrievedCities.name, retrievedCities.lat, retrievedCities.lon);

    $(`#${retrievedCities.name}`).addClass("active");
};

cityFormEl.on("submit", onFormSubmit);
cityStorageListEl.on("click", restoreCity);