import {Elysia, t} from "elysia"
import os from "os"
import {cors} from '@elysiajs/cors'
if(os.platform() === "win32"){
    console.log("Here's a nickel kid, GET YOURSELF A REAL OS AND STOP USING WINSLOP")
    process.exit(1);
}

const app = new Elysia();

app.use(cors())
// get weather data
app.get('/weather', async({query})=>{
    const {lat, lon} = query 
    const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=precipitation_probability`
        )
    const data : any = await response.json()
    const cw = data.current_weather
    const now = new Date()
    const currentHourIndex = data.hourly.time.findIndex((t: string) => new Date(t) >= now);
    const startIndex = currentHourIndex !== -1 ? currentHourIndex : 0;
    const next24Hours = data.hourly.time.slice(startIndex, startIndex + 24).map((timeStr: string, i: number) => {
        return {
            time: new Date(timeStr).getHours() + ":00", // Format as "13:00"
            chance: data.hourly.precipitation_probability[startIndex + i]
        }
    });
    const weather = mapWeatherCode(cw.weathercode, cw.is_day === 1)
    console.log(`Return data for ${lat} ${lon}`)
    return {
        temperature : Math.round(cw.temperature),
        condition : weather.condition,
        theme : weather.theme,
        isDay:cw.is_day === 1,
        forecast :next24Hours
        
    }
    
},
    {
        query: t.Object({
            lat : t.String(),
            lon : t.String()
        })
    })

    
    

function mapWeatherCode(code: number, isDay: boolean) {
    // const suffix = 'night' 
    const suffix = isDay ? 'day' : 'night';
    
    // 0: Clear Sky
    if (code === 0) {
        console.log(`condition : clear sky-${suffix}`)
        return { condition: 'Clear Sky', theme: `clear-${suffix}` }
    }

    //Partially Cloudy (Mainly clear, partly cloudy)
    if (code === 1 || code === 2) {
        console.log(`condition : partially-cloudy-${suffix}`)
        return { condition: 'Partially Cloudy', theme: `partially-cloudy-${suffix}` }
    }

    // Overcast 
    if (code === 3 || code === 45 || code === 48) {
        console.log(`condition : overcast-${suffix}`)
        return { condition: 'Overcast', theme: `overcast-${suffix}` }
    }

    // 51-67, 80-82: Rainy
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
        console.log(`condition : Rainy-${suffix}`)
        return { condition: 'Rainy', theme: `rainy-${suffix}` }
    }

    // 71-77, Snowy(map to rainy temporarily)
    if (code >= 71 && code <= 77) {
        console.log(`condition : Rainy-${suffix}`)
        return { condition: 'Rainy', theme: `rainy-${suffix}` } // or make a "Snowy" later
    }

    // 95-99: Thunderstorm
    if (code >= 95) {
        console.log(`condition : Thunderstorm-${suffix}`)
        return { condition: 'Thunderstorm', theme: `Thunderstorm-${suffix}` }
    }

    // Default Fallback
    console.log(`condition : default-${suffix}`)
    return { condition: 'Sunny', theme: `overcast-${suffix}` }
    // console.log(`condition : partially-cloudy-${suffix}`)
    // return { condition: 'Partially Cloudy', theme: `partially-cloudy-${suffix}` }
}

app.listen({
    port: 23000,
    hostname: '0.0.0.0'
}, () => {
    console.log(`Elysia is listening on 23000`);
});