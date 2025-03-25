function parseTimeString(timeString) {
    const timeUnits = {
        m: 60 * 1000, // minutes
        s: 1000,      // seconds
        h: 60 * 60 * 1000 // hours
    };

    const match = timeString.match(/^(\d+)([ms]{1})$/);
    if (match) {
        const value = parseInt(match[1], 10);
        const unit = match[2];
        return value * timeUnits[unit];
    }
    return 0;
}

module.exports = { parseTimeString };