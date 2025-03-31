import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    Index,
    ManyToMany,
    DeleteDateColumn
} from 'typeorm';
import { Tenant } from './Tenant';
import {Doctor} from "./Doctor";

@Entity()
@Index(['id', 'exam_name'])
export class TenantExams {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    exam_name!: string;

    @Column({ nullable: true })
    exam_type!: string;

    @Column('decimal', { precision: 10, scale: 2 })
    price!: number;

    @Column('decimal', { precision: 10, scale: 2,  nullable: true })
    doctorPrice!: number;

    @CreateDateColumn()
    created_at!: Date;

    @ManyToOne(() => Tenant, tenant => tenant.exams)
    tenant!: Tenant;    

    @ManyToMany(() => Doctor, doctor => doctor.exams, { nullable: true })
    doctors!: Doctor[];

    @DeleteDateColumn()
    delete_at?: Date;
}
