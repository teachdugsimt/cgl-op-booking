import 'reflect-metadata';
import fp from 'fastify-plugin';
import { createConnection } from 'typeorm';
import { Booking, JobCarrier, Trip, VwTripInprogress, VwMyJobNewList, VwJobWithBookingId, VwTripWithTruckDetail, VwMyJobDoneList } from '../models';

export default fp(async server => {
  try {
    const connection = await createConnection();
    console.log('database connected');

    server.decorate('db', {
      booking: connection.getRepository(Booking),
      trip: connection.getRepository(Trip),
      jobCarrier: connection.getRepository(JobCarrier),
      vwTripInprogress: connection.getRepository(VwTripInprogress),
      vwMyJobNewList: connection.getRepository(VwMyJobNewList),
      vwMyJobDoneList: connection.getRepository(VwMyJobDoneList),
      vwJobWithBookingId: connection.getRepository(VwJobWithBookingId),
      vwTripWithTruckDetail: connection.getRepository(VwTripWithTruckDetail),
    });
  } catch (error) {
    console.log(error);
    console.log('make sure you have set .env variables - see .env.sample');
  }
});
