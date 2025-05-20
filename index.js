const keep_alive = require(`./keep_alive.js`);
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

const warns = new Map(); // Simple in-memory warning system

client.on('ready', () => {
  console.log(`Bot listo como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'help') {
    message.channel.send(
      `Comandos disponibles:
- !help: Muestra esta ayuda
- !mute @usuario [minutos]: Silencia a un usuario
- !ban @usuario [motivo]: Banea a un usuario
- !warn @usuario [motivo]: Advierte a un usuario`
    );
  }

  if (command === 'mute') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
      return message.reply('No tienes permiso para silenciar.');
    }
    const member = message.mentions.members.first();
    const minutes = parseInt(args[1]) || 1;
    if (!member) return message.reply('Menciona a un usuario.');
    if (!member.moderatable) return message.reply('No puedo silenciar a ese usuario.');
    await member.timeout(minutes * 60 * 1000, 'Muteado por comando');
    message.channel.send(`${member.user.tag} ha sido silenciado por ${minutes} minuto(s).`);
  }

  if (command === 'ban') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply('No tienes permiso para banear.');
    }
    const member = message.mentions.members.first();
    const reason = args.slice(1).join(' ') || 'Sin motivo';
    if (!member) return message.reply('Menciona a un usuario.');
    if (!member.bannable) return message.reply('No puedo banear a ese usuario.');
    await member.ban({ reason });
    message.channel.send(`${member.user.tag} ha sido baneado. Motivo: ${reason}`);
  }

  if (command === 'warn') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return message.reply('No tienes permiso para advertir.');
    }
    const member = message.mentions.members.first();
    const reason = args.slice(1).join(' ') || 'Sin motivo';
    if (!member) return message.reply('Menciona a un usuario.');
    const userId = member.id;
    if (!warns.has(userId)) warns.set(userId, []);
    warns.get(userId).push({ reason, by: message.author.tag, date: new Date() });
    message.channel.send(`${member.user.tag} ha sido advertido. Motivo: ${reason}`);
  }
});

client.login(process.env.TOKEN); // Pon tu token en un archivo .env como TOKEN=tu_token
