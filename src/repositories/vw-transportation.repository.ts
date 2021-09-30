import { FastifyInstance } from 'fastify';
import { FastifyInstanceToken, getInstanceByToken } from 'fastify-decorators';
import { FindManyOptions, Repository } from 'typeorm';
import { VwTransportation } from '../models'

export default class TransportationRepository {

  private instance: FastifyInstance = getInstanceByToken(FastifyInstanceToken);

  async findTransportation(options: FindManyOptions): Promise<any> {
    const server: any = this.instance
    const transportation: Repository<VwTransportation> = server?.db?.vwTransportation;
    return transportation.findAndCount(options)
  }

  async fullTextSearch(data: FilterQueryTranspotation): Promise<any> {
    const server: any = this.instance
    const viewJobList: Repository<VwTransportation> = server?.db?.vwTransportation;
    return viewJobList.createQueryBuilder()
      .select()
      .where('full_text_search @@ to_tsquery(:query)', {
        query: data.fullTextSearch
      })
      .orderBy({
        ...(data?.sortBy ? { [data.sortBy]: data.descending } : undefined),
        ['ts_rank(full_text_search, to_tsquery(:query))']: 'DESC'
      })
      .take(data.rowsPerPage)
      .skip(data.page)
      .getManyAndCount();
  }


}

export interface FilterQueryTranspotation {
  fullTextSearch?: string
  page?: number
  rowsPerPage?: number
  sortBy?: string,
  descending?: string
}
