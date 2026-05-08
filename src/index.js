const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const path = require('path');
const config = require('./config');
const TicketStore = require('./database/ticketStore');
const logger = require('./utils/logger');

const requiredEnv = [
  ['DISCORD_TOKEN', config.token],
  ['GUILD_ID', config.guildId],
  ['CATEGORY_ID', config.categoria],
  ['SUPPORT_ROLE_ID', config.suporte],
  ['CLIENT_ROLE_ID', config.cliente]
];

const missingEnv = requiredEnv.filter(([, value]) => !value).map(([key]) => key);
if (missingEnv.length > 0) {
  logger.erro(`Variaveis de ambiente obrigatorias ausentes: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User]
});

module.exports = client;

client.commands = new Collection();
client.aliases = new Collection();
client.events = new Collection();
client.ticketStore = new TicketStore(config.databasePath);

logger.info('Carregando handlers...');
['command', 'event'].forEach(handler => {
  require(path.join(__dirname, `handlers/${handler}`))(client);
});

function shutdown() {
  client.ticketStore.close();
}

process.on('unhandledRejection', (reason) => {
  logger.erro(`Rejeicao nao tratada: ${reason}`);
});

process.on('uncaughtException', (err) => {
  logger.erro(`Excecao nao capturada: ${err.message}`);
});

process.on('SIGINT', () => {
  shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  shutdown();
  process.exit(0);
});

client.login(config.token).catch(err => {
  logger.erro('Falha ao fazer login. Verifique o DISCORD_TOKEN no arquivo .env.');
  logger.erro(err.message);
  process.exit(1);
});
