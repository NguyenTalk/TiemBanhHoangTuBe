import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/cakes", async (req, res) => {
  const response = await fetch("https://banhngot.fitlhu.com/api/cakes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body)
  });
  const data = await response.json();
  res.json(data);
});

app.listen(3000, () => console.log("Proxy chạy tại http://localhost:3000"));
