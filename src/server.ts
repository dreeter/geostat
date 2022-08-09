import express from "express";
import bodyParser from "body-parser";
import https from "https";
import { IncomingMessage } from "http";
import * as http from "http";
import * as _ from "lodash";
import { Location, WeatherInfo, GeoInfo} from "./types"

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

const port: number = 3000;


let locations: Location[] = [] as Location[];
// let userLocation: Location = {} as Location;
// let userIPInfo: IPInfo = {} as IPInfo;





// app.set("view engine", "ejs");


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
    const country: string = String(_req.query.country);

    const apiKey: string = "APIKEYHERE"
    const weatherURL:string = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "," + country + "&appid=" + apiKey + "&units=imperial";

    const weatherInfo: WeatherInfo = await getAPIInfo(weatherURL, "https") as WeatherInfo;

    console.log("The weather info: ", weatherInfo);

    _res.send(JSON.stringify(weatherInfo));

});


app.get("/geology", async (_req, _res)=>{

    const latitude = _req.query.latitude;
    const longitude = _req.query.longitude;

    //API Call to Macrostrat (Geology)
    const geoURL: string = "https://macrostrat.org/api/geologic_units/map?lat=" + latitude + "&lng=" + String(longitude);
    const geoInfo: GeoInfo = await getAPIInfo(geoURL, "https") as GeoInfo;

    _res.send(JSON.stringify(geoInfo));

});

app.get("/locations", async (_req, _res)=>{

    const response = {
        locations: locations
    }
    
    _res.send(JSON.stringify(response));

});

app.use(express.static('public'));


app.get("/", (_req: express.Request, _res: express.Response)=>{
    _res.send();
});

app.listen(port, ()=>{

    //console.log("Listening on port: ", port);

    //API call to countriesnow api to get all searchable locations
    const countriesNowURL: string = "https://countriesnow.space/api/v0.1/countries/"
    getAPIInfo(countriesNowURL, "https")
        .then((data: any)=>{
            data.data.forEach((location:any)=>{
                
                for(let i = 0; i < location.cities.length; i++){

                    const locationToInsert: Location = {
                        city: location.cities[i],
                        country: location.country,
                        iso2: location.iso2,
                        iso3: location.iso3
                    }

                    //console.log("Pushing a location", locationToInsert);
                    locations.push(locationToInsert)
                }

            });
        })
        .catch((error)=>{
            console.log(error);
        });

});