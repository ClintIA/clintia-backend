import {Request, Response} from 'express';
import {registerPatient} from '../services/patientService';
import {loginAdmin, registerAdmin, selectTenantService} from '../services/adminService';
import {errorResponse, successResponse} from '../utils/httpResponses';
import {generatePassword, generatePasswordByCpfAndName} from "../utils/passwordGenerator";
import {sendLoginInfoToAdmin} from './notificationController';
import {RegisterPatientDTO} from '../types/dto/auth/registerPatientDTO';
import {LoginAdminDTO} from '../types/dto/auth/loginAdminDTO';
import {RegisterAdminDTO} from '../types/dto/auth/registerAdminDTO';

export const registerAdminController = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Admin']
    #swagger.summary = 'Register a Admin'
    #swagger.description = 'Route to create a new admin/doctor'
    */
    try {
        const newAdmin: RegisterAdminDTO = req.body;
        const tenantId = req.tenantId!;

        const password = generatePasswordByCpfAndName(newAdmin.cpf, newAdmin.fullName);

        const result = await registerAdmin(
            { ...newAdmin, password},
            tenantId
        );

        try {
            await sendLoginInfoToAdmin({
                name: result.data.fullName,
                phoneNumber: result.data.phone || "",
                login: result.data.email,
                password: password,
                tenantId: tenantId
            });
        } catch (e) {
            console.error('Erro ao enviar notificação de cadastro de admin', e);
        }

        return successResponse(res, result, 'Admin registrado com sucesso', 201);
    } catch (error) {
        return errorResponse(res, error);
    }
};

export const registerPatientController = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Admin']
    #swagger.summary = 'Register a Patient '
    #swagger.description = 'Route to create a new patient and send notification'
    */
    try {
        const patientData: RegisterPatientDTO = req.body;
        const tenantId = req.tenantId!;
        const password = generatePassword({
            full_name: patientData.full_name
        });

        const result = await registerPatient(
            { ...patientData, password },
            tenantId
        );

        // Não enviar info de login pro paciente por enquanto, somente quando for exame e verificar se ele já recebeu (sugiro criar tabela)

        // await sendLoginInfoToClient({
        //     name: patientData.full_name,
        //     phoneNumber: patientData.phone,
        //     login: patientData.cpf,
        //     password: password,
        //     tenantId: tenantId
        // });

        return successResponse(res, result, 'Paciente registrado com sucesso', 201);
    } catch (error) {
        return errorResponse(res, error);
    }
};


export const loginController = async (req: Request, res: Response) => {
    /*
     #swagger.tags = ['Auth']
     #swagger.summary = 'Login as Admin or Doctor'
     */
    try {
        const loginData: LoginAdminDTO = req.body;

        const result = await loginAdmin(loginData);

        if (result.multipleTenants) {
            return successResponse(res, { tenants: result.tenants, admin: result.admin, login: result.login }, 'Selecione o tenant para prosseguir.');
        }

        return successResponse(res, { token: result.token }, 'Login realizado com sucesso.');
    } catch (error) {
        return errorResponse(res, error, 401);
    }
};

export const selectTenantController = async (req: Request, res: Response) => {
    /*
     #swagger.tags = ['Auth']
     #swagger.summary = 'Select Tenant for Login'
     */
    try {
        const { user, tenantId } = req.body;

        const token = await selectTenantService(user, tenantId);

        return successResponse(res, { token }, 'Login realizado com sucesso.');
    } catch (error) {
        return errorResponse(res, error, 401);
    }
};

