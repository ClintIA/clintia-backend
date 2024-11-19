export interface RegisterPatientDTO {
    full_name: string;
    cpf: string;
    dob: string;
    email: string;
    phone: string;
    cep: number;
    canal: string;
    gender: "Masculino" | "Feminino" | "Prefiro não informar";
    health_card_number?: string;
    password?: string;
}
