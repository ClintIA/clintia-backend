import {getWhatsAppClient} from "../config/whatsapp";
import {getTemplateMessage} from "../utils/messageTemplates";

export const sendWhatsAppMessage = async (to: string, templateKey: string, params: any) => {
    const client = getWhatsAppClient();
    const template = getTemplateMessage(templateKey, params);
    const formattedNumber = `${to.replace(/\D/g, '')}@c.us`;

    try {
        await client.sendMessage(formattedNumber, template);
        console.log(`Message sent to ${to}`);
    } catch (error) {
        console.error(`Failed to send message to ${to}:`, error);
    }
};