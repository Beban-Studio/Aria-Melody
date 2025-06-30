const { ActivityType } = require("discord.js");
const { logger } = require("../../../utils/logger");
const config = require("../../../config");
const colors = require("colors");

module.exports = (client) => {
    logger(`Successfully logged in as ${colors.rainbow(`[${client.user.tag}]`)}`, "debug");

    const activities = config.presence.activities;

    if (!Array.isArray(activities) || activities.length === 0) {
        return logger("No presence activities configured in config.presence.activities", "warn");
    }

    client.user.setStatus(config.presence.status || "online");

    setInterval(() => {
        const index = Math.floor(Math.random() * activities.length);
        const activity = activities[index];

        let data = {};
        try {
            data = typeof activity.data === "function" ? activity.data(client) : {};
        } catch (err) {
            logger(`Error generating presence data: ${err.message}`, "error");
        }

        const format = (template, data) =>
            template.replace(/\{(\w+)\}/g, (_, key) => data[key] ?? '');


        const capitalize = (str) => {
            if (!str) return '';
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        };

        const type = capitalize(activity.type);
        const activityType = ActivityType[type];

        if (!activityType) {
            return logger(`Invalid activity type: ${activity.type}`, "warn");
        }

        if (type === "Custom") {
            client.user.setActivity(activity.name);
        } else {
            client.user.setActivity({
                name: format(activity.name, data),
                type: activityType,
            });
        }

    }, 10000); // every 10 seconds
};
