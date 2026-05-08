require('dotenv').config();

const staticConfig = require('./config.json');

module.exports = {
  ...staticConfig,
  token: process.env.DISCORD_TOKEN,
  guildId: process.env.GUILD_ID,
  logs: process.env.LOG_CHANNEL_ID,
  avaliacao: process.env.AVALIACAO_CHANNEL_ID,
  sugestao: process.env.SUGESTAO_CHANNEL_ID,
  categoria: process.env.CATEGORY_ID,
  suporte: process.env.SUPPORT_ROLE_ID,
  cliente: process.env.CLIENT_ROLE_ID,
  duvida: process.env.DUVIDA_CHANNEL_ID,
  databasePath: process.env.DATABASE_PATH || './data/tickets.sqlite',
  color: process.env.COLOR || staticConfig.color || '#5865F2'
};
