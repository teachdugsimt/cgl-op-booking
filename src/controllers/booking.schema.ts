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
      truckId: { type: 'string', nullable: true },
      requesterType: { type: 'string' },
      accepterUserId: { type: 'string' },
    },
    require: ['jobId', 'accepterUserId', 'requesterType']
  },
  response: {
    200: {
      type: 'number',
      additionalProperties: false
    }
  }
}

export const bookingSchema2: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      jobId: { type: 'string' },
      truckId: { type: 'string', nullable: true },
      requesterType: { type: 'string' },
      accepterUserId: { type: 'string' },
      requesterUserId: { type: 'string' }
    },
    require: ['jobId', 'accepterUserId', 'requesterType', 'requesterUserId']
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

export const getAllBooking: FastifySchema = {
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
      requesterType: {
        type: 'string',
        nullable: true,
        enum: ['TRUCK_OWNER', 'JOB_OWNER']
      },
      status: {
        type: 'string',
        nullable: true,
        enum: ['ACCEPTED', 'WAITING', 'REJECTED']
      },
      searchText: { type: 'string' }
    }
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



const truckProperties = {
  id: { type: 'string' },
  truckType: { type: 'number' },
  loadingWeight: { type: 'number', nullable: true },
  stallHeight: { type: 'string', nullable: true },
  createdAt: { type: "string", format: "date-time" },
  updatedAt: { type: "string", format: "date-time" },
  approveStatus: { type: 'number' },
  registrationNumber: { type: 'array', nullable: true },
  tipper: { type: 'boolean', nullable: true },
  workingZones: { type: 'array' },
  owner: {
    type: 'object', properties: {
      id: { type: 'number', nullable: true },
      userId: { type: 'string', nullable: true },
      companyName: { type: 'string', nullable: true },
      fullName: { type: 'string', nullable: true },
      mobileNo: { type: 'string', nullable: true },
      email: { type: 'string', nullable: true },
      avatar: { type: 'string', nullable: true },
      object: { type: 'string', nullable: true },
      token: { type: 'string', nullable: true },
    }, nullable: true
  },
  truckPhotos: {
    type: 'object', properties: {
      front: { type: 'string', nullable: true },
      back: { type: 'string', nullable: true },
      left: { type: 'string', nullable: true },
      right: { type: 'string', nullable: true }
    }
  }
}


export const getJobWithBookingId: FastifySchema = {
  headers: {
    type: 'object',
    properties: {
      authorization: { type: 'string' }
    },
    require: ['authorization']
  },
  params: {
    bookingId: { type: 'string' }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string', nullable: true },
        productTypeId: { type: 'number', nullable: true },
        productName: { type: 'string', nullable: true },
        truckType: { type: 'string', nullable: true },
        weight: { type: 'number', nullable: true },
        requiredTruckAmount: { type: 'number', nullable: true },

        from: {
          type: 'object', properties: {
            name: { type: 'string', nullable: true },
            dateTime: { type: 'string', nullable: true },
            contactName: { type: 'string', nullable: true },
            contactMobileNo: { type: 'string', nullable: true },
            lat: { type: 'string', nullable: true },
            lng: { type: 'string', nullable: true },
          }, nullable: true
        },

        to: {
          type: 'array',
          items: {
            properties: {
              name: { type: 'string', nullable: true },
              dateTime: { type: 'string', nullable: true },
              contactName: { type: 'string', nullable: true },
              contactMobileNo: { type: 'string', nullable: true },
              lat: { type: 'string', nullable: true },
              lng: { type: 'string', nullable: true },
            }
          },
          nullable: true
        },


        owner: {
          type: 'object', properties: {
            id: { type: 'number', nullable: true },
            userId: { type: 'string', nullable: true },
            companyName: { type: 'string', nullable: true },
            fullName: { type: 'string', nullable: true },
            mobileNo: { type: 'string', nullable: true },
            email: { type: 'string', nullable: true },
            avatar: { type: 'object', properties: { object: { type: 'string', nullable: true } }, nullable: true },
            object: { type: 'string', nullable: true },
            token: { type: 'string', nullable: true },
          }, nullable: true
        },

        quotations: { type: 'array', nullable: true },
        truck: { type: 'object', properties: truckProperties, nullable: true },
        price: { type: 'number', nullable: true },
        priceType: { type: 'string', nullable: true },
      },
    }
  }
}




export const getTransportation: FastifySchema = {
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
    },
    additionalProperties: true
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

export const getTransportationId: FastifySchema = {
  headers: {
    type: 'object',
    properties: {
      authorization: { type: 'string' }
    },
    require: ['authorization']
  },
  params: {
    jobId: { type: 'string' },
  },
  querystring: {
    isDeleted: { type: 'boolean', nullable: true },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        productTypeId: { type: 'number' },
        productName: { type: 'string' },
        truckType: { type: 'string' }, //? should be number if mobx parse error, check here
        weight: { type: 'number' },
        requiredTruckAmount: { type: 'number' },
        loadingDatetime: { type: 'string' },
        from: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            dateTime: { type: 'string' },
            contactName: { type: 'string' },
            contactMobileNo: { type: 'string' },
            lat: { type: 'string' },
            lng: { type: 'string' },
          }
        },
        to: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              dateTime: { type: 'string' },
              contactName: { type: 'string' },
              contactMobileNo: { type: 'string' },
              lat: { type: 'string' },
              lng: { type: 'string' },
            }
          }
        },
        owner: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            fullName: { type: 'string' },
            companyName: { type: 'string' },
            email: { type: 'string' },
            mobileNo: { type: 'string' },
            avatar: {
              type: 'object',
              properties: {
                object: { type: 'string' }
              }
            },
            userId: { type: 'string' }
          }
        },
        trips: { type: 'array', nullable: true },
        status: {
          type: 'string',
          enum: ['NEW', 'INPROGRESS', 'CANCELLED', 'DONE', 'EXPIRED']
        },
        tipper: { type: 'boolean' },
        price: { type: 'string' },
        priceType: {
          type: 'string',
          enum: ['PER_TRIP', 'PER_TON']
        },
        createdAt: { type: 'string' }
      },
      additionalProperties: true
    }
  }
}

export const addPaymentSchema: FastifySchema = {
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
      tripId: { types: "number" },
    },
    require: ['tripId'],
    additionalProperties: true
  },
  response: {
    200: {
      type: 'boolean'
    }
  }
}


export const getPaymentSchema: FastifySchema = {
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
      id: { types: "number" },
    },
    require: ['id'],
    additionalProperties: true
  },
  response: {
    200: {
      type: 'object', properties: {

      },
      additionalProperties: true
    }
  }
}
