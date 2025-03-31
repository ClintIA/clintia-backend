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
@Index(['id', 'cpf', 'fullName'])
export class Admin {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    email!: string;

    @Column({ unique: true })
    cpf!: string;

    @Column()
    password!: string;

    @Column({nullable: true})
    phone!: string;

    @Column({ enum: ProfileRole, nullable: true })
    role!: string;

    @Column({ nullable: true })
    cep!: string;

    @Column()
    fullName!: string;

    @Column({ nullable: true })
    sessionToken?: string;
    
    @CreateDateColumn()
    created_at!: Date;

    @ManyToMany(() => Tenant, tenant => tenant.admins)
    @JoinTable()
    tenants!: Tenant[];

    @DeleteDateColumn()
    delete_at?: Date;
}
