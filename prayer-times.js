// prayer-times.js

// Get today's date in Malaysian timezone
const todayMY = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" }));
const day = todayMY.getDate();
const month = todayMY.getMonth() + 1;
const year = todayMY.getFullYear();

// Sample zone and negeri
const zone = "WLY01";
const negeri = "Wilayah Persekutuan";

// Build API URL
const apiURL = `https://api.waktusolat.my/v1/prayer/${year}/${month}/${day}?zone=${zone}&negeri=${negeri}`;

fetch(apiURL)
  .then(response => response.json())
  .then(data => {
    if (!data || !data.prayer_times) throw new Error("Invalid data structure");

    document.getElementById("fajr").innerText = data.prayer_times.fajr;
    document.getElementById("dhuhr").innerText = data.prayer_times.dhuhr;
    document.getElementById("asr").innerText = data.prayer_times.asr;
    document.getElementById("maghrib").innerText = data.prayer_times.maghrib;
    document.getElementById("isha").innerText = data.prayer_times.isha;

    document.getElementById("current-prayer-time").innerText = data.prayer_times.fajr; // placeholder
  })
  .catch(error => {
    console.error("Error fetching prayer times:", error);
  });
