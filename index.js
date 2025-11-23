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
    qrcode.generate(qr, { small: true, type: 'terminal' }, (err, url) => {
        if (err) console.log(err);
        else console.log(url);
    });
});

client.on('ready', () => {
    console.log('✅ WhatsApp listo');
});

client.on('message', async msg => {
    if (msg.fromMe) return;

    console.log(`📩 ${msg.from}: ${msg.body}`);

    // Reemplaza con tu URL real de n8n
    const webhookUrl = 'http://0.0.0.0:10000/webhook/e7901b63-fada-41c0-9592-09c99e7b8f24';

    try {
    const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg.body, from: msg.from })
    });

    console.log('🔍 Estado de n8n:', res.status);
    
    if (!res.ok) {
        console.error('❌ n8n respondió con error:', res.status);
        await msg.reply("⚠️ El asistente no está respondiendo.");
        return;
    }

    const data = await res.json();
    console.log('📩 Respuesta de n8n:', data); // <-- Esto es clave

    await msg.reply(data.response || "⚠️ Sin respuesta útil.");
} catch (e) {
    console.error('💥 Error al conectar con n8n:', e.message);
    await msg.reply("⚠️ No pude contactar al asistente.");
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
