"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { 
  Plus, MessageSquare, Settings, LayoutGrid, Trash2, Menu, X, Edit2, MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: Date;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId?: string;
  onNewChat: () => void;
  onSelectChat: (sessionId: string) => void;
  onDeleteChat: (sessionId: string) => void;
  onRenameChat: (sessionId: string, newTitle: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const ChatSidebar = ({
    sessions,
    currentSessionId,
    onNewChat,
    onSelectChat,
    onDeleteChat,
    onRenameChat,
    isOpen,
    onToggle,
  }: ChatSidebarProps) => {
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');

    // Handle starting the rename process
    const MAX_TITLE_LENGTH = 50; // Increased from 3 to a more reasonable length
    
    const handleStartRename = (session: ChatSession) => {
      setEditingSessionId(session.id);
      setEditTitle(session.title);
    };

    // Handle submitting the rename
    const handleSubmitRename = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingSessionId && editTitle.trim()) {
        const truncatedTitle = editTitle.trim().slice(0, MAX_TITLE_LENGTH);
        onRenameChat(editingSessionId, truncatedTitle);
        setEditingSessionId(null);
      }
    };

    // Handle canceling the rename
    const handleCancelRename = () => {
      setEditingSessionId(null);
    };

    return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm sm:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-40 h-full w-72 border-r bg-muted/30 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4">
            <Button 
              onClick={onNewChat} 
              className="flex-1 justify-start gap-2"
            >
              <Plus size={18} />
              <span>New Chat</span>
            </Button>
            
            {/* Mobile toggle button moved inside sidebar */}
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 sm:hidden"
              onClick={onToggle}
            >
              <X size={20} />
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2">
              <h3 className="text-sm font-medium">Chat History</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <LayoutGrid size={16} />
              </Button>
            </div>
            
            <ScrollArea className="h-[calc(100vh-10rem)]">
              <div className="space-y-1 p-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      "group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      currentSessionId === session.id && "bg-accent text-accent-foreground"
                    )}
                  >
                    {editingSessionId === session.id ? (
                      <form onSubmit={handleSubmitRename} className="flex w-full gap-1">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="h-8 text-sm"
                          autoFocus
                          onBlur={handleCancelRename}
                          onKeyDown={(e) => e.key === 'Escape' && handleCancelRename()}
                        />
                      </form>
                    ) : (
                        <div className="flex w-full items-center justify-between gap-2">
                        <Button
                          variant="ghost"
                          className="h-8 flex-1 justify-start gap-2 p-2 font-normal"
                          onClick={() => onSelectChat(session.id)}
                          onDoubleClick={() => handleStartRename(session)}
                        >
                          <MessageSquare size={16} className="flex-shrink-0" />
                          <span className="truncate">{session.title}</span>
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0 group-hover:opacity-100"
                          >
                            <MoreVertical size={14} />
                          </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => handleStartRename(session)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            <span>Rename</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDeleteChat(session.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          <div className="mt-auto p-4">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Settings size={16} />
              <span>Settings</span>
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Menu button only shown when sidebar is closed */}
      {!isOpen && (
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-50 sm:hidden"
          onClick={onToggle}
        >
          <Menu size={20} />
        </Button>
      )}
    </>
  );
};