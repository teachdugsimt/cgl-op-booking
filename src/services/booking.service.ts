import { Service, Initializer, Destructor } from 'fastify-decorators';
import * as Types from '../controllers/booking.types'
import BookingRepository from '../repositories/booking.repository';
const repo = new BookingRepository()
@Service()
export default class BookingService {
  @Initializer()
  async init(): Promise<void> {
  }

  async createBooking(objectParams: Types.FullPostBooking): Promise<any> {
    return repo.insert(objectParams)
  }

  async updateBooking(objectParams: Types.FullUpdateBooking): Promise<any> {
    return repo.update(objectParams)
  }

  @Destructor()
  async destroy(): Promise<void> {
  }
}
