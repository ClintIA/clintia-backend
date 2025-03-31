import {Request, Response} from 'express';
import {customErrorResponse, errorResponse, successResponse} from '../utils/httpResponses';
import {
    deleteAdmin,
    getAdminByCPF,
    getAdminById,
    getAdmins,
    getAdminsByName,
    updateAdmin
} from "../services/adminService";
import {adminRepository} from "../repositories/adminRepository";

export const findAdminById = async (adminId: number) => {
    return await adminRepository.findOne({where: {id: adminId}})
}

export const getAdminListController =  async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Admin']
    #swagger.summary = 'List All Admins by Tenant'
    #swagger.description = 'Get All Admins from a Tenant'
    */
    try {
        const tenantId = req.headers['x-tenant-id'];
        const result = await getAdmins(parseInt(tenantId as string));
        return successResponse(res, result);

    } catch (error) {
        return errorResponse(res, error);
    }
}
export const getAdminsByCPFController = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Admin']
    #swagger.summary = 'Get Admin info by CPF'
    #swagger.description = 'Filter Admins with CPF '
    */
   try {
        const { cpf } = req.query;
        const result = await getAdminByCPF(cpf as string)

       if(!result) {
           return customErrorResponse(res, 'Admin não encontrado');
       }
       return successResponse(res, result);

   }  catch (error) {
    return errorResponse(res, error);

    }
}
export const getAdminsByIDController = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Admin']
    #swagger.summary = 'Get Admin info by CPF'
    #swagger.description = 'Filter Admins with CPF '
    */
    try {
        const { adminID } = req.query;
        const result = await getAdminById(parseInt(adminID as string))

        if(!result) {
            return customErrorResponse(res, 'Admin não encontrado');
        }
        return successResponse(res, result);

    }  catch (error) {
        return errorResponse(res, error);

    }
}
export const getAdminsByNameController = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Admin']
    #swagger.summary = 'Get Admin info with Name '
    #swagger.description = 'Get Admin infos filter by Name'
    */
   try {
       const { fullName } = req.query;

       const result = await getAdminsByName(fullName as string)
       return successResponse(res, result);

   } catch (error) {
       return errorResponse(res, error);

   }
}



export const updateAdminController = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Admin']
    #swagger.summary = 'Update Admin'
    #swagger.description = 'Update admin details such as email, full name, and CPF'
    */
    try {
        const adminId = parseInt(req.params.id);
        const { email, fullName, cpf, cep, phone, role } = req.body;
        
        const result = await updateAdmin(adminId, { email, fullName, cpf, phone, cep, role });
        return successResponse(res, result, 'Admin atualizado com sucesso');
    } catch (error) {
        return errorResponse(res, error);
    }
};


export const deleteAdminController = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Admin']
    #swagger.summary = 'Delete Admin'
    #swagger.description = 'Delete an admin from the database by admin ID'
    */
    try {
        const adminId = parseInt(req.params.adminId);
        const tenantId = req.headers['x-tenant-id'];
        
        await deleteAdmin(adminId, Number(tenantId));
        return successResponse(res, null, 'Admin deletado com sucesso');
    } catch (error) {
        return errorResponse(res, error);
    }
};