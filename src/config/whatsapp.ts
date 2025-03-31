import {Client, LocalAuth} from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

const client = new Client({ puppeteer: {
    headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-extensions'] },
    authStrategy: new LocalAuth(),
});


client.on('qr', (qr) => {
    console.log('QR CODE')
    console.log('---------------------')
    console.log(qr)
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp Client is ready!');
});

client.on('authenticated', () => {
    console.log('WhatsApp authentication successful!');
});

client.on('auth_failure', () => {
    console.error('Authentication failed, please check your credentials.');
});

client.on('disconnected', (reason) => {
    console.log('WhatsApp client disconnected:', reason);
});

export const initializeWhatsApp = async () => {
    console.log('Iniciando WhatsApp Client')
    await client.initialize();
};

export const getWhatsAppClient = () => client;
