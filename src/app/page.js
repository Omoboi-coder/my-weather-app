"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function Home() {
  const [query, setQuery] = useState("New York, US");
  const [forecastByDay, setForecastByDay] = useState({});
  const [locationName, setLocationName] = useState(""); 
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const API_KEY = "aa76d9013bbc5a6fd96d1f515c7037db";

  const getWeather = async () => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${query}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();

      if (data.cod === "404") {
        setForecastByDay({});
        return setError("Location not found.");
      }

      const grouped = {};
      const nowUTC = new Date();
      const nowLocalTime = new Date(nowUTC.getTime() + data.city.timezone * 1000);

      data.list.forEach((item) => {
        const localTime = new Date((item.dt + data.city.timezone) * 1000);
        const hour = localTime.getHours();
        if (hour < 0 || hour > 21) return;

        const isToday = localTime.toDateString() === nowLocalTime.toDateString();
        if (isToday && localTime < nowLocalTime) return;

        const day = localTime.toLocaleDateString(undefined, { weekday: "long" });
        if (!grouped[day]) grouped[day] = [];
        grouped[day].push({ ...item, localTime });
      });

      const groupedEntries = Object.entries(grouped).slice(0, 5);
      setForecastByDay(Object.fromEntries(groupedEntries));

      setLocationName(`${data.city.name}, ${data.city.country}`); 
      setQuery(`${data.city.name}, ${data.city.country}`);  
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch weather.");
    }
  };

  useEffect(() => {
    getWeather();
  }, []);

  const cardGradients = [
    "from-blue-800 to-cyan-700",
    "from-blue-700 to-cyan-600",
    "from-blue-600 to-cyan-500",
    "from-blue-500 to-cyan-500",
    "from-blue-400 to-cyan-300",
  ];

  return (
    <main className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-br
     from-blue-100 to-blue-300 flex flex-col items-center justify-start p-4">
      <h1 className="text-[32px] mt-8 md:mt-2 md:text-4xl font-bold mb-4 text-blue-800
       text-center">
        5-Day Forecast
      </h1>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 items-center justify-center
       w-full">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") getWeather();
          }}
          placeholder="Enter city or country..."
          className="px-4 py-2 text-xl text-black md:text-[23px] md:font-semibold rounded-md 
          border border-gray-500 md:border-gray-400 w-[90vw] sm:w-[300px] shadow focus:outline-none"
        />

        <button
          onClick={() => getWeather()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md
           text-base w-[90vw] md:text-lg md:w-auto"
        >
          Search
        </button>
      </div>

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      {/* Forecast Cards */}
      <div className="flex flex-col justify-center items-center w-full gap-4 md:mt-2
       md:items-start md:flex-row md:min-h-[70vh] md:overflow-auto">
        {Object.entries(forecastByDay).map(([day, entries], i) => {
          const cardGradient = cardGradients[i % cardGradients.length];
          return (
            <div
              key={day}
              className={`bg-gradient-to-br ${cardGradient} text-white p-3 rounded-2xl
               shadow-lg w-[90vw] md:w-60`}
            >
              <h2 className="text-2xl md:text-2xl font-semibold text-center uppercase">{day}</h2>
              
              <p className="text-lg md:text-lg font-semibold text-center mt-1 mb-1 ">{locationName}</p>

              <div className="flex flex-col gap-2">
                {entries.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-white px-2 py-1 rounded-md
                     backdrop-blur-sm text-md md:text-sm"
                  >
                    <div>
                      {item.localTime.toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="font-semibold">
                      {Math.round(item.main.temp)}<span className="font-serif">°C</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-10 h-10 md:w-7 md:h-7 relative">
                        <Image
                          src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                          alt={item.weather[0].main}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span>{item.weather[0].main}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
