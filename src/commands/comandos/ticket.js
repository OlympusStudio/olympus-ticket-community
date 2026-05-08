const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  PermissionFlagsBits,
  Colors
} = require('discord.js');
const config = require('../../config');

module.exports = {
  name: 'ticket',
  aliases: [],

  run: async (client, message) => {
    const embedNoPerm = new EmbedBuilder()
      .setColor(Colors.Red)
      .setTitle('Voce nao possui permissao para usar esse comando.');

    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      message.delete().catch(() => {});
      const warning = await message.channel.send({ embeds: [embedNoPerm] });
      setTimeout(() => warning.delete().catch(() => {}), 5000);
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(config.color || Colors.Blurple)
      .setTitle(config.title || 'Sistema de Tickets')
      .setDescription(config.description || 'Selecione uma categoria abaixo para abrir um ticket.')
      .setFooter({ text: config.footer || client.user.username });

    if (config.thumbnail) {
      embed.setThumbnail(config.thumbnail);
    }

    const options = [
      { label: 'Suporte', emoji: config.emoji, value: 'sup' },
      { label: 'Tirar duvida', emoji: config.emoji4, value: 'question' },
      { label: 'Problema na compra', emoji: config.emoji1, value: 'pro' },
      { label: 'Compra', emoji: config.emoji1, value: 'com' },
      { label: 'Avaliacao', emoji: config.emoji2, value: 'ava' },
      { label: 'Sugestao', emoji: config.emoji3, value: 'sug' }
    ].map(option => {
      if (!option.emoji) delete option.emoji;
      return option;
    });

    const selectmenu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('ticket')
        .setPlaceholder('Escolha uma categoria')
        .addOptions(options)
    );

    message.delete().catch(() => {});
    await message.channel.send({
      embeds: [embed],
      components: [selectmenu]
    });
  }
};
