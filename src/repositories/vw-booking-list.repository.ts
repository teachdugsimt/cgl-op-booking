import { FastifyInstance } from 'fastify';
import { FastifyInstanceToken, getInstanceByToken } from 'fastify-decorators';
import {
  FindManyOptions, FindOneOptions, Repository,
} from 'typeorm';
import { VwBookingList } from '../models'

export default class VwBookingListRepository {

  private instance: FastifyInstance = getInstanceByToken(FastifyInstanceToken);

  async find(options: FindManyOptions<VwBookingList>): Promise<VwBookingList[]> {
    const server: any = this.instance
    const bookingList: Repository<VwBookingList> = server?.db?.vwBookingList;
    return bookingList.find(options);
  }

  async findAndCount(options: FindManyOptions<VwBookingList>): Promise<any> {
    const server: any = this.instance
    const bookingList: Repository<VwBookingList> = server?.db?.vwBookingList;
    return bookingList.findAndCount(options);
  }

  async findById(id: number, options?: FindOneOptions<VwBookingList>): Promise<any> {
    const server: any = this.instance
    const bookingList: Repository<VwBookingList> = server?.db?.vwBookingList;
    return bookingList.findOne(id, options);
  }

}
