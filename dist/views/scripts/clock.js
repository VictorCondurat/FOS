"use strict";
class CountdownClock {
    constructor(launchDateString, countdownElementId) {
        this.countdownIntervalId = null;
        this.launchDate = new Date(launchDateString);
        this.countdownElement = document.getElementById(countdownElementId);
    }
    start() {
        this.updateCountdown();
        this.countdownIntervalId = window.setInterval(() => {
            this.updateCountdown();
        }, 1000);
    }
    stop() {
        if (this.countdownIntervalId !== null) {
            window.clearInterval(this.countdownIntervalId);
            this.countdownIntervalId = null;
        }
    }
    updateCountdown() {
        const timeValues = this.getTimeValues();
        this.updateCountdownElement(timeValues);
    }
    getTimeValues() {
        const diff = this.launchDate.getTime() - Date.now();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        return { days, hours, minutes, seconds };
    }
    updateCountdownElement(timeValues) {
        const { days, hours, minutes, seconds } = timeValues;
        const daysText = days > 0 ? `${days}d ` : "";
        const hoursText = `${hours.toString().padStart(2, "0")}:`;
        const minutesText = `${minutes.toString().padStart(2, "0")}:`;
        const secondsText = `${seconds.toString().padStart(2, "0")}`;
        const countdownText = `Launching in ${daysText}${hoursText}${minutesText}${secondsText}`;
        this.countdownElement.textContent = countdownText;
    }
}
const countdownClock = new CountdownClock("2023-05-31T00:00:00Z", "countdown-clock");
countdownClock.start();
