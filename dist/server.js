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
app.use(express_1.default.static('public'));
app.set("view engine", "ejs");
function getIPInfo(ipAddress) {
    return new Promise((resolve, reject) => {
        ipAddress = "24.48.0.1";
        const url = "http://ip-api.com/json/" + ipAddress;
        http_1.default.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject("Invalid Response Code: " + response.statusCode);
            }
            let responseData = "";
            response.on("data", (data) => {
                responseData += data;
            });
            response.on("end", () => {
                const ipInfo = JSON.parse(responseData);
                resolve(ipInfo);
            });
        });
    });
}
function getWeatherInfo(data) {
    return new Promise((resolve, reject) => {
        const apiKey = "c0b5e29a902014b259dad2f832ededd7";
        const userCity = data.city;
        const userCountry = data.country;
        const url = "https://api.openweathermap.org/data/2.5/weather?q=" + userCity + "&userCountry=" + userCountry + "&appid=" + apiKey + "&units=imperial";
        https_1.default.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject("Invalid Response Code: " + response.statusCode);
            }
            let responseData = "";
            response.on("data", (data) => {
                responseData += data;
            });
            response.on("end", () => {
                const jsonWeatherData = JSON.parse(responseData);
                const weatherInfo = jsonWeatherData.main;
                resolve(weatherInfo);
            });
        });
    });
}
function getGeoInfo(data) {
    return new Promise((resolve, reject) => {
        const lat = data.lat;
        const lng = data.lon;
        const geoURL = "https://macrostrat.org/api/geologic_units/map?lat=" + lat + "&lng=" + lng;
        https_1.default.get(geoURL, (response) => {
            if (response.statusCode !== 200) {
                reject("Invalid Response Code: " + response.statusCode);
            }
            let responseData = "";
            response.on("data", (data) => {
                responseData += data;
            });
            response.on("end", () => {
                const geoData = JSON.parse(responseData);
                const geoInfo = geoData.success.data[0].name;
                resolve(geoInfo);
            });
        });
    });
}
app.get("/", (_req, _res) => {
    const ipAddress = _req.socket.remoteAddress;
    if (ipAddress) {
        getIPInfo(ipAddress).then((data) => {
            return Promise.all([getWeatherInfo(data), getGeoInfo(data)]);
        }).then((values) => {
            console.log("Final results: ");
            console.log(values);
        }).catch((err) => {
            console.dir(err);
        });
    }
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