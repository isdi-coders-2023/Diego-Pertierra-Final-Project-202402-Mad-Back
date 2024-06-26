import { type PrismaClient } from '@prisma/client';
import { UsersRepo } from './users.repo';
import { HttpError } from '../middleware/errors.middleware';
import { User, type UserCreateDto } from '../entities/user';

const mockPrisma = {
  user: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue({ id: '1' }),
    findFirst: jest.fn().mockResolvedValue({ id: '1' }),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  },
} as unknown as PrismaClient;

describe('Given an instance of the class UsersRepo', () => {
  const usersRepo = new UsersRepo(mockPrisma);

  it('should be an instance of the class', () => {
    expect(usersRepo).toBeInstanceOf(UsersRepo);
  });

  describe('When we call the method ReadAll', () => {
    it('should call prisma.user.findMany', async () => {
      const result = await usersRepo.readAll();
      expect(mockPrisma.user.findMany).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('When we call the method ReadById with a valid id', () => {
    it('should call prisma.user.findUnique', async () => {
      const result = await usersRepo.readById('1');
      expect(mockPrisma.user.findUnique).toHaveBeenCalled();
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('When we use the method readById with an invalid ID', () => {
    test('Then it should throw an error', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(usersRepo.readById('2')).rejects.toThrow(
        new HttpError(404, 'Not Found', 'User 2 not found')
      );
    });
  });

  describe('When we use the method searchForLogin with a valid key', () => {
    test('Then it should call prisma.findFirst', async () => {
      const result = await usersRepo.searchForLogin('email', 'test@sample.com');
      expect(mockPrisma.user.findFirst).toHaveBeenCalled();
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('When we use the method searchForLogin with an invalid key', () => {
    test('Then it should throw an error', async () => {
      await expect(
        usersRepo.searchForLogin('invalid' as 'username', 'test')
      ).rejects.toThrow(
        new HttpError(400, 'Bad Request', 'Invalid query parameters')
      );
    });
  });

  describe('When we use the method searchForLogin with an invalid value', () => {
    test('Then it should throw an error', async () => {
      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValueOnce(null);
      await expect(usersRepo.searchForLogin('email', 'test')).rejects.toThrow(
        new HttpError(400, 'Bad Request', 'Invalid email or password')
      );
    });
  });

  describe('When we use the method create', () => {
    test('Then it should call prisma.create', async () => {
      const data = {} as unknown as UserCreateDto;
      const result = await usersRepo.create(data);
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(result).toEqual({});
    });
  });

  describe('When we use the method update with a valid ID', () => {
    test('Then it should call prisma.update', async () => {
      const result = await usersRepo.update('1', {});
      expect(mockPrisma.user.update).toHaveBeenCalled();
      expect(result).toEqual({});
    });
  });

  describe('When we use the method update with an invalid ID', () => {
    test('Then it should throw an error', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(usersRepo.update('2', {})).rejects.toThrow(
        new HttpError(404, 'Not Found', 'User 2 not found')
      );
    });
  });

  describe('When we use the method delete with a valid ID', () => {
    test('Then it should call prisma.delete', async () => {
      const result = await usersRepo.delete('1');
      expect(mockPrisma.user.delete).toHaveBeenCalled();
      expect(result).toEqual({});
    });
  });

  describe('When we use the method delete with an invalid ID', () => {
    test('Then it should throw an error', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(usersRepo.delete('2')).rejects.toThrow(
        new HttpError(404, 'Not Found', 'User 2 not found')
      );
    });
  });

  describe('When we call the method manageMeet', () => {
    const mockUserId = '1';
    const mockMeetId = '2';

    describe('and operation is "POST"', () => {
      beforeEach(() => {
        (mockPrisma.user.update as jest.Mock).mockResolvedValueOnce({});
      });

      it('should call prisma.user.update with correct parameters and connect the meet', async () => {
        await usersRepo.manageMeet(
          mockUserId,
          mockMeetId,
          'POST',
          'savedMeets'
        );

        expect(mockPrisma.user.update).toHaveBeenCalledWith({
          where: { id: mockUserId },
          data: { savedMeets: { connect: { id: mockMeetId } } },
          include: { savedMeets: true },
        });
      });
    });

    describe('and operation is "DELETE"', () => {
      beforeEach(() => {
        (mockPrisma.user.update as jest.Mock).mockResolvedValueOnce({});
      });

      it('should call prisma.user.update with correct parameters and disconnect the meet', async () => {
        await usersRepo.manageMeet(
          mockUserId,
          mockMeetId,
          'DELETE',
          'savedMeets'
        );

        expect(mockPrisma.user.update).toHaveBeenCalledWith({
          where: { id: mockUserId },
          data: { savedMeets: { disconnect: { id: mockMeetId } } },
          include: { savedMeets: true },
        });
      });
    });

    describe('and operation is unknown', () => {
      it('should throw an error', async () => {
        await expect(
          usersRepo.manageMeet(mockUserId, mockMeetId, 'UNKNOWN', 'savedMeets')
        ).rejects.toThrow(new Error('Operation unknown'));
      });
    });
  });

  describe('When we call the method addFriend', () => {
    it('should call prisma.user.update with correct parameters', async () => {
      const mockUserId = '1';
      const mockFriendId = '2';

      (mockPrisma.user.update as jest.Mock).mockResolvedValueOnce({});

      await usersRepo.addFriend(mockUserId, mockFriendId);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { friends: { connect: { id: mockFriendId } } },
        include: { friends: true },
      });
    });
  });

  describe('When we call the method getFriends', () => {
    it('should call prisma.user.findUnique with correct parameters', async () => {
      const mockUserId = '1';
      const mockUser = {
        id: '1',
        friends: [
          { id: '2', username: 'friend1' },
          { id: '3', username: 'friend2' },
        ],
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);

      const result = await usersRepo.getFriends(mockUserId);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        include: { friends: true },
      });

      expect(result).toEqual(mockUser.friends);
    });

    it('should throw HttpError if user is not found', async () => {
      const mockUserId = '1';

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(usersRepo.getFriends(mockUserId)).rejects.toThrow(
        new HttpError(404, 'Not Found', `User ${mockUserId} not found`)
      );
    });
  });

  describe('When we call the method deleteFriend', () => {
    it('should call prisma.user.update with correct parameters', async () => {
      const mockUserId = '1';
      const mockFriendId = '2';

      (mockPrisma.user.update as jest.Mock).mockResolvedValueOnce({});

      await usersRepo.deleteFriend(mockUserId, mockFriendId);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { friends: { disconnect: { id: mockFriendId } } },
        include: { friends: true },
      });
    });
  });

  describe('When we call the method searchByUsername', () => {
    it('should call prisma.user.findMany with correct parameters', async () => {
      const mockUsername = 'testuser';
      const mockUsers = [
        { id: '1', username: 'testuser1' },
        { id: '2', username: 'testuser2' },
      ];

      (mockPrisma.user.findMany as jest.Mock).mockResolvedValueOnce(mockUsers);

      const result = await usersRepo.searchByUsername(mockUsername);

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            username: {
              contains: mockUsername,
              mode: 'insensitive',
            },
          },
          select: expect.objectContaining({
            id: true,
            username: true,
          }),
        })
      );

      expect(result).toEqual(mockUsers);
    });
  });
});
