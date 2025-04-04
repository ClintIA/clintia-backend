export interface CreateLeadDTO {
    name: string;
    phoneNumber: string;
    canal: string;
    indication_name?: string;
    contactChannel?: string;
    diagnosis?: string;
    scheduled?: boolean;
    scheduledDate?: Date;
    scheduledDoctorId?: number;
    examId?: number;
}