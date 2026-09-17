const express = require("express");

const app = express();
app.use(express.json());

let commands = [];
let whitelist = [];

app.post("/give", (req, res) => {
    const { player, tool } = req.body;

    if (!player || !tool) {
        return res.json({
            success: false,
            message: "Player and Tool are required."
        });
    }

    commands.push({
        player,
        tool
    });

    res.json({
        success: true
    });
});

app.get("/commands", (req, res) => {
    const data = [...commands];
    commands = [];

    res.json(data);
});

app.post("/whitelist", (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.json({
            success: false,
            message: "UserId is required."
        });
    }

    if (whitelist.includes(userId)) {
        return res.json({
            success: false,
            message: "This player is already whitelisted."
        });
    }

    whitelist.push(userId);

    console.log(`Whitelisted: ${userId}`);

    res.json({
        success: true
    });
});

app.post("/unwhitelist", (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.json({
            success: false,
            message: "UserId is required."
        });
    }

    const index = whitelist.indexOf(userId);

    if (index === -1) {
        return res.json({
            success: false,
            message: "This player is not whitelisted."
        });
    }

    whitelist.splice(index, 1);

    console.log(`Removed from whitelist: ${userId}`);

    res.json({
        success: true
    });
});

app.get("/whitelist", (req, res) => {
    res.json({
        success: true,
        whitelist: whitelist
    });
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`API running on port ${process.env.PORT || 3000}`);
});
