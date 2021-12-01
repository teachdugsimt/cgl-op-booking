import { Service, Initializer, Destructor } from 'fastify-decorators';
import * as Types from '../controllers/booking.types'
import BookingRepository from '../repositories/booking.repository';
import { FindManyOptions, FindOneOptions, ILike } from 'typeorm'
import TripRepository from '../repositories/trip.repository';
import JobCarrierRepository from '../repositories/job-carrier.repository';
import VwBookingListRepository from '../repositories/vw-booking-list.repository';
import TripService from './trip.service'
import axios from 'axios'
import moment from 'moment-timezone'

import Utility from 'utility-layer/dist/security'
const util = new Utility();

const trip = new TripService()
const repo = new BookingRepository()
const tripRepo = new TripRepository()
const jobCarrierRepo = new JobCarrierRepository()
const vwBookingListRepository = new VwBookingListRepository();

const enum_booking_status = {
  0: "WAITING",
  1: "ACCEPTED",
  2: "REJECTED"
}
@Service()
export default class BookingService {
  @Initializer()
  async init(): Promise<void> {
  }

  async findJobByBookingId(bookingId: string): Promise<any> {
    const filter: FindOneOptions = { where: ` "VwJobWithBookingId"."booking_id" = ${bookingId}` }
    return repo.findJobByBookingId(filter)
  }

  async createBooking(objectParams: Types.FullPostBooking): Promise<any> {
    return repo.insert(objectParams)
  }

  async getJob(jobId: string, authorization: string | null): Promise<any> {
    const mainUrl = process.env.API_URL || 'https://2kgrbiwfnc.execute-api.ap-southeast-1.amazonaws.com/prod';
    return axios.get(`${mainUrl}/api/v1/jobs/${jobId}/mst`, { headers: { Authorization: authorization || '' } });
  }

  async getTruck(truckId: string, authorization: string | null): Promise<any> {
    const mainUrl = process.env.API_URL || 'https://2kgrbiwfnc.execute-api.ap-southeast-1.amazonaws.com/prod';
    return axios.get(`${mainUrl}/api/v1/trucks/${truckId}/mst`, { headers: { Authorization: authorization || '' } });
  }

  async updateBooking(objectParams: Types.FullUpdateBooking, authorization: string | null): Promise<any> {
    let resultUpdate = await repo.update(objectParams)

    if (resultUpdate && objectParams.status == "ACCEPTED") {
      const bookingData = await repo.findOne({ where: [{ id: objectParams.id }] }) // find all for รถอาทสองคัน จองงานตั้มงานเดียว
      console.log("Booking dsata :: , ", bookingData)
      const jobData = await this.getJob(bookingData.jobId, authorization)
      console.log("Job data :: ", jobData.data)
      const truckData = await this.getTruck(util.encodeUserId(bookingData.truckId), authorization)
      console.log("truck data :: ", truckData.data)

      const truck = truckData.data
      const job = jobData.data
      const checkExistCarrierJobTable = await jobCarrierRepo.find({ where: [{ jobId: bookingData.jobId, carrierId: truck.carrierId }] })
      let addCarrierJob
      if (checkExistCarrierJobTable.length < 1)
        addCarrierJob = await jobCarrierRepo.add({ jobId: bookingData.jobId, carrierId: truck.carrierId })
      else addCarrierJob = checkExistCarrierJobTable[0]
      console.log("Add trip repo :: ", addCarrierJob)
      const addTrip = await tripRepo.add({
        jobCarrierId: addCarrierJob.id,
        truckId: truck.id,
        weight: job.weight,
        price: job.price,
        priceType: job.priceType,
        status: 'IN_PROGRESS',
        bookingId: bookingData.id,
        createdUser: "" + objectParams.accepterUserId
      })
      console.log("Add trip repo :: ", addTrip)
    }
    return true
  }

  attachTypeNewJob(list: any, userId: string): any {
    const tmpData: any = JSON.parse(JSON.stringify(list))
    console.log("tmp data :: ", tmpData)
    const newList = tmpData[0].map((e: any) => {
      if (!e.status) { // don't have status
        e.type = "IM_OWNER_JOB"
      } else {  // Only status wating
        if (e.requesterUserId == userId) { // เราไปขอจอง งาน/รถ คนอื่น - เราเป็น requester
          e.type = e.requesterType == 'JOB_OWNER' ?
            "IM_OWNER_JOB_REQUEST_BOOKING_OTHER_MAN_CAR" : "IM_OWNER_CAR_REQUEST_BOOKING_OTHER_MAN_JOB"
        } else if (e.accepterUserId == userId) { // เราโดน คนอื่น มาขอจอง งาน/รถ - เราเป็น accepter
          e.type = e.requesterType == 'JOB_OWNER' ?
            "IM_OWNER_CAR_HAVE_JOB_ASK_FOR_BOOKING" : "IM_OWNER_JOB_HAVE_CAR_ASK_FOR_BOOKING"
        }
      }
      e.quotationNumber = e.quotations ? e.quotations.length : 0
      delete e.loadingDatetime
      delete e.accepterUserId;
      delete e.requesterType;
      delete e.requesterUserId;
      delete e.status;
      return e
    })
    tmpData[0] = newList
    return tmpData
  }
  attachTypeDoneJob(list: any, userId: string): any {
    const tmpData = JSON.parse(JSON.stringify(list))
    console.log("tmp data :: ", tmpData)
    const newList = tmpData[0].map(e => {
      if (!e.status) { // don't have status
        e.type = "IM_OWNER_JOB"
      } else {  // Only status wating
        if (e.requesterUserId == userId) { // เราไปขอจอง งาน/รถ คนอื่น - เราเป็น requester
          e.type = e.requesterType == 'JOB_OWNER' ?
            "IM_OWNER_JOB_REQUEST_BOOKING_OTHER_MAN_CAR" : "IM_OWNER_CAR_REQUEST_BOOKING_OTHER_MAN_JOB"
        } else if (e.accepterUserId == userId) { // เราโดน คนอื่น มาขอจอง งาน/รถ - เราเป็น accepter
          e.type = e.requesterType == 'JOB_OWNER' ?
            "IM_OWNER_CAR_HAVE_JOB_ASK_FOR_BOOKING" : "IM_OWNER_JOB_HAVE_CAR_ASK_FOR_BOOKING"
        } else if (!e.requesterUserId && !e.accepterUserId) {
          e.type = "IM_OWNER_JOB"
        }
      }
      return e
    })
    tmpData[0] = newList
    return tmpData
  }
  async findMyjobNew(realPage: number, realTake: number, descending: boolean, sortBy: string, userId: string, type: number): Promise<any> {
    const newDate = moment((new Date())).format("YYYY-MM-DD HH:mm:ss")
    console.log("New date :: ", newDate)
    const finalFilter: string = ` "VwMyJobNewList"."loading_datetime" >= '${newDate}' and ("VwMyJobNewList"."status" IS NULL or "VwMyJobNewList"."status" = '${enum_booking_status[type]}') and ("VwMyJobNewList"."user_id" = ${userId} or "VwMyJobNewList"."requester_user_id" = ${userId} or "VwMyJobNewList"."accepter_user_id" = ${userId})`

    const findOptions: FindManyOptions = {
      take: realTake,
      skip: realPage,
      where: finalFilter,
      order: {
        [`${sortBy}`]: descending ? "ASC" : "DESC"
      },
    };
    const data = await repo.findNewJob(findOptions)
    const parseData = this.attachTypeNewJob(data, userId)
    return parseData
  }

  async findMyJobInprogress({ page, rowsPerPage, userId }: any): Promise<any> {
    const response = await trip.getTrips(util.encodeUserId(userId), { page, rowsPerPage })
    const newList: any = []
    newList[0] = response.data
    newList[1] = response.count
    console.log("Response Inprogress :: ", response)
    return newList
  }

  async findMyJobDone(realPage: number, realTake: number, descending: boolean, sortBy: string, userId: string, type: number): Promise<any> {
    const finalFilter: string = ` ("VwMyJobDoneList"."status" = 'REJECTED' or "VwMyJobDoneList"."job_status" = 'DONE' or "VwMyJobDoneList"."job_status" = 'CANCELLED' or "VwMyJobDoneList"."job_status" = 'EXPIRED')
 and ("VwMyJobDoneList"."user_id" = ${userId} or "VwMyJobDoneList"."requester_user_id" = ${userId} or "VwMyJobDoneList"."accepter_user_id" = ${userId})`

    const findOptions: FindManyOptions = {
      take: realTake,
      skip: realPage,
      where: finalFilter,
      order: {
        [`${sortBy}`]: descending ? "ASC" : "DESC"
      },
    };
    const data = await repo.findDoneJob(findOptions)
    const parseData = this.attachTypeDoneJob(data, userId)
    return parseData
  }

  async findListMyJob(query: Types.MyJobFilterList, userId: string) {
    let { rowsPerPage = 10, page = 1, descending = false, sortBy = "id", type } = query;
    let realPage: number;
    let realTake: number;
    if (rowsPerPage) realTake = +rowsPerPage;
    else {
      rowsPerPage = 10;
      realTake = 10;
    }
    if (page) realPage = +page === 1 ? 0 : (+page - 1) * realTake;
    else {
      realPage = 0;
      page = 1;
    }

    let data: any
    if (type == 0) data = await this.findMyjobNew(realPage, realTake, descending, sortBy, userId, type)
    else if (type == 1) data = await this.findMyJobInprogress({ ...query, userId })
    else if (type == 2) data = await this.findMyJobDone(realPage, realTake, descending, sortBy, userId, type)
    else {
      const response_final = {
        data: [],
        totalElements: 0,
        size: rowsPerPage,
        numberOfElements: 0,
        currentPage: page,
        totalPages: Math.ceil((0) / (+rowsPerPage))
      }
      return response_final
    }
    const response_final = {
      data: data[0] || [],
      totalElements: data[1] || 0,
      size: rowsPerPage,
      numberOfElements: data[0].length ?? 0,
      currentPage: page,
      totalPages: Math.ceil((data[1] || 0) / (+rowsPerPage))
    }
    console.log("Data in my job list FINAL :: ", response_final)
    return response_final
  }

  async findAllBooking(filter: Types.BookingFilter): Promise<any> {
    const {
      descending = true,
      page,
      rowsPerPage,
      sortBy = 'id',
      requesterType,
      status,
      searchText
    } = filter

    let numbOfPage: number;
    let numbOfLimit: number;
    if (rowsPerPage) {
      numbOfLimit = +rowsPerPage;
    } else {
      numbOfLimit = 10;
    }
    if (page) {
      numbOfPage = +page === 1 ? 0 : (+page - 1) * numbOfLimit;
    } else {
      numbOfPage = 0;
    }

    const cond: string[] = [];

    if (requesterType) cond.push(`requester_type = '${requesterType}'`);
    if (status) cond.push(`status = '${status}'`);
    if (searchText) {
      cond.push(`(product_name ILIKE '%${searchText}%' OR requester_profile->>'fullName' ILIKE '%${searchText}%')`);
    }

    const whereCase = cond.length ? cond.join(' AND ') : {};

    const options: FindManyOptions = {
      where: whereCase,
      take: numbOfLimit,
      skip: numbOfPage,
      order: {
        [sortBy.toLowerCase()]: descending ? 'DESC' : 'ASC'
      },
    }

    const result = await vwBookingListRepository.findAndCount(options);

    return {
      data: result[0] || [],
      count: result[1] || 0,
    }
  }

  @Destructor()
  async destroy(): Promise<void> {
  }
}
