import 'reflect-metadata';
import fp from 'fastify-plugin';
import { Connection, createConnection } from 'typeorm';
import {
  Booking, JobCarrier, Trip, VwTripInprogress, VwMyJobNewList,
  VwJobWithBookingId, VwTripWithTruckDetail, VwMyJobDoneList,
  VwTransportationV2, BankAccount, PaymentCarrier, PaymentShipper
} from '../models';
import PaymentConnection from './payment-connection';

const paymentDB = new PaymentConnection();

export default fp(async server => {
  try {
    const connection = await createConnection();
    console.log('database connected');

    const paymentConnection: Connection = await paymentDB.getConnection();

    server.decorate('db', {
      booking: connection.getRepository(Booking),
      trip: connection.getRepository(Trip),
      jobCarrier: connection.getRepository(JobCarrier),
      vwTripInprogress: connection.getRepository(VwTripInprogress),
      vwMyJobNewList: connection.getRepository(VwMyJobNewList),
      vwMyJobDoneList: connection.getRepository(VwMyJobDoneList),
      vwJobWithBookingId: connection.getRepository(VwJobWithBookingId),
      vwTripWithTruckDetail: connection.getRepository(VwTripWithTruckDetail),
      vwTransportationV2: connection.getRepository(VwTransportationV2),
      bankAccount: paymentConnection.getRepository(BankAccount),
      paymentShipper: paymentConnection.getRepository(PaymentShipper),
      paymentCarrier: paymentConnection.getRepository(PaymentCarrier),
    });
  } catch (error) {
    console.log(error);
    console.log('make sure you have set .env variables - see .env.sample');
  }
});
