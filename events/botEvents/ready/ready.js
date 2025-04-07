const { ActivityType } = require("discord.js");
const { logger } = require("../../../utils/logger");
const config = require("../../../config");
const colors = require("colors");

module.exports = (client) => {
    logger(`Successfully logged in as ${colors.rainbow(`[${client.user.tag}]`)}`, "debug");

    const activities = config.presence.activities;
    client.user.setStatus(config.presence.status);
    
    setInterval(() => {
        const index = Math.floor(Math.random() * activities.length);

        let data = {};
        try {
            data = activities[index].data(client);
        } catch (err) {}

        const format = (template, data) => {
            return template.replace(/\{(\w+)\}/g, (_, key) => data[key] || '');
        };

        const capitalize = (str) => {
            if (!str) return '';
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        };

        client.user.setActivity({
            name: format(activities[index].name, data),
            type: ActivityType[capitalize(activities[index].type)],
        });
    }, 10000);
};