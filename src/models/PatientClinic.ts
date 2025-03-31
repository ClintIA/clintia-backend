import {Entity, Index, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Patient} from './Patient';
import {Tenant} from './Tenant';

@Entity()
@Index(['id'])
export class PatientClinic {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Patient, patient => patient.tenants)
    patient!: Patient;

    @ManyToOne(() => Tenant, tenant => tenant.patients)
    tenant!: Tenant;
}
