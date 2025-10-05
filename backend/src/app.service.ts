import { Injectable } from '@nestjs/common';

import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getHello() {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: 'user@example.com',
          password: 'password',
          role: 'TENANT',
          isActive: true,
        },
      });

      return `Hello world! Create user with ID: ${user.id}`;
    } catch (error) {
      return `Hello world! Error creating user: ${error}`;
    }
  }
}
