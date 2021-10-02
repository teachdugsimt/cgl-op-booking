import { Service, Initializer, Destructor } from 'fastify-decorators';
import * as Types from '../controllers/booking.types'
import { FindManyOptions } from 'typeorm'
import TransportationRepository from '../repositories/vw-transportation.repository';
import TransportationRepositoryV2 from '../repositories/vw-transportation-v2.repository';

const transportationRepo = new TransportationRepository()
const transportationRepoV2 = new TransportationRepositoryV2()
const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
const generateFilterSearchText = (str: string) => ` ("VwTransportationV2"."full_text_search" like '%${camelToSnakeCase(str)}%')`
const generateFilterSearchTextV2 = (str: string) => {
  let filterTmp: string[] = []
  const spliter = str.split(" ")
  if (spliter.length > 1)
    spliter.map((e, i) => filterTmp.push(i == 0 ?
      `("VwTransportationV2"."full_text_search" like '%${camelToSnakeCase(e)}%'` : (
        i == spliter.length - 1 ? `"VwTransportationV2"."full_text_search" like '%${camelToSnakeCase(e)}%')` :
          `"VwTransportationV2"."full_text_search" like '%${camelToSnakeCase(e)}%'`
      )
    ))
  else filterTmp.push(`"VwTransportationV2"."full_text_search" like '%${camelToSnakeCase(spliter[0])}%'`)
  return filterTmp.join(" and ")
  // return `("VwTransportationV2"."requester_type" IS NOT NULL ) and ` + filterTmp.join(" or ")
}
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


      // console.log("Search Text :: ", searchText)
      // console.time("GetTransportation Start") 
      // // 2.527s => ไม้แบบ
      // // 1.580s => ไม้
      // // 1.556s => ของใช้
      // // 1.767s, 1.688s, 1.636s => ศรีภูมิ
      // const options = {
      //   fullTextSearch: `${searchText}:*`,
      //   page: realPage,
      //   rowsPerPage: realTake,
      //   ...(sortBy ? { sortBy: camelToSnakeCase(sortBy) } : undefined),
      //   ...(descending ? { descending: descending ? 'DESC' : 'ASC' } : undefined),
      // }
      // response = await transportationRepo.fullTextSearch(options);
      // console.timeEnd("GetTransportation Start")



      const filterOptions = generateFilterSearchTextV2(searchText)
      console.log("Filter Options :: ", filterOptions)
      console.time("GetTransportationV2 Start")
      // 1.506s => ไม้แบบ
      // 1.647s => ไม้
      // 1.517s => ของใช้
      // 1.802s, 1.628s, 1.616s => ศรีภูมิ
      const findOptions: FindManyOptions = {
        take: realTake,
        skip: realPage,
        where: filterOptions,
        order: {
          [camelToSnakeCase(sortBy)]: descending ? 'DESC' : 'ASC'
        },
      };
      response = await transportationRepoV2.findTransportation(findOptions)
      console.timeEnd("GetTransportationV2 Start")


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
      response = await transportationRepoV2.findTransportation(findOptions)
    }




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

  @Destructor()
  async destroy(): Promise<void> {
  }
}
