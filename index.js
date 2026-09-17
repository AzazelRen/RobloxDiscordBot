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

const API_URL = "https://robloxdiscordbot-nvfv.onrender.com";

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
    const command = args[0].toLowerCase();

    const hasDeveloperRole = message.member.roles.cache.has(DEVELOPER_ROLE_ID);
    const isWhitelisted = WHITELIST.includes(message.author.id);

    if (!hasDeveloperRole && !isWhitelisted) {
        return;
    }

    if (command === "!tool") {
        if (!args[1] || !args[2]) {
            return message.reply("Usage: `!tool PlayerName ToolName`");
        }

        const player = args[1];
        const tool = args.slice(2).join(" ");

        try {
            const response = await fetch(`${API_URL}/give`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    player: player,
                    tool: tool
                })
            });

            const data = await response.json();

            if (data.success) {
                return message.reply(`**${tool}** was given to **${player}**.`);
            }

            return message.reply(`❌ ${data.message}`);
        } catch (error) {
            console.error(error);
            return message.reply("Could not connect to the API.");
        }
    }

    if (command === "!whitelist") {
        if (!args[1]) {
            return message.reply("Usage: `!whitelist UserId`");
        }

        const userId = args[1];

        try {
            const response = await fetch(`${API_URL}/whitelist`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: userId
                })
            });

            const data = await response.json();

            if (data.success) {
                return message.reply(`**${userId}** has been whitelisted.`);
            }

            return message.reply(`❌ ${data.message}`);
        } catch (error) {
            console.error(error);
            return message.reply("Could not connect to the API.");
        }
    }

    if (command === "!unwhitelist") {
        if (!args[1]) {
            return message.reply("Usage: `!unwhitelist UserId`");
        }

        const userId = args[1];

        try {
            const response = await fetch(`${API_URL}/unwhitelist`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: userId
                })
            });

            const data = await response.json();

            if (data.success) {
                return message.reply(`**${userId}** has been removed from the whitelist.`);
            }

            return message.reply(`❌ ${data.message}`);
        } catch (error) {
            console.error(error);
            return message.reply("Could not connect to the API.");
        }
    }

    if (command === "!whitelistlist") {
        try {
            const response = await fetch(`${API_URL}/whitelist`);
            const data = await response.json();

            if (!data.success) {
                return message.reply(`❌ ${data.message}`);
            }

            if (data.whitelist.length === 0) {
                return message.reply("Whitelist is empty.");
            }

            return message.reply(
                `**Whitelist:**\n${data.whitelist.map((id, index) => `${index + 1}. ${id}`).join("\n")}`
            );
        } catch (error) {
            console.error(error);
            return message.reply("Could not connect to the API.");
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
