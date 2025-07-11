// leitor de QR Code
const qrcode = require('qrcode-terminal');
const { Client, Buttons, List, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const client = new Client({authStrategy: new LocalAuth()});

// Função para simular delay
const delay = ms => new Promise(res => setTimeout(res, ms));

// Inicialização
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Tudo certo! WhatsApp conectado.');
});

client.initialize();

// Função para verificar se está fora do horário (antes das 7h ou depois das 20h)
const foraDoHorario = () => {
    const agora = new Date();
    const hora = agora.getHours();
    return (hora < 7 || hora >= 20);
};

// Atendimento principal
client.on('message', async msg => {
    const from = msg.from;

    // Verifica se é uma conversa individual
    if (!from.endsWith('@c.us')) return;

    // Fora do horário
    if (foraDoHorario()) {
        await client.sendMessage(from, 'Olá! Nosso horário de atendimento é das 7h às 20h. Mas pode deixar sua mensagem aqui e responderemos assim que possível! 🕒');
        return;
    }

    // Saudação inicial
    if (msg.body.match(/(menu|Menu|dia|tarde|bom|boa|Bom|Boa|noite|oi|Oi|Olá|olá|ola|Ola)/i)) {
        const chat = await msg.getChat();
        const contact = await msg.getContact();
        const name = contact.pushname || 'amigo';
        const firstName = name.split(' ')[0];

        await delay(2000);
        await chat.sendStateTyping();
        await delay(3000);

        await client.sendMessage(from,
            '👋 Olá, '+ firstName +'! Seja bem-vindo à *Companhia do Milho Verde* 🌽\n' +
            'Sou seu assistente virtual e estou aqui pra facilitar seu atendimento!\n\n' +
            'Por favor, escolha uma opção:\n\n' +
            '1️⃣ Fazer um pedido de pamonha, curau, suco de milho, milho cozido, canjica, bolo de milho, água de coco ou milho verde na espiga\n\n' +
            '2️⃣ Encomendar saco de milho\n\n' +
            '3️⃣ Falar com um atendente'
        );
        return;
    }

    // Opção 1 - Pedido de produtos
    if (msg.body === '1') {
        const chat = await msg.getChat();

        await delay(2000);
        await chat.sendStateTyping();
        await delay(3000);

        await client.sendMessage(from,
            '🛵 Entregamos nossos produtos fresquinhos em todo o *Guarujá*!'
        );

        await delay(1000);
        await chat.sendStateTyping();
        await delay(2000);

        await client.sendMessage(from,
            '📋 Aqui está o nosso cardápio!\n\nPor favor, envie também seu *endereço (rua, número e bairro)*.\n\n💳 Aceitamos pagamentos por *Pix* e *débito*!'
        );

        const media = MessageMedia.fromFilePath('./Cardápio Quiosque.jpg');
        await client.sendMessage(from, media, { caption: '📋 Cardápio da Companhia do Milho Verde' });

        return;
    }

    // Opção 2 - Encomenda de saco de milho
    if (msg.body === '2') {
        const chat = await msg.getChat();

        await delay(2000);
        await chat.sendStateTyping();
        await delay(3000);

        await client.sendMessage(from,
            '🌽 Quantos *sacos de milho* você gostaria de encomendar?\n\nPor favor, envie:\n' +
            '📍 Seu endereço (rua, número, bairro e cidade)\n' +
            '🚚 E o *dia desejado para entrega*'
        );

        return;
    }

    // Opção 3 - Falar com atendente
    if (msg.body === '3') {
        const chat = await msg.getChat();

        await delay(2000);
        await chat.sendStateTyping();
        await delay(3000);

        await client.sendMessage(from,
            '👤 Beleza!\nUm de nossos *atendentes* vai te chamar em instantes.\n\nEnquanto isso, fique à vontade para enviar dúvidas ou pedidos 😊'
        );

        return;
    }
});
