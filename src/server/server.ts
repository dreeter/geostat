import express from "express";
import bodyParser from "body-parser";
import https from "https";
import { IncomingMessage } from "http";
import * as http from "http";
import * as _ from "lodash";
import { WeatherInfo, GeoInfo} from "./types"
import * as fs from "fs";

let locations: Location[] = [] as Location[];

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

const port: number = 3000;

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

app.get("/weather", async (_req, _res)=>{

    const city: string = String(_req.query.city);
    const state: string = String(_req.query.state);

    const apiKey: string = "APIKEYHERE"
    const weatherURL:string = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "," + state + "&appid=" + apiKey + "&units=imperial";

    const weatherInfo: WeatherInfo = await getAPIInfo(weatherURL, "https") as WeatherInfo;

    console.log("The weather info: ", weatherInfo);

    _res.send(JSON.stringify(weatherInfo));

});


app.get("/geology", async (_req, _res)=>{

    const latitude: string = String(_req.query.latitude);
    const longitude: string = String(_req.query.longitude);

    //API Call to Macrostrat (Geology)
    const geoURL: string = "https://macrostrat.org/api/geologic_units/map?lat=" + latitude + "&lng=" + longitude;
    const geoInfo: GeoInfo = await getAPIInfo(geoURL, "https") as GeoInfo;

    console.log("The geology info: ", geoInfo);

    _res.send(JSON.stringify(geoInfo));

});

app.get("/locations", async (_req, _res)=>{

    const data: any = fs.readFileSync(__dirname + "/city-list.json");

    locations = JSON.parse(data);

    const response = {
        locations: locations
    }
    
    _res.send(JSON.stringify(response));

});

app.use(express.static(__dirname + "/../../dist/client/components"));
app.use(express.static(__dirname + "/../../dist/client/css"));
app.use(express.static(__dirname + "/../../dist/client/scripts"));
app.use(express.static(__dirname + "/../../dist/client/images"));
app.use(express.static(__dirname + "/../../dist/client/partials"));



app.get("/", (_req: express.Request, _res: express.Response)=>{

});

app.listen(port, ()=>{

    console.log("Listening");

    // //API call to countriesnow api to get all searchable locations
    // const countriesNowURL: string = "https://countriesnow.space/api/v0.1/countries/"
    // getAPIInfo(countriesNowURL, "https")
    //     .then((data: any)=>{
    //         data.data.forEach((location:any)=>{
                
    //             for(let i = 0; i < location.cities.length; i++){

    //                 const locationToInsert: Location = {
    //                     formatted: location.cities[i] + ", " + location.country,
    //                     city: location.cities[i],
    //                     country: location.country,
    //                     iso2: location.iso2,
    //                     iso3: location.iso3
    //                 }
    //                 if(location.country === "United States") {
    //                     console.log(location.cities[i] + ", " + location.country);
    //                     locations.push(locationToInsert);
    //                     console.log(locations.length);
    //                 }
                    
    //             }

    //         });
    //     })
    //     .catch((error)=>{
    //         console.log(error);
    //     });

});

