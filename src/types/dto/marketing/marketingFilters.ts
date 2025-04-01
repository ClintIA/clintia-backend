export interface MarketingFilters {
    tenantId?: number;
    startDate?: string
    endDate?: string
    status?: 'Scheduled' | 'InProgress' | 'Completed'
    examID?: number
    examType?: string
    attended?: string
    exam_name?: string
    channel?: string
    patientID?: number
    canal?: string
    gender?: string
    doctorID?: number
    month?: string
    year?: string
}

