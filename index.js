const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const http = require('http');

// Inicializa el cliente de WhatsApp
const client = new Client({
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    },
    authStrategy: new LocalAuth({ dataPath: '/home/node/.wwebjs_cache' })
});

client.on('qr', (qr) => {
    console.log('✅ Escanea este QR con tu WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WhatsApp listo');
});

client.on('message', async msg => {
    if (msg.fromMe) return;

    console.log(`📩 ${msg.from}: ${msg.body}`);
    
    // Reemplaza con tu URL real de n8n
    const webhookUrl = 'https://mi-n8n-render-1.onrender.com/webhook/rBZhcnsuSAPdia3b';

    try {
        const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg.body, from: msg.from })
        });
        const data = await res.json();
        await msg.reply(data.response || "Gracias.");
    } catch (e) {
        console.error('Error:', e.message);
        await msg.reply("⚠️ Asistente temporalmente fuera de servicio.");
    }
});

// Inicia WhatsApp
client.initialize();

// ✅ SERVIDOR HTTP MÍNIMO (obligatorio en Render)
const PORT = process.env.PORT || 10000;
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WhatsApp Web.js activo');
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor HTTP escuchando en puerto ${PORT}`);
});
