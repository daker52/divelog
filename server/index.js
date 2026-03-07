const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/dives", require("./routes/dives"));
app.use("/api/gear", require("./routes/gear"));
app.use("/api/forum", require("./routes/forum"));

app.get("/api/health", (_, res) => res.json({ ok: true }));

app.listen(PORT, "127.0.0.1", () => {
  console.log(`YourDiveLog API running on port ${PORT}`);
});
