import { IUserRepository } from '@modules/users/domain/user.repository';
import { UserMongoRepository } from '@modules/users/infrastructure/user.mongo.repository';
import { IAdminRepository } from '@modules/users/domain/admin.repository';
import { AdminMongoRepository } from '@modules/users/infrastructure/admin.mongo.repository';
import { User } from '@modules/users/domain/user.entity';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export class AuthService {
  private userRepository: IUserRepository;
  private adminRepository: IAdminRepository;
  constructor() {
    this.userRepository = new UserMongoRepository();
    this.adminRepository = new AdminMongoRepository();
  }

  async register(email: string, password: string, phone?: string, fullName?: string): Promise<{status: boolean}> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) throw new Error('User already exists');
    const passwordHash = await bcrypt.hash(password, 10);
    const user: User = {
      email,
      passwordHash,
      phone,
      fullName,
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
    const token = jwt.sign(
      { userId: user._id, email: user.email, phone: user.phone, fullName: user.fullName },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    return { token };
  }
  async adminLogin(email: string, password: string): Promise<{ token: string; }> {
    const admin = await this.adminRepository.findByEmail(email);
    if (!admin) throw new Error('Admin not found');
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) throw new Error('Invalid password');
    const token = jwt.sign(
      { userId: admin._id, email: admin.email, phone: admin.phone, accessLevel: admin.accessLevel || 'full' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    return { token };
  }

  verifyToken(token: string): any {
    return jwt.verify(token, JWT_SECRET);
  }
}