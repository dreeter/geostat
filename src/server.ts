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


let countries = {} as Countries;

let cityCountry: string[] = [];

let userLocationData: any = ""


app.use(express.static('public'));

app.set("view engine", "ejs");

app.get("/", (_req: express.Request, _res: express.Response)=>{

    //render the data retrieved from openweathermap and macrostrat
    //_res.render("home", {cityCountry: cityCountry});

    console.log("The IP address is: ");
    console.log(_req.socket.remoteAddress);

    //Query ip-api.coms geolocation api to retrieve city, country, lat, and longitude
    const ipApiURL = "http://ip-api.com/json/" + "24.48.0.1";
    http.get(ipApiURL, (ipResponse: IncomingMessage)=>{
        console.log(ipResponse.statusCode);

        let responseData: any = "";

        ipResponse.on("data", (data: any)=>{
            responseData += data;
        });

        ipResponse.on("end", ()=>{
            userLocationData = JSON.parse(responseData);

            console.log(userLocationData.country);
            console.log(userLocationData.city);


            //Query openweathermap's api using the city, country gathered from ip-api
            const apiKey = "APIKEYHERE"
            const url = "https://api.openweathermap.org/data/2.5/weather?q=" + userLocationData.city + "&appid=" + apiKey + "&units=imperial";

            https.get(url, (weatherResponse: any)=> {

                weatherResponse.on("data", (data: any)=>{
                    const weatherData = JSON.parse(data);

                    console.log("The weather in " + userLocationData.city + " is " + weatherData.main.temp);

                });

                weatherResponse.on("end", ()=>{
                    
                    //url for macrostrat  https://macrostrat.org/api/geologic_units/map?lat=40.0861000&lng=-105.9394600
                    const geoURL = "https://macrostrat.org/api/geologic_units/map?lat=40.0861000&lng=-105.9394600"
                    https.get(geoURL, (geoResponse:any)=>{

                        geoResponse.on("data", (data:any)=>{
                            
                            const geoData = JSON.parse(data);

                            console.log("Geologic Name: " + geoData.success.data[0].name);

                            _res.write(userLocationData.city);
                            _res.write(geoData.success.data[0].name);
                            _res.send();
                        });

                    });

                });

            });
        });

    });

});


// function getData(url: string){

//     return new Promise((resolve: Function, reject: Function)=>{
//         //fetch something
//         //call resolve() if we get the data back
//         //call reject(error) if we don't get the data back
//         resolve("data");
//     });

// }

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