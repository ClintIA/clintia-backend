export interface ListLeadsDTO {
    tenantId?: number;
    name?: string;
    phoneNumber?: string;
    scheduled?: boolean;
    doctorId?: number;
    examId?: number;
    take?: number;
    skip?: number;
}