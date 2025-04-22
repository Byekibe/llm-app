"use client"

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatList } from './ChatList';
import { ChatInput } from './ChatInput';
import { ChatSidebar, ChatSession } from './Sidebar';
import { ModelSelector } from './ModelSelector';
import { 
  useChatMutation, 
  useGetModelsQuery,
  ChatMessage as ChatMessageType
} from '@/app/lib/features/geminiApiSlice';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// LocalStorage keys
const STORAGE_KEYS = {
  SESSIONS: 'chat-sessions',
  CURRENT_SESSION: 'current-session-id',
  CHAT_HISTORIES: 'chat-histories',
  SELECTED_MODEL: 'selected-model',
};

interface ChatContainerProps {
  initialSessions?: ChatSession[];
}

export const ChatContainer = ({ 
  initialSessions = [] 
}: ChatContainerProps) => {
  // State
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [history, setHistory] = useState<ChatMessageType[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-pro');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // RTK Query hooks
  const [sendMessage, { isLoading }] = useChatMutation();
  const { data: modelsData, isLoading: isModelsLoading } = useGetModelsQuery();

  // Check if the component is mounted (client-side)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load data from localStorage on initial load
  useEffect(() => {
    if (isMounted) {
      try {
        // Load sessions
        const savedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
        const parsedSessions = savedSessions ? JSON.parse(savedSessions) : [];
        
        // Load current session ID
        const savedSessionId = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
        
        // Load selected model
        const savedModel = localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL);
        if (savedModel) setSelectedModel(savedModel);
        
        if (parsedSessions.length > 0) {
          setSessions(parsedSessions);
          
          // Set current session ID (either saved or first available)
          const sessionId = savedSessionId || parsedSessions[0].id;
          setCurrentSessionId(sessionId);
          
          // Load chat history for the current session
          loadChatHistory(sessionId);
        } else {
          createNewChat();
        }
      } catch (err) {
        console.error('Error loading data from localStorage:', err);
        createNewChat();
      }
    }
  }, [isMounted]);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (isMounted && sessions.length > 0) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    }
  }, [sessions, isMounted]);

  // Save current session ID to localStorage
  useEffect(() => {
    if (isMounted && currentSessionId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, currentSessionId);
    }
  }, [currentSessionId, isMounted]);

  // Save selected model to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, selectedModel);
    }
  }, [selectedModel, isMounted]);

  // Save chat history to localStorage
  const saveChatHistory = (sessionId: string, chatHistory: ChatMessageType[]) => {
    if (!isMounted) return;
    
    try {
      const allHistories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHAT_HISTORIES) || '{}');
      allHistories[sessionId] = chatHistory;
      localStorage.setItem(STORAGE_KEYS.CHAT_HISTORIES, JSON.stringify(allHistories));
    } catch (err) {
      console.error('Error saving chat history to localStorage:', err);
    }
  };

  // Load chat history from localStorage
  const loadChatHistory = (sessionId: string) => {
    if (!isMounted) return;
    
    try {
      const allHistories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHAT_HISTORIES) || '{}');
      const sessionHistory = allHistories[sessionId] || [];
      setHistory(sessionHistory);
    } catch (err) {
      console.error('Error loading chat history from localStorage:', err);
      setHistory([]);
    }
  };

  // Helper function to generate initial chat title
  const generateInitialTitle = (inputText?: string) => {
    if (inputText) {
      // Truncate the input text to create a title that fits within 100px
      // Approximate character count (assuming average char width)
      const maxChars = 15; // Approximate number of characters that fit in 100px
      return inputText.length > maxChars 
        ? `${inputText.slice(0, maxChars)}...`
        : inputText;
    }
    // Fallback to date-based title if no input
    const now = new Date();
    const dateTitle = `Chat ${now.toLocaleDateString()}`;
    return dateTitle.length > 15 
      ? `${dateTitle.slice(0, 12)}...`
      : dateTitle;
  };

  // Create a new chat session
  const createNewChat = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: generateInitialTitle(),
      updatedAt: new Date(),
    };
    
    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    setCurrentSessionId(newSession.id);
    setHistory([]);
    setError(null);
    
    if (isMounted) {
      saveChatHistory(newSession.id, []);
    }
  };

  // Select a chat session
  const selectChat = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    loadChatHistory(sessionId);
    setError(null);
    setIsSidebarOpen(false);
  };

  // Delete a chat session
  const deleteChat = (sessionId: string) => {
    const updatedSessions = sessions.filter(session => session.id !== sessionId);
    setSessions(updatedSessions);
    
    if (isMounted) {
      // Remove chat history for the deleted session
      try {
        const allHistories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHAT_HISTORIES) || '{}');
        delete allHistories[sessionId];
        localStorage.setItem(STORAGE_KEYS.CHAT_HISTORIES, JSON.stringify(allHistories));
      } catch (err) {
        console.error('Error removing chat history from localStorage:', err);
      }
    }
    
    // Select another session if the current one was deleted
    if (currentSessionId === sessionId) {
      if (updatedSessions.length > 0) {
        const nextSession = updatedSessions[0];
        setCurrentSessionId(nextSession.id);
        loadChatHistory(nextSession.id);
      } else {
        createNewChat();
      }
    }
  };

  // Handle sending a message
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    setError(null);
    
    // Create user message
    const userMessage: ChatMessageType = {
      role: 'user',
      parts: [{ text: message }]
    };
    
    // Update UI immediately with user message
    const updatedHistory = [...history, userMessage];
    setHistory(updatedHistory);
    
    // Save updated history to localStorage
    if (isMounted) {
      saveChatHistory(currentSessionId, updatedHistory);
    }
    
    try {
      // Send to API
      const response = await sendMessage({
        history: history,
        new_message: message,
        model_name: selectedModel
      }).unwrap();
      
      // Update with API response
      setHistory(response.updated_history);
      
      // Save final history to localStorage
      if (isMounted) {
        saveChatHistory(currentSessionId, response.updated_history);
      }
      
      // Update session title if this is the first message
      if (history.length === 0) {
        // Generate a more meaningful title from the first message
        let newTitle = message.trim();
        
        // If message is a question, keep it as is (up to 30 chars)
        if (newTitle.endsWith('?')) {
          newTitle = newTitle.slice(0, 30) + (newTitle.length > 30 ? '...' : '');
        } 
        // If not a question, try to extract a subject
        else {
          // Get the first sentence or up to 30 chars
          const firstSentence = newTitle.split(/[.!?]/)[0];
          newTitle = firstSentence.slice(0, 30) + (firstSentence.length > 30 ? '...' : '');
        }
        
        const updatedSessions = sessions.map(session => 
          session.id === currentSessionId 
            ? { ...session, title: newTitle } 
            : session
        );
        setSessions(updatedSessions);
      }
      
      // Update session timestamp
      const sessionsWithUpdatedTimestamp = sessions.map(session => 
        session.id === currentSessionId 
          ? { ...session, updatedAt: new Date() } 
          : session
      );
      setSessions(sessionsWithUpdatedTimestamp);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while sending your message');
      console.error('Error sending message:', err);
    }
  };

  // Handle model change
  const handleModelChange = (modelName: string) => {
    setSelectedModel(modelName);
  };

  const renameChat = (sessionId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    
    const updatedSessions = sessions.map(session => 
      session.id === sessionId 
        ? { ...session, title: newTitle.trim() } 
        : session
    );
    
    setSessions(updatedSessions);
  };

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={createNewChat}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
        onRenameChat={renameChat}  // Add this prop
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <main className="flex-1 flex flex-col h-full sm:ml-72">
        {!isModelsLoading && modelsData && (
          <ModelSelector
            models={modelsData.models}
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
            isLoading={isLoading}
          />
        )}
        
        {error && (
          <Alert variant="destructive" className="m-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <ChatList messages={history} loading={isLoading} />
        
        <ChatInput 
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          placeholder="Message the AI assistant..."
        />
      </main>
    </div>
  );
};