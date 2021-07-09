import { Service, Initializer, Destructor } from 'fastify-decorators';
import { FindManyOptions } from 'typeorm';
import TripRepository from '../repositories/trip.repository';
import VwTripInprogressRepository from '../repositories/vw-trip-inprogress.repository';
import Security from 'utility-layer/dist/security'

interface FindTripProps {
  descending?: boolean
  page?: number
  rowsPerPage?: number
  sortBy?: string
}

const tripRepository = new TripRepository();
const security = new Security();
const vwTripInprogressRepository = new VwTripInprogressRepository()

const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

@Service()
export default class TripService {
  @Initializer()
  async init(): Promise<void> { }

  async getTrips(userId: string, filter: FindTripProps): Promise<any> {
    let {
      descending = true,
      page = 1,
      rowsPerPage = 10,
      sortBy = 'id',
    } = filter

    const decodeUserId = security.decodeUserId(userId);

    const numbOfPage = page <= 1 ? 0 : (+page - 1) * rowsPerPage;

    const options: any = {
      where: `carrier_id = ${decodeUserId} OR (job_owner ->> 'id')::INTEGER = ${decodeUserId} OR trips::JSONB @> '[{"owner":{"id": ${decodeUserId}}}]'`,
      select: [
        'jobId',
        // 'carrierId',
        'price',
        'priceType',
        'productName',
        'productTypeId',
        'truckType',
        'totalWeight',
        'requiredTruckAmount',
        'from',
        'to',
        'owner',
      ],
      take: rowsPerPage,
      skip: numbOfPage,
      order: {
        [camelToSnakeCase(sortBy)]: descending ? 'DESC' : 'ASC'
      },
    }

    const trips = await vwTripInprogressRepository.findAndCount(options);

    const newTrips = trips[0].map((trip: any) => {
      const newJobId = security.encodeUserId(trip.jobId)
      delete trip.id;
      delete trip.jobId;
      return {
        id: newJobId,
        price: Math.round(trip.price * 100) / 100,
        weight: Math.round(trip.totalWeight * 100) / 100,
        ...trip
      }
    })

    return {
      data: newTrips || [],
      count: trips[1] || 0,
    }
  }

  @Destructor()
  async destroy(): Promise<void> { }
}
