const { logger } = require("../../../utils/logger");
const { ActivityType } = require("discord.js");
const { capitalize, format } = require("../../../utils/string");
const config = require("../../../config");
const colors = require("colors");

module.exports = (client) => {
   logger(`Succesfully logged in as ${colors.rainbow(`[${client.user.tag}]`)}`, "debug");

   const activities = config.presence.activities;
   client.user.setStatus(config.presence.status);
	setInterval(() => {
		const index = Math.floor(Math.random() * activities.length);

		let data = {};
		try {
			data = activities[index].data(client);
		} catch (err) {}

		client.user.setActivity({
			name: format(activities[index].name, data),
			type: ActivityType[capitalize(activities[index].type)],
		});
	}, 10000);
}; 
