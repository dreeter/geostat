import express from "express";
import bodyParser from "body-parser";
import https from "https";
import { IncomingMessage } from "http";
import { WeatherInfo, GeoInfo} from "./types"
import * as fs from "fs";

let locations: Location[] = [] as Location[];

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

const port: number = 3000;

//retrieves a response parsed to JSON
function getAPIInfo(url:string){
    
    return new Promise((resolve, reject)=>{

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

    });

}

app.get("/weather", async (_req, _res)=>{

    //Endpoint for weather information at a city and state

    const city: string = String(_req.query.city);
    const state: string = String(_req.query.state);

    const apiKey: string = "APIKEYHERE"
    const weatherURL:string = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "," + state + "&appid=" + apiKey + "&units=imperial";

    const weatherInfo: WeatherInfo = await getAPIInfo(weatherURL) as WeatherInfo;

    _res.send(JSON.stringify(weatherInfo));

});


app.get("/geology", async (_req, _res)=>{

    //Endpoint for geologic unit information at a given latitude and longitude

    const latitude: string = String(_req.query.latitude);
    const longitude: string = String(_req.query.longitude);

    const geoURL: string = "https://macrostrat.org/api/geologic_units/map?lat=" + latitude + "&lng=" + longitude + "&scale=medium";
    const geoInfo: GeoInfo = await getAPIInfo(geoURL) as GeoInfo;

    _res.send(JSON.stringify(geoInfo));

});

app.get("/locations", async (_req, _res)=>{

    //Read and send file data of all searchable locations
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
app.use(express.static(__dirname + "/../../dist/client/templates"));



app.get("/", (_req: express.Request, _res: express.Response)=>{
    //Client will request everything it needs based on statically served files
});

app.listen(port, ()=>{
    //Server is listening
});

