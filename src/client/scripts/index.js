"use strict";

import * as util from "/util.js";

const searchInfo = {
    city: "",
    state: "",
    latitude: "",
    longitude: ""
}

let searchableLocations = [];
let searchStrings = [];



document.addEventListener("DOMContentLoaded", async ()=>{

    // An initial one time AJAX request for the client's city/state/lat/lon so current location's weather and geology is displayed
    const userLocationInfo = await getUserLocationInfo();
    setSearchInfo(userLocationInfo.city, userLocationInfo.region, userLocationInfo.lat, userLocationInfo.lon);

    await displaySearchData(userLocationInfo.city, userLocationInfo.region, userLocationInfo.lat, userLocationInfo.lon);

    // set weather information for the current search to update automatically
    window.setInterval(updateWeatherInfo, 20000);


    // fetch all searchable locations for the search-bar
    const locationInfo = await getLocations();
    searchableLocations = locationInfo.locations; 
    searchableLocations.forEach((location) => {
        searchStrings.push(location.cityState);
        console.log(location.cityState);
    });


    document.getElementById("location-search-input").addEventListener("keyup", showSearchResults);
    document.getElementById("search-form").addEventListener("submit", search);
    document.getElementById("search-items").addEventListener("click", search);
    //document.getElementById("my-locations").addEventListener("click", showLocations);

    
    //set a cookie with a stored location
    //document.cookie = "location=New York, NY";

    // console.log(document.cookie);

    // let locationCookie = document.cookie.split("=");

    // let location = locationCookie[1].split(",");

    // let city = location[0];
    // let state = location[1];


    // searchInfo.city = city;
    // searchInfo.state = state;

});



////////////////////////
// SEARCH FUNCTIONALITY
////////////////////////
async function search(event) {

    event.preventDefault();

    if(event.target.nodeName === "BUTTON"){

        document.getElementById("location-search-input").value = event.target.innerText;
    }

    const searchInput = document.getElementById("location-search-input").value.split(",");

    console.log(searchInput);

    const city = searchInput[0];
    const state = searchInput[1];

    await displaySearchData(city, state, 0, 0);

    searchInfo.city = city;
    searchInfo.state = state;

    resetSearch();
}


function resetSearch(){
    document.getElementById("search-form").reset();
    document.getElementById("search-items").innerHTML = "";
}

async function displaySearchData(city, state, latitude, longitude){
    const userWeatherInfo = await getWeatherInfo(city, state, latitude, longitude);
    const userGeologyInfo = await getGeologyInfo(userWeatherInfo.coord.lat, userWeatherInfo.coord.lon);

    //Format the data recieved from the weather and geology apis
    const weatherCards = formatWeatherInfo(userWeatherInfo);
    const geologyCards = formatGeologyInfo(userGeologyInfo);

    console.log(weatherCards);
    console.log(geologyCards);

    document.getElementById("location-container").innerHTML = await util.render("card.mustache", weatherCards);
    
    document.getElementById("geology-container").innerHTML = await util.render("geocard.mustache", geologyCards);
}

function autocompleteMatch(input) {

  const regex = new RegExp(input)

  return searchStrings.filter(function(location) {
	  if (location.match(regex)) {
  	    return location;
	  }
  });

}

async function showSearchResults(event) {

    const input = this.value;

    let results = [];

    if(input.length > 3){

        let matches = autocompleteMatch(input);
        for (let i = 0; i < Math.min(matches.length, 4); i++) {
            
            results.push(matches[i]);
        }
    }

    document.getElementById("search-items").innerHTML = await util.render("searchItem.mustache", {searchItems: results});

}

function setSearchInfo(city, state, lat, lon){

    searchInfo.city = city;
    searchInfo.state = state;
    searchInfo.latitude = lat;
    searchInfo.longitude = lon;

}


async function updateWeatherInfo(){

    const userWeatherInfo = await getWeatherInfo(searchInfo.city, searchInfo.state, searchInfo.latitude, searchInfo.longitude);
    const weatherCards = formatWeatherInfo(userWeatherInfo);
    document.getElementById("location-container").innerHTML = await util.render("card.mustache", weatherCards);
}




async function getLocations(){

    const response = await fetch("http://localhost:3000/locations");

    const locations = await response.json();

    return locations;
}


async function getUserLocationInfo(){

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


