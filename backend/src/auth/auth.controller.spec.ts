import { Test, TestingModule } from '@nestjs/testing';

import { UserRole } from '@tacohouse/shared';
import type { UserWithRelations } from 'src/types';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { RegisterAuthDto } from './dto';

describe('AuthController', () => {
  let controller: AuthController;

  const mockUser: UserWithRelations = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: UserRole.TENANT,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    deletedAt: null,
    profile: {
      id: '1',
      userId: '1',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+84901234567',
      avatar: 'https://avatar.com/john.jpg',
      dateOfBirth: new Date('1990-01-01'),
      occupation: 'Developer',
      workplace: 'Tech Corp',
      createdAt: new Date(),
      updatedAt: new Date(),
      idCardFrontPhoto: null,
      idCardBackPhoto: null,
      portraitPhoto: null,
    },
    admin: null,
    landlord: null,
    tenant: null,
  };

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return tokens and user data', async () => {
      const loginResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          firstName: mockUser.profile?.firstName,
          lastName: mockUser.profile?.lastName,
          phone: mockUser.profile?.phone,
          avatar: mockUser.profile?.avatar,
          dateOfBirth: mockUser.profile?.dateOfBirth,
          occupation: mockUser.profile?.occupation,
          workplace: mockUser.profile?.workplace,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      };

      mockAuthService.login.mockResolvedValue(loginResult);

      const result = await controller.login(mockUser);

      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(loginResult);
    });
  });

  describe('register', () => {
    it('should create a new user and return user data', async () => {
      const registerDto: RegisterAuthDto = {
        email: 'newuser@example.com',
        password: 'Password123',
        role: UserRole.TENANT,
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+84901234567',
        avatar: 'https://avatar.com/jane.jpg',
        dateOfBirth: new Date('1995-05-15'),
        occupation: 'Designer',
        workplace: 'Design Studio',
      };

      const registeredUser = {
        id: '2',
        email: registerDto.email,
        role: registerDto.role,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        avatar: registerDto.avatar,
        dateOfBirth: registerDto.dateOfBirth,
        occupation: registerDto.occupation,
        workplace: registerDto.workplace,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthService.register.mockResolvedValue(registeredUser);

      const result = await controller.register(registerDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(registeredUser);
    });
  });

  describe('refresh', () => {
    it('should return new tokens', async () => {
      const refreshResult = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockAuthService.refresh.mockResolvedValue(refreshResult);

      const result = await controller.create(mockUser);

      expect(mockAuthService.refresh).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(refreshResult);
    });
  });
});
