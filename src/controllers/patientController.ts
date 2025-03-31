import {Request, Response} from 'express';
import {errorResponse, successResponse} from '../utils/httpResponses';
import {
    deletePatientService,
    findPatientByCpf,
    findPatientByPhoneService,
    listPatientByTenant,
    updatePatientService
} from "../services/patientService";
import {PatientFiltersDTO} from '../types/dto/patient/patientFiltersDTO';
import {UpdatePatientDTO} from '../types/dto/patient/updatePatientDTO';

export const listPatients = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Admin']
    #swagger.summary = 'List All Patients by Tenant'
    #swagger.description = 'List All Patients from a tenant'
    */
    const { take, skip, patientCpf, patientName } = req.query;
    const tenantId = req.tenantId;
    const filters: PatientFiltersDTO = {
        patientCpf: patientCpf as string | undefined,
        patientName: patientName as string | undefined,
    };

    if (!tenantId) {
        throw new Error('Tenant não encontrado');
    }

    const takeNumber = take ? parseInt(take as string, 10) : 1000;
    const skipNumber = skip ? parseInt(skip as string, 10) : 0;

    try {
        const result = await listPatientByTenant(filters, tenantId, takeNumber, skipNumber);
        return successResponse(res, result);
    } catch (error) {
        return errorResponse(res, error);
    }
}

export const updatePatient = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Admin/Patient']
    #swagger.summary = 'Update a Patient'
    #swagger.description = 'Route to update a Patient from a tenant'
    */
    const tenantId = req.tenantId;
    const patientData: UpdatePatientDTO = req.body;
    const { patientId } = req.params;
    if (!tenantId) {
        throw new Error('Tenant não encontrado');
    }

    try {
        const result = await updatePatientService(patientData, parseInt(patientId));
        return successResponse(res, result);
    } catch (error) {
        return errorResponse(res, error);
    }
}

export const deletePatient = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Admin/Patient']
    #swagger.summary = 'Delete a Patient'
    #swagger.description = 'Route to delete a Patient from a tenant'
    */
    const { patientId } = req.params;
    const tenantId = req.tenantId;

    if (!tenantId) {
        throw new Error('Tenant não encontrado');
    }

    try {
        const result = await deletePatientService(parseInt(patientId as string, 10), tenantId);
        return successResponse(res, result);
    } catch (error) {
        return errorResponse(res, error);
    }
}

export const findPatientByCPF = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Admin/Patient']
    #swagger.summary = 'Find a Patient by CPF'
    #swagger.description = 'Get patient info by CPF'
    */
    const { cpf } = req.query;

    try {
        const patient = await findPatientByCpf(cpf as string);
        if (!patient) {
            return errorResponse(res, new Error('Paciente não encontrado'), 404);
        }

        const { password, ...patientInfoWithoutPassword } = patient;
        return successResponse(res, patientInfoWithoutPassword);
    } catch (error) {
        return errorResponse(res, error);
    }
}
export const findPatientByPhone = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Admin/Patient']
    #swagger.summary = 'Find a Patient by CPF'
    #swagger.description = 'Get patient info by CPF'
    */
    const { phone } = req.query;

    try {
        const patient = await findPatientByPhoneService(phone as string);
        if (!patient) {
            return errorResponse(res, new Error('Paciente não encontrado'), 404);
        }

        const { password, ...patientInfoWithoutPassword } = patient;
        return successResponse(res, patientInfoWithoutPassword);
    } catch (error) {
        return errorResponse(res, error);
    }
}
