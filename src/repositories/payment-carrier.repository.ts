import { FastifyInstance } from 'fastify';
import { FastifyInstanceToken, getInstanceByToken } from 'fastify-decorators';
import {
  FindManyOptions, FindOneOptions, Repository,
} from 'typeorm';
import { PaymentCarrier } from '../models'

export default class PaymentCarrierRepository {

  private instance: FastifyInstance = getInstanceByToken(FastifyInstanceToken);

  async add(data: Partial<PaymentCarrier>): Promise<PaymentCarrier> {
    const server: any = this.instance;
    const paymentCarrierRepository: Repository<PaymentCarrier> = server?.db?.paymentCarrier;
    return paymentCarrierRepository.save(paymentCarrierRepository.create(data));
  }

  async find(options: FindManyOptions<PaymentCarrier>): Promise<PaymentCarrier[]> {
    const server: any = this.instance;
    const paymentCarrierRepository: Repository<PaymentCarrier> = server?.db?.paymentCarrier;
    return paymentCarrierRepository.find(options);
  }

  async findAndCount(options: FindManyOptions<PaymentCarrier>): Promise<any> {
    const server: any = this.instance;
    const paymentCarrierRepository: Repository<PaymentCarrier> = server?.db?.paymentCarrier;
    return paymentCarrierRepository.findAndCount(options);
  }

  async findById(id: number, options?: FindOneOptions<PaymentCarrier>): Promise<any> {
    const server: any = this.instance;
    const paymentCarrierRepository: Repository<PaymentCarrier> = server?.db?.paymentCarrier;
    return paymentCarrierRepository.findOne(id, options);
  }

  async findByTripId(tripId: number, options?: FindOneOptions<PaymentCarrier>): Promise<any> {
    const server: any = this.instance;
    const paymentCarrierRepository: Repository<PaymentCarrier> = server?.db?.paymentCarrier;
    return paymentCarrierRepository.findOne({ tripId }, options);
  }

  async update(id: number, data: Partial<PaymentCarrier>): Promise<any> {
    const server: any = this.instance;
    const paymentCarrierRepository: Repository<PaymentCarrier> = server?.db?.paymentCarrier;

    let paymentData = await this.findById(id);
    paymentData = { ...paymentData, ...data }

    return paymentCarrierRepository.save(paymentCarrierRepository.create(paymentData));
  }

  async updateByTripId(tripId: number, data: Partial<PaymentCarrier>): Promise<any> {
    const server: any = this.instance;
    const paymentCarrierRepository: Repository<PaymentCarrier> = server?.db?.paymentCarrier;

    let paymentData = await this.findByTripId(tripId);
    paymentData = { ...paymentData, ...data }

    return paymentCarrierRepository.save(paymentCarrierRepository.create(paymentData));
  }

}
