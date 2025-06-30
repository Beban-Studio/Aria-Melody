function parseTimeString(timeString) {
    if (!timeString || typeof timeString !== "string") return null;

    const timeUnits = {
        ms: 1,
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000
    };

    // Handle colon format like "1:30" or "01:02:03"
    if (/^\d+(:\d+)+$/.test(timeString)) {
        const parts = timeString.split(":").map(Number);
        let ms = 0;
        let multiplier = 1000; // seconds

        while (parts.length > 0) {
            const value = parts.pop();
            ms += value * multiplier;
            multiplier *= 60;
        }
        return ms;
    }

    // Handle formats like 2m10s, 90s, 5000ms
    const regex = /(\d+)(ms|s|m|h)/g;
    let match;
    let totalMs = 0;

    while ((match = regex.exec(timeString)) !== null) {
        const value = parseInt(match[1]);
        const unit = match[2];
        totalMs += value * timeUnits[unit];
    }

    return totalMs || null;
}

module.exports = { parseTimeString };
