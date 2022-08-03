import express from "express";
import bodyParser from "body-parser";
import https from "https";
import { IncomingMessage } from "http";
import * as http from "http";
import * as _ from "lodash";

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

const port: number = 3000;

// type Countries = {
//     error: boolean;
//     msg: string;
//     data: [{
//         iso2: string;
//         iso3: string;
//         country: string;
//         cities: [string];
//     }]
// }

type IPInfo = {
   status: string,
   country: string,
   countryCode: string,
   region: string,
   regionName: string,
   city: string,
   zip: string,
   lat: number,
   lon: number,
   timezone: string,
   isp: string,
   org: string,
   as: string,
   query: string
}

// type Location = {
//     city: string,
//     country: string,
//     lat: number,
//     lng: number
// }

// type Weather = {
//     main: {
//         temp: number,
//         feels_like: number,
//         temp_min: number,
//         temp_max: number,
//         pressure: number,
//         humidity: number
//     }
// }

// type GeoInfo = {
//     name: string
// }


// let countries = {} as Countries;



type CityCountry = string[];

// type UserInfo = {
//     city: string,
//     country: string,
//     latitude: number,
//     longitude: number
// }

//declare a type for UserWeather

//declare a a type for UserGeology

// let userInfo = {} as UserInfo;
let cityCountry = [] as CityCountry;



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

function formatInformation(data:any): any{

    //data contains an array of objects, function will return an array of objects
    //representing each card to be sent to the front-end

    const info = [
        {
            cardTitle: "Weather",
            listItemOne: "Temperature: " + data[1].main.temp,
            listItemTwo: "Description: " + data[1].weather.description

        }
    ];

    return info;

}

//retrieves all information for each API
async function getInformation(ipAddress: string, city?:string, country?:string, lat?:number, lon?:number){

    let ipInfo: IPInfo = {} as IPInfo;

    //API Call to ip-api if ip-based search supplied
    if(ipAddress !== ""){
        const ipURL:string = "http://ip-api.com/json/" + ipAddress;
        ipInfo = await getAPIInfo(ipURL, "http") as IPInfo;

        city = ipInfo.city;
        country = ipInfo.country;
        lat = ipInfo.lat;
        lon = ipInfo.lon;
    }

    //API Call to OpenWeatherMap
    const apiKey = "APIKEYHERE"
    const weatherURL:string = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&userCountry=" + country + "&appid=" + apiKey + "&units=imperial";
    const weatherInfo: any = await getAPIInfo(weatherURL, "https");

    if(lat === 0 && lon === 0){
        lat = weatherInfo.coord.lat;
        lon = weatherInfo.coord.lon;
    }

    //API Call to Macrostrat (Geology)
    const geoURL = "https://macrostrat.org/api/geologic_units/map?lat=" + lat + "&lng=" + lon;
    const geoInfo: any = await getAPIInfo(geoURL, "https");

    return [ipInfo, weatherInfo, geoInfo];
}


app.get("/", (_req: express.Request, _res: express.Response)=>{

    //TODO: if we already have the information for the user's current location, make no calls and return it

    let ipAddress = _req.socket.remoteAddress;
    ipAddress = "24.48.0.1";

    if(ipAddress){

        getInformation(ipAddress)
            .then((_data)=>{
                console.log(_data);
                //format the data and render
                const info:any = formatInformation(_data);
                _res.render("home", {info: info});
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

    getInformation(ipAddress, city, country, lat, lon)
        .then((data)=>{
            console.log(data);
            let info = formatInformation(data);
            _res.render("home", {info: info});
        })
        .catch((error)=>{
            console.log("There was an error: " + error);
        });
});

app.listen(port, ()=>{

    //API call to countriesnow api to get all countries/cities
    const countriesNowURL: string = "https://countriesnow.space/api/v0.1/countries"
    getAPIInfo(countriesNowURL, "https")
        .then((data: any)=>{
            data.data.forEach((obj:any)=>{
                
                for(let i = 0; i < obj.cities.length; i++){
                    const input = obj.cities[i] + "," + obj.country;
                    cityCountry.push(_.replace(input, "\s", ""));
                }

            });
        })
        .catch((error)=>{
            console.log(error);
        });

});