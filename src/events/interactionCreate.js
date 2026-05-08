const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Colors,
  PermissionFlagsBits
} = require('discord.js');
const config = require('../config');
const { createTranscript } = require('../utils/transcript');

function getConfiguredChannel(interaction, channelId) {
  if (!channelId) return null;
  return interaction.guild.channels.cache.get(channelId) || null;
}

function baseEmbed(description) {
  return new EmbedBuilder()
    .setColor(config.color || Colors.Blurple)
    .setDescription(description);
}

function closeButtonRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('fechar')
      .setLabel('Fechar')
      .setStyle(ButtonStyle.Danger)
  );
}

function singleButtonRow(customId, label) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(customId)
      .setLabel(label)
      .setStyle(ButtonStyle.Primary)
  );
}

async function safeReply(interaction, payload) {
  if (interaction.replied || interaction.deferred) {
    return interaction.followUp(payload);
  }

  return interaction.reply(payload);
}

async function deleteTicketChannel(client, channel, delayMs = 10000) {
  setTimeout(async () => {
    client.ticketStore.closeTicketByChannel(channel.id);
    await channel.delete().catch(() => {});
  }, delayMs);
}

async function handleClose(interaction, client) {
  await interaction.deferReply({ ephemeral: true });

  const channel = interaction.channel;
  const logs = getConfiguredChannel(interaction, config.logs);
  const attachment = await createTranscript(channel);

  const transcriptEmbed = new EmbedBuilder()
    .setColor(config.color || Colors.Blurple)
    .setTitle(`Transcript | ${config.title || 'Sistema de Tickets'}`)
    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
    .addFields({ name: 'Canal', value: channel.name });

  if (logs) {
    await logs.send({ embeds: [transcriptEmbed], files: [attachment] });
  }

  await interaction.editReply({
    embeds: [baseEmbed('Canal sera deletado em 10 segundos.')]
  });

  await deleteTicketChannel(client, channel);
}

async function collectTextAndSend(interaction, client, targetChannelId, title, successMessage) {
  await interaction.reply({ embeds: [baseEmbed('Escreva sua mensagem neste canal.')] });

  const collector = interaction.channel.createMessageCollector({
    filter: (message) => message.author.id === interaction.user.id,
    max: 1,
    time: 120000
  });

  collector.on('collect', async (message) => {
    message.delete().catch(() => {});

    const targetChannel = getConfiguredChannel(interaction, targetChannelId);
    const embed = new EmbedBuilder()
      .setColor(config.color || Colors.Blurple)
      .setTitle(title)
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'Autor', value: `<@${interaction.user.id}>` },
        { name: 'Mensagem', value: `\`\`\`${message.content.slice(0, 3900)}\`\`\`` }
      )
      .setTimestamp()
      .setFooter({ text: config.footer || interaction.guild.name });

    if (targetChannel) {
      await targetChannel.send({ embeds: [embed] });
    }

    await interaction.editReply({ embeds: [baseEmbed(successMessage)] });
    await deleteTicketChannel(client, interaction.channel);
  });

  collector.on('end', async (collected) => {
    if (collected.size === 0) {
      await interaction.editReply({
        embeds: [baseEmbed('Tempo esgotado. Nenhuma mensagem foi recebida. O canal sera deletado em 10 segundos.')]
      }).catch(() => {});
      await deleteTicketChannel(client, interaction.channel);
    }
  });
}

async function findOpenTicketChannel(interaction, client, type) {
  const openTicket = client.ticketStore.getOpenTicket({
    guildId: interaction.guild.id,
    userId: interaction.user.id,
    type
  });

  if (!openTicket) return null;

  const channel = interaction.guild.channels.cache.get(openTicket.channel_id);
  if (channel) return channel;

  client.ticketStore.markMissingChannelClosed(openTicket.channel_id);
  return null;
}

async function createTicket(interaction, client, options) {
  const existing = await findOpenTicketChannel(interaction, client, options.type);
  if (existing) {
    return interaction.reply({
      embeds: [baseEmbed(`Voce ja tem um ticket aberto em ${existing}.`)],
      ephemeral: true
    });
  }

  await interaction.deferReply({ ephemeral: true });

  const overwrites = [
    {
      id: interaction.guild.id,
      deny: [PermissionFlagsBits.ViewChannel]
    },
    {
      id: interaction.user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory
      ]
    }
  ];

  if (options.supportRoleId) {
    overwrites.push({
      id: options.supportRoleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory
      ]
    });
  }

  const channel = await interaction.guild.channels.create({
    name: options.name,
    topic: interaction.user.id,
    type: ChannelType.GuildText,
    parent: config.categoria || null,
    permissionOverwrites: overwrites
  });

  client.ticketStore.createTicket({
    guildId: interaction.guild.id,
    channelId: channel.id,
    userId: interaction.user.id,
    type: options.type
  });

  await channel.send({
    content: options.supportRoleId ? `${interaction.user} <@&${options.supportRoleId}>` : `${interaction.user}`,
    embeds: [
      new EmbedBuilder()
        .setColor(config.color || Colors.Blurple)
        .setTitle(options.title)
        .setDescription(options.description)
    ],
    components: [options.components || closeButtonRow()]
  });

  if (options.autoDeleteMs) {
    await deleteTicketChannel(client, channel, options.autoDeleteMs);
  }

  await interaction.editReply({
    embeds: [baseEmbed(`Seu ticket foi aberto em ${channel}.`)]
  });
}

module.exports = {
  name: 'interactionCreate',
  run: async (interaction, client) => {
    if (!interaction.guild) return;

    try {
      if (interaction.isButton()) {
        if (interaction.customId === 'fechar') {
          return handleClose(interaction, client);
        }

        if (interaction.customId === 'avaliacao') {
          return collectTextAndSend(interaction, client, config.avaliacao, `Avaliacao | ${config.title || 'Tickets'}`, 'Sua avaliacao foi enviada com sucesso. O canal sera deletado em 10 segundos.');
        }

        if (interaction.customId === 'sugestao') {
          return collectTextAndSend(interaction, client, config.sugestao, `Sugestao | ${config.title || 'Tickets'}`, 'Sua sugestao foi enviada com sucesso. O canal sera deletado em 10 segundos.');
        }

        if (interaction.customId === 'duvida') {
          return collectTextAndSend(interaction, client, config.duvida, `Duvida | ${config.title || 'Tickets'}`, 'Sua duvida foi enviada com sucesso. O canal sera deletado em 10 segundos.');
        }
      }

      if (interaction.isStringSelectMenu() && interaction.customId === 'ticket') {
        const supportRoleId = config.suporte;
        const ticketType = interaction.values[0];

        if (ticketType === 'ava' && config.cliente && !interaction.member.roles.cache.has(config.cliente)) {
          return interaction.reply({
            embeds: [baseEmbed('Voce precisa ter o cargo de cliente para abrir uma avaliacao.')],
            ephemeral: true
          });
        }

        const ticketMap = {
          sup: {
            type: 'suporte',
            name: `suporte-${interaction.user.id}`,
            title: `Suporte | ${config.title || 'Tickets'}`,
            description: 'Seu ticket de suporte foi aberto. Aguarde o atendimento da equipe.',
            supportRoleId
          },
          pro: {
            type: 'problema',
            name: `problema-${interaction.user.id}`,
            title: `Problema | ${config.title || 'Tickets'}`,
            description: 'Seu ticket de problema foi aberto. Aguarde o atendimento da equipe.',
            supportRoleId
          },
          com: {
            type: 'compra',
            name: `compra-${interaction.user.id}`,
            title: `Compra | ${config.title || 'Tickets'}`,
            description: 'Seu ticket de compra foi aberto. Aguarde o atendimento da equipe.',
            supportRoleId
          },
          ava: {
            type: 'avaliacao',
            name: `avaliacao-${interaction.user.id}`,
            title: `Avaliacao | ${config.title || 'Tickets'}`,
            description: 'Clique no botao abaixo para enviar sua avaliacao.',
            components: singleButtonRow('avaliacao', 'Avaliacao')
          },
          sug: {
            type: 'sugestao',
            name: `sugestao-${interaction.user.id}`,
            title: `Sugestao | ${config.title || 'Tickets'}`,
            description: 'Clique no botao abaixo para enviar sua sugestao.',
            components: singleButtonRow('sugestao', 'Sugestao')
          },
          question: {
            type: 'duvida',
            name: `duvida-${interaction.user.id}`,
            title: `Duvida | ${config.title || 'Tickets'}`,
            description: 'Clique no botao abaixo para enviar sua duvida.',
            components: singleButtonRow('duvida', 'Enviar duvida')
          }
        };

        const options = ticketMap[ticketType];
        if (!options) {
          return interaction.reply({
            embeds: [baseEmbed('Opcao de ticket indisponivel.')],
            ephemeral: true
          });
        }

        return createTicket(interaction, client, options);
      }
    } catch (error) {
      console.error('[interactionCreate] Erro ao processar interacao:', error);
      await safeReply(interaction, {
        embeds: [baseEmbed('Ocorreu um erro ao processar esta interacao.')],
        ephemeral: true
      }).catch(() => {});
    }
  }
};
