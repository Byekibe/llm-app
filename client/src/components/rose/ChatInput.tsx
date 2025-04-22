"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizontal, ImagePlus, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  onUploadImage?: (imageData: string, mimeType: string) => void;
}

export const ChatInput = ({
  onSendMessage,
  isLoading = false,
  placeholder = "Type your message...",
  onUploadImage,
}: ChatInputProps) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (trimmedInput && !isLoading) {
      onSendMessage(trimmedInput);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      // Auto resize the textarea based on content
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onUploadImage) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Extract the base64 data without the prefix
        const base64Data = base64String.split(',')[1];
        onUploadImage(base64Data, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 sm:ml-72">
      <div className="relative flex items-end max-w-4xl mx-auto">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="resize-none pr-20 min-h-24 max-h-60 py-3"
          rows={1}
          disabled={isLoading}
        />
        <div className="absolute bottom-3 right-3 flex gap-2">
          {onUploadImage && (
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isLoading}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={isLoading}
              >
                <ImagePlus size={20} />
              </Button>
            </div>
          )}
          <Button
            type="submit"
            size="icon"
            variant="default"
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <SendHorizontal size={20} />
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};