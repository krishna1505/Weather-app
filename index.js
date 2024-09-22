require('dotenv').config();
const http = require("http");
const fs = require("fs");
const requests = require("requests");
const url = require("url");

const homeFile = fs.readFileSync("index.html", "utf-8");

// Function to replace placeholders in the HTML file
const replaceVal = (tempVal, orgVal) => {
  let temperature = tempVal.replace("{%tempval%}", (orgVal.main.temp - 273.15).toFixed(2));
  temperature = temperature.replace("{%tempmin%}", (orgVal.main.temp_min - 273.15).toFixed(2));
  temperature = temperature.replace("{%tempmax%}", (orgVal.main.temp_max - 273.15).toFixed(2));
  temperature = temperature.replace("{%location%}", orgVal.name);
  temperature = temperature.replace("{%country%}", orgVal.sys.country);
  temperature = temperature.replace("{%tempstatus%}", orgVal.weather[0].main);
  
  return temperature;
};

// Create the server
const server = http.createServer((req, res) => {
  if (req.url.startsWith("/")) {
    const parsedUrl = url.parse(req.url, true);
    const cityName = parsedUrl.query.city || "Varanasi, uttar pradesh"; 
    const apiKey = "1e87263c44b418f76882a39aaa389d16"; // Your actual API key

    requests(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`)
      .on("data", (chunk) => {
        const objdata = JSON.parse(chunk);
        if (objdata.cod === 200) {
          const realTimeData = replaceVal(homeFile, objdata);
          res.write(realTimeData);
        } else {
          res.end(`Error: ${objdata.message}`);
        }
      })
      .on("end", (err) => {
        if (err) return console.log("Connection closed due to errors", err);
        res.end();
      })
      .on("error", (err) => {
        console.error("Request error:", err);
        res.end("Error fetching data");
      });
  } else {
    res.end("File not found");
  }
});

// Start the server
server.listen(8000, "127.0.0.1", () => {
  console.log("Server is running on http://127.0.0.1:8000");
});
