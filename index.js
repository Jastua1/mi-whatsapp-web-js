const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

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

    // Usa la URL pública de n8n
    const webhookUrl = 'http://0.0.0.0:10000/webhook/e7901b63-fada-41c0-9592-09c99e7b8f24';

    try {
        const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg.body, from: msg.from })
        });

        if (!res.ok) {
            console.error('❌ n8n error:', res.status);
            await msg.reply("⚠️ Asistente no responde.");
            return;
        }

        const data = await res.json();
        await msg.reply(data.response || "Gracias.");
    } catch (e) {
        console.error('💥 Error:', e.message);
        await msg.reply("⚠️ Error interno.");
    }
});

client.initialize();
