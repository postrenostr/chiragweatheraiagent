const express = require("express");
const axios = require("axios");
const app = express();
const cors = require("cors"); // Import the CORS package

app.use(express.json());
app.use(cors()); // Use CORS middleware to enable cross-origin requests

// Function to extract JSON object from a string (array version)
function extractJsonArray(str) {
  try {
    // Clean up the string by replacing unwanted characters
    str = str.replace("`", " ").replace("\n", " ").trim();

    // Find the first occurrence of '[' and the last occurrence of ']'
    const startIdx = str.indexOf("{");
    const endIdx = str.lastIndexOf("}") + 1;

    // Extract the potential JSON substring
    const jsonStr = str.substring(startIdx, endIdx).trim();

    // Convert string to JSON object
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error(`JSON decoding error: ${error}`);
    return null;
  }
}

const API_KEY = "e55561d7a056182fdc0fc10bc81fe44b"; // Replace with your actual API key

async function getWeatherByLocation(location) {
  const weatherApiUrl = `http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`;

  try {
    const response = await axios.get(weatherApiUrl);
    const weatherData = response.data;

    console.log("Llama Response Object:", weatherData);
    return `The weather in ${location} is ${weatherData.weather[0].description} with a temperature of ${weatherData.main.temp}°C.`;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return "Sorry, I could not fetch the weather at the moment.";
  }
}

// Method to communicate with Llama 3 API
async function communicateWithLlama(input) {
  try {
    const payload = {
      // model: "llama3",
      prompt: `You are an intelligent assistant that can return weather data by calling a function. If the user asks for the weather for a location, only and only return the JSON object in the format {"method": "getWeatherByLocation", "location": "<location>"} do not return any other single character instead of this JSON Object. For other questions, respond as usual.

      User input: "${input}".
      `,
    };

    const response = await axios.post(
      "https://ai.chiragpgauswami.workers.dev/",
      payload
    );

    if (response.status === 200) {
      response.data.answer = response.data.response;
      return response.data;
    } else {
      return `{"answer": "Sorry! Something went wrong."}`;
    }
  } catch (error) {
    console.error("Error communicating with Llama API:", error);
    return `{"answer": "Sorry! Something went wrong."}`;
  }
}

// Express route to handle requests
app.post("/ask-ai", async (req, res) => {
  const { input } = req.body; // User's question from the request

  try {
    // Get Llama response
    const llamaResponse = await communicateWithLlama(input);

    console.log("str : ", llamaResponse.response);

    let llamaResponseObj = extractJsonArray(llamaResponse.response);

    // Check if the response contains method and location
    if (
      llamaResponseObj !== null &&
      llamaResponseObj.method === "getWeatherByLocation" &&
      llamaResponseObj.location
    ) {
      // Call the weather method if method name and location exist
      const weatherData = await getWeatherByLocation(llamaResponseObj.location);
      res.json({ answer: weatherData });
    } else {
      // Return Llama's response if it's a regular message
      res.json({ answer: llamaResponse.answer || "No relevant response." });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Failed to process request." });
  }
});

// Start the Express server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
