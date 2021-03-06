import { FastifyInstance } from 'fastify';
import { FastifyInstanceToken, getInstanceByToken } from 'fastify-decorators';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { VwTransportationV2 } from '../models'

export default class TransportationRepository {

  private instance: FastifyInstance = getInstanceByToken(FastifyInstanceToken);

  async findTransportation(options: FindManyOptions): Promise<any> {
    const server: any = this.instance
    const transportation: Repository<VwTransportationV2> = server?.db?.vwTransportationV2;
    return transportation.findAndCount(options)
  }
  async findOne(options: FindOneOptions): Promise<any> {
    const server: any = this.instance
    const transportation: Repository<VwTransportationV2> = server?.db?.vwTransportationV2;
    return transportation.findOne(options)
  }

}

export interface FilterQueryTranspotation {
  fullTextSearch?: string
  page?: number
  rowsPerPage?: number
  sortBy?: string,
  descending?: string
}
