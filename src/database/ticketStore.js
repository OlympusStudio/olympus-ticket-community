const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

function now() {
  return new Date().toISOString();
}

class TicketStore {
  constructor(databasePath) {
    this.databasePath = path.resolve(process.cwd(), databasePath);
    fs.mkdirSync(path.dirname(this.databasePath), { recursive: true });

    this.db = new DatabaseSync(this.databasePath);
    this.db.exec('PRAGMA journal_mode = WAL');
    this.db.exec('PRAGMA foreign_keys = ON');
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        channel_id TEXT NOT NULL UNIQUE,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        created_at TEXT NOT NULL,
        closed_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_tickets_open_user_type
      ON tickets (guild_id, user_id, type, status);
    `);

    this.createTicketStatement = this.db.prepare(`
      INSERT INTO tickets (guild_id, channel_id, user_id, type, status, created_at)
      VALUES (?, ?, ?, ?, 'open', ?)
    `);
    this.getOpenTicketStatement = this.db.prepare(`
      SELECT *
      FROM tickets
      WHERE guild_id = ? AND user_id = ? AND type = ? AND status = 'open'
      ORDER BY id DESC
      LIMIT 1
    `);
    this.closeTicketStatement = this.db.prepare(`
      UPDATE tickets
      SET status = 'closed', closed_at = ?
      WHERE channel_id = ? AND status = 'open'
    `);
    this.closeMissingTicketStatement = this.db.prepare(`
      UPDATE tickets
      SET status = 'closed', closed_at = ?
      WHERE channel_id = ?
    `);
  }

  createTicket({ guildId, channelId, userId, type }) {
    this.createTicketStatement.run(guildId, channelId, userId, type, now());
  }

  getOpenTicket({ guildId, userId, type }) {
    return this.getOpenTicketStatement.get(guildId, userId, type) || null;
  }

  closeTicketByChannel(channelId) {
    this.closeTicketStatement.run(now(), channelId);
  }

  markMissingChannelClosed(channelId) {
    this.closeMissingTicketStatement.run(now(), channelId);
  }

  close() {
    this.db.close();
  }
}

module.exports = TicketStore;
