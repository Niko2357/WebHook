const express = require('express');
const app = express();
const body = JSON.stringify(payload);
const SHARED_SECRET = 'heslo';
const sig = crypto.createHmac('sha256', SHARED_SECRET)
                  .update(body, 'utf8')
                  .digest('hex');
app.use(express.json());

app.post('/order', (req, res) => {
  const order = req.body;
  console.log(`Order accepted ${order.id}`);
  // Simulace postupného zpracování objednávky:
  res.status(202).send({message: 'Order accepted'});

  setTimeout(() => {
    console.log(`${order.id}: Order in process`);
    fetch(order.callbackUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id: order.id, status: 'Order in proccess'})
        })
        .catch(err => console.error(`${order.id}: Something went wrong`, err));
        setTimeout(() => {
            console.log(`${order.id}: Delivering`);
            fetch(order.callbackUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({id: order.id, status: 'Delivering'})
            })
            .catch(err => console.error(`${order.id}: Something went wrong`, err));
            setTimeout(() => {
                console.log(`${order.id}: Delivered`);
                fetch(order.callbackUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({id: order.id, status: 'Delivered'})
                })
                .catch(err => console.error(`${order.id}: Something went wrong`, err));
        }, 5000)
    }, 5000)
  }, 5000);
});


app.listen(3000, () => {
console.log("Courier runs on http://localhost:3000");
});
