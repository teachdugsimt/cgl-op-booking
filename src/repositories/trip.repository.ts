import { FastifyInstance } from 'fastify';
import { FastifyInstanceToken, getInstanceByToken } from 'fastify-decorators';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Trip } from '../models'

export default class TripRepository {

  private instance: FastifyInstance = getInstanceByToken(FastifyInstanceToken);

  async add(data: Partial<Trip>): Promise<Trip> {
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

  async delete(id: number, opts?: Partial<Trip>): Promise<any> {
    return this.update(id, {
      isDeleted: true,
      status: 'REJECTED',
      updatedAt: new Date(),
      ...opts,
    });
  }

  async getJobDetail(jobId: number): Promise<any> {
    const server: any = this.instance
    const tripRepository: Repository<Trip> = server?.db?.trip;
    const result = await tripRepository.query(`
      SELECT * FROM dblink('jobserver'::text, 'SELECT id, product_type_id, product_name, price, price_type, truck_type, weight, required_truck_amount, loading_address, loading_datetime, loading_contact_name, loading_contact_phone, loading_latitude, loading_longitude, owner, shipments, tipper FROM vw_job_list WHERE id = ${jobId}'::text) vwjob (id INTEGER,
        product_type_id INTEGER,
        product_name TEXT,
        price NUMERIC,
        price_type TEXT,
        truck_type TEXT,
        weight NUMERIC,
        required_truck_amount INTEGER,
        loading_address TEXT,
        loading_datetime TEXT,
        loading_contact_name TEXT,
        loading_contact_phone TEXT,
        loading_latitude TEXT,
        loading_longitude TEXT,
        owner JSONB,
        shipments JSONB,
        tipper BOOLEAN)`);

    if (!result.length) {
      throw new Error('Job Data Not Found');
    }

    const data = result[0];
    console.log('data :>> ', data);
    return {
      id: data.id,
      productTypeId: data.product_type_id,
      productName: data.product_name,
      truckType: data.truck_type,
      weight: data.weight,
      requiredTruckAmount: data.required_truck_amount,
      from: {
        name: data.loading_address,
        dateTime: data.loading_datetime,
        contactName: data.loading_contact_name,
        contactMobileNo: data.loading_contact_phone,
        lat: data.loading_latitude,
        lng: data.loading_longitude
      },
      to: data.shipments,
      owner: data.owner,
      tipper: data.tipper,
      price: data.price,
      priceType: data.price_type,
    }
  }

  async getTruckDetail(truckId: number): Promise<any> {
    const server: any = this.instance
    const tripRepository: Repository<Trip> = server?.db?.trip;
    const result = await tripRepository.query(`
      SELECT * FROM dblink('truckserver'::text, 'SELECT id, registration_number, truck_type, carrier_id, owner FROM vw_truck_list WHERE id = ${truckId}'::TEXT) vwtruck (
        id INTEGER,
        registration_number _TEXT,
        truck_type INTEGER,
        carrier_id INTEGER,
        owner JSONB)`);

    if (!result.length) {
      throw new Error('Truck Data Not Found');
    }

    const data = result[0];
    return {
      id: data.id,
      registrationNumber: data.registration_number,
      truckType: data.truck_type,
      carrierId: data.carrier_id,
      owner: data.owner
    }
  }

}
