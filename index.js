const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once("ready", () => {
    console.log(`${client.user.tag} aktif!`);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    const args = message.content.split(" ");

    if (args[0] !== "!tool") return;

    if (!args[1] || !args[2]) {
        return message.reply("Kullanım: `!tool OyuncuAdı ToolAdı`");
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
            message.reply(`**${tool}** was given to **${player}**.`);
        } else {
            message.reply(`❌ ${data.message}`);
        }
    } catch (error) {
        console.error(error);
        message.reply("❌ API'ye bağlanılamadı.");
    }
});

client.login(process.env.DISCORD_TOKEN);
