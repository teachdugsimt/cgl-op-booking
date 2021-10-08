import VwTripInprogressRepository from '../repositories/vw-trip-inprogress.repository';
import TruckRepository from '../repositories/truck.repository';
import JobCarrierRepository from '../repositories/job-carrier.repository';
import TripRepository from '../repositories/trip.repository';
import Security from 'utility-layer/dist/security'
import { Service } from 'fastify-decorators';
import { In } from 'typeorm';

interface FindTripProps {
  descending?: boolean
  page?: number
  rowsPerPage?: number
  sortBy?: string
}

interface ITruckProps {
  id: string
  startDate: string
}

const security = new Security();
const vwTripInprogressRepository = new VwTripInprogressRepository();
const truckRepository = new TruckRepository();
const jobCarrierRepository = new JobCarrierRepository();
const tripRepository = new TripRepository();

const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const diffArray = (arr1: Array<any>, arr2: Array<any>): Array<any> => {
  function diff(a: Array<any>, b: Array<any>) {
    return a.filter(item => b.indexOf(item) === -1);
  }

  const diff1 = diff(arr1, arr2);
  const diff2 = diff(arr2, arr1);
  return [...diff1, ...diff2];
}

@Service()
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

  async bulkTrip(jobId: string, truckIds: ITruckProps[], userId: number): Promise<any> {
    const truckDate: any = {};
    const decJobId = security.decodeUserId(jobId);
    const decTruckIds = truckIds.map((truck: ITruckProps) => {
      truckDate[truck.id] = truck.startDate;
      return security.decodeUserId(truck.id)
    });
    const trucks = await truckRepository.findManyById(decTruckIds);
    const carrierIds = trucks.map((truck: any) => truck.carrier_id);
    console.log('decJobId :>> ', decJobId);
    console.log('trucks :>> ', trucks);
    console.log('carrierIds :>> ', carrierIds);

    const uniqueCarrierIds = [...new Set(carrierIds)];
    console.log('uniqueCarrierIds :>> ', uniqueCarrierIds);
    const jobCarriers = await Promise.all(uniqueCarrierIds.map(async (carrierId: any) =>
      jobCarrierRepository.add({ jobId: decJobId, carrierId })
    ));

    const result = await Promise.all(trucks.map(async (truck: any) => {
      const jobCarrier = jobCarriers.find((jobCarrier: any) => jobCarrier.carrierId === truck.carrier_id);
      console.log('find jobCarrier :>> ', jobCarrier);
      return tripRepository.add({
        jobCarrierId: jobCarrier.id,
        truckId: truck.id,
        priceType: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdUser: userId.toString(),
        startDate: truckDate[truck.id]
      })
    }))

    console.log('result :>> ', result);
    return result;
  }

  async updateTripByJobId(jobId: string, truckIds: ITruckProps[], userId: number): Promise<void> {
    const carrierIdsNew: Array<number> = [];
    const carrierIdsOld: Array<number> = [];
    const carrierJobIds: Array<number> = [];
    const carrierTruck: any = {};
    const carrierTruckArray: any = {};
    const truckDate: any = {};

    const decJobId = security.decodeUserId(jobId);
    const decTruckIds = truckIds.map((truck: ITruckProps) => {
      truckDate[truck.id] = truck.startDate;
      return security.decodeUserId(truck.id);
    });
    const trucks = await truckRepository.findManyById(decTruckIds);
    trucks.forEach((truck: any) => {
      carrierIdsNew.push(truck.carrier_id);
      carrierTruck[`${truck.carrier_id}-${truck.id}`] = truck.id;
      if (carrierTruckArray[truck.carrier_id]) {
        carrierTruckArray[truck.carrier_id].push(truck.id);
      } else {
        carrierTruckArray[truck.carrier_id] = [truck.id];
      }
    });

    const jobCarriers = await jobCarrierRepository.find({
      select: ['id', 'carrierId'],
      where: {
        jobId: decJobId,
      },
    });

    jobCarriers.map((jc: any) => {
      carrierIdsOld.push(jc.carrierId);
      carrierJobIds.push(jc.id);
    });

    const carrierIdsDiff = diffArray(carrierIdsOld, carrierIdsNew);
    if (carrierIdsDiff.length) {
      await Promise.all(
        carrierIdsDiff.map(async (carId: any) => {
          if (carrierTruckArray[carId]) {
            const jobCarrierData = await jobCarrierRepository.add({ jobId: decJobId, carrierId: carId });
            carrierTruckArray[carId].map(async (tid: number) => tripRepository.add({
              jobCarrierId: jobCarrierData.id,
              truckId: tid,
              createdAt: new Date(),
              updatedAt: new Date(),
              createdUser: userId.toString(),
              startDate: truckDate[tid]
            }))
          }
        })
      );
    }

    const trips = await tripRepository.find({
      select: ['id', 'jobCarrierId', 'truckId'],
      where: {
        jobCarrierId: In(carrierJobIds),
        isDeleted: false
      }
    });

    console.log('jobCarriers :>> ', jobCarriers);
    console.log('trips :>> ', trips);

    await Promise.all(
      trips.map(async (trip: any) => {
        if (!carrierTruck[`${trip.jobCarrierId}-${trip.truckId}`]) {
          tripRepository.add({
            jobCarrierId: trip.jobCarrierId,
            truckId: trip.truckId,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdUser: userId.toString(),
            startDate: truckDate[trip.truckId]
          });
        }
      })
    );
  }

  async deleteTripById(tripId: string): Promise<void> {
    const decTripId = security.decodeUserId(tripId);
    await tripRepository.delete(decTripId);
  }

}
