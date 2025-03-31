import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    JoinTable,
    ManyToOne,
    PrimaryGeneratedColumn
} from 'typeorm';
import {Tenant} from './Tenant';
import {TenantExams} from './TenantExams';
import {Doctor} from './Doctor';

@Entity()
@Index(['id'])
export class Lead {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: true })
    name!: string;

    @Column({ nullable: true })
    phoneNumber!: string;

    @ManyToOne(() => TenantExams, { nullable: true })
    @JoinTable()
    exam?: TenantExams;

    @CreateDateColumn({ type: "timestamp" , nullable: true })
    callDate!: Date;

    @Column({ nullable: true })
    canal!: string;

    @Column({ nullable: true })
    indication_name?: string;

    @Column({ nullable: true })
    contactChannel?: string;

    @Column({ nullable: true })
    diagnosis?: string;

    @Column({ default: false })
    scheduled!: boolean;

    @ManyToOne(() => Doctor, { nullable: true })
    scheduledDoctor?: Doctor;

    @Column({ nullable: true })
    scheduledDate?: Date;

    @ManyToOne(() => Tenant, tenant => tenant.patients, { nullable: false })
    tenant!: Tenant;
    @DeleteDateColumn()
    delete_at?: Date;
}
