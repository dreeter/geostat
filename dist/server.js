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
let cityCountry = [];
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
function formatInformation(data) {
    const info = [
        {
            cardTitle: "Weather",
            listItemOne: "Temperature: " + data[1].main.temp,
            listItemTwo: "Description: " + data[1].weather.description
        }
    ];
    return info;
}
function getInformation(ipAddress, city, country, lat, lon) {
    return __awaiter(this, void 0, void 0, function* () {
        let ipInfo = {};
        if (ipAddress !== "") {
            const ipURL = "http://ip-api.com/json/" + ipAddress;
            ipInfo = (yield getAPIInfo(ipURL, "http"));
            city = ipInfo.city;
            country = ipInfo.country;
            lat = ipInfo.lat;
            lon = ipInfo.lon;
        }
        const apiKey = "APIKEYHERE";
        const weatherURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&userCountry=" + country + "&appid=" + apiKey + "&units=imperial";
        const weatherInfo = yield getAPIInfo(weatherURL, "https");
        if (lat === 0 && lon === 0) {
            lat = weatherInfo.coord.lat;
            lon = weatherInfo.coord.lon;
        }
        const geoURL = "https://macrostrat.org/api/geologic_units/map?lat=" + lat + "&lng=" + lon;
        const geoInfo = yield getAPIInfo(geoURL, "https");
        return [ipInfo, weatherInfo, geoInfo];
    });
}
app.get("/", (_req, _res) => {
    let ipAddress = _req.socket.remoteAddress;
    ipAddress = "24.48.0.1";
    if (ipAddress) {
        getInformation(ipAddress)
            .then((_data) => {
            console.log(_data);
            const info = formatInformation(_data);
            _res.render("home", { info: info });
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
    getInformation(ipAddress, city, country, lat, lon)
        .then((data) => {
        console.log(data);
        let info = formatInformation(data);
        _res.render("home", { info: info });
    })
        .catch((error) => {
        console.log("There was an error: " + error);
    });
});
app.listen(port, () => {
    const countriesNowURL = "https://countriesnow.space/api/v0.1/countries";
    getAPIInfo(countriesNowURL, "https")
        .then((data) => {
        data.data.forEach((obj) => {
            for (let i = 0; i < obj.cities.length; i++) {
                const input = obj.cities[i] + "," + obj.country;
                cityCountry.push(_.replace(input, "\s", ""));
            }
        });
    })
        .catch((error) => {
        console.log(error);
    });
});
//# sourceMappingURL=server.js.map