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
const app = (0, express_1.default)();
app.use(body_parser_1.default.urlencoded({ extended: true }));
const port = 3000;
let locations = [];
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
app.get("/weather", (_req, _res) => __awaiter(void 0, void 0, void 0, function* () {
    const city = String(_req.query.city);
    const country = String(_req.query.country);
    const apiKey = "APIKEYHERE";
    const weatherURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "," + country + "&appid=" + apiKey + "&units=imperial";
    const weatherInfo = yield getAPIInfo(weatherURL, "https");
    console.log("The weather info: ", weatherInfo);
    _res.send(JSON.stringify(weatherInfo));
}));
app.get("/geology", (_req, _res) => __awaiter(void 0, void 0, void 0, function* () {
    const latitude = _req.query.latitude;
    const longitude = _req.query.longitude;
    const geoURL = "https://macrostrat.org/api/geologic_units/map?lat=" + latitude + "&lng=" + String(longitude);
    const geoInfo = yield getAPIInfo(geoURL, "https");
    _res.send(JSON.stringify(geoInfo));
}));
app.get("/locations", (_req, _res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = {
        locations: locations
    };
    _res.send(JSON.stringify(response));
}));
app.use(express_1.default.static('public'));
app.get("/", (_req, _res) => {
    _res.send();
});
app.listen(port, () => {
    const countriesNowURL = "https://countriesnow.space/api/v0.1/countries/";
    getAPIInfo(countriesNowURL, "https")
        .then((data) => {
        data.data.forEach((location) => {
            for (let i = 0; i < location.cities.length; i++) {
                const locationToInsert = {
                    city: location.cities[i],
                    country: location.country,
                    iso2: location.iso2,
                    iso3: location.iso3
                };
                locations.push(locationToInsert);
            }
        });
    })
        .catch((error) => {
        console.log(error);
    });
});
//# sourceMappingURL=server.js.map