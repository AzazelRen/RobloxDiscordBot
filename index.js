const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("Discord bot is online!");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Web server is online!");
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const DEVELOPER_ROLE_ID = "1550020338887172096";

const WHITELIST = [
    "791713482860265503"
];

client.once("ready", () => {
    console.log(`${client.user.tag} is online!`);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    const args = message.content.trim().split(/\s+/);

    if (args[0] !== "!tool") return;

    const hasDeveloperRole = message.member.roles.cache.has(DEVELOPER_ROLE_ID);
    const isWhitelisted = WHITELIST.includes(message.author.id);

    if (!hasDeveloperRole && !isWhitelisted) {
        return message.reply("You don't have permission to use this command.");
    }

    if (!args[1] || !args[2]) {
        return message.reply("Usage: `!tool PlayerName ToolName`");
    }

    const player = args[1];
    const tool = args.slice(2).join(" ");

    try {
        const response = await fetch(
            "https://robloxdiscordbot-nvfv.onrender.com/give",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    player: player,
                    tool: tool
                })
            }
        );

        const data = await response.json();

        if (data.success) {
            return message.reply(`**${tool}** was given to **${player}**.`);
        }

        return message.reply(`❌ ${data.message}`);
    } catch (error) {
        console.error(error);
        return message.reply("Could not connect to the API.");
    }
});

client.login(process.env.DISCORD_TOKEN);
