const express = require("express");
const ip = require("ip");
const { IPinfoWrapper } = require("node-ipinfo");
require("dotenv").config();
app = express();

app.use(express.json());

const ipinfo = new IPinfoWrapper(process.env.IP_TOKEN);

app.get("/", (req, res) => {
  res.status(200).send({
    status: "success",
    message: `Navigate to the route ${req.protocol}://${req.hostname}/api/hello?visitor_name=name to get a greeting from this api`,
  });
});

app.get("/api/hello", async (req, res) => {
  try {
    const client_ip = ip.address();
    const { visitor_name } = req.query;
    const loc = await ipinfo.lookupIp(String(client_ip));

    res.send({
      client_ip,
      location: loc?.city || "",
      greetings: `Hello, ${visitor_name || "from user"}!`,
    });
  } catch (err) {
    console.log(err);
    res.send({ status: "fail", err_msg: err.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Listenin on port ", PORT);
});
