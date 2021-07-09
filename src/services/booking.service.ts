import { Service, Initializer, Destructor } from 'fastify-decorators';
import * as Types from '../controllers/booking.types'
import BookingRepository from '../repositories/booking.repository';
import { FindManyOptions } from 'typeorm'
const repo = new BookingRepository()
@Service()
export default class BookingService {
  @Initializer()
  async init(): Promise<void> {
  }

  async createBooking(objectParams: Types.FullPostBooking): Promise<any> {
    return repo.insert(objectParams)
  }

  async updateBooking(objectParams: Types.FullUpdateBooking): Promise<any> {
    return repo.update(objectParams)
  }

  async findMyjobNew(realPage: number, realTake: number, descending: boolean, sortBy: string, userId: string, type: number): Promise<any> {
    const finalFilter: string = ` "VwMyJobNewList"."user_id" = ${userId} or ("VwMyJobNewList"."requester_user_id" = ${userId} or "VwMyJobNewList"."accepter_user_id" = ${userId}) `
    const findOptions: FindManyOptions = {
      take: realTake,
      skip: realPage,
      where: finalFilter,
      order: {
        [`${sortBy}`]: descending ? "ASC" : "DESC"
      },
    };
    const data = await repo.findNewJob(findOptions)
    console.log("Data :: ", data)
    return data

  }
  async findMyJobInprogress(realPage: number, realTake: number, descending: boolean, sortBy: string, userId: string, type: number): Promise<any> {

    // const findOptions: FindManyOptions = {
    //   take: realTake,
    //   skip: realPage,
    //   where: finalFilter,
    //   order: {
    //     [`${sortBy}`]: descending ? "ASC" : "DESC"
    //   },
    // };
  }
  async findMyJobDone(realPage: number, realTake: number, descending: boolean, sortBy: string, userId: string, type: number): Promise<any> {

    // const findOptions: FindManyOptions = {
    //   take: realTake,
    //   skip: realPage,
    //   where: finalFilter,
    //   order: {
    //     [`${sortBy}`]: descending ? "ASC" : "DESC"
    //   },
    // };
  }

  async findListMyJob(query: Types.MyJobFilterList, userId: string) {
    let { rowsPerPage = 10, page = 1, descending = false, sortBy = "id", type = 0 } = query;
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
    else if (type == 1) data = await this.findMyJobInprogress(realPage, realTake, descending, sortBy, userId, type)
    else if (type == 2) data = await this.findMyJobDone(realPage, realTake, descending, sortBy, userId, type)

    console.log("Data Final  step :: ", data)
    const response_final = {
      data: data[0],
      totalElements: data[1],
      size: rowsPerPage,
      numberOfElements: data[0].length ?? 0,
      currentPage: page,
      totalPages: Math.ceil(data[1] / (+rowsPerPage))
    }
    console.log("Data in my job list FINAL :: ", response_final)
    return response_final
  }

  @Destructor()
  async destroy(): Promise<void> {
  }
}
