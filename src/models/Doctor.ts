import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn
} from 'typeorm';
import {Tenant} from './Tenant';
import {TenantExams} from './TenantExams';
import {ProfileRole} from "../types/enums/ProfileRole";

@Entity()
@Index(['id', 'fullName', 'occupation'])
export class Doctor {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    cpf!: string;

    @Column()
    password!: string;

    @Column({ unique: true, nullable: true })
    email!: string;

    @Column({ nullable: true })
    CRM?: string;

    @Column({nullable: true})
    cep?: string;

    @Column( { enum: ProfileRole, default: 'doctor' } )
    role!: string;

    @Column({nullable: true})
    cnpj?: string;

    @Column()
    phone!: string;

    @Column()
    fullName!: string;

    @Column({ nullable: true})
    occupation?: string;

    @Column({ nullable: true })
    sessionToken?: string;

    @CreateDateColumn()
    created_at!: Date;

    @ManyToMany(() => Tenant, tenant => tenant.admins)
    @JoinTable()
    tenants!: Tenant[];

    @ManyToMany(() => TenantExams, exam => exam.doctors)
    @JoinTable()
    exams!: TenantExams[];

    @DeleteDateColumn()
    delete_at?: Date;
}
