import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import getErrorMessage from '@/app/utils/errorMessage';
// import { baseQueryWithReauth } from '@/app/utils/baseQueryWithReauth';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

// Define types for Gemini API requests and responses
export interface GenerateTextRequest {
  prompt: string;
  model_name?: string;
  temperature?: number;
  max_output_tokens?: number;
  top_p?: number;
  top_k?: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface ChatRequest {
  history: ChatMessage[];
  new_message: string;
  model_name?: string;
  temperature?: number;
  max_output_tokens?: number;
}

export interface ImageData {
  mime_type: string;
  data: string; // Base64 encoded string
}

export interface VisionRequest {
  prompt: string;
  image_data: ImageData[];
  model_name?: string;
  temperature?: number;
  max_output_tokens?: number;
}

export interface EmbedRequest {
  text: string | string[];
  model_name?: string;
  task_type?: string;
  title?: string;
}

export interface ApiResponse {
  text: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export interface ChatApiResponse extends ApiResponse {
  updated_history: ChatMessage[];
}

export interface EmbedApiResponse {
  embedding: number[] | number[][];
  usage?: {
    total_tokens?: number;
  };
}

export interface ModelInfo {
  name: string;
  description: string;
  supported_generation_methods: string[];
  input_token_limit: number;
  output_token_limit: number;
}

export interface ModelsResponse {
  models: ModelInfo[];
}

export const geminiApiSlice = createApi({
  reducerPath: 'geminiApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['Models'],
  endpoints: (builder) => ({
    // Text generation endpoint
    generateText: builder.mutation<ApiResponse, GenerateTextRequest>({
      query: (request) => ({
        url: '/generate',
        method: 'POST',
        body: request,
      }),
      transformErrorResponse: (response) => ({
        status: response.status,
        message: getErrorMessage(response),
      }),
    }),

    // Chat endpoint
    chat: builder.mutation<ChatApiResponse, ChatRequest>({
      query: (request) => ({
        url: '/chat',
        method: 'POST',
        body: request,
      }),
      transformErrorResponse: (response) => ({
        status: response.status,
        message: getErrorMessage(response),
      }),
    }),

    // Chat streaming endpoint
    // Note: Streaming requires special handling in the component
    chatStream: builder.mutation<void, ChatRequest>({
      query: (request) => ({
        url: '/chat/stream',
        method: 'POST',
        body: request,
        responseHandler: 'text', // Important for event stream
      }),
      // Streaming responses need special handling at component level
      transformErrorResponse: (response) => ({
        status: response.status,
        message: getErrorMessage(response),
      }),
    }),

    // Vision endpoint
    generateVision: builder.mutation<ApiResponse, VisionRequest>({
      query: (request) => ({
        url: '/vision/generate',
        method: 'POST',
        body: request,
      }),
      transformErrorResponse: (response) => ({
        status: response.status,
        message: getErrorMessage(response),
      }),
    }),

    // Embedding endpoint
    generateEmbedding: builder.mutation<EmbedApiResponse, EmbedRequest>({
      query: (request) => ({
        url: '/embed',
        method: 'POST',
        body: request,
      }),
      transformErrorResponse: (response) => ({
        status: response.status,
        message: getErrorMessage(response),
      }),
    }),

    // Get available models
    getModels: builder.query<ModelsResponse, void>({
      query: () => '/models',
      providesTags: ['Models'],
      transformErrorResponse: (response) => ({
        status: response.status,
        message: getErrorMessage(response),
      }),
    }),

    // Health check endpoint
    checkHealth: builder.query<{ status: string }, void>({
      query: () => '/health',
      transformErrorResponse: (response) => ({
        status: response.status,
        message: getErrorMessage(response),
      }),
    }),
  }),
});

export const {
  useGenerateTextMutation,
  useChatMutation,
  useChatStreamMutation,
  useGenerateVisionMutation,
  useGenerateEmbeddingMutation,
  useGetModelsQuery,
  useCheckHealthQuery,
} = geminiApiSlice;