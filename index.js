const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Inicializa el cliente con autenticación local (guarda sesión)
const client = new Client({
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    },
    authStrategy: new LocalAuth()
});

// Muestra QR en consola para escanear con tu celular
client.on('qr', (qr) => {
    console.log('QR Code recibido:');
    qrcode.generate(qr, { small: true });
});

// Cuando se conecte
client.on('ready', () => {
    console.log('✅ Cliente de WhatsApp listo!');
});

// Escucha mensajes entrantes
client.on('message', async msg => {
    console.log(`📩 Mensaje recibido de ${msg.from}: ${msg.body}`);

    // Si el mensaje empieza con /, lo envía a n8n (por webhook)
    if (msg.body.startsWith('/')) {
        const webhookUrl = 'https://mi-n8n-render-1.onrender.com/webhook/...'; // <-- Reemplaza con tu URL real
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg.body, from: msg.from })
        });

        const result = await response.text();
        await msg.reply(result);
    }
});

// Inicia el cliente
client.initialize();