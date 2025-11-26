import { AdminMongoRepository } from '@modules/users/infrastructure/admin.mongo.repository';
import { hashSync } from 'bcryptjs';

const admins = [
  {
    email: 'dev_admin@picassostudio.ru',
    passwordHash: hashSync('DevInfrastructure', 10),
    phone: '+79999999990',
    accessLevel: 'full' as const,
    isDeleted: false,
  },
    {
    email: 'full_admin@picassostudio.ru',
    passwordHash: hashSync('^0APLiYbu#U*@1&*Ny1N', 10),
    phone: '+79999999990',
    accessLevel: 'full' as const,
    isDeleted: false,
  },
  {
    email: 'admin@picassostudio.ru',
    passwordHash: hashSync('!o3##Z8t1J!2VdY!j%&U', 10),
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