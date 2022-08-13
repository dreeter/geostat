

function convertUTCToTime(UTCDate){

    const date = new Date();

    date.setUTCSeconds(UTCDate);

    return date.toTimeString().substring(0, 17);


}

export function formatWeatherInfo(data) {

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


export async function render(templateFile, value){

    const template = await getTemplate(templateFile);
    const rendered = Mustache.render(template, value);

    return rendered;
}

async function getTemplate(file){

    const response = await fetch(file);

    const template = await response.text();

    return template;

}