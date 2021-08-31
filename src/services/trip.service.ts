import VwTripInprogressRepository from '../repositories/vw-trip-inprogress.repository';
import Security from 'utility-layer/dist/security'

interface FindTripProps {
  descending?: boolean
  page?: number
  rowsPerPage?: number
  sortBy?: string
}

const security = new Security();
const vwTripInprogressRepository = new VwTripInprogressRepository()

const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

export default class TripService {

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
        ...trip,
        id: newJobId,
        price: Math.round(trip.price * 100) / 100,
        weight: Math.round(trip.totalWeight * 100) / 100,
      }
    })

    return {
      data: newTrips || [],
      count: trips[1] || 0,
    }
  }

}
