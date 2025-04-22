'use client';

import { useState, useEffect } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage as ChatMessageType } from '@/app/lib/features/geminiApiSlice';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: ChatMessageType;
  isLast?: boolean;
}

export const ChatMessage = ({ message, isLast }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const messageText = message.parts[0]?.text || '';
  const messageId = `${message.role}-${messageText.substring(0, 20)}`;

  const [animatedIds, setAnimatedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load animated message IDs from localStorage
    const stored = localStorage.getItem('animatedMessageIds');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAnimatedIds(new Set(parsed));
      } catch {
        // ignore if parsing fails
      }
    }
  }, []);

  const markAnimated = () => {
    setAnimatedIds(prev => {
      const updated = new Set(prev);
      updated.add(messageId);
      localStorage.setItem('animatedMessageIds', JSON.stringify([...updated]));
      return updated;
    });
  };

  const shouldAnimate = isLast && !isUser && !animatedIds.has(messageId);

  if (isUser || !shouldAnimate) {
    if (isLast && !isUser && !animatedIds.has(messageId)) {
      markAnimated();
    }

    return (
      <MessageContainer isUser={isUser} isLast={isLast}>
        <ReactMarkdown>{messageText}</ReactMarkdown>
      </MessageContainer>
    );
  }

  return (
    <MessageContainer isUser={isUser} isLast={isLast}>
      <AnimatedMarkdown content={messageText} onComplete={markAnimated} />
    </MessageContainer>
  );
};

const MessageContainer = ({
  isUser,
  isLast,
  children,
}: {
  isUser: boolean;
  isLast?: boolean;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex justify-center w-full">
      <div
        className={cn(
          'flex gap-3 p-4 max-w-5xl w-full rounded-md pb-20',
          isUser ? 'bg-muted/50' : 'bg-background',
          isLast && 'mb-16'
        )}
      >
        <Avatar
          className={cn(
            'h-9 w-9 rounded-md',
            isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
          )}
        >
          <div className="flex h-full w-full items-center justify-center">
            {isUser ? <User size={20} /> : <Bot size={20} />}
          </div>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="font-semibold">{isUser ? 'You' : 'AI Assistant'}</div>
          <div className="prose dark:prose-invert max-w-none">{children}</div>
        </div>
      </div>
    </div>
  );
};

const AnimatedMarkdown = ({ content, onComplete }: { content: string; onComplete: () => void }) => {
  const [isComplete, setIsComplete] = useState(false);
  const [displayedContent, setDisplayedContent] = useState('');

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < content.length) {
        setDisplayedContent(prev => prev + content[index]);
        index++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete();
      }
    }, 30);

    return () => clearInterval(interval);
  }, [content, onComplete]);

  return (
    <>
      <ReactMarkdown>{displayedContent}</ReactMarkdown>
      {!isComplete && <span className="animate-pulse">▋</span>}
    </>
  );
};
