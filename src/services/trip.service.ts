import { Service, Initializer, Destructor } from 'fastify-decorators';

@Service()
export default class TripService {
  @Initializer()
  async init(): Promise<void> {
  }



  @Destructor()
  async destroy(): Promise<void> {
  }
}
