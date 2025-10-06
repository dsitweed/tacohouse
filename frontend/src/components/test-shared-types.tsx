/**
 * Test component để verify shared types hoạt động trong Frontend
 * File: frontend/src/components/test-shared-types.tsx
 */

import { 
  User, 
  UserRole, 
  Building, 
  Room,
  RoomStatus,
  Bill,
  BillStatus 
} from '@tacohouse/shared';

// Test interface với shared types
interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps) {
  return (
    <div className="p-4 border rounded">
      <h3>{user.email}</h3>
      <p>Role: {user.role}</p>
      {user.role === UserRole.LANDLORD && (
        <span className="badge">👑 Landlord</span>
      )}
    </div>
  );
}

// Test với enum
export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  const colors = {
    [RoomStatus.AVAILABLE]: 'bg-green-500',
    [RoomStatus.OCCUPIED]: 'bg-red-500',
    [RoomStatus.MAINTENANCE]: 'bg-yellow-500',
    [RoomStatus.PENDING_CHECKOUT]: 'bg-blue-500',
  };

  return (
    <span className={`px-2 py-1 rounded ${colors[status]}`}>
      {status}
    </span>
  );
}

// Test với API response
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

export async function fetchUserBuildings(userId: string): Promise<Building[]> {
  const response = await fetch(`/api/users/${userId}/buildings`);
  const result: ApiResponse<Building[]> = await response.json();
  return result.data;
}

// Test với form data
type CreateRoomData = Pick<Room, 'number' | 'area' | 'monthlyRent' | 'roomType'>;

export function useCreateRoom() {
  const createRoom = async (buildingId: string, data: CreateRoomData) => {
    const response = await fetch(`/api/buildings/${buildingId}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    const result: ApiResponse<Room> = await response.json();
    return result.data;
  };

  return { createRoom };
}

// Test với bill list
interface BillListProps {
  bills: Bill[];
}

export function BillList({ bills }: BillListProps) {
  return (
    <div className="space-y-2">
      {bills.map((bill) => (
        <div key={bill.id} className="p-4 border">
          <p>Total: ${bill.totalAmount.toString()}</p>
          <p>Status: {bill.status}</p>
          {bill.status === BillStatus.OVERDUE && (
            <span className="text-red-500">⚠️ Overdue</span>
          )}
        </div>
      ))}
    </div>
  );
}

console.log('✅ Shared types imported successfully in Frontend!');
console.log('✅ Available enums:', { UserRole, RoomStatus, BillStatus });
