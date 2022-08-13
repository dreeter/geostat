"use strict";


const searchInfo = {
    city: "",
    state: "",
    latitude: "",
    longitude: ""
}

let searchableLocations = [];
let searchStrings = [];

import * as util from "../utils/util.js";


document.addEventListener("DOMContentLoaded", async ()=>{

    // An initial one time AJAX request for the client's city/state/lat/lon so relevant weather and geology can be given
    // without the need for a user to search.
    const userLocationInfo = await getUserLocationInfo();
    setSearchInfo(userLocationInfo.city, userLocationInfo.region, userLocationInfo.lat, userLocationInfo.lon);

    await displaySearchData(userLocationInfo.city, userLocationInfo.region, userLocationInfo.lat, userLocationInfo.lon);

    // weather information for the current search will update automatically
    window.setInterval(updateWeatherInfo, 20000);


    // fetch all searchable locations for the search-bar
    const locationInfo = await getLocations();
    searchableLocations = locationInfo.locations; 
    searchableLocations.forEach((location) => {
        searchStrings.push(location.cityState);
        console.log(location.cityState);
    });


    document.getElementById("location-search-input").addEventListener("keyup", showResults);


    //search form submission
    document.getElementById("search-form").addEventListener("submit", async (event)=>{

        event.preventDefault();

        let search = document.getElementById("location-search-input").value;

        //value will be enforced at City, Country
        //remove white spaces, split on "," and search on city,country to pass city, ISO2 to the weather api

        let input = search.split(",");

        let city = input[0];
        let state = input[1];

        
        console.log("city: ", city, "state: ", state);

        await displaySearchData(city, state, 0, 0);

        searchInfo.city = city;
        searchInfo.state = state;

        document.getElementById("search-form").reset();
        document.getElementById("searchItems").innerHTML = "";

    });


    document.getElementById("searchItems").addEventListener("click", async (event)=>{
        
        if(event.target && event.target.nodeName === "BUTTON"){
            
            let input = event.target.innerText;

            input = input.split(",");

            let city = input[0];
            let state = input[1];

            await displaySearchData(city, state, 0, 0);
    
            searchInfo.city = city;
            searchInfo.state = state;
    
            document.getElementById("search-form").reset();
            document.getElementById("searchItems").innerHTML = "";

        }
    });
    


});

function formatSearchInput(input){

}

function resetSearch(){
    
}

async function displaySearchData(city, state, latitude, longitude){
    const userWeatherInfo = await getWeatherInfo(city, state, latitude, longitude);
    //const userGeologyInfo = await getWeatherInfo(city, country, 0, 0);

    //Format the data recieved from the weather and geology apis
    const weatherCards = util.formatWeatherInfo(userWeatherInfo);
    //const geologyCards = util.formatGeologyInfo(userGeologyInfo);

    console.log(weatherCards);

    document.getElementById("location-container").innerHTML = await util.render("card.mustache", weatherCards);
    //document.getElementById("geology-container").innerHTML = util.render("card.mustache", geologyCards);
}

function autocompleteMatch(input) {
  if (input === "") {
    return [];
  }
  const reg = new RegExp(input)
  return searchStrings.filter(function(term) {
	  if (term.match(reg)) {
  	    return term;
	  }
  });
}

async function showResults(val) {
  val = this.value;

  let list = [];

  if(val.length > 3){

    let terms = autocompleteMatch(val);
    for (let i=0; i < Math.min(terms.length, 5); i++) {
      list.push(terms[i]);
    }

    console.log("The list ", list);
    document.getElementById("searchItems").innerHTML = await util.render("searchItem.mustache", {searchItems: list});
  } else {
    document.getElementById("searchItems").innerHTML = await util.render("searchItem.mustache", {searchItems: list});
  }

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


