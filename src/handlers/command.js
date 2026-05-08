const { readdirSync } = require('fs');
const path = require('path');
const ascii = require('ascii-table');

const table = new ascii('Comandos');
table.setHeading('Comando', 'Status');

module.exports = client => {
  const commandPath = path.join(__dirname, '../commands');

  readdirSync(commandPath).forEach(dir => {
    const commands = readdirSync(path.join(commandPath, dir)).filter(file =>
      file.endsWith('.js')
    );

    for (const file of commands) {
      const command = require(path.join(commandPath, dir, file));
      if (!command.name) {
        table.addRow(file, 'Falhou');
        continue;
      }

      client.commands.set(command.name, command);
      table.addRow(file, 'OK');

      if (Array.isArray(command.aliases)) {
        command.aliases
          .filter(Boolean)
          .forEach(alias => client.aliases.set(alias, command.name));
      }
    }
  });

  console.log(table.toString());
  console.log('\x1b[32m%s\x1b[0m', 'Comandos carregados');
};
