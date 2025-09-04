import { AdminRepository } from '../repositories/admin.repository';
import { hashSync } from 'bcryptjs';

const admins = [
  {
    email: 'test@test.com',
    passwordHash: hashSync('test', 10),
    phone: '+79999999999',
    isDeleted: false,
  },
];

export async function seedAdmins() {
  const repo = new AdminRepository();
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