import { Service, Initializer, Destructor } from 'fastify-decorators';
import * as Types from '../controllers/booking.types'
import { FindManyOptions, IsNull, Not, Like, FindOneOptions } from 'typeorm'
import TransportationRepositoryV2 from '../repositories/vw-transportation-v2.repository';
import Utility from 'utility-layer/dist/security'

const util = new Utility();

const transportationRepoV2 = new TransportationRepositoryV2()
const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

@Service()
export default class TransportationService {
  @Initializer()
  async init(): Promise<void> {
  }

  async findTransportationList(query: Types.Transportation) {
    let { rowsPerPage = 10, page = 1, descending = true, sortBy = 'id', where } = query;

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

    let response: any

    const filter: any = where && typeof where == 'string' ? JSON.parse(where) : (where ?? {})
    if (filter?.id) filter.id = util.decodeUserId(filter.id)
    if (filter?.trips && filter.trips == "NOT_NULL") filter.trips = Not(IsNull())
    if (filter?.trips && filter.trips == "NULL") filter.trips = IsNull()
    if (filter?.fullTextSearch) filter.fullTextSearch = Like(`%${filter.fullTextSearch}%`)
    console.log("Filter :: ", filter)
    const findOptions: FindManyOptions = {
      take: realTake,
      skip: realPage,
      where: filter,
      order: {
        [camelToSnakeCase(sortBy)]: descending ? 'DESC' : 'ASC'
      },
    };
    response = await transportationRepoV2.findTransportation(findOptions)

    const response_final = {
      data: response[0] || [],
      totalElements: response[1] || 0,
      size: rowsPerPage,
      numberOfElements: response[0].length ?? 0,
      currentPage: page,
      totalPages: Math.ceil((response[1] || 0) / (+rowsPerPage))
    }
    return response_final
  }

  async findTransportationId(jobId: string, isDeleted: boolean | null) {
    const parseJobId = util.decodeUserId(jobId)
    const findOptions: FindOneOptions = {
      where: { id: parseJobId },
    };
    const result = await transportationRepoV2.findOne(findOptions)
    if (typeof isDeleted == 'boolean') {
      if (result.trips && result.trips.length > 0) {
        result.trips = result.trips.filter((e: any) => e.isDeleted == isDeleted)
      }
    }
    console.log("Result  :: ", result)
    return result
  }

  @Destructor()
  async destroy(): Promise<void> {
  }
}
