import { UserRepository } from '../repositories/UserRepository';
import { User } from '../models/User';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }
  async getUserProfile(id:string): Promise<User | null> {
    return this.userRepository.getUser(id);
  }
  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }
  async createUser(user: User): Promise<User> {
    
    return this.userRepository.createUser(user);
  }
}