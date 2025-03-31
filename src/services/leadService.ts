import {leadRepository} from '../repositories/leadRepository';
import {tenantExamsRepository} from '../repositories/tenantExamsRepository';
import {doctorRepository} from '../repositories/doctorRepository';
import {tenantRepository} from '../repositories/tenantRepository';
import {CreateLeadDTO} from '../types/dto/lead/CreateLeadDTO';
import {UpdateLeadDTO} from '../types/dto/lead/UpdateLeadDTO';
import {DeleteLeadDTO} from '../types/dto/lead/DeleteLeadDTO';
import {ListLeadsDTO} from '../types/dto/lead/ListLeadsDTO';


export const listLeads = async (filters?: ListLeadsDTO) => {
    let queryBuilder = leadRepository
        .createQueryBuilder("lead")
        .leftJoinAndSelect("lead.exam", "exam")
        .leftJoinAndSelect("lead.scheduledDoctor", "scheduledDoctor")
        .leftJoinAndSelect("lead.tenant", "tenant")
        .where("lead.delete_at IS NULL")
    if (filters?.tenantId) {
        queryBuilder = queryBuilder.andWhere("tenant.id = :tenantId", { tenantId: filters.tenantId })
    }
    if (filters?.name) {
        queryBuilder = queryBuilder.andWhere("lead.name LIKE :name", { name: `%${filters.name}%` })
    }
    if (filters?.phoneNumber) {
        queryBuilder = queryBuilder.andWhere("lead.phoneNumber = :phoneNumber", { phoneNumber: filters.phoneNumber })
    }
    if (filters?.scheduled !== undefined) {
        queryBuilder = queryBuilder.andWhere("lead.scheduled = :scheduled", { scheduled: filters.scheduled })
    }
    if (filters?.doctorId) {
        queryBuilder = queryBuilder.andWhere("scheduledDoctor.id = :doctorId", { doctorId: filters.doctorId })
    }
    if (filters?.examId) {
        queryBuilder = queryBuilder.andWhere("exam.id = :examId", { examId: filters.examId })
    }
    if (filters?.callDate) {
        queryBuilder = queryBuilder.andWhere("lead.callDate = :callDate", { callDate: filters.callDate })
    }
    if (filters?.day) {
        queryBuilder = queryBuilder.andWhere("EXTRACT(DAY FROM lead.callDate) = :day", { day: filters.day })
    }
    if (filters?.month) {
        queryBuilder = queryBuilder.andWhere("EXTRACT(MONTH FROM lead.callDate) = :month", { month: filters.month })
    if (filters?.year) {
        queryBuilder = queryBuilder.andWhere("EXTRACT(YEAR FROM lead.callDate) = :year", { year: filters.year })
    }
    }
    if (filters?.take) {
        queryBuilder = queryBuilder.take(filters.take)
    }
    if (filters?.skip) {
        queryBuilder = queryBuilder.skip(filters.skip)
    }


    queryBuilder = queryBuilder.orderBy("lead.callDate", "DESC")
    const [leads, total] = await queryBuilder.getManyAndCount()
    return { leads, total }
}

export const createLead = async (leadData: CreateLeadDTO, tenantId: number) => {
    let exam;
    let scheduledDoctor;

    if (leadData.examId) {
        exam = await tenantExamsRepository.findOne({ where: { id: leadData.examId } });
    }
    if (leadData.scheduledDoctorId) {
        scheduledDoctor = await doctorRepository.findOne({ where: { id: leadData.scheduledDoctorId } });
    }
    const tenant = await tenantRepository.findOne({ where: { id: tenantId } });
    if (!tenant) {
        throw new Error('Tenant inválido');
    }

    const newLead = leadRepository.create({
        ...leadData,
        exam,
        scheduledDoctor,
        tenant
    });

    const result = await leadRepository.save(newLead);
    return { message: 'Lead criado com sucesso', data: result };
};

export const updateLead = async (leadId: number, leadData: UpdateLeadDTO) => {
    let exam;
    let scheduledDoctor;

    if (leadData.examId) {
        exam = await tenantExamsRepository.findOne({ where: { id: leadData.examId } });
    }
    if (leadData.scheduledDoctorId) {
        scheduledDoctor = await doctorRepository.findOne({ where: { id: leadData.scheduledDoctorId } });
    }
    delete leadData.scheduledDoctorId
    delete leadData.examId
    const updateResult = await leadRepository.update({ id: leadId }, {...leadData, scheduledDoctor: scheduledDoctor, exam: exam});

    if (!updateResult.affected) {
        throw new Error('Erro ao atualizar o lead ou lead não encontrado');
    }
    const updatedLead = await leadRepository.findOne({ where: { id: leadId } });
    return { message: 'Lead atualizado com sucesso', data: updatedLead };
};

export const deleteLead = async ({ leadId, tenantId }: DeleteLeadDTO) => {
    const updateResult = await leadRepository.softDelete(
        { id: leadId, tenant: { id: tenantId } },
    );

    if (!updateResult.affected) {
        throw new Error('Lead não encontrado');
    }
    return { message: 'Lead deletado (soft delete) com sucesso' };
};
