
const searchInfo = {
    city: "",
    country: "",
    latitude: "",
    longitude: ""
}

let searchableLocations = [];

document.addEventListener("DOMContentLoaded", async ()=>{

    //Make FETCH request to get the client's ISP city/country/lat/lon/region
    const userLocationInfo = await getLocationInfo();

    with (userLocationInfo) {
        searchInfo.city = city;
        searchInfo.country = country;
        searchInfo.latitude = lat;
        searchInfo.longitude = lon;
    }

    //Make FETCH request to get the weather information based on the ISP info
    const userWeatherInfo = await getWeatherInfo(searchInfo.city, searchInfo.country, searchInfo.latitude, searchInfo.longitude);

    console.log("User Weather Info");
    console.log(userWeatherInfo);

    //Make a FETCH request to get the geology information based on the ISP info
    const userGeologyInfo = await getGeologyInfo(searchInfo.latitude, searchInfo.longitude);

    console.log("User Geology Info");
    console.log(userGeologyInfo);

    //Format the data recieved from the weather and geology apis
    const cards = formatWeatherInfo(userWeatherInfo);

    console.log(cards);

    const template = await getTemplate("card.mustache", cards);

    const rendered = Mustache.render(template, cards);
    console.log(rendered);
    document.getElementById("location-container").innerHTML = rendered;

    //We'll make an AJAX request to get up-to-date weather info every 20 seconds
    window.setInterval(updateWeatherInfo, 20000);


    //Make a fetch request to get all searchable locations
    const locationInfo = await getLocations();
    searchableLocations = locationInfo.locations;

    //add event handler for search bar autocomplete
    
    //add event handler for search bar search event

    //make api calls for the searched values

    //render the mustache templates

    document.getElementById("search-form").addEventListener("submit", async (event)=>{

        event.preventDefault();

        let search = document.getElementById("location-search-input").value;

        //value will be enforced at City, Country
        //remove white spaces, split on "," and search on city,country to pass city, ISO2 to the weather api

        let cityCountry = search.split(",");

        let city = cityCountry[0];
        let country = cityCountry[1];

        
        console.log("city: ", city, "country: ", country);

        const userWeatherInfo = await getWeatherInfo(city, country, 0, 0);

        //Format the data recieved from the weather and geology apis
        const cards = formatWeatherInfo(userWeatherInfo);

        console.log(cards);

        const template = await getTemplate("card.mustache", cards);

        const rendered = Mustache.render(template, cards);
        console.log(rendered);
        document.getElementById("location-container").innerHTML = rendered;
            //get the form data and make a fetch requests for the info
        //parse the city and country or lat and lon and call the apis


    });

});

async function updateWeatherInfo(){

    const userWeatherInfo = await getWeatherInfo(searchInfo.city, searchInfo.country, searchInfo.latitude, searchInfo.longitude);

    //Format the data recieved from the weather and geology apis
    const cards = formatWeatherInfo(userWeatherInfo);

    console.log(cards);
   
    const template = await getTemplate("card.mustache", cards);
   
    const rendered = Mustache.render(template, cards);
    console.log(rendered);
    document.getElementById("location-container").innerHTML = rendered;
}

async function getTemplate(file, values){

    const response = await fetch(file, values);

    const template = await response.text();

    return template;

}

async function getLocations(){

    const response = await fetch("http://localhost:3000/locations");

    const locations = await response.json();

    return locations;
}


async function getLocationInfo(){

    const response = await fetch("http://ip-api.com/json/");

    const userLocationInfo = await response.json();

    return userLocationInfo;

}

async function getWeatherInfo(city, country, latitude, longitude){

    const url = "http://localhost:3000/weather?" + new URLSearchParams({
        city: city,
        country: country,
        latitude: latitude,
        longitude: longitude
    });

    const response = await fetch(url);

    const userWeatherInfo = await response.json();

    return userWeatherInfo;

}

async function getGeologyInfo(latitude, longitude) {

    const url = "http://localhost:3000/geology?" + new URLSearchParams({
        latitude: latitude,
        longitude: longitude
    });

    const response = await fetch(url);

    const userGeologyInfo = await response.json();

    return userGeologyInfo;
}


function convertUTCToTime(UTCDate){

    const date = new Date();

    date.setUTCSeconds(UTCDate);

    return date.toTimeString().substring(0, 17);


}

function formatWeatherInfo(data) {

    let cards = {
        cards: []
    };

    const weatherCard = {
        cardTitle: "Weather",
        cardItems: [
            data.weather[0].description, 
            "Temperature: " + data.main.temp,
            "Temp-Minimum: " + data.main.temp_min,
            "Temp-Maximum: " + data.main.temp_max,
            "Humidity : " + data.main.humidity 
        ]
    }



    const timeZoneCard = {
        cardTitle: "Time-Zone",
        cardItems: [
            data.name + ", " + data.sys.country,
            "Latitude: " + data.coord.lat,
            "Longitude: " + data.coord.lon,
            "Sunrise: " + convertUTCToTime(data.sys.sunrise), 
            "Sunset: " + convertUTCToTime(data.sys.sunset)
        ]
    }

    const atmosphereCard = {
        cardTitle: "Atmosphere",
        cardItems: [
            "Wind Speed: " + data.wind.speed,
            "Wind Direction: " + data.wind.deg,
            "Pressure: " + data.main.pressure,
            "Visibility: " + data.visibility,
            "Cloudiness: " + data.clouds.all
        ]
    }

    cards.cards.push(timeZoneCard);
    cards.cards.push(weatherCard);
    cards.cards.push(atmosphereCard);

    return cards;
}