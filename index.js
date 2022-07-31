const guilds = require('./redux/reducers/guilds');
const { Bot } = require('./Structures/Bot');
if (process.env.NODE_ENV != 'production') {
  require("dotenv").config();
}


const token = process.env.DISCORD_BOT_TOKEN;

const client = new Bot(token);
client.start(token);
