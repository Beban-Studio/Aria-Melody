/**
 * Parses a time string like "15s", "10m", "1h" or a plain number (milliseconds) into milliseconds.
 * @param {string | number} timeString The time string (e.g., "15s", "10m") or a number in milliseconds.
 * @returns {number} The time in milliseconds, or 0 if parsing fails.
 */
export const parseTimeString = function (timeString) {
    const timeUnits = {
        ms: 1,
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
    };

    if (typeof timeString === 'number') {
        return timeString; 
    }
    if (typeof timeString !== 'string') {
        return 0;
    }

    const match = timeString.match(/^(\d+)([smh])$/);
    if (match) {
        const value = parseInt(match[1], 10);
        const unit = match[2];
        return value * timeUnits[unit];
    }
    if (/^\d+$/.test(timeString)) { 
        return parseInt(timeString, 10);
    }
    return 0;
};

/**
 * Converts a duration in milliseconds to a "D day(s) HH:MM:SS", "HH:MM:SS" or "MM:SS" string.
 * @param {number} durationMs The duration in milliseconds.
 * @returns {string} The formatted time string. Returns "00:00" for invalid input.
 */
export const formatDurationDetailed = function (durationMs) {
    if (isNaN(durationMs) || durationMs < 0) return "00:00";

    let totalSeconds = Math.floor(durationMs / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    totalSeconds %= (3600 * 24); // Remaining seconds after extracting days
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600; // Remaining seconds after extracting hours
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const paddedHours = String(hours).padStart(2, "0");
    const paddedMinutes = String(minutes).padStart(2, "0");
    const paddedSeconds = String(seconds).padStart(2, "0");

    let result = "";
    if (days > 0) {
        result += `${days}d `; // Or `${days} day${days > 1 ? 's' : ''} ` for "1 day" vs "2 days"
    }
    // Always show H:M:S if there are days or hours, otherwise M:S if only minutes/seconds
    if (days > 0 || hours > 0) {
        result += `${paddedHours}h ${paddedMinutes}m ${paddedSeconds}s`;
    } else if (minutes > 0 || seconds > 0) { // Only M:S if no days and no hours
        result = `${paddedMinutes}m ${paddedSeconds}s`;
    } else if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) { // Handle exact 0 duration
        return "0s"; // Or "0m 0s" or "00:00" as you prefer
    }


    return result.trim() || "0s"; // Default to "0s" if somehow empty (e.g. only days was 0)
};

/**
 * Converts a duration in milliseconds to a "HH:MM:SS" or "MM:SS" string.
 * @param {number} durationMs The duration in milliseconds.
 * @returns {string} The formatted time string (e.g., "02:05", "01:15:45"). Returns "00:00" for invalid input.
 */
export const convertTime = function (durationMs) {
    if (isNaN(durationMs) || durationMs < 0) return "00:00";

    const totalSeconds = Math.floor(durationMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const paddedMinutes = String(minutes).padStart(2, "0");
    const paddedSeconds = String(seconds).padStart(2, "0");

    if (hours > 0) {
        const paddedHours = String(hours).padStart(2, "0");
        return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
    } else {
        return `${paddedMinutes}:${paddedSeconds}`;
    }
};

/**
 * Formats a large number into a human-readable string with metric prefixes (K, M, B, T).
 * @param {number} number The number to format.
 * @param {number} [decPlaces=2] The number of decimal places to use.
 * @returns {string} The formatted number string (e.g., "1.23K", "5M").
 */
export const convertNumber = function (number, decPlaces = 2) {
    if (isNaN(number)) return "0";
    if (number === 0) return "0";

    const effectiveDecPlaces = Math.pow(10, decPlaces);
    const abbrev = ["K", "M", "B", "T"];

    for (let i = abbrev.length - 1; i >= 0; i--) {
        const size = Math.pow(10, (i + 1) * 3);
        if (size <= Math.abs(number)) {
            let result = Math.round((number * effectiveDecPlaces) / size) / effectiveDecPlaces;
            if (Math.abs(result) >= 1000 && i < abbrev.length - 1) {
                result /= 1000;
                i++; 
            }
            return result + abbrev[i];
        }
    }
    return String(Math.round(number * effectiveDecPlaces) / effectiveDecPlaces);
};

/**
 * Formats a duration in milliseconds for display, handling "Live" status and invalid inputs.
 * @param {number} durationMs The duration in milliseconds.
 * @returns {string} The formatted duration string (e.g., "00:00", "Live", "02:05").
 */
export const formatDuration = function (durationMs) {
    if (isNaN(durationMs) || typeof durationMs === "undefined" || durationMs < 0) return "00:00";
    if (durationMs >= 3600000000) return "Live"; 

    return convertTime(durationMs);
};

/**
 * Helper function to get the day of the month with its correct ordinal suffix (e.g., "1st", "2nd", "23rd").
 * @param {number} day The day of the month (1-31).
 * @returns {string} The day with its ordinal suffix.
 */
const getDayWithSuffix = (day) => {
    if (day > 3 && day < 21) return day + 'th'; 
    switch (day % 10) {
        case 1: return day + "st";
        case 2: return day + "nd";
        case 3: return day + "rd";
        default: return day + "th";
    }
};

/**
 * Formats a date string or Date object into a timestamp string, optionally including time.
 * Example: "Sat, Jan 1st, 2023" or "Sat, Jan 1st, 2023, 10:00 AM".
 * @param {string | Date} dateInput The date string or Date object.
 * @param {boolean} [includeTime=false] Whether to include the time in the output.
 * @returns {string} The formatted timestamp string, or "Invalid Date" on error.
 */
export const formatTimestamp = (dateInput, includeTime = false) => {
    try {
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return "Invalid Date";

        const day = date.getDate();
        const dayWithSuffix = getDayWithSuffix(day);

        const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const year = date.getFullYear();

        let result = `${weekday}, ${month} ${dayWithSuffix}, ${year}`;

        if (includeTime) {
            const timePart = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            result += `, ${timePart}`;
        }
        return result;
    } catch (e) {
        return "Invalid Date";
    }
};