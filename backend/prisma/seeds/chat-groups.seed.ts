import { faker } from '@faker-js/faker';
import { MessageType } from '@prisma/client';
import type {
  Building,
  ChatGroup,
  ChatGroupMember,
  Message,
  PrismaClient,
} from '@prisma/client';
import { UserWithRelations } from 'src/types';

type ChatGroupData = {
  buildingId: string;
  name: string;
  description: string;
};

type ChatGroupMemberData = {
  chatGroupId: string;
  userId: string;
};

type MessageData = {
  senderId: string;
  chatGroupId?: string;
  recipientId?: string;
  content: string;
  messageType: MessageType;
};

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

export async function seedChatGroups(
  prisma: PrismaClient,
  users: UserWithRelations[],
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

  const landlords = users.filter((user) => user.landlord !== null);
  const tenants = users.filter((user) => user.tenant !== null);

  // Generate chat groups data - one group per building
  const chatGroupData: ChatGroupData[] = buildings.map((building) => ({
    buildingId: building.id,
    name: `${building.name} - Chat Group`,
    description: `Group chat cho cư dân ${building.name}`,
  }));

  // Create all chat groups
  const chatGroups = await Promise.all(
    chatGroupData.map((data) => prisma.chatGroup.create({ data })),
  );

  // Generate chat group member data
  const chatGroupMemberData: ChatGroupMemberData[] = [];

  for (const chatGroup of chatGroups) {
    const building = buildings.find((b) => b.id === chatGroup.id);
    if (!building) continue;

    // find landlord of this building
    const landlord = landlords.find(
      (landlordUser) => landlordUser.landlord?.id === building.landlordId,
    );

    if (landlord) {
      chatGroupMemberData.push({
        chatGroupId: chatGroup.id,
        userId: landlord.id,
      });
    }

    // Get rooms in this building to find tenants
    const rooms = await prisma.room.findMany({
      where: { buildingId: building.id },
      include: { rentals: { where: { status: 'ACTIVE' } } },
    });

    // Add active tenant to group
    for (const room of rooms) {
      for (const rental of room.rentals) {
        const tenant = tenants.find(
          (tenantUser) => tenantUser.tenant?.id === rental.tenantId,
        );

        if (tenant) {
          chatGroupMemberData.push({
            chatGroupId: chatGroup.id,
            userId: tenant.id,
          });
        }
      }
    }
  }

  // Create all members to chat groups
  const chatGroupMembers = await Promise.all(
    chatGroupMemberData.map((data) => prisma.chatGroupMember.create({ data })),
  );

  // Generate messages data
  const messageData: MessageData[] = [];

  // Group messages - 5-10 messages per group
  for (const chatGroup of chatGroups) {
    const groupMembers = chatGroupMembers.filter(
      (member) => member.chatGroupId === chatGroup.id,
    );

    if (groupMembers.length === 0) continue;

    const messageCount = faker.number.int({ min: 5, max: 10 });

    for (let i = 0; i < messageCount; i++) {
      const sender = faker.helpers.arrayElement(groupMembers);
      const senderUser = users.find((user) => user.id === sender.userId);

      // Landlors user landlord message more often
      const isLandlord = senderUser?.landlord !== null;
      const messagePoll = isLandlord
        ? faker.datatype.boolean({ probability: 0.6 })
          ? LANDLORD_MESSAGES
          : SAMPLE_MESSAGES
        : SAMPLE_MESSAGES;

      messageData.push({
        senderId: sender.userId,
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

  const messages = await Promise.all(
    messageData.map((data) => prisma.message.create({ data })),
  );

  console.log(
    `✅ Chat groups seeded: ${chatGroups.length} groups, ${chatGroupMembers.length} members, ${messages.length} messages`,
  );

  return { chatGroups, chatGroupMembers, messages };
}
