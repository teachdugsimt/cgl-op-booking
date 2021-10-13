import VwTripInprogressRepository from '../repositories/vw-trip-inprogress.repository';
import TruckRepository from '../repositories/truck.repository';
import JobCarrierRepository from '../repositories/job-carrier.repository';
import TripRepository from '../repositories/trip.repository';
import Security from 'utility-layer/dist/security'
import { Service } from 'fastify-decorators';
import { In } from 'typeorm';
import BankAccountRepository from '../repositories/bank-account.reepository';
import PaymentShipperRepository from '../repositories/payment-shipper.repsitory';
import PaymentCarrierRepository from '../repositories/payment-carrier.repository';
import { PaymentShipper, PaymentCarrier, Trip } from '../models';

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

export interface IShipmentTrip {
  shipperPricePerTon?: number
  shipperPaymentStatus?: "PAYMENT_DUE" | "PAID" | "VOID"
  shipperBillStartDate?: string
  shipperPaymentDate?: string

  weightStart?: number
  weightEnd?: number
  carrierPricePerTon?: number
  bankAccountId?: number
  carrierPaymentStatus?: "PAID" | "AWAITING" | "APPROVED" | "REJECTED" | "ISSUED"
  carrierPaymentDate?: string
}

const security = new Security();
const vwTripInprogressRepository = new VwTripInprogressRepository();
const truckRepository = new TruckRepository();
const jobCarrierRepository = new JobCarrierRepository();
const tripRepository = new TripRepository();
const bankAccRepository = new BankAccountRepository();
const paymentShipperRepository = new PaymentShipperRepository();
const paymentCarrierRepository = new PaymentCarrierRepository();

const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const diffArray = (arr1: Array<any>, arr2: Array<any>): Array<any> => {
  function diff(a: Array<any>, b: Array<any>) {
    return a.filter(item => b.indexOf(item) === -1);
  }

  const diff1 = diff(arr1, arr2);
  const diff2 = diff(arr2, arr1);
  return [...diff1, ...diff2];
}

const encodeIds = (data: any[]) => data?.map((attr: any) => ({
  ...attr,
  id: security.encodeUserId(attr.id)
})) ?? [];

const encodeId = (data: any) => data ? { ...data, id: security.encodeUserId(data.id) } : null;

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

  async getTripDetail(tripId: string): Promise<any> {
    const decodeTripId = security.decodeUserId(tripId);
    const jobCarrier = await jobCarrierRepository.getJobAndTruckIdByJobCarrierId(decodeTripId);
    if (!jobCarrier?.length) {
      throw new Error('Request not found');
    }
    console.log('jobCarrier[0] :>> ', jobCarrier[0]);
    const {
      job_id: jobId,
      truck_id: truckId,
      weight_start: weightStart,
      weight_end: weightEnd
    } = jobCarrier[0];
    const jobDetail = await tripRepository.getJobDetail(jobId);
    const truckDetail = await tripRepository.getTruckDetail(truckId);
    jobDetail.id = security.encodeUserId(jobDetail.id);
    if (jobDetail?.owner?.id) {
      jobDetail.owner.id = security.encodeUserId(jobDetail.owner.id)
    }

    truckDetail.id = security.encodeUserId(truckDetail.id);
    if (truckDetail?.owner?.id) {
      truckDetail.owner.id = security.encodeUserId(truckDetail.owner.id)
    }

    console.log('jobDetail :>> ', jobDetail);
    console.log(`truckDetail`, truckDetail);

    // get bank account
    const bankAccounts = await bankAccRepository.find({
      select: ['id', 'accountName', 'accountNo', 'bankName'],
      where: { userId: truckDetail.carrierId }
    });

    const bankAccountDecrypted = encodeIds(bankAccounts);

    // get payment shipper
    const paymentShipper = await paymentShipperRepository.findByTripId(decodeTripId, {
      select: ['id', 'pricePerTon', 'amount', 'feeAmount', 'feePercentage', 'netAmount', 'paymentStatus', 'billStartDate', 'paymentDate']
    });
    const paymentShipperDecrypted = encodeId(paymentShipper);

    // get payment carrier
    const paymentCarrier = await paymentCarrierRepository.findByTripId(decodeTripId, {
      select: ['id', 'pricePerTon', 'bankAccountId', 'amount', 'feeAmount', 'feePercentage', 'netAmount', 'paymentStatus', 'paymentDate']
    });
    const paymentCarrierDecrypted = encodeId(paymentCarrier);

    return {
      id: tripId,
      weightStart,
      weightEnd,
      bankAccount: bankAccountDecrypted,
      job: {
        ...jobDetail,
        payment: paymentShipperDecrypted
      },
      truck: {
        ...truckDetail,
        carrierId: security.encodeUserId(truckDetail.carrierId),
        payment: paymentCarrierDecrypted
      },
    };
  }

  async bulkTrip(jobId: string, truckIds: ITruckProps[], userId: number): Promise<any> {
    const tripDate: any = {};
    const decJobId = security.decodeUserId(jobId);
    const decTruckIds = truckIds.map((truck: ITruckProps) => {
      const decTruckId = security.decodeUserId(truck.id);
      tripDate[decTruckId] = truck.startDate;
      return decTruckId;
    });
    const trucks = await truckRepository.findManyById(decTruckIds);
    const carrierIds = trucks.map((truck: any) => truck.carrier_id);
    console.log('decJobId :>> ', decJobId);
    console.log('trucks :>> ', trucks);
    console.log('carrierIds :>> ', carrierIds);
    console.log('decTruckIds :>> ', decTruckIds);
    console.log('tripDate :>> ', tripDate);

    const uniqueCarrierIds = [...new Set(carrierIds)];
    console.log('uniqueCarrierIds :>> ', uniqueCarrierIds);
    const jobCarriers = await Promise.all(uniqueCarrierIds.map(async (carrierId: any) =>
      jobCarrierRepository.add({ jobId: decJobId, carrierId })
    ));

    const result = await Promise.all(trucks.map(async (truck: any) => {
      const jobCarrier = jobCarriers.find((jobCarrier: any) => jobCarrier.carrierId === truck.carrier_id);
      console.log('find jobCarrier :>> ', jobCarrier);
      const tripData = await tripRepository.add({
        jobCarrierId: jobCarrier.id,
        truckId: truck.id,
        priceType: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdUser: userId.toString(),
        startDate: tripDate[truck.id]
      });

      // initial payment shipper
      await paymentShipperRepository.add({ tripId: tripData.id, feePercentage: '1' });

      // initial payment carrier
      await paymentCarrierRepository.add({ tripId: tripData.id, feePercentage: '1' });

      return tripData;
    }))

    console.log('result :>> ', result);
    return result;
  }

  async updateTripByJobId(jobId: string, truckIds: ITruckProps[], userId: number): Promise<void> {
    const carrierIdsNew: Array<number> = [];
    const carrierIdsOld: Array<number> = [];
    const carrierJobIds: Array<number> = [];
    const carrierTruckArray: any = {};
    const tripDate: any = {};
    const truckIdCreated: any[] = [];

    const decJobId = security.decodeUserId(jobId);
    const decTruckIds = truckIds.map((truck: ITruckProps) => {
      const decTruckId = security.decodeUserId(truck.id);
      tripDate[decTruckId] = truck.startDate;
      return decTruckId;
    });
    const trucks = await truckRepository.findManyById(decTruckIds);
    trucks.forEach((truck: any) => {
      if (!carrierIdsNew.includes(truck.carrier_id)) {
        carrierIdsNew.push(truck.carrier_id);
      }
      if (carrierTruckArray[truck.carrier_id]) {
        carrierTruckArray[truck.carrier_id].push(truck.id);
      } else {
        carrierTruckArray[truck.carrier_id] = [truck.id];
      }
    });
    console.log('trucks :>> ', trucks);
    console.log('carrierTruckArray :>> ', carrierTruckArray);
    console.log('tripDate :>> ', tripDate);

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

    console.log('carrierIdsOld :>> ', carrierIdsOld);
    console.log('carrierIdsNew :>> ', carrierIdsNew);

    const carrierIdsDiff = diffArray(carrierIdsOld, carrierIdsNew);
    console.log('carrierIdsDiff :>> ', carrierIdsDiff);
    if (carrierIdsDiff.length) {
      await Promise.all(
        carrierIdsDiff.map(async (carId: any) => {
          if (carrierTruckArray[carId]) {
            console.log('carrierTruckArray[carId] :>> ', carrierTruckArray[carId]);
            truckIdCreated.push(...carrierTruckArray[carId]);
            const jobCarrierData = await jobCarrierRepository.add({ jobId: decJobId, carrierId: carId });
            return carrierTruckArray[carId].map(async (tid: number) => tripRepository.add({
              jobCarrierId: jobCarrierData.id,
              truckId: tid,
              createdAt: new Date(),
              updatedAt: new Date(),
              createdUser: userId.toString(),
              startDate: tripDate[tid]
            }));
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
    console.log('truckIdCreated :>> ', truckIdCreated);

    await Promise.all(
      trucks.map(async (truck: any) => {
        const trip = trips.find((trip: any) => trip.truckId === truck.id);
        if (!trip && !truckIdCreated.includes(truck.id)) {
          console.log('truck.id :>> ', truck.id);
          const jobCarrierId = jobCarriers.find((jc: any) => jc.carrierId === truck.carrier_id);
          console.log('jobCarrierId :>> ', jobCarrierId);
          console.log('tripDate[truck.id] :>> ', tripDate[truck.id]);
          return tripRepository.add({
            jobCarrierId: jobCarrierId.id,
            truckId: truck.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdUser: userId.toString(),
            startDate: tripDate[truck.id]
          });
        }
      })
    )
  }

  async deleteTripById(tripId: string, userId: number): Promise<void> {
    const decTripId = security.decodeUserId(tripId);
    await tripRepository.delete(decTripId, { updatedUser: userId.toString() });
  }

  async updateShipmentTrip({ tripId, userId, data }: { tripId: string; userId: string; data: IShipmentTrip; }): Promise<void> {
    const decodeTripId = security.decodeUserId(tripId);
    const decodeUserId = security.decodeUserId(userId);

    // get payment shipper
    const paymentShipper = await paymentShipperRepository.findByTripId(decodeTripId, { select: ['feePercentage'] });
    const shipperFeePercentage = paymentShipper?.feePercentage ?? 1;

    // get payment carrier
    const paymentCarrier = await paymentCarrierRepository.findByTripId(decodeTripId, { select: ['feePercentage'] });
    const carrierFeePercentage = paymentCarrier?.feePercentage ?? 1;

    // update payment
    let paymentShipperData: Partial<PaymentShipper> = {
      updatedAt: new Date(),
      updatedUser: decodeUserId
    };
    let paymentCarrierData: Partial<PaymentCarrier> = {
      updatedAt: new Date(),
      updatedUser: decodeUserId
    };

    if (data?.shipperPricePerTon) {
      const amount = data.weightEnd ? (data.weightEnd * data.shipperPricePerTon) : 0;
      const feeAmount = amount * (+shipperFeePercentage / 100);
      const netAmount = Math.abs(amount - feeAmount);

      paymentShipperData.pricePerTon = data.shipperPricePerTon.toString();
      paymentShipperData.amount = amount.toString();
      paymentShipperData.feeAmount = feeAmount.toString();
      paymentShipperData.netAmount = netAmount.toString();
    }

    paymentShipperData = {
      ...paymentShipperData,
      ...(!paymentShipper ? { tripId: decodeTripId, createdAt: new Date() } : undefined),
      ...(data?.shipperPaymentStatus ? { paymentStatus: data.shipperPaymentStatus } : undefined),
      ...(data?.shipperBillStartDate ? { billStartDate: data.shipperBillStartDate } : undefined),
      ...(data?.shipperPaymentDate ? { paymentDate: data.shipperPaymentDate } : undefined)
    }

    await paymentShipperRepository.updateByTripId(decodeTripId, paymentShipperData);

    if (data?.carrierPricePerTon) {
      const amount = data.weightEnd ? (data.weightEnd * data.carrierPricePerTon) : 0;
      const feeAmount = amount * (+carrierFeePercentage / 100);
      const netAmount = Math.abs(amount - feeAmount);

      paymentCarrierData.pricePerTon = data.carrierPricePerTon.toString();
      paymentCarrierData.amount = amount.toString();
      paymentCarrierData.feeAmount = feeAmount.toString();
      paymentCarrierData.netAmount = netAmount.toString();
    }

    paymentCarrierData = {
      ...paymentCarrierData,
      ...(!paymentCarrier ? { tripId: decodeTripId, createdAt: new Date() } : undefined),
      ...(data?.bankAccountId ? { bankAccountId: data.bankAccountId } : undefined),
      ...(data?.carrierPaymentDate ? { paymentDate: data.carrierPaymentDate } : undefined),
      ...(data?.carrierPaymentStatus ? { paymentStatus: data.carrierPaymentStatus } : undefined)
    }

    await paymentCarrierRepository.updateByTripId(decodeTripId, paymentCarrierData);

    let tripData: Partial<Trip> = {
      updatedAt: new Date(),
      updatedUser: decodeUserId
    };

    if (data?.weightStart) {
      tripData.weightStart = data.weightStart.toString();
    }

    if (data?.weightEnd) {
      tripData.weightEnd = data.weightEnd.toString();
    }

    await tripRepository.update(decodeTripId, tripData);
  }

}
