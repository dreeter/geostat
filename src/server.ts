import express from "express";
import bodyParser from "body-parser";
import https from "https";
import { IncomingMessage } from "http";
import http from "http";

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

const port: number = 3000;

type Countries = {
    error: boolean;
    msg: string;
    data: [{
        iso2: string;
        iso3: string;
        country: string;
        cities: [string];
    }]
}

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

type Weather = {
    main: {
        temp: number,
        feels_like: number,
        temp_min: number,
        temp_max: number,
        pressure: number,
        humidity: number
    }
}

type GeoInfo = {
    name: string
}


let countries = {} as Countries;

let cityCountry: string[] = [];


app.use(express.static('public'));

app.set("view engine", "ejs");


//function for getting data from an api
function getIPInfo(ipAddress: string){
        
    return new Promise((resolve, reject)=>{

        //_req.socket.remoteAddress

        ipAddress = "24.48.0.1";

        const url = "http://ip-api.com/json/" + ipAddress;
        http.get(url, (response: IncomingMessage)=>{

            if(response.statusCode !== 200){
                reject("Invalid Response Code: " + response.statusCode);
            }

            let responseData: any = "";

            response.on("data", (data: any)=>{
                responseData += data;
            });

            response.on("end", ()=>{
                const ipInfo: IPInfo = JSON.parse(responseData);

                resolve(ipInfo);
            });

        });

    });

}


function getWeatherInfo(data: IPInfo){

    return new Promise((resolve, reject)=>{

         //Query openweathermap's api using the city, country gathered from ip-api
         const apiKey = "APIKEYHERE"
         const userCity: string = data.city;
         const userCountry: string = data.country;
         const url = "https://api.openweathermap.org/data/2.5/weather?q=" + userCity + "&userCountry=" + userCountry + "&appid=" + apiKey + "&units=imperial";

         https.get(url, (response: IncomingMessage)=> {

            if(response.statusCode !== 200){
                reject("Invalid Response Code: " + response.statusCode);
            }

            let responseData: any = "";

             response.on("data", (data: any)=>{
                 responseData += data;
             });

             response.on("end", ()=>{

                const jsonWeatherData: any= JSON.parse(responseData);

                const weatherInfo: Weather = jsonWeatherData.main;

                resolve(weatherInfo);            

             });

         });  

    });

}

function getGeoInfo(data: IPInfo){

    return new Promise((resolve, reject)=>{

        const lat = data.lat;
        const lng = data.lon;

        const geoURL = "https://macrostrat.org/api/geologic_units/map?lat=" + lat + "&lng=" + lng;
        https.get(geoURL, (response: IncomingMessage)=>{

            if(response.statusCode !== 200){
                reject("Invalid Response Code: " + response.statusCode);
            }

            let responseData: any = "";

            response.on("data", (data: any)=>{
                responseData += data;
            });

            response.on("end", ()=>{

                const geoData = JSON.parse(responseData);

                const geoInfo: GeoInfo = geoData.success.data[0].name;

                resolve(geoInfo);
            });

        });

    });

}


app.get("/", (_req: express.Request, _res: express.Response)=>{

    const ipAddress = _req.socket.remoteAddress;

    if(ipAddress){

        //if IP address could be found, we'll get IPInfo (city, country, lat, lng) and use that information to make requests
        //to the openweather and macrostrat APIs
        getIPInfo(ipAddress).then((data: any)=>{
            return Promise.all([getWeatherInfo(data), getGeoInfo(data)]);
    
        }).then((values)=>{
    
            console.log("Final results: ");
            console.log(values);
            //render the page using the weather, geologic, and location information


        }).catch((err) => {
            console.dir(err);
        });
    }

});

app.listen(port, ()=>{

    //Retrieve country/city data from countriesnow api
    const countriesNowURL = "https://countriesnow.space/api/v0.1/countries"

    https.get(countriesNowURL, (response: IncomingMessage)=>{
        console.log(response.statusCode);

        let responseData: any = "";

        response.on("data", (data: any)=>{
            responseData += data;
        });

        response.on("end", ()=> {
            countries = JSON.parse(responseData);

            countries.data.forEach((obj)=>{
                
                for(let i = 0; i < obj.cities.length; i++){
                    cityCountry.push(obj.cities[i] + ", " + obj.country);
                }

            });
        });

    });

});