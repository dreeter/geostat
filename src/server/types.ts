
export type IPInfo = {
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

 export type WeatherInfo = {
    coord: {
        lon: number,
        lat: number
    },
    weather: [
        {
            id: number,
            main: string,
            description: string,
            icon: string
        }
    ],
    base: string,
    main: {
        temp: number,
        feels_like: number,
        temp_min: number,
        temp_max: number,
        pressure: number,
        humidity: number
    },
    visibility: number,
    wind: {
        speed: number,
        deg: number,
        gust: number
    },
    clouds: {
        all: number
    },
    dt: number,
    sys: {
        type: number,
        id: number,
        country: string,
        sunrise: number,
        sunset: number
    },
    timezone: number,
    id: number,
    name: string,
    cod: number
}

export type GeoInfo = {
    success: {
        v: number,
        license: string,
        data: [
            {
                map_id: number,
                source_id: number,
                name: string,
                strat_name: string,
                lith: string,
                descrip: string,
                comments: string,
                macro_units: string[],
                strat_names: string[],
                liths: number[],
                t_int_id: number,
                t_int_age: number,
                t_int_name: string,
                b_int_id: number,
                b_int_age: number,
                b_int_name: string,
                color: string,
                t_age: number,
                b_age: number,
                best_int_name: string
            }
        ],
        refs: {
            7: string,
            133: string,
            154: string
        }
    }
}

export type LithologyInfo = {
    success: {
        v: number,
        license: string,
        data: [
            {
                lith_id: number,
                name: string,
                type: string,
                group: string,
                class: string,
                color: string,
                fill: number,
                t_units: number
            }
        ]
    }
}

 export type Location = {
        cityState: string,
        city: string,
        state: string,
        country: string
 }
