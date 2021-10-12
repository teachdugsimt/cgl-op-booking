import { FastifyInstance } from 'fastify';
import { FastifyInstanceToken, getInstanceByToken } from 'fastify-decorators';
import {
  FindManyOptions, FindOneOptions, Repository,
} from 'typeorm';
import { BankAccount } from '../models'

export default class BankAccountRepository {

  private instance: FastifyInstance = getInstanceByToken(FastifyInstanceToken);

  async add(data: Partial<BankAccount>): Promise<BankAccount> {
    const server: any = this.instance
    const bankAccountRepository: Repository<BankAccount> = server?.db?.bankAccount;
    return bankAccountRepository.save(bankAccountRepository.create(data));
  }

  async find(options: FindManyOptions<BankAccount>): Promise<BankAccount[]> {
    const server: any = this.instance
    const bankAccountRepository: Repository<BankAccount> = server?.db?.bankAccount;
    return bankAccountRepository.find(options);
  }

  async findAndCount(options: FindManyOptions<BankAccount>): Promise<any> {
    const server: any = this.instance
    const bankAccountRepository: Repository<BankAccount> = server?.db?.bankAccount;
    return bankAccountRepository.findAndCount(options);
  }

  async findById(id: number, options?: FindOneOptions<BankAccount>): Promise<any> {
    const server: any = this.instance
    const bankAccountRepository: Repository<BankAccount> = server?.db?.bankAccount;
    return bankAccountRepository.findOne(id, options);
  }

  async update(id: number, data: Partial<BankAccount>): Promise<any> {
    const server: any = this.instance
    const bankAccountRepository: Repository<BankAccount> = server?.db?.bankAccount;

    let paymentData = await this.findById(id);
    paymentData = { ...paymentData, ...data }

    return bankAccountRepository.save(bankAccountRepository.create(paymentData));
  }

}
