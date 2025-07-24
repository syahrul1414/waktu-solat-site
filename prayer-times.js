// Prayer Times API Integration with Location Toggle
class PrayerTimesAPI {
  constructor() {
    this.baseURL = 'https://api.waktusolat.app';
    this.currentZone = 'WLY01'; // Default to Kuala Lumpur
    this.zones = [];
    this.currentPrayerData = null;
  }

  // Get all available zones
  async getZones() {
    try {
      const response = await fetch(`${this.baseURL}/zones`);
      if (!response.ok) {
        throw new Error('Failed to fetch zones');
      }
      const zones = await response.json();
      this.zones = zones;
      return zones;
    } catch (error) {
      console.error('Error fetching zones:', error);
      return [];
    }
  }

  // Get current prayer times for today
  async getCurrentPrayerTimes(zone = this.currentZone) {
    try {
      const today = new Date();
      // Use Malaysian timezone (UTC+8)
      const malaysianTime = new Date(today.getTime() + (8 * 60 * 60 * 1000));
      const day = malaysianTime.getUTCDate();
      const month = malaysianTime.getUTCMonth() + 1;
      const year = malaysianTime.getUTCFullYear();

      const response = await fetch(
        `${this.baseURL}/solat/${zone}/${day}?year=${year}&month=${month}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch prayer times');
      }

      const data = await response.json();
      this.currentPrayerData = data.prayerTime;
      return data.prayerTime;
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      return null;
    }
  }

  // Convert 24-hour time to 12-hour format
  formatTime(timeString) {
    if (!timeString) return 'Loading...';
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    
    return `${displayHour}:${minutes} ${ampm}`;
  }

  // Get current prayer based on time
  getCurrentPrayer(prayerTimes) {
    if (!prayerTimes) return { name: 'Fajr', time: '05:59 AM' };

    // Use Malaysian timezone (UTC+8)
    const now = new Date();
    const malaysianTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const currentTime = malaysianTime.getUTCHours() * 60 + malaysianTime.getUTCMinutes();

    const prayers = [
      { name: 'Fajr', time: prayerTimes.fajr },
      { name: 'Dhuhr', time: prayerTimes.dhuhr },
      { name: 'Asr', time: prayerTimes.asr },
      { name: 'Maghrib', time: prayerTimes.maghrib },
      { name: 'Isha', time: prayerTimes.isha }
    ];

    // Convert prayer times to minutes
    const prayerMinutes = prayers.map(prayer => {
      const [hours, minutes] = prayer.time.split(':');
      return {
        ...prayer,
        minutes: parseInt(hours) * 60 + parseInt(minutes)
      };
    });

    // Find current prayer
    let currentPrayer = prayerMinutes[0]; // Default to Fajr
    
    for (let i = 0; i < prayerMinutes.length; i++) {
      if (currentTime >= prayerMinutes[i].minutes) {
        currentPrayer = prayerMinutes[i];
      } else {
        break;
      }
    }

    return {
      name: currentPrayer.name,
      time: this.formatTime(currentPrayer.time)
    };
  }

  // Get current prayer with status info
  getCurrentPrayerInfo(prayerTimes) {
    if (!prayerTimes) return { name: 'Fajr', time: '05:59 AM', status: 'Current Prayer' };

    // Use Malaysian timezone (UTC+8)
    const now = new Date();
    const malaysianTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const currentTime = malaysianTime.getUTCHours() * 60 + malaysianTime.getUTCMinutes();

    const prayers = [
      { name: 'Fajr', time: prayerTimes.fajr },
      { name: 'Dhuhr', time: prayerTimes.dhuhr },
      { name: 'Asr', time: prayerTimes.asr },
      { name: 'Maghrib', time: prayerTimes.maghrib },
      { name: 'Isha', time: prayerTimes.isha }
    ];

    // Convert prayer times to minutes
    const prayerMinutes = prayers.map(prayer => {
      const [hours, minutes] = prayer.time.split(':');
      return {
        ...prayer,
        minutes: parseInt(hours) * 60 + parseInt(minutes)
      };
    });

    // Find current prayer and determine status
    let currentPrayer = prayerMinutes[0]; // Default to Fajr
    let status = 'Current Prayer';
    
    for (let i = 0; i < prayerMinutes.length; i++) {
      if (currentTime >= prayerMinutes[i].minutes) {
        currentPrayer = prayerMinutes[i];
        
        // Check if we're past this prayer time by more than a reasonable window
        const nextPrayerIndex = (i + 1) % prayerMinutes.length;
        const nextPrayer = prayerMinutes[nextPrayerIndex];
        
        // If it's the last prayer of the day, check against tomorrow's Fajr
        if (i === prayerMinutes.length - 1) {
          // After Isha, before midnight - still current
          status = 'Current Prayer';
        } else if (currentTime < nextPrayer.minutes) {
          // Between current and next prayer
          const timeSincePrayer = currentTime - currentPrayer.minutes;
          if (timeSincePrayer > 30) { // More than 30 minutes past
            status = 'Has Passed';
          } else {
            status = 'Current Prayer';
          }
        }
      } else {
        break;
      }
    }

    return {
      name: currentPrayer.name,
      time: this.formatTime(currentPrayer.time),
      status: status
    };
  }

  // Get next prayer and countdown
  getNextPrayerCountdown(prayerTimes) {
    if (!prayerTimes) return { nextPrayer: 'Dhuhr', countdown: '00:00:00' };

    // Use Malaysian timezone (UTC+8)
    const now = new Date();
    const malaysianTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const currentTime = malaysianTime.getUTCHours() * 60 + malaysianTime.getUTCMinutes();

    const prayers = [
      { name: 'Fajr', time: prayerTimes.fajr },
      { name: 'Dhuhr', time: prayerTimes.dhuhr },
      { name: 'Asr', time: prayerTimes.asr },
      { name: 'Maghrib', time: prayerTimes.maghrib },
      { name: 'Isha', time: prayerTimes.isha }
    ];

    // Convert prayer times to minutes
    const prayerMinutes = prayers.map(prayer => {
      const [hours, minutes] = prayer.time.split(':');
      return {
        ...prayer,
        minutes: parseInt(hours) * 60 + parseInt(minutes)
      };
    });

    // Find next prayer
    let nextPrayer = prayerMinutes[0]; // Default to tomorrow's Fajr
    let isNextDay = true;

    for (let i = 0; i < prayerMinutes.length; i++) {
      if (currentTime < prayerMinutes[i].minutes) {
        nextPrayer = prayerMinutes[i];
        isNextDay = false;
        break;
      }
    }

    // Calculate countdown
    let minutesUntilNext = nextPrayer.minutes - currentTime;
    if (isNextDay) {
      minutesUntilNext = (24 * 60) - currentTime + nextPrayer.minutes;
    }

    const hours = Math.floor(minutesUntilNext / 60);
    const minutes = minutesUntilNext % 60;
    const seconds = 60 - malaysianTime.getUTCSeconds();

    const countdown = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    return {
      nextPrayer: nextPrayer.name,
      countdown: countdown
    };
  }

  // Format Hijri and Gregorian dates
  formatDates(prayerData) {
    if (!prayerData) {
      // Use Malaysian timezone for fallback
      const now = new Date();
      const malaysianTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
      const options = { 
        weekday: 'short', 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        timeZone: 'Asia/Kuala_Lumpur'
      };
      const gregorianFormatted = malaysianTime.toLocaleDateString('en-US', options);
      
      return {
        hijri: '26 Muharram 1447',
        gregorian: gregorianFormatted
      };
    }

    // Format Hijri date
    const hijriParts = prayerData.hijri.split('-');
    const hijriMonths = [
      'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
      'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
      'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
    ];
    
    const hijriDay = parseInt(hijriParts[2]);
    const hijriMonth = hijriMonths[parseInt(hijriParts[1]) - 1];
    const hijriYear = hijriParts[0];
    
    // Format Gregorian date
    let gregorianFormatted;
    try {
      // Try to parse the date from API response
      if (prayerData.date) {
        const gregorianDate = new Date(prayerData.date + 'T12:00:00+08:00'); // Use noon to avoid timezone issues
        const options = { 
          weekday: 'short', 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric',
          timeZone: 'Asia/Kuala_Lumpur'
        };
        gregorianFormatted = gregorianDate.toLocaleDateString('en-US', options);
        
        // Check if the date is valid
        if (gregorianFormatted === 'Invalid Date' || isNaN(gregorianDate.getTime())) {
          throw new Error('Invalid date from API');
        }
      } else {
        throw new Error('No date in API response');
      }
    } catch (error) {
      console.log('Date parsing error:', error.message, 'Using current date instead');
      // Fallback to current Malaysian date
      const now = new Date();
      const malaysianTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
      const options = { 
        weekday: 'short', 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric'
      };
      gregorianFormatted = malaysianTime.toLocaleDateString('en-US', options);
    }

    return {
      hijri: `${hijriDay} ${hijriMonth} ${hijriYear}`,
      gregorian: gregorianFormatted
    };
  }

  // Get zone name from zone code
  getZoneName(zoneCode) {
    const zone = this.zones.find(z => z.jakimCode === zoneCode);
    if (zone) {
      return `${zone.daerah.split(',')[0]}, ${zone.negeri}`;
    }
    return 'Kuala Lumpur, Putrajaya';
  }

  // Set current zone
  setZone(zoneCode) {
    this.currentZone = zoneCode;
  }
}

// Initialize the API
const prayerAPI = new PrayerTimesAPI();
let countdownInterval;

// Populate location dropdown
async function populateLocationDropdown() {
  try {
    const zones = await prayerAPI.getZones();
    const locationSelect = document.getElementById('location-select');
    
    // Clear existing options
    locationSelect.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = 'WLY01';
    defaultOption.textContent = 'Kuala Lumpur, Putrajaya';
    defaultOption.selected = true;
    locationSelect.appendChild(defaultOption);
    
    // Group zones by state
    const groupedZones = {};
    zones.forEach(zone => {
      if (!groupedZones[zone.negeri]) {
        groupedZones[zone.negeri] = [];
      }
      groupedZones[zone.negeri].push(zone);
    });
    
    // Add zones grouped by state
    Object.keys(groupedZones).sort().forEach(state => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = state;
      
      groupedZones[state].forEach(zone => {
        const option = document.createElement('option');
        option.value = zone.jakimCode;
        option.textContent = `${zone.daerah.split(',')[0]}, ${zone.negeri}`;
        optgroup.appendChild(option);
      });
      
      locationSelect.appendChild(optgroup);
    });
    
    // Add event listener for location change
    locationSelect.addEventListener('change', async function() {
      const selectedZone = this.value;
      prayerAPI.setZone(selectedZone);
      
      // Show loading state
      showLoadingState();
      
      // Update prayer times for new location
      await updatePrayerTimes();
    });
    
  } catch (error) {
    console.error('Error populating location dropdown:', error);
  }
}

// Show loading state
function showLoadingState() {
  document.getElementById('fajr-time').textContent = 'Loading...';
  document.getElementById('dhuhr-time').textContent = 'Loading...';
  document.getElementById('asr-time').textContent = 'Loading...';
  document.getElementById('maghrib-time').textContent = 'Loading...';
  document.getElementById('isha-time').textContent = 'Loading...';
  document.getElementById('current-prayer-time').textContent = 'Loading...';
  document.getElementById('countdown-timer').textContent = '00:00:00';
}

// Update prayer times display
async function updatePrayerTimes() {
  try {
    console.log('Fetching prayer times for zone:', prayerAPI.currentZone);
    const currentPrayerData = await prayerAPI.getCurrentPrayerTimes();
    console.log('Prayer data received:', currentPrayerData);
    
    if (currentPrayerData) {
      // Get current prayer info
      const currentPrayerInfo = prayerAPI.getCurrentPrayerInfo(currentPrayerData);
      
      // Update individual prayer times
      document.getElementById('fajr-time').textContent = prayerAPI.formatTime(currentPrayerData.fajr);
      document.getElementById('dhuhr-time').textContent = prayerAPI.formatTime(currentPrayerData.dhuhr);
      document.getElementById('asr-time').textContent = prayerAPI.formatTime(currentPrayerData.asr);
      document.getElementById('maghrib-time').textContent = prayerAPI.formatTime(currentPrayerData.maghrib);
      document.getElementById('isha-time').textContent = prayerAPI.formatTime(currentPrayerData.isha);

      // Update current prayer card
      document.getElementById('current-prayer-name').textContent = currentPrayerInfo.name;
      document.getElementById('current-prayer-time').textContent = currentPrayerInfo.time;
      document.getElementById('current-prayer-status').textContent = currentPrayerInfo.status;

      // Update dates
      const dates = prayerAPI.formatDates(currentPrayerData);
      console.log('Formatted dates:', dates);
      document.getElementById('hijri-date').textContent = dates.hijri;
      document.getElementById('gregorian-date').textContent = dates.gregorian;

      // Update location
      document.getElementById('location').textContent = prayerAPI.getZoneName(prayerAPI.currentZone);

      // Clear existing countdown interval
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }

      // Start countdown timer
      countdownInterval = setInterval(() => {
        const countdownData = prayerAPI.getNextPrayerCountdown(currentPrayerData);
        document.getElementById('countdown-timer').textContent = countdownData.countdown;
      }, 1000);

      // Initial countdown update
      const countdownData = prayerAPI.getNextPrayerCountdown(currentPrayerData);
      document.getElementById('countdown-timer').textContent = countdownData.countdown;
    }
  } catch (error) {
    console.error('Error updating prayer times:', error);
    console.error('Error details:', error.message);
    // Show error state
    document.getElementById('location').textContent = 'Error loading data';
    
    // Show fallback dates
    const fallbackDates = prayerAPI.formatDates(null);
    document.getElementById('hijri-date').textContent = fallbackDates.hijri;
    document.getElementById('gregorian-date').textContent = fallbackDates.gregorian;
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async function() {
  // Show initial loading state
  showLoadingState();
  
  // Populate location dropdown
  await populateLocationDropdown();
  
  // Load initial prayer times
  await updatePrayerTimes();
  
  // Update prayer times every hour
  setInterval(updatePrayerTimes, 60 * 60 * 1000);
  
  // Initialize quote rotation
  rotateQuote();
  
  // Rotate quotes every 30 seconds
  setInterval(rotateQuote, 30000);
});

// Islamic quotes from Quran and authentic Hadith
const islamicQuotes = [
  {
    text: "Indeed, those who believe and do righteous deeds and establish prayer and give zakah will have their reward with their Lord, and there will be no fear concerning them, nor will they grieve.",
    source: "Quran 2:277"
  },
  {
    text: "And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose.",
    source: "Quran 65:3"
  },
  {
    text: "The believer is not one who eats his fill while his neighbor goes hungry.",
    source: "Hadith - Al-Adab Al-Mufrad"
  },
  {
    text: "And it is He who created the heavens and earth in truth. And the day He says, 'Be,' and it is, His word is the truth.",
    source: "Quran 6:73"
  },
  {
    text: "Charity does not decrease wealth, no one forgives another except that Allah increases his honor, and no one humbles himself for the sake of Allah except that Allah raises his status.",
    source: "Hadith - Sahih Muslim"
  },
  {
    text: "And whoever fears Allah - He will make for him a way out. And will provide for him from where he does not expect.",
    source: "Quran 65:2-3"
  },
  {
    text: "The example of those who spend their wealth in the way of Allah is like a seed which grows seven spikes; in each spike is a hundred grains.",
    source: "Quran 2:261"
  },
  {
    text: "None of you truly believes until he loves for his brother what he loves for himself.",
    source: "Hadith - Sahih Bukhari"
  },
  {
    text: "And give good tidings to the patient, Who, when disaster strikes them, say, 'Indeed we belong to Allah, and indeed to Him we will return.'",
    source: "Quran 2:155-156"
  },
  {
    text: "The upper hand is better than the lower hand. The upper hand is the one that gives, and the lower hand is the one that receives.",
    source: "Hadith - Sahih Bukhari"
  }
];

let currentQuoteIndex = 0;

// Function to rotate quotes
function rotateQuote() {
  const quoteText = document.getElementById('quote-text');
  const quoteSource = document.getElementById('quote-source');
  
  if (quoteText && quoteSource) {
    // Add fade out effect
    quoteText.style.opacity = '0';
    quoteSource.style.opacity = '0';
    
    setTimeout(() => {
      // Update quote content
      const currentQuote = islamicQuotes[currentQuoteIndex];
      quoteText.textContent = `"${currentQuote.text}"`;
      quoteSource.textContent = `— ${currentQuote.source}`;
      
      // Fade in new quote
      quoteText.style.opacity = '1';
      quoteSource.style.opacity = '1';
      
      // Move to next quote
      currentQuoteIndex = (currentQuoteIndex + 1) % islamicQuotes.length;
    }, 300);
  }
}

import { DateTime } from "luxon";

document.addEventListener("DOMContentLoaded", () => {
  if (typeof window !== "undefined") {
    // 1. Get the current date in KL timezone
    const now = DateTime.now().setZone("Asia/Kuala_Lumpur");

    const formattedDate = now.toFormat("cccc, dd LLL yyyy");
    const hijriDate = getHijriDate(now.toJSDate());

    document.getElementById("date-today").textContent = formattedDate;
    document.getElementById("hijri-date").textContent = hijriDate;

    // 2. Fetch prayer times
    fetch("/selangor.json")
      .then(res => res.json())
      .then(data => {
        const today = now.toFormat("yyyy-MM-dd");
        const times = data[today];
        if (times) {
          document.getElementById("fajr-time").textContent = times.Fajr;
          document.getElementById("dhuhr-time").textContent = times.Dhuhr;
          document.getElementById("asr-time").textContent = times.Asr;
          document.getElementById("maghrib-time").textContent = times.Maghrib;
          document.getElementById("isha-time").textContent = times.Isha;
        } else {
          console.error("No prayer times found for:", today);
        }
      })
      .catch(console.error);
  }
});

// Simple Hijri placeholder (can be replaced with real lib like moment-hijri)
function getHijriDate(date) {
  // You can improve this using an actual hijri lib
  return "26 Muharram 1447"; // Static for now
}
