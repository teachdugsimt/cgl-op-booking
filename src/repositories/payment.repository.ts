import {
  FindManyOptions, FindOneOptions, Repository,
  getConnectionOptions, createConnection, ConnectionOptions
} from 'typeorm';
import { Payment } from '../models'

export default class PaymentRepository {

  async getPaymentConnection(): Promise<any> {
    const connectionOptions: ConnectionOptions = await getConnectionOptions();
    Object.assign(connectionOptions, {
      database: process.env.PAYMENT_DB || "payment_service",
      name: 'payment_connection'
    });
    return await createConnection(connectionOptions);
  }

  async add(data: Partial<Payment>): Promise<any> {
    const server: any = await this.getPaymentConnection()
    const paymentRepository: Repository<Payment> = await server.getRepository(Payment);
    return paymentRepository.save(paymentRepository.create(data));
  }

  async find(options: FindManyOptions): Promise<any> {
    const server: any = await this.getPaymentConnection()
    const paymentRepository: Repository<Payment> = await server.getRepository(Payment);
    return paymentRepository.find(options);
  }

  async findAndCount(options: FindManyOptions): Promise<any> {
    const server: any = await this.getPaymentConnection()
    const paymentRepository: Repository<Payment> = await server.getRepository(Payment);
    return paymentRepository.findAndCount(options);
  }

  async findById(id: number, options?: FindOneOptions): Promise<any> {
    const server: any = await this.getPaymentConnection()
    const paymentRepository: Repository<Payment> = await server.getRepository(Payment);
    return paymentRepository.findOne(id, options);
  }

  async update(id: number, data: Partial<Payment>): Promise<any> {
    const server: any = await this.getPaymentConnection()
    const paymentRepository: Repository<Payment> = await server.getRepository(Payment);

    let paymentData = await this.findById(id);
    paymentData = { ...paymentData, ...data }

    return paymentRepository.save(paymentRepository.create(paymentData));
  }

}
