import { ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { UserRole } from '@tacohouse/shared';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import type { UserWithProfile } from 'src/types';
import { UserService } from 'src/user/user.service';

import { AuthService } from './auth.service';
import type { RegisterAuthDto } from './dto/register-auth.dto';

jest.mock('argon2');

describe('AuthService', () => {
  let service: AuthService;

  const mockUser: UserWithProfile = {
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
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockUserService = {
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access token, refresh token and user', async () => {
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      mockJwtService.signAsync
        .mockResolvedValueOnce(accessToken)
        .mockResolvedValueOnce(refreshToken);

      mockConfigService.get
        .mockReturnValueOnce('secret')
        .mockReturnValueOnce('15m')
        .mockReturnValueOnce('refresh-secret')
        .mockReturnValueOnce('7d');

      const result = await service.login(mockUser);

      expect(result).toEqual({
        accessToken,
        refreshToken,
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        }) as UserWithProfile,
      });

      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('register', () => {
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

    it('should create a new user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      (argon.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.register(registerDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });

      expect(argon.hash).toHaveBeenCalledWith(registerDto.password);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          password: 'hashedPassword',
          role: registerDto.role,
          profile: {
            create: {
              firstName: registerDto.firstName,
              lastName: registerDto.lastName,
              phone: registerDto.phone,
              avatar: registerDto.avatar,
              dateOfBirth: registerDto.dateOfBirth,
              occupation: registerDto.occupation,
              workplace: registerDto.workplace,
            },
          },
        },
        include: { profile: true },
      });

      expect(result).toEqual(
        expect.objectContaining({
          email: mockUser.email,
        }),
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'Email already exists',
      );

      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should return new access and refresh tokens', async () => {
      const accessToken = 'new-access-token';
      const refreshToken = 'new-refresh-token';

      mockJwtService.signAsync
        .mockResolvedValueOnce(accessToken)
        .mockResolvedValueOnce(refreshToken);

      mockConfigService.get
        .mockReturnValueOnce('secret')
        .mockReturnValueOnce('15m')
        .mockReturnValueOnce('refresh-secret')
        .mockReturnValueOnce('7d');

      const result = await service.refresh(mockUser);

      expect(result).toEqual({
        accessToken,
        refreshToken,
      });

      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('validateUser', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123',
    };

    it('should return user without password if credentials are valid', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      (argon.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(loginDto);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(argon.verify).toHaveBeenCalledWith(
        mockUser.password,
        loginDto.password,
      );
      expect(result).not.toHaveProperty('password');
      expect(result).toEqual(
        expect.objectContaining({
          email: mockUser.email,
        }),
      );
    });

    it('should return null if user not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(loginDto);

      expect(result).toBeNull();
      expect(argon.verify).not.toHaveBeenCalled();
    });

    it('should return null if password is invalid', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      (argon.verify as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(loginDto);

      expect(result).toBeNull();
    });
  });
});
