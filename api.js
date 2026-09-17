const express = require("express");

const app = express();
app.use(express.json());

let commands = [];

app.post("/give", (req, res) => {
    commands.push(req.body);
    res.json({ success: true });
});

app.get("/commands", (req, res) => {
    const data = [...commands];
    commands = [];
    res.json(data);
});

app.listen(3000, () => {
    console.log("API aktif: 3000");
});