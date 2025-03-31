import {Tenant} from "../models/Tenant";
import {tenantRepository} from "../repositories/tenantRepository";

export const findTenantById = async (tenantId: number): Promise<Tenant | null> => {
    return await tenantRepository.findOne({ where: { id: tenantId } });
};