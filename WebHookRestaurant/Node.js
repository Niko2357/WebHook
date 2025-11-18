const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('public'));

const crypto = require('crypto');
const SHARED_SECRET = 'heslo';

const orders = {};
const processedEvents = new Set();

app.get('/send-order', async (req, res) => {
  const order = {
    id: order.length + 1,
    callbackUrl: 'http://localhost:3001/update',
    status: 'Order request',
  };

  try {
    const response = await fetch('http://localhost:3000/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
  } catch (err) {
    console.error('Fetch failed:', err.message);
    res.status(500).send('Courier is not available');
  }
  res.redirect('/');
});

app.post('/update', express.json(), (req, res) => {
  const sigHeader = (req.get('X-Signature') || '').trim();

  const rawBody = JSON.stringify(req.body);

  const expectedSig = crypto.createHmac('sha256', SHARED_SECRET)
                            .update(rawBody, 'utf8')
                            .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(sigHeader, 'utf8'), Buffer.from(expectedSig, 'utf8'))) {
    console.log('Neplatný podpis – webhook ignorován:', req.body);
    return res.sendStatus(401);
  }

  const { id, status, event_id } = req.body;

  if (processedEvents.has(event_id)) {
    console.log(`Duplikátní webhook ignorován: ${event_id}`);
    return res.sendStatus(200);
  }
  processedEvents.add(event_id);

  orders[id] = status;
  console.log(`Aktualizace od kurýra: ${id} → ${status} (event_id: ${event_id})`);
  res.sendStatus(200);
});


app.get('/orders', (req, res) => {
  res.json(orders);
});


app.listen(3001, () => {
  console.log('Restaurant runs on http://localhost:3001');
});