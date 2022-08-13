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
const fs = __importStar(require("fs"));
let locations = [];
const app = (0, express_1.default)();
app.use(body_parser_1.default.urlencoded({ extended: true }));
const port = 3000;
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
    const state = String(_req.query.state);
    const apiKey = "APIKEYHERE";
    const weatherURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "," + state + "&appid=" + apiKey + "&units=imperial";
    const weatherInfo = yield getAPIInfo(weatherURL, "https");
    console.log("The weather info: ", weatherInfo);
    _res.send(JSON.stringify(weatherInfo));
}));
app.get("/geology", (_req, _res) => __awaiter(void 0, void 0, void 0, function* () {
    const latitude = String(_req.query.latitude);
    const longitude = String(_req.query.longitude);
    const geoURL = "https://macrostrat.org/api/geologic_units/map?lat=" + latitude + "&lng=" + longitude;
    const geoInfo = yield getAPIInfo(geoURL, "https");
    console.log("The geology info: ", geoInfo);
    _res.send(JSON.stringify(geoInfo));
}));
app.get("/locations", (_req, _res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = fs.readFileSync(__dirname + "/city-list.json");
    locations = JSON.parse(data);
    const response = {
        locations: locations
    };
    _res.send(JSON.stringify(response));
}));
app.use(express_1.default.static(__dirname + "/../../dist/client/components"));
app.use(express_1.default.static(__dirname + "/../../dist/client/css"));
app.use(express_1.default.static(__dirname + "/../../dist/client/scripts"));
app.use(express_1.default.static(__dirname + "/../../dist/client/images"));
app.use(express_1.default.static(__dirname + "/../../dist/client/partials"));
app.get("/", (_req, _res) => {
});
app.listen(port, () => {
    console.log("Listening");
});
//# sourceMappingURL=server.js.map