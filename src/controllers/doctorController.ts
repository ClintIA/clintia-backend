import {Request, Response} from "express";
import {generatePasswordByCpfAndName} from "../utils/passwordGenerator";
import {errorResponse, successResponse} from "../utils/httpResponses";
import {RegisterDoctorDTO} from "../types/dto/doctor/registerDoctorDTO";
import {addDoctorToExam} from "../services/tenantExamService";
import {
    deleteDoctorFromTenant,
    findDoctorsById,
    getDoctors,
    getDoctorsByExamName,
    registerDoctor,
    updateDoctorService
} from "../services/doctorService";

interface PaginationQuery {
    page?: string;
    take?: string;
    skip?: string;
}

interface GetDoctorsResult {
    doctors: any[];
    total: number;
}
export const getDoctorsByExamNameController = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Doctor']
    #swagger.summary = 'Get Doctors by Exam  '
    #swagger.description = 'Filter Doctors by exam name'
    */
    try {
        const { examName } = req.query;
        const result = await getDoctorsByExamName(examName as string);
        return successResponse(res, result, 'Doutores associados ao exame listados com sucesso');
    } catch (error) {
        return errorResponse(res, error);
    }
};
export const registerDoctorController = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Doctor']
    #swagger.summary = 'Register a Doctor'
    #swagger.description = 'Route to create a new doctor'
    */
    try {
        const newDoctor: RegisterDoctorDTO = req.body.newDoctor;
        const tenantId = req.tenantId!;
        const exams: string[] = req.body.exams;

        const password = generatePasswordByCpfAndName(newDoctor.cpf, newDoctor.fullName);

        const result = await registerDoctor(
            { ...newDoctor, password},
            tenantId
        );
        if(exams) {
            await addDoctorToExam(exams, result.data)
        }

        // await sendLoginInfoToAdmin({
        //     name: newDoctor.fullName,
        //     phoneNumber: newDoctor.phone || "",
        //     login: newDoctor.cpf,
        //     password: password,
        //     tenantId: tenantId
        // });

        return successResponse(res, result.message, 'Médico registrado com sucesso', 201);
    } catch (error) {
        return errorResponse(res, error);
    }
};
export const getDoctorByIDController = async (req: Request, res: Response) => {

    try {
        const doctorID = parseInt(req.params.id);

        const result = await findDoctorsById(doctorID);
        const newResult = { ...result, password: null}
        return successResponse(res, newResult , 'Médico atualizado com sucesso');
    } catch (error) {
        return errorResponse(res, error);
    }
};

export const updateDoctorController = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Doctor']
    #swagger.summary = 'Update Doctor'
    #swagger.description = 'Update doctor details such as CRM, CNPL, CEP, full name, and CPF'
    */
    try {
        const doctorID = parseInt(req.params.id);
        const { CRM, fullName, cpf, cep, phone, CNPJ, occupation } = req.body;

        const result = await updateDoctorService(doctorID, { CRM, fullName, cpf, cep, phone, CNPJ, occupation });
        return successResponse(res, result, 'Médico atualizado com sucesso');
    } catch (error) {
        return errorResponse(res, error);
    }
};
export const getDoctorsListController = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Doctor']
    #swagger.summary = 'List All Doctors by Tenant with pagination'
    #swagger.description = 'Get All Doctors from a Tenant with pagination By default list 10'
    */
    try {
        const tenantId = req.headers['x-tenant-id'];
        if (!tenantId || typeof tenantId !== 'string') {
            return errorResponse(res, new Error('Tenant ID inválido ou não informado'), 400);
        }

        const { page = '1', take = '10', skip = '0' } = req.query as PaginationQuery;

        const numericParams = {
            tenantId: parseInt(tenantId),
            take: parseInt(take),
            skip: parseInt(skip),
            page: parseInt(page)
        };

        if (Object.values(numericParams).some(isNaN)) {
            return errorResponse(res, new Error('Invalid pagination parameters'), 400);
        }
        const result: GetDoctorsResult = await getDoctors({
            tenantId: numericParams.tenantId,
            take: numericParams.take,
            skip: numericParams.skip
        });

        const remaining = result.total - result.doctors.length;

        const message = `Mostrando ${result.doctors.length} de ${result.total} médicos (${remaining} faltando)`;

        return successResponse(res, {
            data: result.doctors,
            pagination: {
                total: result.total,
                page: numericParams.page,
                take: numericParams.take,
                skip: numericParams.skip,
                remaining
            }
        }, message);

    } catch (error) {
        console.error('Error in getDoctorsListController', error);
        return errorResponse(res, error);
    }
};

export const deleteDoctorController = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Doctor']
    #swagger.summary = 'Delete Doctor'
    #swagger.description = 'Delete an doctor from the database by Doctor ID - can not be '
    */
    try {
        const doctorId = parseInt(req.params.id);
        const tenantId = req.headers['x-tenant-id'];

        await deleteDoctorFromTenant(doctorId, parseInt(tenantId as string));
        return successResponse(res, null, 'Médico deletado com sucesso');
    } catch (error) {
        return errorResponse(res, error);
    }
};