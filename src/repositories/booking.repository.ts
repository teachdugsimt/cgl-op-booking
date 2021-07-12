import { FastifyInstance } from 'fastify';
import { FastifyInstanceToken, getInstanceByToken } from 'fastify-decorators';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Booking, VwMyJobNewList, VwJobWithBookingId, VwMyJobDoneList } from '../models'
import * as  Types from '../controllers/booking.types'

export default class BookingRepository {

  private instance: FastifyInstance = getInstanceByToken(FastifyInstanceToken);

  async findJobByBookingId(options: FindOneOptions): Promise<any> {
    const server: any = this.instance
    const bookingRepository: Repository<VwJobWithBookingId> = server?.db?.vwJobWithBookingId;
    return bookingRepository.findOne(options);
  }

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

  async findOne(options: FindOneOptions): Promise<any> {
    const server: any = this.instance
    const bookingRepository: Repository<Booking> = server?.db?.booking;
    return bookingRepository.findOne(options);
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

  async findDoneJob(options: FindManyOptions): Promise<any> {
    const server: any = this.instance
    const jobRepository: Repository<VwMyJobDoneList> = server?.db?.vwMyJobDoneList;
    return jobRepository.findAndCount(options)
  }


}
