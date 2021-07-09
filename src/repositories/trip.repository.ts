import { FastifyInstance } from 'fastify';
import { FastifyInstanceToken, getInstanceByToken } from 'fastify-decorators';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Trip } from '../models'

export default class TripRepository {

  private instance: FastifyInstance = getInstanceByToken(FastifyInstanceToken);

  async add(data: Partial<Trip>): Promise<any> {
    const server: any = this.instance
    const tripRepository: Repository<Trip> = server?.db?.trip;
    return tripRepository.save(tripRepository.create(data));
  }

  async find(options: FindManyOptions): Promise<any> {
    const server: any = this.instance
    const tripRepository: Repository<Trip> = server?.db?.trip;
    return tripRepository.find(options);
  }

  async findAndCount(options: FindManyOptions): Promise<any> {
    const server: any = this.instance
    const tripRepository: Repository<Trip> = server?.db?.trip;
    return tripRepository.findAndCount(options);
  }

  async findById(id: number, options?: FindOneOptions): Promise<any> {
    const server: any = this.instance
    const tripRepository: Repository<Trip> = server?.db?.trip;
    return tripRepository.findOne(id, options);
  }

  async update(id: number, data: Partial<Trip>): Promise<any> {
    const server: any = this.instance
    const tripRepository: Repository<Trip> = server?.db?.trip;

    let tripData = await this.findById(id);
    tripData = { ...tripData, ...data }

    return tripRepository.save(tripRepository.create(tripData));
  }

}
