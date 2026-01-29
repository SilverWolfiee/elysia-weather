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
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        )
    const data : any = await response.json()
    const cw = data.current_weather
    const weather = mapWeatherCode(cw.weathercode, cw.is_day === 1)
    console.log(`Return data for ${lat} ${lon}`)
    return {
        temperature : Math.round(cw.temperature),
        condition : weather.condition,
        theme : weather.theme,
        isDay:cw.is_day === 1
        
    }
    
},
    {
        query: t.Object({
            lat : t.String(),
            lon : t.String()
        })
    })

    
    app.listen(23000)

function mapWeatherCode(code: number, isDay: boolean) {
    const suffix = isDay ? 'day' : 'night';
    
    // 0 = Clear, 1-3 = Cloudy, 51-67 = Rain, 95+ = Storm
    if (code === 0) return { condition: 'Clear sky', theme: `sunny-${suffix}` }
    if (code <= 3) return { condition: 'Partially Cloudy', theme: `cloudy-${suffix}` }
    if (code >= 51 && code <= 67) return { condition: 'Rainy', theme: `rainy-${suffix}` }
    if (code >= 95) return { condition: 'Thunderstorm', theme: `storm-${suffix}` }
    
    return { condition: 'Overcast', theme: `overcast-${suffix}` }
    
}

console.log(`Elysia is listening at 23000`);
