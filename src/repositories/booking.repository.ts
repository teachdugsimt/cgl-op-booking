import { FastifyInstance } from 'fastify';
import { FastifyInstanceToken, getInstanceByToken } from 'fastify-decorators';
import { FindManyOptions, Repository, UpdateManyOptions } from 'typeorm';
import { Booking, VwMyJobNewList } from '../models'
import * as  Types from '../controllers/booking.types'

export default class BookingRepository {

  private instance: FastifyInstance = getInstanceByToken(FastifyInstanceToken);

  async insert(data: Types.FullPostBooking): Promise<any> {
    const server: any = this.instance
    const bookingRepository: Repository<Booking> = server?.db?.booking;
    return bookingRepository.save(bookingRepository.create(data));
  }

  async find(options: FindManyOptions): Promise<any> {
    const server: any = this.instance
    const bookingRepository: Repository<Booking> = server?.db?.booking;
    return bookingRepository.find(options);
  }

  async update(options: any): Promise<any> {
    const server: any = this.instance
    const bookingRepository: Repository<Booking> = server?.db?.booking;
    return bookingRepository.save(bookingRepository.create(options));
  }

  async findNewJob(options: FindManyOptions): Promise<any> {
    const server: any = this.instance
    const jobRepository: Repository<VwMyJobNewList> = server?.db?.vwMyJobNewList;
    return jobRepository.findAndCount(options)

  }


}
