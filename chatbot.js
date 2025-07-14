const qrcode = require('qrcode');
const express = require('express');
const { Client, Buttons, List, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const app = express();
const port = process.env.PORT || 3000;

let qrCodeData = '';

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox'],
    },
});

// Simula digitação com atraso
const delay = ms => new Promise(res => setTimeout(res, ms));

// --- ROTAS EXPRESS ---
app.get('/', (req, res) => {
    res.send('✅ Bot rodando! Acesse <a href="/qrcode">/qrcode</a> para escanear o QR');
});

app.get('/qrcode', async (req, res) => {
    if (!qrCodeData) return res.send('⏳ QR Code ainda não gerado. Aguarde...');
    const qrImage = await qrcode.toDataURL(qrCodeData);
    res.send(`<h2>Escaneie com o WhatsApp:</h2><img src="${qrImage}">`);
});

// --- EVENTOS WHATSAPP ---
client.on('qr', qr => {
    qrCodeData = qr;
    console.log('⚠️ Novo QR Code gerado! Acesse /qrcode para escanear.');
});

client.on('ready', () => {
    console.log('✅ WhatsApp conectado!');
});

client.on('message', async msg => {
    try {
        const from = msg.from;
        if (!from.endsWith('@c.us')) return;

        const chat = await msg.getChat();

        if (foraDoHorario()) {
            await client.sendMessage(from, '🕒 Nosso horário de atendimento é das 7h às 20h. Deixe sua mensagem e responderemos em breve!');
            return;
        }

        if (/^(menu|teste|dia|tarde|bom|boa|noite|oi|olá|ola)$/i.test(msg.body)) {
            const contact = await msg.getContact();
            const name = contact.pushname || 'amigo';
            const firstName = name.split(' ')[0];

            await delay(1000);
            await chat.sendStateTyping();
            await delay(1000);

            await client.sendMessage(from,
                '👋 Olá, ' + firstName + '! Seja bem-vindo à *Pamonha e Cia* 🌽\n' +
                'Sou seu assistente virtual!\n\n' +
                'Por favor, escolha uma opção:\n\n' +
                '1️⃣ Fazer um pedido\n' +
                '2️⃣ Encomendar saco de milho\n' +
                '3️⃣ Falar com um atendente'
            );
            return;
        }

        if (msg.body === '1') {
            await delay(1000);
            await chat.sendStateTyping();
            await delay(1000);

            await client.sendMessage(from, '🛵 Entregamos nossos produtos fresquinhos em todo o *Guarujá*!');
            await delay(1000);
            await chat.sendStateTyping();
            await delay(1000);

            await client.sendMessage(from,
                '📋 Aqui está o nosso cardápio!\n\nPor favor, envie seu *endereço (rua, número e bairro)*.\n\n💳 Aceitamos *Pix* e *débito*!'
            );

            const media = MessageMedia.fromFilePath('./Cardápio Quiosque.jpg');
            await client.sendMessage(from, media, { caption: '📋 Cardápio da Pamonha e Cia' });
            return;
        }

        if (msg.body === '2') {
            await delay(1000);
            await chat.sendStateTyping();
            await delay(1000);

            await client.sendMessage(from,
                '🌽 Quantos *sacos de milho* você gostaria de encomendar?\n\nPor favor, envie:\n' +
                '📍 Endereço (rua, número, bairro e cidade)\n' +
                '🚚 E o *dia desejado para entrega*'
            );
            return;
        }

        if (msg.body === '3') {
            await delay(1000);
            await chat.sendStateTyping();
            await delay(1000);

            await client.sendMessage(from,
                '👤 Beleza!\nUm *atendente* vai te chamar em instantes.\n\nEnquanto isso, envie dúvidas ou pedidos 😊'
            );
            return;
        }

        // --- RESPOSTA PADRÃO PARA OPÇÕES INVÁLIDAS ---
        await client.sendMessage(from,
            '❗ Não entendi sua resposta.\n\nPor favor, escolha uma das opções abaixo:\n\n' +
            '1️⃣ Fazer um pedido\n' +
            '2️⃣ Encomendar saco de milho\n' +
            '3️⃣ Falar com atendente'
        );

    } catch (err) {
        console.error('❌ Erro no processamento da mensagem:', err);
    }
});

// --- HORÁRIO DE FUNCIONAMENTO ---
const foraDoHorario = () => {
    const agora = new Date();
    const horaUTC = agora.getUTCHours();
    const horaBrasilia = (horaUTC - 3 + 24) % 24; // GMT-3
    return (horaBrasilia < 7 || horaBrasilia >= 20);
};

// --- INICIALIZAÇÃO ---
client.initialize();

app.listen(port, () => {
    console.log(`🌐 Servidor Express rodando na porta ${port}`);
});