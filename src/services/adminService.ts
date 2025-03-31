import {Admin} from '../models/Admin';
import bcrypt from 'bcryptjs';
import {generateToken} from '../utils/jwtHelper';
import {adminRepository} from '../repositories/adminRepository';
import {ILike} from "typeorm";
import {UpdateAdminDTO} from '../types/dto/admin/updateAdminDTO';
import {LoginAdminDTO} from '../types/dto/auth/loginAdminDTO';
import {RegisterAdminDTO} from '../types/dto/auth/registerAdminDTO';
import {tenantRepository} from "../repositories/tenantRepository";
import {findDoctorsByEmail} from "./doctorService";
import {Doctor} from '../models/Doctor';
import {doctorRepository} from "../repositories/doctorRepository";
import {patientExamsRepository} from "../repositories/patientExamsRepository";

const findAdminByEmail = async (email: string): Promise<Admin | null> => {
    return await adminRepository.findOne({where: { email: email }, relations: ['tenants']});
};
export const getAdminById = async (adminID: number): Promise<Admin | null> => {
    return await adminRepository.findOne({ where: { id: adminID }, relations: ['tenants'] });
};
/**
 * Registers a new admin by hashing the provided password and associating the admin with a tenant.
 *
 * @param {RegisterAdminDTO} adminData - The registration data containing the admin's details such as email, cpf, and fullName.
 * @param {number} tenantId - The ID of the tenant to associate the new admin with.
 * @returns {Promise<{data: Admin, message: string}>} A promise that resolves to an object containing the saved admin data and a success message.
 *
 * @throws Will throw an error if the tenant is not found or if there is an issue saving the admin (e.g., email or CPF already exists).
 */
export const registerAdmin = async (adminData: RegisterAdminDTO, tenantId: number): Promise<{ data: Admin; message: string; }> => {
    const hashedPassword = await bcrypt.hash(adminData.password!, 10);
    const tenant = await tenantRepository.findOne({where: {id: tenantId}});
    if (!tenant) {
        throw new Error('Tenant não encontrado.');
    }

    const existingAdmin = await adminRepository.findOne({ where: { email: adminData.email }, relations: ['tenants'] });

    if (existingAdmin) {
        if (!existingAdmin.tenants.find(t => t.id === tenant.id)) {
            existingAdmin.tenants.push(tenant);
            await adminRepository.save(existingAdmin);
        }

        return { data: existingAdmin, message: 'Admin já registrado, associado ao novo tenant.' };
    }

    const newAdmin = adminRepository.create({
        ...adminData,
        password: hashedPassword,
        tenants: [tenant]
    });
    try {
        const result = await adminRepository.save(newAdmin);
        return {data: result, message: 'Admin registrado com sucesso'};
    } catch (error) {
        throw new Error("Erro ao registrar admin: Verifique se o email ou CPF já existe.");
    }
};

/**
 * Authenticates an admin or doctor by their email and password.
 *
 * @param {LoginAdminDTO} loginData - The login credentials containing the user's email and password.
 * @returns {Promise<string>} A promise that resolves to a session token if authentication is successful.
 *
 * @throws Will throw an error if the user is not found or if the password is invalid.
 */
export const loginAdmin = async (loginData: LoginAdminDTO): Promise<any>  => {
    let user: Admin | Doctor | null = await findAdminByEmail(loginData.login) || await findDoctorsByEmail(loginData.login);
    if (!user) throw new Error('Usuário não encontrado');

    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
    if (!isPasswordValid) throw new Error('Senha inválida');
    const tenants = user.tenants;

    if (tenants.length > 1) {
        return { multipleTenants: true, tenants, admin: user.fullName, login: user.email };
    }

    const token = generateToken(user.id, user.role, tenants[0].id, tenants[0].name);
    user.sessionToken = token;
    if (user instanceof Admin) {
        await adminRepository.save(user);
    } else {
        await doctorRepository.save(user);
    }

    return { multipleTenants: false, token };
};

export const selectTenantService = async (userLogin: string, tenantId: number) => {
    let user: Admin | Doctor | null = await findAdminByEmail(userLogin) || await findDoctorsByEmail(userLogin);
    if (!user) throw new Error('Usuário não encontrado');

    const tenant = user.tenants.find(t => t.id === tenantId);
    if (!tenant) throw new Error('Tenant inválido.');

    const token = generateToken(user.id, user.role, tenantId, tenant.name);
    user.sessionToken = token;

    if (user instanceof Admin) {
        await adminRepository.save(user);
    } else {
        await doctorRepository.save(user);
    }

    return token
};


export const getAdmins = async (tenantId: number) => {
    return await adminRepository.find({
        select: { id: true, fullName: true, cpf: true, email: true, cep: true, phone: true, created_at: true, role: true },
        where: { tenants: { id: tenantId } },
        relations: ['tenants'],
    });
};

export const getAdminByCPF = async (cpf: string) => {
    return await adminRepository.findOne({
        select: { email: true, fullName: true, cpf: true, role: true },
        where: { cpf }
    });
};

export const getAdminsByName = async (name: string) => {
    return await adminRepository.find({
        select: { email: true, fullName: true, cpf: true, role: true },
        where: { fullName: ILike(`%${name}%`) }
    });
};


export const updateAdmin = async (adminId: number, updateData: UpdateAdminDTO) => {
    const result = await adminRepository.update(adminId, updateData);

    if (result.affected === 0) throw new Error('Admin não encontrado');

    return { message: 'Admin atualizado com sucesso' };
};

export const deleteAdmin = async (adminId: number, tenantId: number) => {
    const admin = await adminRepository.findOne({
        where: { id: adminId },
        relations: ['tenants']
    });

    if (!admin) {
        throw new Error('Admin não encontrado');
    }

    if (admin.role === 'master') {
        throw new Error('Não é possível deletar este admin específico (master).');
    }

    const tenantAssociation = admin.tenants.find(t => t.id === tenantId);
    if (!tenantAssociation) {
        throw new Error('Admin não está associado ao tenant especificado.');
    }

    const hasDependencies = await patientExamsRepository.count({
        where: { createdBy: admin }
    });

    if (hasDependencies > 0) {
        admin.tenants = admin.tenants.filter(t => t.id !== tenantId);
        await adminRepository.save(admin);
        return { message: 'Admin desassociado do tenant, mas não deletado devido a dependências.' };
    }

    if (admin.tenants.length > 1) {
        admin.tenants = admin.tenants.filter(t => t.id !== tenantId);
        await adminRepository.save(admin);
        return { message: 'Admin desassociado do tenant com sucesso.' };
    }

    if (admin.tenants.length === 1) {
        await adminRepository.remove(admin);
        return { message: 'Admin deletado com sucesso, pois não havia dependências e estava associado a apenas um tenant.' };
    }

    throw new Error('Erro inesperado ao deletar/desassociar Admin.');
};

