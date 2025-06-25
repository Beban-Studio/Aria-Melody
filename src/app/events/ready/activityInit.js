import { ActivityType } from 'discord.js';

/**
 * @param {import('discord.js').Client<true>} client
 */
export default function log(client) {
  client.logger.info(`Logged in as ${client.user.username}!`);
  
  const activities = client.config.presence.activities;
  client.user.setStatus(client.config.presence.status);

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
}
