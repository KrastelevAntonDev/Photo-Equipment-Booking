import { AdminMongoRepository } from '@modules/users/infrastructure/admin.mongo.repository';
import { hashSync } from 'bcryptjs';

const admins = [
  {
    email: 'test@test.com',
    passwordHash: hashSync('test', 10),
    phone: '+79999999999',
    accessLevel: 'full' as const,
    isDeleted: false,
  },
  {
    email: 'partial@test.com',
    passwordHash: hashSync('test', 10),
    phone: '+79999999998',
    accessLevel: 'partial' as const,
    isDeleted: false,
  },
];

export async function seedAdmins() {
  const repo = new AdminMongoRepository();
  for (const admin of admins) {
    const exists = await repo.findByEmail(admin.email);
    if (!exists) {
      await repo.createAdmin(admin);
      console.log(`Admin ${admin.email} created`);
    } else {
      console.log(`Admin ${admin.email} already exists`);
    }
  }
}