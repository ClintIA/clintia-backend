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
import {ProfileRole} from "../types/enums/ProfileRole";

@Entity()
@Index(['id'])
export class Patient {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    full_name!: string;

    @Column({ nullable: true })
    password!: string;

    @Column({ nullable: true })
    cpf?: string;

    @Column({type: 'date', nullable: true })
    dob!: Date;

    @Column({ nullable: true })
    diagnostic?: string;

    @Column({ nullable: true })
    email?: string;

    @Column()
    phone!: string;

    @Column({ nullable: true })
    cep?: string;

    @Column( { enum: ProfileRole, default: 'patient' } )
    role!: string;

    @Column({ nullable: true })
    canal?: string;

    @Column({ nullable: true })
    contactChannel?: string;

    @Column({ nullable: true })
    indication_name?: string;

    @Column({ nullable: true })
    gender?: string;

    @Column({ nullable: true })
    health_card_number?: string;

    @Column("simple-array", { nullable: true })
    exams?: string[];
    
    @Column({ nullable: true })
    sessionToken?: string;

    @CreateDateColumn()
    created_at!: Date;

    @ManyToMany(() => Tenant, tenant => tenant.patients)
    @JoinTable()
    tenants!: Tenant[];

    @DeleteDateColumn()
    delete_at?: Date;
}
