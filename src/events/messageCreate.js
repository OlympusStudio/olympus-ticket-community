const { ChannelType } = require('discord.js');
const config = require('../config');

module.exports = {
  name: 'messageCreate',
  run: async (message, client) => {
    const prefix = config.prefix || '.';

    if (message.author.bot) return;
    if (message.channel.type === ChannelType.DM) return;
    if (!message.content.toLowerCase().startsWith(prefix.toLowerCase())) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift()?.toLowerCase();
    if (!cmd) return;

    const command = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
    if (!command) return;

    try {
      await command.run(client, message, args);
    } catch (err) {
      console.error('[messageCreate] Erro ao executar comando:', err);
    }
  }
};
