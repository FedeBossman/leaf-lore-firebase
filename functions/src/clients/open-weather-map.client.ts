import axios from "axios";
import { Weather } from "../features/home-page-info/model/weather.model";
// import { defineSecret } from "firebase-functions/params";

// const openweathermapKey = defineSecret('OPENWEATHERMAP_KEY');

export async function getWeather(cityName: string): Promise<Weather|undefined> {
  const apiKey: string = process.env.OPENWEATHERMAP_KEY!; // openweathermapKey.value();
  const url: string = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;

  let weather;
  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data) {
      console.log(`Weather in ${cityName}:`);
      console.log(`Temperature: ${data.main.temp} Celcius`);
      console.log(`Humidity: ${data.main.humidity}%`);
      console.log(`Description: ${data.weather[0].description}`);
      weather = {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        description: data.weather[0].description,
      };
    }
  } catch (error) {
    console.error("Error fetching weather data from openweathermap:", error);
  } finally {
    return weather;
  }
}
