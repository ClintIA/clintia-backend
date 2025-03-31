import {tenantExamsRepository} from '../repositories/tenantExamsRepository';
import {CreateExamDTO} from '../types/dto/tenantExam/createExamDTO';
import {UpdateExamDTO} from '../types/dto/tenantExam/updateExamDTO';
import {Doctor} from "../models/Doctor";
import {findDoctorsById} from "./doctorService";

export const createExam = async (examData: CreateExamDTO) => {
    const doctors: Doctor[] = [];
    if(examData.doctors) {
        for (const doctorId of examData.doctors) {
            const doctor = await findDoctorsById(parseInt(doctorId));
            if (doctor) {
                doctors.push(doctor);
            }
        }
    }

    await tenantExamsRepository.save({
        exam_name: examData.exam_name,
        price: examData.price,
        doctorPrice: examData.doctorPrice,
        tenant: { id: examData.tenantId },
        exam_type: examData.exam_type,
        doctors: doctors || []
    });
    return { message: 'Exame criado com sucesso' };
};

export const getExams = async (filters?: number) => {
    return await tenantExamsRepository.find({
        select: {
          id: true,
          exam_name: true,
          exam_type: true,
          price: true,
          doctorPrice: true,
            doctors: {
                id: true,
                fullName: true,
            },
        },
        where: { tenant: { id: filters } }, relations: ['doctors']
    });
};

export const getExam = async (examId: number)   => {
    return await tenantExamsRepository.find({
        where: { id: examId }
    });
};

export const addDoctorToExam = async (examsID: string[], doctor: Doctor) => {
    for (const id of examsID) {
        const doctors: Doctor[] = []
    await tenantExamsRepository.findOne({ where: { id: parseInt(id) } }).then(
            async (result) => {
                if(result) {
                    doctors.push(doctor)
                    await tenantExamsRepository.save(
                    { ...result, doctors: doctors}
                    )
                } else {
                    throw new Error('Erro ao Cadastrar Exame')
                }
            }
        )

    }
    return { message: 'Médico adicionado ao exame com sucesso' };
};

export const updateExam = async (examId: number, examData: UpdateExamDTO) => {
    const doctors: Doctor[] = [];

    if(examData.doctors) {
        for (const doctorId of examData.doctors) {
            const doctor =  await findDoctorsById(parseInt(doctorId));
            if(doctor) {
                doctors.push(doctor);
            }
        }
    }

    const updateExam = tenantExamsRepository.create({
        id: examId,
        exam_name: examData.exam_name,
        price: examData.price,
        doctorPrice: examData.doctorPrice,
        doctors: doctors,
        exam_type: examData.exam_type
    })
    const result = await tenantExamsRepository.save(
        updateExam
    );

    if (!result) {
        throw new Error('Exame ao atualizar exame');
    }

    return { message: 'Exame atualizado com sucesso' };
};

export const deleteExam = async (examId: number, tenantId: number) => {
    const result = await tenantExamsRepository.softDelete({
        id: examId,
        tenant: { id: tenantId },
    });

    if (result.affected === 0) {
        throw new Error('Exame não encontrado');
    }

    return { message: 'Exame deletado com sucesso' };
};
