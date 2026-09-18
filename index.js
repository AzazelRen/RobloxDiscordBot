const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    SlashCommandBuilder
} = require("discord.js");

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

async function apiRequest(url, options = {}, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, options);
            const text = await response.text();

            console.log(`API ${response.status}:`, text);

            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }

            return JSON.parse(text);
        } catch (error) {
            console.error(
                `API attempt ${attempt} failed:`,
                error.message
            );

            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, 3000));
            } else {
                throw error;
            }
        }
    }
}

const commands = [
    new SlashCommandBuilder()
        .setName("tool")
        .setDescription("Give a Tool to a Roblox player.")
        .setContexts(0, 1, 2)
        .setIntegrationTypes(0, 1)
        .addStringOption(option =>
            option
                .setName("player")
                .setDescription("Roblox username")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("tool")
                .setDescription("Tool name")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("whitelist")
        .setDescription("Whitelist a Roblox UserId.")
        .setContexts(0, 1, 2)
        .setIntegrationTypes(0, 1)
        .addStringOption(option =>
            option
                .setName("user_id")
                .setDescription("Roblox UserId")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("unwhitelist")
        .setDescription("Remove a Roblox UserId from the whitelist.")
        .setContexts(0, 1, 2)
        .setIntegrationTypes(0, 1)
        .addStringOption(option =>
            option
                .setName("user_id")
                .setDescription("Roblox UserId")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("whitelistlist")
        .setDescription("Show the Roblox whitelist.")
        .setContexts(0, 1, 2)
        .setIntegrationTypes(0, 1)
].map(command => command.toJSON());

const rest = new REST({ version: "10" })
    .setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log("Registering slash commands...");

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            {
                body: commands
            }
        );

        console.log("Slash commands registered!");
    } catch (error) {
        console.error(error);
    }
})();

client.once("ready", async () => {
    console.log(`${client.user.tag} is online!`);

    try {
        await apiRequest(`${API_URL}/whitelist`);
        console.log("API connection successful!");
    } catch (error) {
        console.error("API connection failed:", error.message);
    }
});

client.on("messageCreate", message => {
    if (message.author.bot) return;

    if (message.content.toLowerCase() === "rat") {
        message.channel.send("🐀");
    }
});

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const hasDeveloperRole =
        interaction.inGuild() &&
        interaction.member.roles.cache.has(DEVELOPER_ROLE_ID);

    const isWhitelisted = WHITELIST.includes(interaction.user.id);

    if (!hasDeveloperRole && !isWhitelisted) {
        return interaction.reply(
            "You don't have permission to use this command."
        );
    }

    await interaction.deferReply();

    if (interaction.commandName === "tool") {
        const player = interaction.options.getString("player");
        const tool = interaction.options.getString("tool");

        try {
            const data = await apiRequest(`${API_URL}/give`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    player: player,
                    tool: tool
                })
            });

            if (data.success) {
                return interaction.editReply(
                    `**${tool}** was given to **${player}**.`
                );
            }

            return interaction.editReply(data.message);
        } catch (error) {
            console.error(error);

            return interaction.editReply(
                "Could not connect to the API."
            );
        }
    }

    if (interaction.commandName === "whitelist") {
        const userId = interaction.options.getString("user_id");

        try {
            const data = await apiRequest(`${API_URL}/whitelist`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: userId
                })
            });

            if (data.success) {
                return interaction.editReply(
                    `**${userId}** has been whitelisted.`
                );
            }

            return interaction.editReply(data.message);
        } catch (error) {
            console.error(error);

            return interaction.editReply(
                "Could not connect to the API."
            );
        }
    }

    if (interaction.commandName === "unwhitelist") {
        const userId = interaction.options.getString("user_id");

        try {
            const data = await apiRequest(`${API_URL}/unwhitelist`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: userId
                })
            });

            if (data.success) {
                return interaction.editReply(
                    `**${userId}** has been removed from the whitelist.`
                );
            }

            return interaction.editReply(data.message);
        } catch (error) {
            console.error(error);

            return interaction.editReply(
                "Could not connect to the API."
            );
        }
    }

    if (interaction.commandName === "whitelistlist") {
        try {
            const data = await apiRequest(`${API_URL}/whitelist`);

            if (!data.success) {
                return interaction.editReply(data.message);
            }

            if (data.whitelist.length === 0) {
                return interaction.editReply("Whitelist is empty.");
            }

            const list = data.whitelist
                .map((id, index) => `${index + 1}. ${id}`)
                .join("\n");

            return interaction.editReply(
                `**Whitelist:**\n${list}`
            );
        } catch (error) {
            console.error(error);

            return interaction.editReply(
                "Could not connect to the API."
            );
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
