import { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, GET, getInstanceByToken } from 'fastify-decorators';
import TripService from '../services/trip.service';
import { getTripSchema } from './trip.schema';
import Security from 'utility-layer/dist/security';

const security = new Security();

@Controller({ route: '/api/v1/booking/trips' })
export default class TripController {

  private tripService = getInstanceByToken<TripService>(TripService);

  @GET({
    url: '/',
    options: {
      schema: getTripSchema
    }
  })
  async getTripHandler(req: FastifyRequest<{
    Headers: { authorization: string },
    Querystring: { descending?: boolean, page?: number, rowsPerPage?: number, sortBy?: string }
  }>, reply: FastifyReply): Promise<object> {
    try {
      const { page = 1, rowsPerPage = 10 } = req.query

      const userIdFromToken = security.getUserIdByToken(req.headers.authorization);
      const trips = await this.tripService.getTrips(userIdFromToken, req.query);

      return {
        data: trips.data,
        size: rowsPerPage,
        currentPage: page,
        totalPages: Math.ceil(trips.count / (+rowsPerPage)),
        totalElements: trips.count,
        numberOfElements: trips.data.length ?? 0,
      }
    } catch (err) {
      console.log('err :>> ', err);
      reply.status(400);
      throw err;
    }
  }

}
