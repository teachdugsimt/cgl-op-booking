import { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, GET, getInstanceByToken } from 'fastify-decorators';
import PingService from '../services/ping.service';
import { getTripSchema } from './trip.schema';


@Controller({ route: '/api/v1/booking/trips' })
export default class TripController {

  private pingService = getInstanceByToken<PingService>(PingService);

  @GET({
    url: '/',
    options: {
      schema: getTripSchema
    }
  })
  async getTripHandler(req: FastifyRequest, reply: FastifyReply): Promise<object> {
    return { message: this.pingService?.ping() }
  }

}
