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

  async addFavoriteRoom(userId: string, roomId: string): Promise<void> {
    return this.userRepository.addFavoriteRoom(userId, roomId);
  }

  // Создание пользователя через админку с минимальными полями
  async createUserByAdmin(payload: { email: string; phone?: string; fullName?: string }): Promise<User> {
    const existing = await this.userRepository.findByEmail(payload.email);
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const now = new Date();
    const newUser: User = {
      email: payload.email,
      passwordHash: '',
      phone: payload.phone,
      fullName: payload.fullName,
      favoriteRoomIds: [],
      balance: 0,
      points: 0,
      bookings: [],
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };

    await this.userRepository.createUser(newUser);
    const created = await this.userRepository.findByEmail(payload.email);
    if (!created) throw new Error('Failed to create user');
    return created;
  }

  // Обновление пользователя через админку
  async updateUserByAdmin(
    userId: string,
    payload: { email?: string; phone?: string; fullName?: string; balance?: number; points?: number }
  ): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Если меняется email, проверяем уникальность
    if (payload.email && payload.email !== user.email) {
      const existing = await this.userRepository.findByEmail(payload.email);
      if (existing) {
        throw new Error('User with this email already exists');
      }
    }

    const updateData: Partial<User> = {
      ...payload,
      updatedAt: new Date(),
    };

    const updated = await this.userRepository.updateUser(userId, updateData);
    if (!updated) throw new Error('Failed to update user');
    return updated;
  }
}