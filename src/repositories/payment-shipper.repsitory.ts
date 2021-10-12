import { FastifyInstance } from 'fastify';
import { FastifyInstanceToken, getInstanceByToken } from 'fastify-decorators';
import {
  FindManyOptions, FindOneOptions, Repository,
} from 'typeorm';
import { PaymentShipper } from '../models'

export default class PaymentShipperRepository {

  private instance: FastifyInstance = getInstanceByToken(FastifyInstanceToken);

  async add(data: Partial<PaymentShipper>): Promise<PaymentShipper> {
    const server: any = this.instance;
    const paymentShipperRepository: Repository<PaymentShipper> = server?.db?.paymentShipper;
    return paymentShipperRepository.save(paymentShipperRepository.create(data));
  }

  async find(options: FindManyOptions<PaymentShipper>): Promise<PaymentShipper[]> {
    const server: any = this.instance;
    const paymentShipperRepository: Repository<PaymentShipper> = server?.db?.paymentShipper;
    return paymentShipperRepository.find(options);
  }

  async findAndCount(options: FindManyOptions<PaymentShipper>): Promise<any> {
    const server: any = this.instance;
    const paymentShipperRepository: Repository<PaymentShipper> = server?.db?.paymentShipper;
    return paymentShipperRepository.findAndCount(options);
  }

  async findById(id: number, options?: FindOneOptions<PaymentShipper>): Promise<any> {
    const server: any = this.instance;
    const paymentShipperRepository: Repository<PaymentShipper> = server?.db?.paymentShipper;
    return paymentShipperRepository.findOne(id, options);
  }

  async findByTripId(tripId: number, options?: FindOneOptions<PaymentShipper>): Promise<any> {
    const server: any = this.instance;
    const paymentShipperRepository: Repository<PaymentShipper> = server?.db?.paymentShipper;
    return paymentShipperRepository.findOne({ tripId }, options);
  }

  async update(id: number, data: Partial<PaymentShipper>): Promise<any> {
    const server: any = this.instance;
    const paymentShipperRepository: Repository<PaymentShipper> = server?.db?.paymentShipper;

    let paymentData = await this.findById(id);
    paymentData = { ...paymentData, ...data }

    return paymentShipperRepository.save(paymentShipperRepository.create(paymentData));
  }

  async updateByTripId(tripId: number, data: Partial<PaymentShipper>): Promise<any> {
    const server: any = this.instance;
    const paymentShipperRepository: Repository<PaymentShipper> = server?.db?.paymentShipper;

    let paymentData = await this.findByTripId(tripId);
    paymentData = { ...paymentData, ...data }

    return paymentShipperRepository.save(paymentShipperRepository.create(paymentData));
  }

}
