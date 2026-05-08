const { readdirSync } = require('fs');
const path = require('path');

module.exports = client => {
  const eventPath = path.join(__dirname, '../events');
  const events = readdirSync(eventPath).filter(file => file.endsWith('.js'));

  for (const file of events) {
    const event = require(path.join(eventPath, file));
    if (!event.name || typeof event.run !== 'function') continue;
    client.on(event.name, (...args) => event.run(...args, client));
  }

  console.log('\x1b[32m%s\x1b[0m', 'Eventos carregados');
};
