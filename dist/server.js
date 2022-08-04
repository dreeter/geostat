"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const https_1 = __importDefault(require("https"));
const http = __importStar(require("http"));
const _ = __importStar(require("lodash"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.urlencoded({ extended: true }));
const port = 3000;
let searchableLocations = [];
let userLocation = {};
let userIPInfo = {};
app.use(express_1.default.static('public'));
app.set("view engine", "ejs");
function getAPIInfo(url, requestType) {
    return new Promise((resolve, reject) => {
        if (requestType === "https") {
            https_1.default.get(url, (response) => {
                if (response.statusCode !== 200) {
                    reject("Invalid Response Code: " + response.statusCode + "from " + url);
                }
                let responseData = "";
                response.on("data", (data) => {
                    responseData += data;
                });
                response.on("end", () => {
                    resolve(JSON.parse(responseData));
                });
            });
        }
        else {
            http.get(url, (response) => {
                if (response.statusCode !== 200) {
                    reject("Invalid Response Code: " + response.statusCode + "from " + url);
                }
                let responseData = "";
                response.on("data", (data) => {
                    responseData += data;
                });
                response.on("end", () => {
                    resolve(JSON.parse(responseData));
                });
            });
        }
    });
}
function convertUTCToTime(UTCDate) {
    const date = new Date();
    date.setUTCSeconds(UTCDate);
    return date.toTimeString().substring(0, 17);
}
function formatWeatherInfo(data) {
    let cards = [];
    const weatherCard = {
        cardTitle: "Weather",
        itemList: [
            data.weather[0].description,
            "Temperature: " + data.main.temp,
            "Temp-Minimum: " + data.main.temp_min,
            "Temp-Maximum: " + data.main.temp_max,
            "Humidity : " + data.main.humidity
        ]
    };
    const timeZoneCard = {
        cardTitle: "Time-Zone",
        itemList: [
            data.name + ", " + data.sys.country,
            "Latitude: " + data.coord.lat,
            "Longitude: " + data.coord.lon,
            "Sunrise: " + convertUTCToTime(data.sys.sunrise),
            "Sunset: " + convertUTCToTime(data.sys.sunset)
        ]
    };
    const atmosphereCard = {
        cardTitle: "Atmosphere",
        itemList: [
            "Wind Speed: " + data.wind.speed,
            "Wind Direction: " + data.wind.deg,
            "Pressure: " + data.main.pressure,
            "Visibility: " + data.visibility,
            "Cloudiness: " + data.clouds.all
        ]
    };
    cards.push(timeZoneCard);
    cards.push(weatherCard);
    cards.push(atmosphereCard);
    return cards;
}
function getAllAPIInfo(ipAddress, city, country, lat, lon) {
    return __awaiter(this, void 0, void 0, function* () {
        if (ipAddress !== "") {
            const ipURL = "http://ip-api.com/json/" + ipAddress;
            userIPInfo = (yield getAPIInfo(ipURL, "http"));
            userLocation.city = userIPInfo.city;
            userLocation.country = userIPInfo.country;
            userLocation.latitude = userIPInfo.lat;
            userLocation.longitude = userIPInfo.lon;
            userLocation.regionName = userIPInfo.regionName;
        }
        const apiKey = "APIKEY";
        const weatherURL = "https://api.openweathermap.org/data/2.5/weather?q=" + (city || String(userLocation.city)) + "&userCountry=" + (country || String(userLocation.country)) + "&appid=" + apiKey + "&units=imperial";
        const weatherInfo = yield getAPIInfo(weatherURL, "https");
        if (lat === 0 && lon === 0) {
            lat = weatherInfo.coord.lat;
            lon = weatherInfo.coord.lon;
        }
        const geoURL = "https://macrostrat.org/api/geologic_units/map?lat=" + (lat || String(userLocation.latitude)) + "&lng=" + (lon || String(userLocation.longitude));
        const geoInfo = yield getAPIInfo(geoURL, "https");
        const apiInfo = { userIPInfo, weatherInfo, geoInfo };
        return apiInfo;
    });
}
app.get("/", (_req, _res) => {
    let ipAddress = _req.socket.remoteAddress;
    ipAddress = "24.48.0.1";
    if (ipAddress) {
        getAllAPIInfo(ipAddress, "", "", 0, 0)
            .then((data) => {
            console.log(data);
            const cards = formatWeatherInfo(data.weatherInfo);
            _res.render("home", { cards: cards });
        })
            .catch((error) => {
            console.log("There was an error: " + error);
        });
    }
});
app.post("/search", (_req, _res) => {
    const ipAddress = "";
    const cityCountryInput = _.replace(_req.body.searchInput, "\s", "");
    const coordInput = _.replace(_req.body.coordInput, "\s", "");
    const cityCountry = cityCountryInput.split(",");
    const city = cityCountry[0];
    const country = cityCountry[1];
    let lat = 0;
    let lon = 0;
    if (coordInput !== "") {
        const coords = coordInput.split(",");
        lat = Number(coords[0]);
        lon = Number(coords[1]);
    }
    getAllAPIInfo(ipAddress, city, country, lat, lon)
        .then((data) => {
        console.log(data);
        const cards = formatWeatherInfo(data.weatherInfo);
        _res.render("home", { cards: cards });
    })
        .catch((error) => {
        console.log("There was an error: " + error);
    });
});
app.listen(port, () => {
    const countriesNowURL = "https://countriesnow.space/api/v0.1/countries";
    getAPIInfo(countriesNowURL, "https")
        .then((data) => {
        data.data.forEach((location) => {
            for (let i = 0; i < location.cities.length; i++) {
                const locationToInsert = {
                    city: location.cities[i],
                    country: location.country
                };
                searchableLocations.push(locationToInsert);
            }
        });
    })
        .catch((error) => {
        console.log(error);
    });
});
//# sourceMappingURL=server.js.map