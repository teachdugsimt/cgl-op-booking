import { FastifySchema } from "fastify";

export const bookingSchema: FastifySchema = {
  headers: {
    type: 'object',
    properties: {
      authorization: { type: 'string' }
    },
    require: ['authorization']
  },
  body: {
    type: 'object',
    properties: {
      jobId: { type: 'string' },
      truckId: { type: 'string' },
      requesterType: { type: 'string' },
      accepterUserId: { type: 'string' },
    },
    require: ['jobId', 'truckId', 'accepterUserId', 'requesterType']
  },
  response: {
    200: {
      type: 'number',
      additionalProperties: false
    }
  }
}


export const bookingUpdateSchema: FastifySchema = {
  headers: {
    type: 'object',
    properties: {
      authorization: { type: 'string' }
    },
    require: ['authorization']
  },
  body: {
    type: 'object',
    properties: {
      status: { type: 'string' }
    }
  },
  params: {
    quotationId: { type: 'string' }
  },
  response: {
    200: {
      type: 'number',
      additionalProperties: false
    }
  }
}

export const getMyJobSchema: FastifySchema = {
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
      descending: { type: 'boolean', nullable: true },
      page: { type: 'number', nullable: true },
      rowsPerPage: { type: 'number', nullable: true },
      sortBy: { type: 'string', nullable: true },
      type: { type: 'number' }
    },
    require: ['type']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: { type: 'array' },
        totalElements: { type: 'number' },
        size: { type: 'number' },
        numberOfElements: { type: 'number' },
        currentPage: { type: 'number' },
        totalPages: { type: 'number' },
      },
    }
  }
}


