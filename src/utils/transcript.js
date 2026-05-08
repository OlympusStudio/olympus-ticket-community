const { AttachmentBuilder } = require('discord.js');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function fetchMessages(channel, limit = 1000) {
  const messages = [];
  let before;

  while (messages.length < limit) {
    const batch = await channel.messages.fetch({ limit: 100, before });
    if (batch.size === 0) break;

    messages.push(...batch.values());
    before = batch.last().id;
  }

  return messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
}

function renderMessage(message) {
  const author = escapeHtml(message.author?.tag || 'Usuario desconhecido');
  const date = new Date(message.createdTimestamp).toLocaleString('pt-BR');
  const content = escapeHtml(message.content || '');
  const attachments = [...message.attachments.values()]
    .map(attachment => `<li><a href="${escapeHtml(attachment.url)}">${escapeHtml(attachment.name || attachment.url)}</a></li>`)
    .join('');

  return `
    <article class="message">
      <header><strong>${author}</strong><span>${escapeHtml(date)}</span></header>
      <p>${content || '<em>Sem conteudo textual</em>'}</p>
      ${attachments ? `<ul>${attachments}</ul>` : ''}
    </article>
  `;
}

async function createTranscript(channel) {
  const messages = await fetchMessages(channel);
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Transcript - ${escapeHtml(channel.name)}</title>
  <style>
    body { background: #101214; color: #e6e8eb; font-family: Arial, sans-serif; margin: 0; padding: 24px; }
    main { max-width: 920px; margin: 0 auto; }
    h1 { font-size: 24px; margin: 0 0 16px; }
    .message { border-top: 1px solid #2a2f35; padding: 14px 0; }
    header { display: flex; gap: 12px; align-items: baseline; }
    header span { color: #9aa4af; font-size: 12px; }
    p { white-space: pre-wrap; line-height: 1.45; margin: 8px 0; }
    a { color: #8ab4ff; }
  </style>
</head>
<body>
  <main>
    <h1>#${escapeHtml(channel.name)}</h1>
    ${messages.map(renderMessage).join('\n')}
  </main>
</body>
</html>`;

  return new AttachmentBuilder(Buffer.from(html, 'utf8'), {
    name: `${channel.name}-transcript.html`
  });
}

module.exports = {
  createTranscript
};
