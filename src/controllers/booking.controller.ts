import { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, GET, POST, PATCH, getInstanceByToken } from 'fastify-decorators';
import BookingService from '../services/booking.service';
import { bookingSchema, bookingUpdateSchema } from './booking.schema';
import * as Types from './booking.types'
import Utility from 'utility-layer/dist/security'
const util = new Utility();
@Controller({ route: '/api/v1/booking' })
export default class PingController {

  private bookingService = getInstanceByToken<BookingService>(BookingService);

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
    const result = await this.bookingService.updateBooking(objectParams)
    if (result && result.id)
      reply.send(1) // success
    else reply.send(0) // fail
  }

}
