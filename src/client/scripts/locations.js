import * as util from "/util.js"
import * as search from "/search.js"

let myLocations = [];

function setMyLocations(locations){
    
    myLocations = locations;

    renderMyLocations(myLocations)
}

function getMyLocations() {

    return myLocations;

}

function updateMyLocations(){

    myLocations.push(searchInfo.city + ", " + searchInfo.state);
}

async function renderMyLocations(locations){

    document.getElementById("my-location-items").innerHTML = await util.renderMustacheTemplate("locations.mustache", {locations: locations});  
}




export {setMyLocations, updateMyLocations, getMyLocations}