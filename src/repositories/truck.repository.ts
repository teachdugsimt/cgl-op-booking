import { FastifyInstance } from 'fastify';
import { FastifyInstanceToken, getInstanceByToken } from 'fastify-decorators';
import { FindManyOptions, FindOneOptions, getConnection, Repository } from 'typeorm';

const connection = getConnection();

export default class TruckRepository {

  private instance: FastifyInstance = getInstanceByToken(FastifyInstanceToken);

  async find(options: FindManyOptions): Promise<any> {
    const server: any = this.instance
    const truckRepository: Repository<any> = server?.db?.trip;
    return truckRepository.find(options);
  }

  async findById(id: number): Promise<any> {
    const trucks = await connection.query(`SELECT * FROM dblink('truckserver'::text,
    'SELECT id, carrier_id FROM vw_truck_details WHERE id = ${id}'::TEXT) truck_detail (
      id INTEGER,
      carrier_id INTEGER)`);
    return trucks[0];
  }

  async findManyById(ids: number[]): Promise<any> {
    return connection.query(`SELECT * FROM dblink('truckserver'::text,
    'SELECT id, carrier_id FROM vw_truck_details WHERE id IN (${ids})'::TEXT) truck_detail (
      id INTEGER,
      carrier_id INTEGER)`);
  }

}
