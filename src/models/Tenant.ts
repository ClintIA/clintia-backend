import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from 'typeorm';
import {Patient} from './Patient';
import {Admin} from './Admin';
import {Product} from './Product';
import {TenantExams} from './TenantExams';
import {Doctor} from "./Doctor";
import {Marketing} from "./Marketing";

@Entity()
@Index(['id'])
export class Tenant {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    name!: string;

    @Column({ unique: true })
    domain!: string;

    @CreateDateColumn()
    created_at!: Date;

    @ManyToOne(() => Product, product => product.tenants)
    product!: Product;

    @Column({default: 0})
    uploadUsage!: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    budgetTotal!: number;

    @Column({ unique: true })
    whatsAppNumber!: string;

    @Column({ nullable: true })
    address!: string;

    @ManyToMany(() => Patient, patient => patient.tenants)
    patients!: Patient[];

    @ManyToMany(() => Admin, admin => admin.tenants)
    admins!: Admin[];

    @ManyToMany(() => Doctor, doctor => doctor.tenants)
    doctors!: Doctor[];

    @OneToMany(() => Marketing, marketing => marketing.tenant)
    marketing!: Marketing;

    @OneToMany(() => TenantExams, tenantExams => tenantExams.tenant)
    exams!: TenantExams[];
}
