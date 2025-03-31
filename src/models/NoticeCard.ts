import {Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Admin} from "./Admin";
import {Tenant} from "./Tenant";

@Entity()
@Index(['id'])
export class NoticeCard {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    message!: string;

    @ManyToOne(() => Admin, admin => admin.id, { nullable: true })
    createdBy?: Admin;

    @Column( 'date')
    cardDate!: Date;

    @ManyToOne(() => Tenant, tenant => tenant.admins)
    tenant!: Tenant;

    @CreateDateColumn()
    created_at!: Date;
}
