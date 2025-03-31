import {patientExamsRepository} from "../repositories/patientExamsRepository";
import { MarketingFilters} from "../types/dto/marketing/marketingFilters";
import {patientRepository} from "../repositories/patientRepository";
import {tenantExamsRepository} from "../repositories/tenantExamsRepository";
import {marketingRepository} from "../repositories/marketingRepository";
import {MarketingDTO} from "../types/dto/marketing/marketingDTO";
import {findAdminById} from "../controllers/adminController";
import {tenantRepository} from "../repositories/tenantRepository";
import {getExams} from "./tenantExamService";
import {getDoctors} from "./doctorService";
import {listPatientExams} from "./patientExamService";
import {Between, LessThan, Like, MoreThan} from "typeorm";
import {Marketing} from "../models/Marketing";
import {PatientExams} from "../models/PatientExams";

interface IChart {
    name: string
    total?: number
    quantity?: number
    totalDoctor?: number
    profit?: number
    percent?: number
}
interface MarketingTotals {
    byChannel: {
        [channel: string]: {
            clicks: number;
            cost: number;
            leads: number;
        }
    };
    total: {
        clicks: number;
        cost: number;
        leads: number;
    }
}

interface TenantMarketingStats {
    tenant: MarketingTotals;
}

export const listCanalService = async (tenantID?: number) => {
    return await marketingRepository.find({
        select: {
            id: true,
            canal: true,
            budgetCanal: true,
            cost: true,
            clicks: true,
            leads: true,
        },
        order: { id: 'ASC'},
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
        const metrics = await marketingRepository.findOne({
            where: {
                tenant: { id: tenantID }
            }
        });
        const result = await tenantRepository.findOne({
            where: { id: tenantID },
            select: {
                budgetTotal: true
            }
        });
        return {
            budgetCanal: metrics?.budgetCanal,
            budget: result?.budgetTotal,
            leads: metrics?.leads,
            cost: metrics?.cost,
            clicks: metrics?.clicks
        }
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
            .andWhere("exam.id = :examId", { examId: filters.examID });
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
        queryBuilder.innerJoin("patientExam.doctor", "doctor")
            .andWhere("doctor.id = :doctorID", { doctorID: filters.doctorID });
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

    if (filters.patientID) {
        queryBuilder.andWhere("patient.id = :patientId", { patientId: filters.patientID });
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

export const totalExamPerDoctorByMonthService = async (filters: MarketingFilters) => {
    const doctorList = await getDoctors({tenantId: filters.tenantId, take: 1000})
    let totalInvoiceDoctors = 0;
    let quantityExamDoctor: IChart[] = [];

    for (const doctor of doctorList.doctors) {
        const patientExamlist = await listPatientExams({ doctorID: doctor.id })
        const countTotalExamsDoctor = await countInvoicingService({ ...filters, doctorID: doctor.id })
        for(const patientexam of patientExamlist.exams) {
            const examPrice = await examPricesService({
                examID: patientexam.exam.id
            })
            const countPatientExam = await countInvoicingService({ ...filters, doctorID: doctor.id, examID: patientexam.exam.id })
            totalInvoiceDoctors += countPatientExam.total * Number(examPrice.doctorPrice)
        }
        quantityExamDoctor.push({name: doctor.fullName, quantity: countTotalExamsDoctor.total})
    }
    return { quantityExamDoctor: quantityExamDoctor, totalInvoiceDoctor: totalInvoiceDoctors }
}

async function getMarketingTotalsByTenantAndChannel(tenantId: number, month: number) {
    return await marketingRepository.find({
        where: {
            tenant: { id: tenantId }
        },
        relations: ['tenant']
    })

}
async function getExamsByMonth(month: number, tenantId: number) {
    const queryBuilder = patientExamsRepository
        .createQueryBuilder('patientExams')
        .leftJoinAndSelect('patientExams.patient', 'patient')
        .leftJoinAndSelect('patientExams.exam', 'exam')
        .leftJoinAndSelect('patientExams.doctor', 'doctor')
        .leftJoinAndSelect('patientExams.tenant', 'tenant')
        .where('EXTRACT(MONTH FROM patientExams.createdAt) = :month', { month })
        .andWhere('patientExams.delete_at IS NULL');

    // Adiciona filtro por tenant se fornecido
    if (tenantId) {
        queryBuilder.andWhere('tenant.id = :tenantId', { tenantId });
    }

    return await queryBuilder.getMany();
}

export const totalInvoicePerExamByMonthService = async (filters: MarketingFilters) => {
    const examList = await getExams(filters.tenantId)
    let totalInvoice = 0;
    let totalDoctorInvoice = 0;
    let totalPerExam: IChart[] = []
    let profit = 0;
    let percent = 0;

    for (const exam of examList) {
        const countPatientExam = await countInvoicingService({ ...filters, exam_name: exam.exam_name})
        const examPrice = await examPricesService({
            examID: exam.id
        })
        totalInvoice += countPatientExam.total * Number(examPrice.price)
        totalDoctorInvoice += countPatientExam.total * Number(examPrice.doctorPrice)
        profit = (countPatientExam.total * Number(examPrice.price))-(countPatientExam.total * Number(examPrice.doctorPrice))
        percent = (profit / (countPatientExam.total * Number(examPrice.price))) * 100
        totalPerExam.push({
            name: exam.exam_name,
            quantity: countPatientExam.total,
            total: countPatientExam.total * Number(examPrice.price),
            totalDoctor: countPatientExam.total * Number(examPrice.doctorPrice),
            profit: profit,
            percent: percent ? percent : 0
        })
    }
    return { generalTotalInvoice: totalInvoice, doctorTotalInvoice: totalDoctorInvoice, totalPerExam: totalPerExam  }
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
    if(filters.doctorID) {
        whereCondition.doctors = { id: filters.doctorID }
    }

    const exam = await tenantExamsRepository.findOne({
        where: whereCondition
    })
    return { price: exam?.price, doctorPrice: exam?.doctorPrice }
}

export const upsertMarketingDataService = async (newData: MarketingDTO, tenantId: number) => {
    const admin = await findAdminById(newData.updatedBy);
    if (!admin) throw new Error('Admin não encontrado');

    const marketingData = marketingRepository.create({
        ...newData,
        updatedBy: admin,
        tenant: { id: tenantId },
    });

        await marketingRepository.update(newData.id, marketingData);


    return { message: 'Dados de marketing atualizados com sucesso' };
};

function calculateMarketingTotals(marketingData: Marketing[]): TenantMarketingStats {
    const result: TenantMarketingStats = {} as TenantMarketingStats;

    // Processa cada registro de marketing
    marketingData.forEach(record => {

        // Inicializa o objeto do tenant se não existir
        if (!result['tenant']) {
            result['tenant'] = {
                byChannel: {},
                total: {
                    clicks: 0,
                    cost: 0,
                    leads: 0
                }
            };
        }

        // Inicializa o canal se não existir
        if (!result['tenant'].byChannel[record.canal]) {
            result['tenant'].byChannel[record.canal] = {
                clicks: 0,
                cost: 0,
                leads: 0
            };
        }

        // Adiciona os valores ao canal específico
        result['tenant'].byChannel[record.canal].clicks += record.clicks || 0;
        result['tenant'].byChannel[record.canal].cost += Number(record.cost) || 0;
        result['tenant'].byChannel[record.canal].leads += record.leads || 0;

        // Adiciona os valores ao total do tenant
        result['tenant'].total.clicks += record.clicks || 0;
        result['tenant'].total.cost += Number(record.cost) || 0;
        result['tenant'].total.leads += record.leads || 0;
    });

    return result;
}
export const calculateMarketingMetrics = async (tenantId: number, month: string) => {

    const marketingData = await getMarketingTotalsByTenantAndChannel(tenantId, Number(month))
    const examsData = await getExamsByMonth(Number(month),tenantId)
    const metricsData = calculateMarketingTotals(marketingData)

    // Variáveis para cálculos
    let totalLeads: number = metricsData.tenant.total.leads
    let totalClicks: number =  metricsData.tenant.total.clicks
    let totalCost: number =  metricsData.tenant.total.cost
    let totalCompleted: number = 0;
    let totalInProgress: number = 0;
    let totalSchedulled: number = 0;
    let totalRevenue: number = 0;
    console.log(metricsData)
    // Processa dados de Exames
    examsData.forEach((exam: PatientExams) => {
        if (exam.status === 'Completed') {
            totalCompleted++;
            if(exam?.exam?.price) totalRevenue += Number(exam.exam.price);
        }
        if (exam.status === 'Scheduled') totalSchedulled++;
        if (exam.status === "InProgress") totalInProgress++;
    });
    console.log(totalRevenue)
    let totalAppointments = totalCompleted + totalInProgress + totalSchedulled;

    // Cálculos
    const CPL = totalCost / totalLeads || 0; // Custo por Lead
    const CAP = totalCost / totalAppointments || 0; // Custo por Agendamento
    const ROAS = totalRevenue / totalCost || 0; // Retorno sobre o Investimento
    const averageTicket = totalRevenue / totalCompleted || 0; // Ticket Médio
    const LTV = totalRevenue / totalLeads || 0; // Lifetime Value
    const CPC = totalCost / totalClicks || 0; // Custo por Clique

    // Taxas
    const appointmentRate = totalAppointments / totalLeads || 0; // Taxa de Aproveitamento
    const noShowRate = 1 - ((totalCompleted / totalAppointments) || 0); // Taxa de Absenteísmo
    const conversionRate = totalCompleted / totalLeads || 0; // Taxa de Conversão Final
    const roasPercentage = (ROAS - 1) * 100; // Taxa de ROAS

    return {
        CPL,
        CAP,
        ROAS,
        roasPercentage,
        averageTicket,
        CPC,
        LTV,
        appointmentRate,
        noShowRate,
        conversionRate,
        funnel: {
            clicks: totalClicks,
            leads: totalLeads,
            appointments: totalAppointments,
            completed: totalCompleted,
        },
    };
};



