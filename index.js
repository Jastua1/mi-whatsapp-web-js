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
    console.log(`📩 ${msg.from}: ${msg.body}`);
    
    // Solo para pruebas: responde cualquier mensaje
    if (!msg.fromMe) {
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
            console.error(e);
            await msg.reply("Error interno.");
        }
    }
});

// Inicia WhatsApp
client.initialize();

// Servidor HTTP mínimo para evitar "Failed deploy"
const PORT = process.env.PORT || 10000;
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WhatsApp Web.js está activo');
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor HTTP escuchando en el puerto ${PORT}`);
});
