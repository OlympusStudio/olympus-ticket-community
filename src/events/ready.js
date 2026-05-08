const { ActivityType } = require('discord.js');
const config = require('../config');

module.exports = {
  name: 'ready',
  run: (client) => {
    console.log('\x1b[32m%s\x1b[0m', `${client.user.tag} esta online.`);

    const activity = config.ready || 'Gerenciando tickets';
    client.user.setActivity(activity, {
      type: ActivityType.Listening
    });
  }
};
