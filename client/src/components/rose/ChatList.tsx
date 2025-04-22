"use client"

import React, { useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType } from '@/app/lib/features/geminiApiSlice';
import { ChatMessage } from './ChatMessage';

interface ChatListProps {
  messages: ChatMessageType[];
  loading?: boolean;
}

export const ChatList = ({ messages, loading }: ChatListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h3 className="text-2xl font-bold mb-2">Welcome to AI Chat</h3>
        <p className="text-muted-foreground mb-6">
          Start a conversation with the AI assistant by typing a message below.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message, index) => (
        <ChatMessage
          key={index}
          message={message}
          isLast={index === messages.length - 1}
        />
      ))}
      {loading && (
        <div className="flex items-center justify-center p-4 text-muted-foreground">
          <span className="animate-pulse">AI is thinking...</span>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};