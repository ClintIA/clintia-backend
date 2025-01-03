import {patientExamsRepository} from "../repositories/patientExamsRepository";
import { handleFilterDate} from "../utils/handleDate";
import { MarketingFilters} from "../types/dto/marketing/marketingFilters";
import {patientRepository} from "../repositories/patientRepository";
import {tenantExamsRepository} from "../repositories/tenantExamsRepository";
import {marketingRepository} from "../repositories/marketingRepository";
import {MarketingDTO} from "../types/dto/marketing/marketingDTO";
import {findAdminById} from "../controllers/adminController";
import {tenantRepository} from "../repositories/tenantRepository";
import {getExams} from "./tenantExamService";

interface IChart {
    name: string
    total: number
    totalDoctor?: number
}

export const listCanalService = async (tenantID?: number) => {
    return await marketingRepository.find({
        select: {
            id: true,
            canal: true,
            budgetCanal: true,
        },
        where: {
            tenant: { id: tenantID }
        }
    })
}

export const createCanalService = async (newCanal: MarketingDTO, tenantID: number) => {
    try {

        const admin = await findAdminById(newCanal.updatedBy)

        if(!admin) return new Error('Admin não encontrado')
        const canal = marketingRepository.create({
            canal: newCanal.canal,
            budgetCanal: newCanal.budgetCanal,
            createdBy: admin,
            updatedBy: admin,
            tenant: { id: tenantID },
        })
         await marketingRepository.save(canal)

        return { message: 'Canal Registrado com sucesso' }
    } catch (error) {
        return new Error('Erro ao cadastrar canal')
    }
}
export const updateCanalService = async (newCanal: MarketingDTO, tenantID: number) => {
    try {
        const admin = await findAdminById(newCanal.updatedBy)

        if(!admin) return new Error('Admin não encontrado')

        const canal = marketingRepository.create({
            canal: newCanal.canal,
            budgetCanal: newCanal.budgetCanal,
            createdBy: admin,
            updatedBy: admin,
            tenant: { id: tenantID },
        })
        if(newCanal.id) {
            await marketingRepository.update(newCanal.id,canal)

        }

        return { message: 'Canal Atualizado com sucesso' }
    } catch (error) {
        return new Error('Erro ao atualizar canal')
    }
}
export const deleteCanalService = async (canalID: number) => {
    try {
        await marketingRepository.delete({
          id: canalID
        })

        return { message: 'Canal deletado com sucesso' }
    } catch (error) {
        return new Error('Erro ao deletar canal')
    }
}

export const getBudgetByTenantService = async (tenantID: number) => {
    try {
        const result = await tenantRepository.findOne({
            where: { id: tenantID },
            select: {
                budgetTotal: true
            }
        })

        return { budget: result?.budgetTotal }
    }
    catch (error) {
        return new Error('Erro ao buscar budget')
    }
}

export const updateBudgetByTenantService = async (tenantBudget: number ,tenantID: number) => {
    try {
        const result = await tenantRepository.update({ id: tenantID },
            {
                budgetTotal: tenantBudget
            })
            if(result.affected !== 0) {
                return { budget: tenantBudget }
            }
    }
    catch (error) {
        return new Error('Erro ao buscar budget')
    }
}

export const countInvoicingService = async (filters: MarketingFilters) => {
    const queryBuilder = patientExamsRepository.createQueryBuilder("patientExam");

    if (filters.status) {
        queryBuilder.andWhere("patientExam.status = :status", { status: filters.status });
    }

    if (filters.examID) {
        queryBuilder.innerJoin("patientExam.exam", "exam")
            .andWhere("exam.id = :examId", { examId: parseInt(filters.examID) });
    }

    if (filters.startDate || filters.endDate) {
        const dateCondition = handleFilterDate(filters, 1);
        if (dateCondition.gte) {
            queryBuilder.andWhere("patientExam.examDate >= :startDate", { startDate: dateCondition.gte });
        }
        if (dateCondition.lte) {
            queryBuilder.andWhere("patientExam.examDate <= :endDate", { endDate: dateCondition.lte });
        }
    }

    if (filters.tenantId) {
        queryBuilder.innerJoin("patientExam.tenant", "tenant")
            .andWhere("tenant.id = :tenantId", { tenantId: filters.tenantId });
    }

    if (filters.examType) {
        queryBuilder.innerJoin("patientExam.exam", "exam")
            .andWhere("exam.exam_type = :examType", { examType: filters.examType });
    }

    if (filters.attended !== undefined) {
        queryBuilder.andWhere("patientExam.attended = :attended", { attended: filters.attended });
    }

    if (filters.exam_name) {
        queryBuilder.innerJoin("patientExam.exam", "exam")
            .andWhere("exam.exam_name = :examName", { examName: filters.exam_name });
    }
    if (filters.doctorID) {
        queryBuilder.innerJoin("patientExam.exam", "exam").leftJoin("exam.doctors", "doctor")
            .andWhere("doctor. = :doctorID", { id: filters.doctorID });
    }
    if (filters.channel) {
        queryBuilder.innerJoin("patientExam.patient", "patient")
            .andWhere("patient.canal = :channel", { channel: filters.channel });
    }

    const totalExams = await queryBuilder.getCount();

    return { total: totalExams };
};

export const countPatientByMonthService = async (filters: MarketingFilters) => {
    const queryBuilder = patientRepository.createQueryBuilder("patient");

    if (filters.tenantId) {
        queryBuilder.innerJoin("patient.tenants", "tenant")
            .andWhere("tenant.id = :tenantId", { tenantId: filters.tenantId });
    }

    if (filters.startDate || filters.endDate) {
        const dateCondition = handleFilterDate(filters, 1);
        if (dateCondition.gte) {
            queryBuilder.andWhere("patient.examDate >= :startDate", { startDate: dateCondition });
        }
        if (dateCondition.lte) {
            queryBuilder.andWhere("patient.examDate <= :endDate", { endDate: dateCondition });
        }
    }

    if (filters.patientID) {
        queryBuilder.andWhere("patient.id = :patientId", { patientId: parseInt(filters.patientID) });
    }

    if (filters.gender) {
        queryBuilder.andWhere("patient.gender = :gender", { gender: filters.gender });
    }

    if (filters.canal) {
        queryBuilder.andWhere("patient.canal = :canal", { canal: filters.canal });
    }

    const totalExamType = await queryBuilder.getCount();

    return { total: totalExamType };
};

export const totalInvoiceByMonthService = async (filters: MarketingFilters) => {
    const examList = await getExams(filters.tenantId)
    let totalInvoice = 0;
    let totalDoctorInvoice = 0;
    let totalExamQuantity: IChart[] = []
    let totalPerExam: IChart[] = []

    for (const exam of examList) {

        const countPatientExam = await countInvoicingService({ ...filters, exam_name: exam.exam_name})
        const examPrice = await examPricesService({
            examID: exam.id.toString()
        })
        totalInvoice += countPatientExam.total * Number(examPrice.price)
        totalDoctorInvoice += countPatientExam.total * Number(examPrice.doctorPrice)
        totalPerExam.push({name: exam.exam_name, total: countPatientExam.total * Number(examPrice.price)})
        totalExamQuantity.push({name: exam.exam_name, total: countPatientExam.total})
    }

    return { generalTotalInvoice: totalInvoice, doctorTotalInvoice: totalDoctorInvoice, examList: totalExamQuantity, totalPerExam: totalPerExam  }
}

export const listChannelByMonthService = async (filters: MarketingFilters) => {

    const listChannel = await listCanalService(filters.tenantId)
    const chartChannelPatient: IChart[] = [];
    const chartChannelExamCompleted: IChart[] = [];
    for(const channel of listChannel) {
        const buildList = await countPatientByMonthService({
            canal: channel.id.toString()
        })
        const countChannel = await countInvoicingService({
            channel: channel.id.toString(),
            status: filters.status
        })
        chartChannelExamCompleted.push({ name: channel.canal, total: countChannel.total })
        chartChannelPatient.push({ name: channel.canal, total: buildList.total })
    }
    return { listChannelPerPatient: chartChannelPatient, listChannelPerExam: chartChannelExamCompleted }
}

export const examPricesService = async (filters: MarketingFilters) => {
    const whereCondition: any = {};

    if(filters.tenantId) {
        whereCondition.tenant = { id: filters.tenantId }
    }
    if(filters.examID) {
        whereCondition.id = filters.examID
    }

    const exam = await tenantExamsRepository.findOne({
        where: whereCondition
    })
    return { price: exam?.price, doctorPrice: exam?.doctorPrice }
}
