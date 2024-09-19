import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm';
import { Tenant } from './Tenant';

@Entity()
@Index(['id'])
export class Product {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    name!: string;

    @Column()
    uploadLimit!: number;

    @OneToMany(() => Tenant, tenant => tenant.product)
    tenants!: Tenant[];
}
