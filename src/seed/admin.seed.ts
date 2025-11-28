import { connectDB } from '@config/database';
import { AdminMongoRepository } from '@modules/users/infrastructure/admin.mongo.repository';
import { hashSync } from 'bcryptjs';
import { env } from '@config/env';

const admins = [
  {
    email: 'dev_admin@picassostudio.ru',
    passwordHash: hashSync(env.dev_admin_pass, 10),
    phone: '+79999999990',
    accessLevel: 'full' as const,
    isDeleted: false,
  },
    {
    email: 'full_admin@picassostudio.ru',
    passwordHash: hashSync(env.full_admin_pass, 10),
    phone: '+79999999990',
    accessLevel: 'full' as const,
    isDeleted: false,
  },
  {
    email: 'admin@picassostudio.ru',
    passwordHash: hashSync(env.admin_pass, 10),
    phone: '+79999999998',
    accessLevel: 'partial' as const,
    isDeleted: false,
  },
];


export async function seedAdmins() {
  await connectDB();
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

// Запуск скрипта
if (require.main === module) {
  seedAdmins()
    .then(() => {
      console.log('✅ Seed admins completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed admins failed:', error);
      process.exit(1);
    });
}