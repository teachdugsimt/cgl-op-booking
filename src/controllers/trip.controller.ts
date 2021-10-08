import { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, DELETE, GET, getInstanceByToken, PATCH, POST } from 'fastify-decorators';
import TripService from '../services/trip.service';
import { addBulkTripSchema, deleteTripSchema, patchTripSchema } from './trip.schema';
import Security from 'utility-layer/dist/security'

const security = new Security();

interface ITruckProps {
  id: string
  startDate: string
}

@Controller({ route: '/api/v1/trips' })
export default class PingController {

  private tripService = getInstanceByToken<TripService>(TripService);

  @POST({
    url: '/',
    options: {
      schema: addBulkTripSchema
    }
  })
  async createHandler(req: FastifyRequest<{
    Body: {
      jobId: string
      trucks: Array<ITruckProps>
    },
    Headers: {
      authorization: string
    }
  }>, reply: FastifyReply): Promise<object> {
    const { jobId, trucks } = req.body;
    const userIdFromToken = security.getUserIdByToken(req.headers.authorization);
    const userId = security.decodeUserId(userIdFromToken);
    return this.tripService?.bulkTrip(jobId, trucks, userId);
  }

  @DELETE({
    url: '/:id',
    options: {
      schema: deleteTripSchema
    }
  })
  async deleteHandler(req: FastifyRequest<{
    Params: {
      tripId: string
    },
    Headers: {
      authorization: string
    }
  }>, reply: FastifyReply): Promise<object> {
    const { tripId } = req.params;
    await this.tripService?.deleteTripById(tripId);
    return reply.status(204).send();
  }

  @PATCH({
    url: '/jobs/:jobId',
    options: {
      schema: patchTripSchema
    }
  })
  async updateHandler(req: FastifyRequest<{
    Params: {
      jobId: string
    },
    Body: {
      trucks: Array<ITruckProps>
    },
    Headers: {
      authorization: string
    }
  }>, reply: FastifyReply): Promise<object> {
    const { jobId } = req.params;
    const { trucks } = req.body
    const userIdFromToken = security.getUserIdByToken(req.headers.authorization);
    const userId = security.decodeUserId(userIdFromToken);
    await this.tripService?.updateTripByJobId(jobId, trucks, userId);
    return reply.status(204).send();
  }

}
// test git
