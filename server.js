const express = require("express");
const cors = require("cors");
require("dotenv").config();

const mpesaRoutes = require("./routes/mpesa");
const paypalRoutes = require("./routes/paypal");
const webhookRoutes = require("./routes/webhook");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/mpesa", mpesaRoutes);
app.use("/api/paypal", paypalRoutes);
app.use("/api/webhook", webhookRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SmartKidStories server running on port ${PORT}`);
}); 
