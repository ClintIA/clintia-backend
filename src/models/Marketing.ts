import {Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {Admin} from "./Admin";
import {Tenant} from "./Tenant";

@Entity()
@Index(['id', 'canal', 'tenant'])
export class Marketing {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    canal!: string;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    budgetCanal!: number;

    @Column('int', { nullable: true })
    clicks?: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    cost?: number;

    @Column('int', { nullable: true })
    leads?: number;

    @ManyToOne(() => Admin, admin => admin.id)
    createdBy?: Admin;

    @ManyToOne(() => Admin, admin => admin.id)
    updatedBy?: Admin;

    @ManyToOne(() => Tenant, tenant => tenant.marketing)
    tenant!: Tenant;

    @UpdateDateColumn()
    updated_at!: Date;

    @CreateDateColumn()
    created_at!: Date;
}
