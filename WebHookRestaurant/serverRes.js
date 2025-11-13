const express = require('express');
const app = express();
app.use(express.json());

app.get('/send-order', async (req, res) => {
  const order = {
    id: '1',
    callbackUrl: 'http://localhost:3001/update',
    status: 'Order request',
  };

  try {
    const response = await fetch('http://localhost:3000/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    console.log('Courier response:', response.status);
    res.send(`Courier answer: ${response.status}`);
  } catch (err) {
    console.error('Fetch failed:', err.message);
    res.status(500).send('Courier not available');
  }
});

app.listen(3001, () => {
  console.log('Restaurant runs on http://localhost:3001');
});