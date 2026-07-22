# WhatsApp Automation — WAHA + n8n

## Architecture

```
Customer places order
        │
        ▼
Satvastones Server (server.js)
  └─ Sends POST to n8n webhook URL
        │
        ▼
n8n Workflow (n8n-workflow-order-whatsapp.json)
  ├─ Sends order confirmation WhatsApp to customer via WAHA API
  └─ Sends new-order notification WhatsApp to admin via WAHA API
```

## 1. Deploy WAHA (WhatsApp HTTP API)

WAHA is the WhatsApp HTTP API that lets you send/receive messages via REST. It runs as a Docker container and requires a phone number linked to WhatsApp Web.

### Option A: Docker on a VPS

```bash
docker run -d --name waha \
  -p 3001:3001 \
  -e WHATSAPP_API_KEY=your-secret-key \
  devlikeapro/waha:latest
```

Then scan the QR code:
```bash
# Get screenshot URL
curl http://localhost:3001/api/screenshot
# Open in browser, scan with WhatsApp
```

### Option B: Render (or other cloud)

WAHA can be deployed on Render as a Docker service:
1. Go to Render Dashboard → New → Web Service
2. Use the image: `devlikeapro/waha:latest`
3. Set port to `3001`
4. Add env var: `WHATSAPP_API_KEY=your-secret-key`
5. Deploy, then access `/api/screenshot` to scan QR

### WAHA API Reference

```bash
# Send text message
curl -X POST http://your-waha:3001/api/sendText \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{"chatId": "919876543210@c.us", "text": "Hello from WAHA!"}'

# Check connection status
curl http://your-waha:3001/api/sessions
```

## 2. Deploy n8n

### Option A: n8n.cloud (managed)

1. Sign up at https://n8n.cloud
2. Create a workflow
3. Import `n8n-workflow-order-whatsapp.json`
4. Set environment variables:
   - `WAHA_API_URL`: Your WAHA instance URL (e.g., `https://waha.your-domain.com`)
   - `WHATSAPP_ADMIN_NUMBER`: Admin's phone (e.g., `919876543210`)
5. Create an HTTP Header Auth credential named `waha-api-key` with the WAHA API key
6. Activate the workflow
7. Copy the webhook URL from the Webhook node

### Option B: Self-hosted n8n

```bash
docker run -d --name n8n \
  -p 5678:5678 \
  -e N8N_SECURE_COOKIE=false \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n:latest
```

1. Open `http://your-server:5678`
2. Import `n8n-workflow-order-whatsapp.json`
3. Set env vars in n8n → Settings → Environment Variables
4. Create HTTP Header Auth credential named `waha-api-key`
5. Activate workflow

## 3. Configure Satvastones Server

Add to your Render dashboard environment variables:

| Variable | Description |
|----------|-------------|
| `N8N_WEBHOOK_URL` | The webhook URL from n8n (e.g., `https://your-n8n.example.com/webhook/satvastones-order`) |

## 4. How It Works

1. Customer places an order (COD or prepaid)
2. `server.js` saves the order and fires `sendOrderWebhook(order)`
3. Webhook POSTs order data to n8n as JSON:
   ```json
   {
     "event": "order.created",
     "orderNumber": "SAT-1001",
     "customer": { "name": "John Doe", "phone": "919876543210" },
     "amount": 599,
     "paymentMethod": "COD",
     "items": [
       { "title": "Gold Hoop Earrings", "qty": 1, "price": 599 }
     ]
   }
   ```
4. n8n workflow:
   - Checks if customer phone exists
   - Sends order confirmation to customer via WAHA
   - Sends admin notification via WAHA (always, even if customer phone missing)

## 5. Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| No WhatsApp received | WAHA not connected | Check `/api/sessions` — must show `"state": "CONNECTED"` |
| n8n webhook error | Wrong URL | Check `N8N_WEBHOOK_URL` in Render env vars |
| Customer not notified | Phone missing | Customer must provide phone at checkout |
| QR expired | Session timeout | Re-scan QR via `/api/screenshot` |
