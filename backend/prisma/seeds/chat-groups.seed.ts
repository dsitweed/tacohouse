import { faker } from '@faker-js/faker';
import {
  Building,
  ChatGroup,
  ChatGroupMember,
  Message,
  PrismaClient,
  User,
} from 'generated/prisma/client';
import { MessageType, UserRole } from 'generated/prisma/enums';
import {
  ChatGroupCreateInput,
  MessageCreateManyInput,
} from 'generated/prisma/models';

export async function seedChatGroups(
  prisma: PrismaClient,
  tenants: User[],
  landlords: User[],
  buildings: Building[],
): Promise<{
  chatGroups: ChatGroup[];
  chatGroupMembers: ChatGroupMember[];
  messages: Message[];
}> {
  console.log('💬 Seeding chat groups...');

  if (buildings.length <= 0) {
    console.log('⚠️ No buildings found, skipping chat groups seed');
    return { chatGroups: [], chatGroupMembers: [], messages: [] };
  }

  const buildingsFull = await prisma.building.findMany({
    where: {
      id: { in: buildings.map((building) => building.id) },
    },
    include: {
      landlord: true,
      rooms: {
        include: {
          rentals: {
            where: { status: 'ACTIVE' },
          },
        },
      },
    },
  });

  // Generate chat groups data - one group per building
  const chatGroupData: ChatGroupCreateInput[] = buildingsFull.map(
    (building) => {
      const fakeChatGroupId = faker.string.uuid();
      const memberUserIds = [
        building.landlordId,
        ...building.rooms.flatMap((room) =>
          room.rentals.map((rental) => rental.tenantId),
        ),
      ];

      return {
        id: fakeChatGroupId,
        building: {
          connect: { id: building.id },
        },
        name: `${building.name} - Chat Group`,
        description: `Group chat cho cư dân ${building.name}`,
        members: {
          createMany: {
            data: memberUserIds.map((id) => ({ userId: id })),
            skipDuplicates: true,
          },
        },
      };
    },
  );

  // Create all chat groups
  const chatGroups = await Promise.all(
    chatGroupData.map((data) => {
      return prisma.chatGroup.create({
        data,
        include: {
          members: {
            include: { user: true },
          },
        },
      });
    }),
  );

  // Generate messages data
  const messageData: MessageCreateManyInput[] = [];

  for (const chatGroup of chatGroups) {
    for (const member of chatGroup.members) {
      // Landlords user landlord message more often
      const isLandlord = member.user.role === UserRole.LANDLORD;
      const messagePoll = isLandlord
        ? faker.datatype.boolean({ probability: 0.6 })
          ? LANDLORD_MESSAGES
          : SAMPLE_MESSAGES
        : SAMPLE_MESSAGES;

      messageData.push({
        senderId: member.userId,
        chatGroupId: chatGroup.id,
        content: faker.helpers.arrayElement(messagePoll),
        messageType: MessageType.TEXT,
      });
    }
  }

  // Direct messages - create some 1-1 conversations
  const directMessageCount = Math.min(100, tenants.length * 2);

  for (let i = 0; i < directMessageCount; i++) {
    const tenant = faker.helpers.arrayElement(tenants);
    const landlord = faker.helpers.arrayElement(landlords);

    // 50% chance tenant sends first, 50% landlord
    if (faker.datatype.boolean()) {
      messageData.push({
        senderId: tenant.id,
        recipientId: landlord.id,
        content: faker.helpers.arrayElement(SAMPLE_MESSAGES),
        messageType: MessageType.TEXT,
      });

      // 70% of reply
      if (faker.datatype.boolean({ probability: 0.7 })) {
        messageData.push({
          senderId: landlord.id,
          recipientId: tenant.id,
          content: faker.helpers.arrayElement(LANDLORD_MESSAGES),
          messageType: MessageType.TEXT,
        });
      }
    } else {
      messageData.push({
        senderId: landlord.id,
        recipientId: tenant.id,
        content: faker.helpers.arrayElement(LANDLORD_MESSAGES),
        messageType: MessageType.TEXT,
      });

      // 70% chance of reply
      if (faker.datatype.boolean({ probability: 0.7 })) {
        messageData.push({
          senderId: tenant.id,
          recipientId: landlord.id,
          content: faker.helpers.arrayElement(SAMPLE_MESSAGES),
          messageType: MessageType.TEXT,
        });
      }
    }
  }

  const messages = await prisma.message.createManyAndReturn({
    data: messageData,
    skipDuplicates: true,
  });

  const chatGroupMembers = chatGroups.flatMap((group) => group.members);

  console.log(
    `✅ Chat groups seeded: ${chatGroups.length} groups, ${chatGroupMembers.length} members, ${messages.length} messages`,
  );

  return { chatGroups, chatGroupMembers, messages };
}

const SAMPLE_MESSAGES = [
  'Chào mọi người! Chúc mọi người một ngày tốt lành!',
  'Xin chào các bạn!',
  'Cho mình hỏi về việc thanh toán tiền điện nước tháng này với ạ',
  'Hôm nay có ai ở nhà không nhỉ? Mình có gói hàng cần nhận',
  'Cảm ơn mọi người đã giúp đỡ!',
  'Tuần sau mình sẽ đi vắng vài ngày, ai giúp mình nhận thư nhé',
  'Wifi hôm nay có vấn đề gì không các bạn?',
  'Mọi người nhớ đóng cửa kỹ khi ra ngoài nhé',
  'Hôm nay trời đẹp quá!',
  'Ai biết quán ăn ngon gần đây không?',
];

const LANDLORD_MESSAGES = [
  'Thông báo: Tuần sau sẽ kiểm tra hệ thống điện nước',
  'Nhắc nhở mọi người thanh toán hóa đơn trước ngày 25 hàng tháng',
  'Mọi người nhớ giữ gìn vệ sinh chung nhé!',
  'Hôm nay có thợ đến sửa chữa, mọi người chú ý',
  'Cảm ơn mọi người đã hợp tác!',
];
