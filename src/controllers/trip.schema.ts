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
    id: { type: 'string' }
  },
  response: {
    200: {
      type: 'object',
      properties: {},
      additionalProperties: true
    }
  }
}

export const patchJobTripSchema: FastifySchema = {
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

export const patchTripSchema: FastifySchema = {
  headers: {
    type: 'object',
    properties: {
      authorization: { type: 'string' }
    },
    require: ['authorization']
  },
  params: {
    id: { type: 'string' }
  },
  body: {
    type: 'object',
    properties: {
      shipperPricePerTon: { type: 'number' },
      shipperPaymentStatus: { type: 'string' },
      shipperBillStartDate: { type: 'string' },
      shipperPaymentDate: { type: 'string' },
      weightStart: { type: 'number' },
      weightEnd: { type: 'number' },
      carrierPricePerTon: { type: 'number' },
      bankAccountId: { type: 'string' },
      carrierPaymentStatus: { type: 'string' },
      carrierPaymentDate: { type: 'string' },
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

export const getDetailTripSchema: FastifySchema = {
  headers: {
    type: 'object',
    properties: {
      authorization: { type: 'string' }
    },
    require: ['authorization']
  },
  params: {
    id: { type: 'string' }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        weightStart: { type: 'string' },
        weightEnd: { type: 'string' },
        bankAccount: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              accountName: { type: 'string' },
              accountNo: { type: 'string' },
              bankName: { type: 'string' },
            }
          }
        },
        job: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            productTypeId: { type: 'number' },
            productName: { type: 'string' },
            truckType: { type: 'number' },
            weight: { type: 'string' },
            requiredTruckAmount: { type: 'number' },
            from: {
              name: { type: 'string' },
              dateTime: { type: 'string' },
              contactName: { type: 'string' },
              contactMobileNo: { type: 'string' },
              lat: { type: 'string' },
              lng: { type: 'string' },
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
                id: { type: 'string' },
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
              },
              nullable: true
            },
            tipper: { type: 'boolean' },
            price: { type: 'string' },
            priceType: { type: 'string' },
            payment: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                pricePerTon: { type: 'string' },
                amount: { type: 'string' },
                feeAmount: { type: 'string' },
                feePercentage: { type: 'string' },
                netAmount: { type: 'string' },
                paymentStatus: { type: 'string' },
                billStartDate: { type: 'string' },
                paymentDate: { type: 'string' },
              },
              nullable: true
            }
          }
        },
        truck: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            registrationNumber: {
              type: 'array',
              items: { type: 'string' }
            },
            truckType: { type: 'number' },
            carrierId: { type: 'string' },
            owner: {
              type: 'object',
              properties: {
                id: { type: 'string' },
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
              },
              nullable: true
            },
            payment: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                bankAccountId: { type: 'string' },
                pricePerTon: { type: 'string' },
                amount: { type: 'string' },
                feeAmount: { type: 'string' },
                feePercentage: { type: 'string' },
                netAmount: { type: 'string' },
                paymentStatus: { type: 'string' },
                paymentDate: { type: 'string' },
              },
              nullable: true
            }
          }
        }
      },
      additionalProperties: true
    }
  }
}

