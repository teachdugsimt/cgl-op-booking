import { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, GET, POST, PATCH, getInstanceByToken } from 'fastify-decorators';
import BookingService from '../services/booking.service';
import TransportationService from '../services/transportation.service';
import {
  bookingSchema, bookingUpdateSchema, getMyJobSchema,
  getJobWithBookingId, getTransportation, addPaymentSchema,
  getPaymentSchema, getTransportationId
} from './booking.schema';
import * as Types from './booking.types'
import PaymentRepository from '../repositories/payment.repository';
import Utility from 'utility-layer/dist/security'
const util = new Utility();
const paymentRepo = new PaymentRepository()
@Controller({ route: '/api/v1/booking' })
export default class BookingController {

  public bookingService = getInstanceByToken<BookingService>(BookingService);
  public transportationService = getInstanceByToken<TransportationService>(TransportationService);

  @POST({
    url: '/',
    options: {
      schema: bookingSchema
    }
  })
  async postBookingHandler(req: FastifyRequest<{ Body: Types.PostBooking, Headers: { authorization: string } }>, reply: FastifyReply): Promise<any> {
    const userIdFromToken = util.getUserIdByToken(req.headers.authorization);
    const userId = util.decodeUserId(userIdFromToken)
    const jobId = util.decodeUserId(req.body.jobId)
    const truckId = util.decodeUserId(req.body.truckId)
    const accepterUserId = util.decodeUserId(req.body.accepterUserId)
    const objectParams = {
      jobId, truckId,
      requesterType: req.body.requesterType,
      requesterUserId: userId,
      accepterUserId,
    }
    console.log("Object Params controller :: ", objectParams)
    const result = await this.bookingService.createBooking(objectParams)
    if (result && result.id)
      reply.send(1) // success
    else reply.send(0) // fail
  }



  @PATCH({
    url: '/:quotationId',
    options: {
      schema: bookingUpdateSchema
    }
  })
  async updateBookingHandler(req: FastifyRequest<{ Params: { quotationId: string }, Body: { status: string }, Headers: { authorization: string } }>, reply: FastifyReply): Promise<any> {
    const userIdFromToken = util.getUserIdByToken(req.headers.authorization);
    const accepterUserId = util.decodeUserId(userIdFromToken)
    const quotationId = util.decodeUserId(req.params.quotationId)
    const objectParams = {
      id: quotationId, status: req.body.status, accepterUserId
    }
    console.log("Object Params update controller :: ", objectParams)
    const result = await this.bookingService.updateBooking(objectParams, req.headers.authorization)
    if (result == true || result?.id)
      reply.send(1) // success
    else reply.send(0) // fail
  }

  @GET({
    url: '/my-job',
    options: {
      schema: getMyJobSchema
    }
  })
  async getMyJobList(req: FastifyRequest<{ Querystring: Types.MyJobFilterList, Headers: { authorization: string } }>, reply: FastifyReply): Promise<any> {
    const userIdFromToken = util.getUserIdByToken(req.headers.authorization);
    const userId = util.decodeUserId(userIdFromToken)

    console.log("User id :: ", userId)
    const result = await this.bookingService.findListMyJob(req.query, userId)
    return { ...result }
  }



  @GET({
    url: '/:bookingId',
    options: {
      schema: getJobWithBookingId
    }
  })
  async getJobWithBookingId(req: FastifyRequest<{ Params: { bookingId: string }, Headers: { authorization: string } }>, reply: FastifyReply): Promise<any> {
    const userIdFromToken = util.getUserIdByToken(req.headers.authorization);
    const userId = util.decodeUserId(userIdFromToken)
    const bookingId = util.decodeUserId(req.params.bookingId)

    console.log("User id :: ", userId)
    const result = await this.bookingService.findJobByBookingId(bookingId)
    return { ...result }
  }



  @GET({
    url: '/transportation',
    options: {
      schema: getTransportation
    }
  })
  async getTransportation(req: FastifyRequest<{ Querystring: Types.MyJobFilterList, Headers: { authorization: string } }>, reply: FastifyReply): Promise<any> {
    console.log("Query :: ", req.query.where)
    const result = await this.transportationService.findTransportationList(req.query)
    return { ...result }
  }

  @GET({
    url: '/transportation/:jobId',
    options: {
      schema: getTransportationId
    }
  })
  async getTransportationId(req: FastifyRequest<{ Params: { jobId: string }, Querystring: { isDeleted: boolean | null }, Headers: { authorization: string } }>, reply: FastifyReply): Promise<any> {
    console.log("Params :: ", req.params.jobId)
    const result = await this.transportationService.findTransportationId(req.params.jobId, req.query.isDeleted)
    console.log("Result get job id :: ", result)
    return { ...result }
  }

  @POST({
    url: '/payment',
    options: {
      schema: addPaymentSchema
    }
  })
  async addPayment(req: FastifyRequest<{ Body: { tripId: number }, Headers: { authorization: string } }>, reply: FastifyReply): Promise<any> {
    const result = await paymentRepo.add({ tripId: req.body.tripId })
    return result ? true : false
  }

  @GET({
    url: '/payment',
    options: {
      schema: getPaymentSchema
    }
  })
  async getPayment(req: FastifyRequest<{ Querystring: { id: number }, Headers: { authorization: string } }>, reply: FastifyReply): Promise<any> {
    const result = await paymentRepo.findAndCount({ where: { id: req.query.id } })
    console.log("Result :: ", result)
    return result
  }

}
