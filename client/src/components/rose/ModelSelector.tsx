"use client"

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Settings, UserCircle } from "lucide-react";
import { ModelInfo } from '@/app/lib/features/geminiApiSlice';

interface ModelSelectorProps {
  models: ModelInfo[];
  selectedModel: string;
  onModelChange: (modelName: string) => void;
  isLoading?: boolean;
  // New props for avatar functionality
  username?: string;
  onLogout?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onLoginClick?: () => void;
}

export const ModelSelector = ({
  models,
  selectedModel,
  onModelChange,
  isLoading,
  username,
  onLogout,
  onProfileClick,
  onSettingsClick,
  onLoginClick,
}: ModelSelectorProps) => {
  // Filter models that support text generation
  const textModels = models.filter(model => 
    model.supported_generation_methods.includes('generateContent') || 
    model.supported_generation_methods.includes('generateText')
  );

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!username) return "?";
    return username.charAt(0).toUpperCase();
  };

  const isLoggedIn = !!username;

  return (
    <div className="fixed top-4 right-4 flex items-center gap-3">
      <Select
        value={selectedModel}
        onValueChange={onModelChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-48 h-8 text-xs">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent>
          {textModels.map((model) => (
            <SelectItem key={model.name} value={model.name} className="text-xs">
              {model.name.split('/').pop()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Avatar with dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage src={username ? `/api/placeholder/32/32` : ""} alt="User avatar" />
            <AvatarFallback className="bg-blue-600 text-white text-xs">{getInitials()}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {isLoggedIn ? (
            <>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onProfileClick} className="cursor-pointer">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSettingsClick} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onClick={onLoginClick} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Login</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};