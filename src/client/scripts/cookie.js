import * as util from "/util.js"

let answeredCookies = false;
let acceptedCookies = false;

function handleCookieResponse(event) {
    answeredCookies = true;

    if(event.target && event.target.nodeName === "BUTTON"){

        if(event.target.id === "cookie-accept-btn"){
            acceptedCookies = true;
        } else {
            acceptedCookies = false;
        }

        document.getElementById("page-container").lastChild.remove();
    } 
}

async function showCookiePopUp() {

    //if user has already accepted or denied cookies, do not show
    if(!answeredCookies){
        const cookieTemplate = document.createElement("template");
        cookieTemplate.innerHTML = await util.renderMustacheTemplate("cookie.mustache", null);
        document.getElementById("page-container").appendChild(cookieTemplate.content);

        document.getElementById("cookie-footer").addEventListener("click", handleCookieResponse);

    }

}

function getCookieLocations(){
    let locations = [];

    if(document.cookie) {

        locations = JSON.parse(document.cookie.split("=")[1]);
    }

    return locations;
}

function setCookieLocations(locations){

    document.cookie = "locations=" + JSON.stringify(locations);
    
}

export {showCookiePopUp, getCookieLocations}