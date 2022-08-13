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
    document.getElementById("searchItems").addEventListener("click", search);
    document.getElementById("my-locations").addEventListener("click", showLocations);
    
    //set a cookie with a stored location
    //document.cookie = "location=New York, NY";

    console.log(document.cookie);

    let locationCookie = document.cookie.split("=");

    let location = locationCookie[1].split(",");

    let city = location[0];
    let state = location[1];


    searchInfo.city = city;
    searchInfo.state = state;

});

function showLocations(){
    window.alert("Showing locations");
}

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
    document.getElementById("searchItems").innerHTML = "";
}

async function displaySearchData(city, state, latitude, longitude){
    const userWeatherInfo = await getWeatherInfo(city, state, latitude, longitude);
    const userGeologyInfo = await getGeologyInfo(latitude, longitude);

    //Format the data recieved from the weather and geology apis
    const weatherCards = util.formatWeatherInfo(userWeatherInfo);
    //const geologyCards = util.formatGeologyInfo(userGeologyInfo);

    console.log(weatherCards);

    document.getElementById("location-container").innerHTML = await util.render("card.mustache", weatherCards);
    document.getElementById("geology-container").innerHTML = await util.render("card.mustache", weatherCards);
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

    document.getElementById("searchItems").innerHTML = await util.render("searchItem.mustache", {searchItems: results});

}

function setSearchInfo(city, state, lat, lon){

    searchInfo.city = city;
    searchInfo.state = state;
    searchInfo.latitude = lat;
    searchInfo.longitude = lon;

}


async function updateWeatherInfo(){

    const userWeatherInfo = await getWeatherInfo(searchInfo.city, searchInfo.state, searchInfo.latitude, searchInfo.longitude);
    const weatherCards = util.formatWeatherInfo(userWeatherInfo);
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


