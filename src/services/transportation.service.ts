import { Service, Initializer, Destructor } from 'fastify-decorators';
import * as Types from '../controllers/booking.types'
import { FindManyOptions } from 'typeorm'
import TransportationRepository from '../repositories/vw-transportation.repository';

const transportationRepo = new TransportationRepository()
const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

@Service()
export default class TransportationService {
  @Initializer()
  async init(): Promise<void> {
  }

  async findTransportationList(query: Types.Transportation) {
    let { rowsPerPage = 10, page = 1, descending = true, sortBy = 'id', searchText, where } = query;

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
    if (searchText) {
      console.log("Search Text :: ", searchText)
      const options = {
        fullTextSearch: `${searchText}:*`,
        page: realPage,
        rowsPerPage: realTake,
        ...(sortBy ? { sortBy: camelToSnakeCase(sortBy) } : undefined),
        ...(descending ? { descending: descending ? 'DESC' : 'ASC' } : undefined),
      }
      response = await transportationRepo.fullTextSearch(options);
    } else {
      const filter: any = where && typeof where == 'string' ? JSON.parse(where) : (where ?? {})
      console.log("Filter :: ", filter)
      const findOptions: FindManyOptions = {
        take: realTake,
        skip: realPage,
        where: filter,
        order: {
          [camelToSnakeCase(sortBy)]: descending ? 'DESC' : 'ASC'
        },
      };
      response = await transportationRepo.findTransportation(findOptions)
    }
    console.log("Raw reseponse :: ", response)




    const response_final = {
      data: response[0] || [],
      totalElements: response[1] || 0,
      size: rowsPerPage,
      numberOfElements: response[0].length ?? 0,
      currentPage: page,
      totalPages: Math.ceil((response[1] || 0) / (+rowsPerPage))
    }
    console.log("Data in transportation FINAL :: ", response_final)
    return response_final
  }

  @Destructor()
  async destroy(): Promise<void> {
  }
}
