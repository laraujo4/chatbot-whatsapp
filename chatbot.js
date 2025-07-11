const qrcode = require('qrcode');
const express = require('express');
const { Client, Buttons, List, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const app = express();
const port = process.env.PORT || 3000;

let qrCodeData = ''; // Armazena o QR code

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox'],
    },
});

// Função para simular delay
const delay = ms => new Promise(res => setTimeout(res, ms));

// Servidor web para exibir QR
app.get('/', (req, res) => {
    res.send('✅ Bot rodando! Acesse <a href="/qrcode">/qrcode</a> para escanear o QR');
});

app.get('/qrcode', async (req, res) => {
    if (!qrCodeData) {
        return res.send('⏳ QR Code ainda não gerado. Aguarde...');
    }
    const qrImage = await qrcode.toDataURL(qrCodeData);
    res.send(`<h2>Escaneie com o WhatsApp:</h2><img src="${qrImage}">`);
});

client.on('qr', qr => {
    qrCodeData = qr;
    console.log('⚠️ Novo QR Code gerado! Acesse /qrcode para escanear.');
});

client.on('ready', () => {
    console.log('✅ WhatsApp conectado!');
});

client.initialize();

client.on('message', async msg => {
    const from = msg.from;
    if (!from.endsWith('@c.us')) return;

    if (foraDoHorario()) {
        await client.sendMessage(from, 'Olá! Nosso horário de atendimento é das 7h às 20h. Mas pode deixar sua mensagem aqui e responderemos assim que possível! 🕒');
        return;
    }

    if (msg.body.match(/(menu|Menu|teste|Teste|dia|tarde|bom|boa|Bom|Boa|noite|oi|Oi|Olá|olá|ola|Ola)/i)) {
        const chat = await msg.getChat();
        const contact = await msg.getContact();
        const name = contact.pushname || 'amigo';
        const firstName = name.split(' ')[0];

        await delay(1000);
        await chat.sendStateTyping();
        await delay(1000);

        await client.sendMessage(from,
            '👋 Olá, ' + firstName + '! Seja bem-vindo à *Pamonha e Cia* 🌽\n' +
            'Sou seu assistente virtual e estou aqui pra facilitar seu atendimento!\n\n' +
            'Por favor, escolha uma opção:\n\n' +
            '1️⃣ Fazer um pedido de pamonha, curau, suco de milho, milho cozido, canjica, bolo de milho, água de coco ou milho verde na espiga\n\n' +
            '2️⃣ Encomendar saco de milho\n\n' +
            '3️⃣ Falar com um atendente'
        );
        return;
    }

    if (msg.body === '1') {
        const chat = await msg.getChat();
        await delay(1000);
        await chat.sendStateTyping();
        await delay(1000);

        await client.sendMessage(from, '🛵 Entregamos nossos produtos fresquinhos em todo o *Guarujá*!');

        await delay(1000);
        await chat.sendStateTyping();
        await delay(1000);

        await client.sendMessage(from, '📋 Aqui está o nosso cardápio!\n\nPor favor, envie também seu *endereço (rua, número e bairro)*.\n\n💳 Aceitamos pagamentos por *Pix* e *débito*!');

        const media = MessageMedia.fromFilePath('./Cardápio Quiosque.jpg');
        await client.sendMessage(from, media, { caption: '📋 Cardápio da Pamonha e Cia' });
        return;
    }

    if (msg.body === '2') {
        const chat = await msg.getChat();
        await delay(1000);
        await chat.sendStateTyping();
        await delay(1000);
        await client.sendMessage(from,
            '🌽 Quantos *sacos de milho* você gostaria de encomendar?\n\nPor favor, envie:\n' +
            '📍 Seu endereço (rua, número, bairro e cidade)\n' +
            '🚚 E o *dia desejado para entrega*'
        );
        return;
    }

    if (msg.body === '3') {
        const chat = await msg.getChat();
        await delay(1000);
        await chat.sendStateTyping();
        await delay(1000);
        await client.sendMessage(from,
            '👤 Beleza!\nUm de nossos *atendentes* vai te chamar em instantes.\n\nEnquanto isso, fique à vontade para enviar dúvidas ou pedidos 😊'
        );
        return;
    }
});

const foraDoHorario = () => {
    const agora = new Date();
    const hora = agora.getHours();
    return (hora < 7 || hora >= 20);
};

app.listen(port, () => {
    console.log(`🌐 Servidor Express rodando na porta ${port}`);
});
