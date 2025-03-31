import {doctorRepository} from "../repositories/doctorRepository";
import {ILike} from "typeorm";
import bcrypt from "bcryptjs";
import {tenantRepository} from "../repositories/tenantRepository";
import {RegisterDoctorDTO} from "../types/dto/doctor/registerDoctorDTO";
import {PaginationQuery} from "../types/dto/doctor/paginationQuery";
import {adminRepository} from "../repositories/adminRepository";
import {patientExamsRepository} from "../repositories/patientExamsRepository";


export const getDoctors = async ({ tenantId, take = 100, skip = 0 }: PaginationQuery) => {
    const [doctors, total] = await doctorRepository.findAndCount({
        select: { id: true, fullName: true, cpf: true, role:true, CRM: true,occupation: true, phone: true, created_at: true },
        take,
        skip,
        where: { tenants: { id: tenantId } }
    });
    return { doctors, total };
};

export const findDoctorsByEmail = async (email: string) => {
    return await doctorRepository.findOne({where: {email: email}, relations: ['tenants']});
}
export const registerDoctor = async (doctorData: RegisterDoctorDTO, tenantId: number) => {
    const hashedPassword = await bcrypt.hash(doctorData.password!, 10);
    const tenant = await tenantRepository.findOne({ where: { id: tenantId } });

    if(!tenant){
        throw new Error('Tenant not found!');
    }

    const existingDoctor = await doctorRepository.findOne({ where: { email: doctorData.email }, relations: ['tenants'] });

    if (existingDoctor) {
        if (!existingDoctor.tenants.find(t => t.id === tenant.id)) {
            existingDoctor.tenants.push(tenant);
            await doctorRepository.save(existingDoctor);
        }

        return { data: existingDoctor, message: 'Doutor já registrado, associado ao novo tenant.' };
    }

    const newDoctor = doctorRepository.create({
        ...doctorData,
        password: hashedPassword,
        tenants: [tenant],
        role: 'doctor'
    });
    try {
        const result = await doctorRepository.save(newDoctor);
        return { data: result, message: 'Médico registrado com sucesso' };
    } catch (error) {
        throw new Error("Erro ao registrar médico: Verifique se o email ou CPF já existe.");
    }
};


export const getDoctorsByExamName = async (examName: string) => {
    return await doctorRepository.find({
        where: { exams: { exam_name: ILike(`%${examName}%`) } },
        relations: ['exams'],
        select: { id: true, fullName: true }
    });
};

export const findDoctorsById = async (id: number) => {
    return await doctorRepository.findOne({
        where: {
            id
        }
    })
}

export const updateDoctorService = async (doctorID: number, updateData: RegisterDoctorDTO) => {
    const result = await doctorRepository.update(doctorID, updateData);

    if (result.affected === 0) throw new Error('Médico não encontrado');

    return { message: 'Médico atualizado com sucesso' };
};

export const deleteDoctorFromTenant = async (doctorID: number, tenantID: number) => {
    const doctor = await doctorRepository.findOne({
        where: { id: doctorID },
        relations: ['tenants'],
    });

    if (!doctor) {
        throw new Error('Médico não encontrado.');
    }

    // Verifica se o médico está associado ao tenant especificado
    const tenantAssociation = doctor.tenants.find((t) => t.id === tenantID);
    if (!tenantAssociation) {
        throw new Error('Médico não está associado ao tenant especificado.');
    }

    const hasDependencies = await patientExamsRepository.count({
        where: { doctor: doctor },
    });

    if (hasDependencies > 0) {
        doctor.tenants = doctor.tenants.filter((t) => t.id !== tenantID);
        await doctorRepository.save(doctor);
        return { message: 'Médico desassociado do tenant, mas não deletado devido a dependências.' };
    }

    if (doctor.tenants.length > 1) {
        doctor.tenants = doctor.tenants.filter((t) => t.id !== tenantID);
        await doctorRepository.save(doctor);
        return { message: 'Médico desassociado do tenant com sucesso.' };
    }

    if (doctor.tenants.length === 1) {
        await doctorRepository.remove(doctor);
        return { message: 'Médico deletado com sucesso, pois não havia dependências e estava associado a apenas um tenant.' };
    }

    throw new Error('Erro inesperado ao deletar/desassociar médico.');
};
