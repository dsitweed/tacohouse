'use client';

import { MessageSquare, Send, Users } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  // Mock data - sẽ thay bằng API calls
  const chats = [
    {
      id: '1',
      name: 'Tòa nhà ABC',
      lastMessage: 'Xin chào, tôi có câu hỏi về hóa đơn',
      timestamp: '10:30',
      unread: 2,
      type: 'group' as const,
    },
    {
      id: '2',
      name: 'Nguyễn Văn A',
      lastMessage: 'Cảm ơn bạn đã xác nhận',
      timestamp: '09:15',
      unread: 0,
      type: 'direct' as const,
    },
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] space-x-6">
      {/* Chat List */}
      <div className="w-80 flex-shrink-0">
        <Card className="h-full">
          <CardContent className="p-0">
            <div className="border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">Tin nhắn</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`w-full p-4 text-left transition-colors ${
                    selectedChat === chat.id
                      ? 'bg-indigo-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                      {chat.type === 'group' ? (
                        <Users className="h-5 w-5 text-indigo-600" />
                      ) : (
                        <MessageSquare className="h-5 w-5 text-indigo-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {chat.name}
                        </p>
                        {chat.unread > 0 && (
                          <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-sm text-gray-600">
                        {chat.lastMessage}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {chat.timestamp}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Window */}
      <div className="flex-1">
        <Card className="flex h-full flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="border-b border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {chats.find((c) => c.id === selectedChat)?.name}
                </h3>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {/* Mock messages */}
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="rounded-lg bg-gray-100 p-3">
                      <p className="text-sm text-gray-900">
                        Xin chào, tôi có câu hỏi về hóa đơn
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">10:30</p>
                  </div>
                </div>
                <div className="flex items-start justify-end space-x-3">
                  <div className="flex flex-1 justify-end">
                    <div>
                      <div className="rounded-lg bg-indigo-600 p-3">
                        <p className="text-sm text-white">
                          Tôi có thể giúp gì cho bạn?
                        </p>
                      </div>
                      <p className="mt-1 text-right text-xs text-gray-500">
                        10:32
                      </p>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-indigo-200" />
                </div>
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Nhập tin nhắn..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && message.trim()) {
                        // Send message
                        setMessage('');
                      }
                    }}
                  />
                  <Button>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-sm text-gray-600">
                  Chọn một cuộc trò chuyện để bắt đầu
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
