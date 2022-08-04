import express from "express";
import bodyParser from "body-parser";
import https from "https";
import { IncomingMessage } from "http";
import * as http from "http";
import * as _ from "lodash";
import {IPInfo, Location, WeatherInfo, GeoInfo, Card} from "./types"

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

const port: number = 3000;


let searchableLocations: Location[] = [] as Location[];
let userLocation: Location = {} as Location;
let userIPInfo: IPInfo = {} as IPInfo;



app.use(express.static('public'));

app.set("view engine", "ejs");


//retrieves a response parsed to JSON for a given API url and http/s type
function getAPIInfo(url:string, requestType:string){
    
    return new Promise((resolve, reject)=>{

        if(requestType === "https"){
            https.get(url, (response: IncomingMessage)=>{

                if(response.statusCode !== 200){
                    reject("Invalid Response Code: " + response.statusCode + "from " + url);
                }
    
                let responseData: any = "";
    
                response.on("data", (data: any)=>{
                    responseData += data;
                });
    
                response.on("end", ()=>{
    
                    resolve(JSON.parse(responseData));
                });
    
            });

        } else {
            http.get(url, (response: IncomingMessage)=>{

                if(response.statusCode !== 200){
                    reject("Invalid Response Code: " + response.statusCode + "from " + url);
                }
    
                let responseData: any = "";
    
                response.on("data", (data: any)=>{
                    responseData += data;
                });
    
                response.on("end", ()=>{
    
                    resolve(JSON.parse(responseData));
                });
    
            });
        }

    });

}

// function formatGeoInfo(data: GeoInfo): CardInfo[] {

//     //data contains an array of objects, function will return an array of objects
//     //representing each card to be sent to the front-end

//     let cards: CardInfo[] = [];

//     return cards;

// }

function convertUTCToTime(UTCDate:number): string{

    const date = new Date();

    date.setUTCSeconds(UTCDate);

    return date.toTimeString().substring(0, 17);


}

function formatWeatherInfo(data: WeatherInfo): Card[] {

    let cards: Card[] = [];

    const weatherCard: Card = {
        cardTitle: "Weather",
        itemList: [
            data.weather[0].description, 
            "Temperature: " + data.main.temp,
            "Temp-Minimum: " + data.main.temp_min,
            "Temp-Maximum: " + data.main.temp_max,
            "Humidity : " + data.main.humidity 
        ]
    }



    const timeZoneCard: Card = {
        cardTitle: "Time-Zone",
        itemList: [
            data.name + ", " + data.sys.country,
            "Latitude: " + data.coord.lat,
            "Longitude: " + data.coord.lon,
            "Sunrise: " + convertUTCToTime(data.sys.sunrise), 
            "Sunset: " + convertUTCToTime(data.sys.sunset)
        ]
    }

    const atmosphereCard: Card = {
        cardTitle: "Atmosphere",
        itemList: [
            "Wind Speed: " + data.wind.speed,
            "Wind Direction: " + data.wind.deg,
            "Pressure: " + data.main.pressure,
            "Visibility: " + data.visibility,
            "Cloudiness: " + data.clouds.all
        ]
    }

    cards.push(timeZoneCard);
    cards.push(weatherCard);
    cards.push(atmosphereCard);

    return cards;
}

//retrieves all information for each API
async function getAllAPIInfo(ipAddress: string, city?:string, country?:string, lat?:number, lon?:number){

    //API Call to ip-api if ip-based search supplied
    if(ipAddress !== ""){
        const ipURL:string = "http://ip-api.com/json/" + ipAddress;
        userIPInfo = await getAPIInfo(ipURL, "http") as IPInfo;

        userLocation.city = userIPInfo.city;
        userLocation.country = userIPInfo.country;
        userLocation.latitude = userIPInfo.lat;
        userLocation.longitude = userIPInfo.lon;
        userLocation.regionName = userIPInfo.regionName;
    }

    //API Call to OpenWeatherMap
    const apiKey: string = "APIKEY"
    const weatherURL:string = "https://api.openweathermap.org/data/2.5/weather?q=" + (city || String(userLocation.city)) + "&userCountry=" + (country || String(userLocation.country)) + "&appid=" + apiKey + "&units=imperial";
    const weatherInfo: WeatherInfo = await getAPIInfo(weatherURL, "https") as WeatherInfo;

    if(lat === 0 && lon === 0){
        lat = weatherInfo.coord.lat;
        lon = weatherInfo.coord.lon;
    }

    //API Call to Macrostrat (Geology)
    const geoURL: string = "https://macrostrat.org/api/geologic_units/map?lat=" + (lat || String(userLocation.latitude)) + "&lng=" + (lon || String(userLocation.longitude));
    const geoInfo: GeoInfo = await getAPIInfo(geoURL, "https") as GeoInfo;

    const apiInfo = {userIPInfo, weatherInfo, geoInfo};

    return apiInfo;
}


app.get("/", (_req: express.Request, _res: express.Response)=>{

    //TODO: if we already have the information for the user's current location, make no calls and return it

    let ipAddress = _req.socket.remoteAddress;
    ipAddress = "24.48.0.1";

    if(ipAddress){

        getAllAPIInfo(ipAddress, "", "", 0, 0)
            .then((data)=>{
                console.log(data);
                //format the data and render
                const cards: Card[] = formatWeatherInfo(data.weatherInfo);
                _res.render("home", {cards: cards});
            })
            .catch((error)=>{
                console.log("There was an error: " + error);
            });
    }

});

app.post("/search", (_req: express.Request, _res: express.Response)=>{

    const ipAddress = "";

    //TODO: get the search parameters (city, country or lat/lon)
    const cityCountryInput:string = _.replace(_req.body.searchInput, "\s", "");
    const coordInput:string = _.replace(_req.body.coordInput, "\s", "");

    const cityCountry: string[] = cityCountryInput.split(",");
    const city = cityCountry[0];
    const country = cityCountry[1];

    let lat:number = 0;
    let lon:number = 0;

    if(coordInput !== ""){
        const coords: string[] = coordInput.split(",");
        lat = Number(coords[0]);
        lon = Number(coords[1]);
    }

    getAllAPIInfo(ipAddress, city, country, lat, lon)
        .then((data)=>{
            console.log(data);
            const cards: Card[] = formatWeatherInfo(data.weatherInfo);
            _res.render("home", {cards: cards});
        })
        .catch((error)=>{
            console.log("There was an error: " + error);
        });
});

app.listen(port, ()=>{

    //API call to countriesnow api to get all searchable locations
    const countriesNowURL: string = "https://countriesnow.space/api/v0.1/countries"
    getAPIInfo(countriesNowURL, "https")
        .then((data: any)=>{
            data.data.forEach((location:any)=>{
                
                for(let i = 0; i < location.cities.length; i++){

                    const locationToInsert: Location = {
                        city: location.cities[i],
                        country: location.country
                    }

                    searchableLocations.push(locationToInsert)
                }

            });
        })
        .catch((error)=>{
            console.log(error);
        });

});