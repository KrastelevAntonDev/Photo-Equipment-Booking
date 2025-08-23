import { UserRepository } from '../repositories/UserRepository';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(email: string, password: string, phone?: string): Promise<{status: boolean}> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) throw new Error('User already exists');
    const passwordHash = await bcrypt.hash(password, 10);
    const user: User = {
      email,
      passwordHash,
      phone,
      balance: 0,
      points: 0,
      bookings: [],
      favoriteRoomIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return await this.userRepository.createUser(user);
  }

  async login(email: string, password: string): Promise<{ token: string; }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error('User not found');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error('Invalid password');
    // Не кладем passwordHash в возвращаемого user!
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    return { token };
  }

  verifyToken(token: string): any {
    return jwt.verify(token, JWT_SECRET);
  }
}