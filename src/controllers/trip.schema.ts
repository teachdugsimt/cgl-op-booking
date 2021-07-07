import { FastifySchema } from "fastify";

export const getTripSchema: FastifySchema = {
  headers: {
    type: 'object',
    properties: {
      authorization: { type: 'string' }
    },
    require: ['authorization']
  },
  querystring: {
    type: 'object',
    properties: {
      descending: { type: 'boolean' },
      page: { type: 'number' },
      rowsPerPage: { type: 'number' },
      sortBy: { type: 'string' },
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: { type: 'array' },
        size: { type: 'number' },
        currentPage: { type: 'number' },
        totalPages: { type: 'number' },
        totalElements: { type: 'number' },
        numberOfElements: { type: 'number' },
      },
      additionalProperties: false
    }
  }
}
