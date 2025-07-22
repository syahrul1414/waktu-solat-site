// Prayer Times API Integration
class PrayerTimesAPI {
  constructor() {
    this.baseURL = 'https://api.waktusolat.app';
    this.kualaLumpurZone = 'WLY01'; // Kuala Lumpur zone code
  }

  // Get current prayer times for today
  async getCurrentPrayerTimes() {
    try {
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      const response = await fetch(
        `${this.baseURL}/solat/${this.kualaLumpurZone}/${day}?year=${year}&month=${month}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch prayer times');
      }

      const data = await response.json();
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

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

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

  // Get next prayer and countdown
  getNextPrayerCountdown(prayerTimes) {
    if (!prayerTimes) return { nextPrayer: 'Dhuhr', countdown: '00:00:00' };

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

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
    const seconds = 60 - now.getSeconds();

    const countdown = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    return {
      nextPrayer: nextPrayer.name,
      countdown: countdown
    };
  }

  // Format Hijri and Gregorian dates
  formatDates(prayerData) {
    if (!prayerData) {
      return {
        hijri: '26 Muharram 1447',
        gregorian: 'Tue, 22 Jul 2025'
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
    const gregorianDate = new Date(prayerData.date);
    const options = { 
      weekday: 'short', 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    };
    const gregorianFormatted = gregorianDate.toLocaleDateString('en-US', options);

    return {
      hijri: `${hijriDay} ${hijriMonth} ${hijriYear}`,
      gregorian: gregorianFormatted
    };
  }
}

// Initialize the API
const prayerAPI = new PrayerTimesAPI();
let currentPrayerData = null;

// Update prayer times display
async function updatePrayerTimes() {
  try {
    currentPrayerData = await prayerAPI.getCurrentPrayerTimes();
    
    if (currentPrayerData) {
      // Update individual prayer times
      document.getElementById('dhuhr-time').textContent = prayerAPI.formatTime(currentPrayerData.dhuhr);
      document.getElementById('asr-time').textContent = prayerAPI.formatTime(currentPrayerData.asr);
      document.getElementById('maghrib-time').textContent = prayerAPI.formatTime(currentPrayerData.maghrib);
      document.getElementById('isha-time').textContent = prayerAPI.formatTime(currentPrayerData.isha);

      // Update current prayer
      const currentPrayer = prayerAPI.getCurrentPrayer(currentPrayerData);
      document.getElementById('current-prayer-name').textContent = currentPrayer.name;
      document.getElementById('current-prayer-time').textContent = currentPrayer.time;

      // Update dates
      const dates = prayerAPI.formatDates(currentPrayerData);
      document.getElementById('hijri-date').textContent = dates.hijri;
      document.getElementById('gregorian-date').textContent = dates.gregorian;

      // Update location
      document.getElementById('location').textContent = 'Kuala Lumpur, Putrajaya';
    }
  } catch (error) {
    console.error('Error updating prayer times:', error);
  }
}

// Update countdown timer
function updateCountdown() {
  if (currentPrayerData) {
    const countdownData = prayerAPI.getNextPrayerCountdown(currentPrayerData);
    document.getElementById('countdown-timer').textContent = countdownData.countdown;
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  updatePrayerTimes();
  
  // Update countdown every second
  setInterval(updateCountdown, 1000);
  
  // Update prayer times every hour
  setInterval(updatePrayerTimes, 60 * 60 * 1000);
});