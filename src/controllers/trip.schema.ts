import { FastifySchema } from "fastify";

export const addBulkTripSchema: FastifySchema = {
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
      trucks: {
        type: 'array',
        items: {
          properties: {
            id: { type: 'string' },
            startDate: { type: 'string' }
          }
        }
      },
    }
  },
  response: {
    200: {
      type: 'array',
      properties: {
        items: {
          jobCarrierId: { type: 'number' },
          truckId: { type: 'number' },
          priceType: { type: 'string' },
          createdAt: { type: 'string' },
          updatedAt: { type: 'string' },
          createdUser: { type: 'string' },
          weight: { type: 'number' },
          price: { type: 'number' },
          status: { type: 'string' },
          updatedUser: { type: 'string' },
          id: { type: 'number' },
          version: { type: 'number' },
          isDeleted: { type: 'boolean' },
        }
      },
      additionalProperties: true
    }
  }
}

export const deleteTripSchema: FastifySchema = {
  headers: {
    type: 'object',
    properties: {
      authorization: { type: 'string' }
    },
    require: ['authorization']
  },
  params: {
    tripId: { type: 'string' }
  },
  response: {
    200: {
      type: 'object',
      properties: {},
      additionalProperties: true
    }
  }
}

export const patchTripSchema: FastifySchema = {
  headers: {
    type: 'object',
    properties: {
      authorization: { type: 'string' }
    },
    require: ['authorization']
  },
  params: {
    jobId: { type: 'string' }
  },
  body: {
    type: 'object',
    properties: {
      trucks: {
        type: 'array',
        items: {
          properties: {
            id: { type: 'string' },
            startDate: { type: 'string' }
          }
        }
      },
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {},
      additionalProperties: true
    }
  }
}

