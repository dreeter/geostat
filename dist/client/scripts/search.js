import * as util from "/util.js"

export const searchInfo = {
    city: "",
    state: ""
}

let searchableLocations = [];
let searchStrings = [];

export async function setSearchableLocations(){
    // fetch all searchable locations for the search-bar
    const locationInfo = await getLocations();
    searchableLocations = locationInfo.locations; 
    searchableLocations.forEach((location) => {
        searchStrings.push(location.cityState);
    });
}


export async function search(event) {

    event.preventDefault();

    if(event.target.nodeName === "BUTTON"){

        document.getElementById("location-search-input").value = event.target.innerText;

    } else if (event.target.nodeName === "A") {

        document.getElementById("location-search-input").value = event.target.innerText;

    }

    const searchInput = document.getElementById("location-search-input").value.split(",");

    const city = searchInput[0];
    const state = searchInput[1];

    await displaySearchData(city, state);

    setSearchInfo(city, state);

    resetSearch();
}


function resetSearch(){
    document.getElementById("search-form").reset();
    document.getElementById("search-items").innerHTML = "";
}

export async function displaySearchData(city, state){
    const userWeatherInfo = await getWeatherInfo(city, state);
    const weatherCards = formatWeatherInfo(userWeatherInfo);
    document.getElementById("location-container").innerHTML = await util.renderMustacheTemplate("card.mustache", weatherCards);

    const userGeologyInfo = await getGeologyInfo(userWeatherInfo.coord.lat, userWeatherInfo.coord.lon);
    const geologyCards = formatGeologyInfo(userGeologyInfo);
    document.getElementById("geology-container").innerHTML = await util.renderMustacheTemplate("geocard.mustache", geologyCards);
}

function autocompleteMatch(input) {

  const regex = new RegExp(input)

  return searchStrings.filter(function(location) {
	  if (location.match(regex)) {
  	    return location;
	  }
  });

}

export async function showSearchResults(event) {

    console.log("Called");

    const input = this.value;

    console.log(this.value);

    let results = [];

    if(input.length > 3){

        let matches = autocompleteMatch(input);
        for (let i = 0; i < Math.min(matches.length, 4); i++) {
            
            results.push(matches[i]);
        }
    }

    console.log(results);

    document.getElementById("search-items").innerHTML = await util.renderMustacheTemplate("searchItem.mustache", {searchItems: results});

}

export function setSearchInfo(city, state){

    searchInfo.city = city;
    searchInfo.state = state;

}


export async function updateWeatherInfo(){

    const userWeatherInfo = await getWeatherInfo(searchInfo.city, searchInfo.state, searchInfo.latitude, searchInfo.longitude);
    const weatherCards = formatWeatherInfo(userWeatherInfo);
    document.getElementById("location-container").innerHTML = await util.renderMustacheTemplate("card.mustache", weatherCards);
}

async function getWeatherInfo(city, country){

    const url = "http://localhost:3000/weather?" + new URLSearchParams({
        city: city,
        country: country
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

async function getLocations(){

    const response = await fetch("http://localhost:3000/locations");

    const locations = await response.json();

    return locations;
}


export function formatWeatherInfo(data) {

    let cards = {
        cards: []
    };

    const weatherCard = {
        cardTitle: "Weather",
        cardImage: "http://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png",
        cardItems: [
            data.weather[0].description, 
            "Temperature: " + data.main.temp + " F",
            "Temp-Minimum: " + data.main.temp_min + " F",
            "Temp-Maximum: " + data.main.temp_max + " F",
            "Humidity : " + data.main.humidity + "%"
        ]
    }



    const timeZoneCard = {
        cardTitle: "Time-Zone",
        cardImage: "/location.png",
        cardItems: [
            data.name + ", " + data.sys.country,
            "Latitude: " + data.coord.lat,
            "Longitude: " + data.coord.lon,
            "Sunrise: " + util.convertUTCToTime(data.sys.sunrise), 
            "Sunset: " + util.convertUTCToTime(data.sys.sunset)
        ]
    }

    const atmosphereCard = {
        cardTitle: "Atmosphere",
        cardImage: "/barometer.png",
        cardItems: [
            "Wind Speed: " + data.wind.speed + " mph",
            "Wind Direction: " + data.wind.deg + " degrees",
            "Pressure: " + data.main.pressure + " hPa",
            "Visibility: " + data.visibility + " meters",
            "Cloudiness: " + data.clouds.all + "%"
        ]
    }

    cards.cards.push(timeZoneCard);
    cards.cards.push(weatherCard);
    cards.cards.push(atmosphereCard);

    return cards;
}


export function formatGeologyInfo(data) {

    let cards = {
        cards: []
    };

    const unitCard = {
        cardTitle: "Geology",
        cardImage: "/rock.png",
        cardItems: [
            "Unit Name: " + data.success.data[0].name,
            "Lithology: " + data.success.data[0].lith,
            "Top-Age: " + data.success.data[0].t_int_age,
            "Bottom-Age: " + data.success.data[0].b_int_age,
            "Description: " + data.success.data[0].descrip
        ]
    }


    cards.cards.push(unitCard);

    return cards;
}
