import {findTenantById} from '../services/tenantService';
import {sendWhatsAppMessage} from '../services/whatsappService';
import {SendExamReadyNotificationDTO} from '../types/dto/notification/sendExamReadyNotificationDTO';
import {SendExamScheduledDTO} from '../types/dto/notification/sendExamScheduledDTO';
import {SendLoginInfoDTO} from '../types/dto/notification/sendLoginInfoDTO';
import {WhatsAppMessageType} from '../types/enums/whatsappMessages';
import {formatPhoneNumber} from '../utils/formatPhoneNumber';
import {generateWhatsAppLink} from '../utils/generateWhatsAppLink';
import dotenv from 'dotenv';

dotenv.config();

export const sendLoginInfoToClient = async (clientData: SendLoginInfoDTO) => {
    const { name, phoneNumber, login, password, tenantId } = clientData;
    const formattedNumber = formatPhoneNumber(phoneNumber);
    const clinicData = await findTenantById(tenantId);

    if (!clinicData) {
        throw new Error('Tenant not found');
    }

    const clinicWhatsAppLink = generateWhatsAppLink(clinicData.whatsAppNumber);

    await sendWhatsAppMessage(formattedNumber.toString(), WhatsAppMessageType.LoginInfo, {
        name,
        clinicName: clinicData.name,
        clinicWhatsAppLink,
        platformLink: process.env.ExamPlatformLink,
        login,
        password
    });
};

export const sendLoginInfoToAdmin = async (adminData: SendLoginInfoDTO) => {
    const { name, phoneNumber, login, password, tenantId } = adminData;
    const formattedNumber = formatPhoneNumber(phoneNumber);
    const clinicData = await findTenantById(tenantId);

    if (!clinicData) {
        throw new Error('Tenant not found');
    }

    const clinicWhatsAppLink = generateWhatsAppLink(clinicData.whatsAppNumber);

    await sendWhatsAppMessage(formattedNumber.toString(), WhatsAppMessageType.AdminLoginInfo, {
        name,
        clinicName: clinicData.name,
        clinicWhatsAppLink,
        platformLink: process.env.ADMIN_PLATFORM_LINK,
        login,
        password
    });
};

export const sendExamReadyNotification = async (clientData: SendExamReadyNotificationDTO) => {
    const { name, phoneNumber, tenantId } = clientData;
    const formattedNumber = formatPhoneNumber(phoneNumber);
    const clinicData = await findTenantById(tenantId);

    if (!clinicData) {
        throw new Error('Tenant not found');
    }

    const clinicWhatsAppLink = generateWhatsAppLink(clinicData.whatsAppNumber);

    await sendWhatsAppMessage(formattedNumber.toString(), WhatsAppMessageType.ExamReady, {
        name,
        clinicName: clinicData.name,
        platformLink: process.env.EXAM_PLATFORM_LINK,
        clinicWhatsAppLink
    });
};

export const sendExamScheduled = async (clientData: SendExamScheduledDTO) => {
    const { name, phoneNumber, tenantId, examDateTime, examName } = clientData;
    const formattedNumber = formatPhoneNumber(phoneNumber);
    const clinicData = await findTenantById(tenantId);

    if (!clinicData) {
        throw new Error('Tenant not found');
    }

    const clinicWhatsAppLink = generateWhatsAppLink(clinicData.whatsAppNumber);

    await sendWhatsAppMessage(formattedNumber.toString(), WhatsAppMessageType.ExamScheduled, {
        name,
        clinicName: clinicData.name,
        clinicAdress: clinicData.address,
        examName: examName,
        examDateTime,
        clinicWhatsAppLink
    });
};
