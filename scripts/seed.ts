import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing users
  await prisma.user.deleteMany();

  const users = [
    {
      username: 'Faker',
      email: 'faker@t1.gg',
      displayName: 'Lee Sang-hyeok',
      avatarUrl: 'https://i.pravatar.cc/150?u=faker',
      score: {
        create: {
          overall: 99,
          vitality: 95,
          discipline: 99,
          logic: 98,
          strategy: 99,
          craft: 99,
          grit: 99,
          archetype: 'Demon King',
          axesPopulated: 6,
          xp: 100000,
          level: 99
        }
      }
    },
    {
      username: 'Chovy',
      email: 'chovy@geng.gg',
      displayName: 'Jeong Ji-hoon',
      avatarUrl: 'https://i.pravatar.cc/150?u=chovy',
      score: {
        create: {
          overall: 96,
          vitality: 90,
          discipline: 98,
          logic: 95,
          strategy: 90,
          craft: 99,
          grit: 85,
          archetype: 'Church of Chovy',
          axesPopulated: 6,
          xp: 80000,
          level: 95
        }
      }
    },
    {
      username: 'ShowMaker',
      email: 'showmaker@dk.gg',
      displayName: 'Heo Su',
      avatarUrl: 'https://i.pravatar.cc/150?u=showmaker',
      score: {
        create: {
          overall: 92,
          vitality: 85,
          discipline: 85,
          logic: 92,
          strategy: 88,
          craft: 94,
          grit: 95,
          archetype: 'Playmaker',
          axesPopulated: 6,
          xp: 70000,
          level: 92
        }
      }
    },
    {
      username: 'CasualGamer',
      email: 'casual@example.com',
      displayName: 'Casual Gamer',
      avatarUrl: 'https://i.pravatar.cc/150?u=casual',
      score: {
        create: {
          overall: 65,
          vitality: 60,
          discipline: 60,
          logic: 70,
          strategy: 50,
          craft: 60,
          grit: 45,
          archetype: 'Weekend Warrior',
          axesPopulated: 6,
          xp: 5000,
          level: 25
        }
      }
    }
  ];

  for (const user of users) {
    await prisma.user.create({
      data: user
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
