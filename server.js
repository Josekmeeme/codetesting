
const express = require("express");
const app = express();
app.use(express.json());
app.get("/", (req, res) => res.send("SmartKidStories API Running"));
app.listen(3001, () => console.log("Server running on port 3001"));
