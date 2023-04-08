interface TimeValues {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

class CountdownClock {
    private launchDate: Date;
    private countdownElement: HTMLElement;
    private countdownIntervalId: number | null = null;

    constructor(launchDateString: string, countdownElementId: string) {
        this.launchDate = new Date(launchDateString);
        this.countdownElement = document.getElementById(countdownElementId)!;
    }

    public start() {
        this.updateCountdown();
        this.countdownIntervalId = window.setInterval(() => {
            this.updateCountdown();
        }, 1000);
    }

    public stop() {
        if (this.countdownIntervalId !== null) {
            window.clearInterval(this.countdownIntervalId);
            this.countdownIntervalId = null;
        }
    }

    private updateCountdown() {
        const timeValues = this.getTimeValues();
        this.updateCountdownElement(timeValues);
    }

    private getTimeValues(): TimeValues {
        const diff = this.launchDate.getTime() - Date.now();

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        return { days, hours, minutes, seconds };
    }

    private updateCountdownElement(timeValues: TimeValues) {
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
