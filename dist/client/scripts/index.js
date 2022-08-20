"use strict";

import * as locations from "/locations.js";
import * as search from "/search.js";
import * as util from "/util.js";
import * as cookie from "/cookie.js";

document.addEventListener("DOMContentLoaded", async ()=>{

    // Initial one time AJAX request for the client's city/state/lat/lon so current location's weather and geology is displayed
    const userLocationInfo = await getUserLocationInfo();
    search.setSearchInfo(userLocationInfo.city, userLocationInfo.region);
    await search.displaySearchData(userLocationInfo.city, userLocationInfo.region);

    // Weather Information will periodically update automatically
    window.setInterval(search.updateWeatherInfo, 20000);

    // Search functionality initializes
    search.setSearchableLocations();

    // MyLocations functionality intializes
    locations.setMyLocations(cookie.getCookieLocations());

    // EVENT listeners
    document.getElementById("location-search-input").addEventListener("keyup", search.showSearchResults);
    document.getElementById("search-form").addEventListener("submit", search.search);
    document.getElementById("search-items").addEventListener("click", search.search);
    document.getElementById("my-location-items").addEventListener("click", search.search);
    document.getElementById("add-location-btn").addEventListener("click", locations.updateMyLocations);
    document.getElementById("add-location-btn").addEventListener("click", cookie.showCookiePopUp);

});


async function getUserLocationInfo(){

    const response = await fetch("http://ip-api.com/json/");

    const userLocationInfo = await response.json();

    return userLocationInfo;

}





