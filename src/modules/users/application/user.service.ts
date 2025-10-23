import { IUserRepository } from '../domain/user.repository';
import { UserMongoRepository } from '../infrastructure/user.mongo.repository';
import { User } from '../domain/user.entity';

export class UserService {
  private userRepository: IUserRepository;

  constructor() {
    this.userRepository = new UserMongoRepository();
  }
  async getUserProfile(id:string): Promise<User | null> {
    return this.userRepository.getUser(id);
  }
  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }
  async createUser(user: User): Promise<{status: boolean}> {
    return this.userRepository.createUser(user);
  }
}