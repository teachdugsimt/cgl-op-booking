import { FastifyInstance } from 'fastify';
import { FastifyInstanceToken, getInstanceByToken } from 'fastify-decorators';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { JobCarrier } from '../models'

export default class JobCarrierRepository {

  private instance: FastifyInstance = getInstanceByToken(FastifyInstanceToken);

  async add(data: Partial<JobCarrier>): Promise<any> {
    const server: any = this.instance
    const jobCarrierRepository: Repository<JobCarrier> = server?.db?.jobCarrier;
    return jobCarrierRepository.save(jobCarrierRepository.create(data));
  }

  async find(options: FindManyOptions): Promise<any> {
    const server: any = this.instance
    const jobCarrierRepository: Repository<JobCarrier> = server?.db?.jobCarrier;
    return jobCarrierRepository.find(options);
  }

  async findById(id: number, options?: FindOneOptions): Promise<any> {
    const server: any = this.instance
    const jobCarrierRepository: Repository<JobCarrier> = server?.db?.jobCarrier;
    return jobCarrierRepository.findOne(id, options);
  }

  async update(id: number, data: Partial<JobCarrier>): Promise<any> {
    const server: any = this.instance
    const jobCarrierRepository: Repository<JobCarrier> = server?.db?.jobCarrier;

    let jobCarrierData = await this.findById(id);
    jobCarrierData = { ...jobCarrierData, ...data }

    return jobCarrierRepository.save(jobCarrierRepository.create(jobCarrierData));
  }

}
