"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.urlencoded({ extended: true }));
const port = 3000;
let countries = {};
let cityCountry = [];
let userLocationData = "";
app.use(express_1.default.static('public'));
app.set("view engine", "ejs");
app.get("/", (_req, _res) => {
    console.log("The IP address is: ");
    console.log(_req.socket.remoteAddress);
    const ipApiURL = "http://ip-api.com/json/" + "24.48.0.1";
    http_1.default.get(ipApiURL, (ipResponse) => {
        console.log(ipResponse.statusCode);
        let responseData = "";
        ipResponse.on("data", (data) => {
            responseData += data;
        });
        ipResponse.on("end", () => {
            userLocationData = JSON.parse(responseData);
            console.log(userLocationData.country);
            console.log(userLocationData.city);
            const apiKey = "APIKEYHERE";
            const url = "https://api.openweathermap.org/data/2.5/weather?q=" + userLocationData.city + "&appid=" + apiKey + "&units=imperial";
            https_1.default.get(url, (weatherResponse) => {
                weatherResponse.on("data", (data) => {
                    const weatherData = JSON.parse(data);
                    console.log("The weather in " + userLocationData.city + " is " + weatherData.main.temp);
                });
                weatherResponse.on("end", () => {
                    const geoURL = "https://macrostrat.org/api/geologic_units/map?lat=40.0861000&lng=-105.9394600";
                    https_1.default.get(geoURL, (geoResponse) => {
                        geoResponse.on("data", (data) => {
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
app.listen(port, () => {
    const countriesNowURL = "https://countriesnow.space/api/v0.1/countries";
    https_1.default.get(countriesNowURL, (response) => {
        console.log(response.statusCode);
        let responseData = "";
        response.on("data", (data) => {
            responseData += data;
        });
        response.on("end", () => {
            countries = JSON.parse(responseData);
            countries.data.forEach((obj) => {
                for (let i = 0; i < obj.cities.length; i++) {
                    cityCountry.push(obj.cities[i] + ", " + obj.country);
                }
            });
        });
    });
});
//# sourceMappingURL=server.js.map