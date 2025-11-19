const express = require("express");
const crypto = require("crypto");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const SHARED_SECRET = "heslo";

app.post("/order", (req, res) => {
  const order = req.body;
  console.log(`Order accepted: ${order.id}`);

  res.status(202).json({ status: "Order accepted" });

  const sendWebhook = (status) => {
    const payload = {
      id: order.id,
      status,
      event_id: `${order.id}-${status}-${Date.now()}`,
    };

    const body = JSON.stringify(payload);

    const sig = crypto
      .createHmac("sha256", SHARED_SECRET)
      .update(body, "utf8")
      .digest("hex");

    fetch(order.callbackUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Signature": sig,
      },
      body,
    })
    .catch((err) =>
      console.error(`${order.id}: Failed to send webhook for ${status}`, err)
    );
  };

  setTimeout(() => {
    console.log(`${order.id}: Order in process`);
    sendWebhook("Order in process");

    setTimeout(() => {
      console.log(`${order.id}: Delivering`);
      sendWebhook("Delivering");

      setTimeout(() => {
        console.log(`${order.id}: Delivered`);
        sendWebhook("Delivered");
      }, 5005);
    }, 5005);
  }, 5005);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Courier runs on http://localhost:${PORT}`));
