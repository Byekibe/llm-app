import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

// Define possible error response structures
interface CustomErrorResponse {
  message?: string;
  error?: string;
  data?: {
    message?: string;
    errors?: Record<string, string[]>;
  };
  errors?: Record<string, string[]>;
}

/**
 * Type guard to check if an error is of type FetchBaseQueryError
 * @param error - The error to check
 * @returns True if the error is a FetchBaseQueryError, false otherwise
 */
function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error;
}

/**
 * Enhanced error message handler for RTK Query errors
 * Handles various API error response formats and Redux errors
 * 
 * @param error - The error from RTK Query or Redux
 * @returns A user-friendly error message string
 */
function getErrorMessage(error: FetchBaseQueryError | SerializedError | undefined): string {
  // Handle undefined errors
  if (!error) {
    console.error('Undefined error encountered');
    return 'An unknown error occurred';
  }

  // Handle FetchBaseQueryError (API errors)
  if (isFetchBaseQueryError(error)) {
    const fetchError = error as FetchBaseQueryError;

    // Handle string error responses
    if (typeof fetchError.data === 'string') {
      return fetchError.data;
    }

    // Handle object error responses
    if (fetchError.data && typeof fetchError.data === 'object') {
      const customError = fetchError.data as CustomErrorResponse;

      // Check for nested validation errors
      if (customError.errors || customError.data?.errors) {
        const errors = customError.errors ?? customError.data?.errors;
        if (errors) {
          const errorMessages = Object.values(errors)
            .flat()
            .filter(Boolean);
          if (errorMessages.length > 0) {
            return errorMessages.join(', ');
          }
        }
      }

      // Check various message fields
      if (customError.message) return customError.message;
      if (customError.error) return customError.error;
      if (customError.data?.message) return customError.data.message;
    }

    // Handle HTTP status codes and error types
    const status = fetchError.status;

    if (typeof status === 'number') {
      switch (status) {
        case 400:
          return 'Bad request - please check your input';
        case 401:
          return 'Your session has expired - please log in again';
        case 403:
          return 'You do not have permission to perform this action';
        case 404:
          return 'The requested resource was not found';
        case 422:
          return 'Validation error - please check your input';
        case 429:
          return 'Too many requests - please try again later';
        case 500:
          return 'Internal server error - please try again later';
        default:
          return `Server error (${status})`;
      }
    }

    if (typeof status === 'string') {
      switch (status) {
        case 'FETCH_ERROR':
          return 'Network error - please check your internet connection';
        case 'PARSING_ERROR':
          return 'Error processing server response';
        case 'TIMEOUT_ERROR':
          return 'Request timed out - please try again';
        case 'CUSTOM_ERROR':
          return 'An error occurred while processing your request';
        default:
          // Explicitly assert that status is a string
          const stringStatus = status as string;
          return `Request failed: ${stringStatus.toLowerCase().replace('_', ' ')}`;
      }
    }
  }

  // Handle SerializedError (Redux errors)
  if ('message' in error) {
    if (error.message) return error.message;
    if (error.name) return error.name;
    if (error.code) return `Error code: ${error.code}`;
  }

  // Fallback error message
  console.error('Unexpected error format:', error);
  return 'An unknown error occurred';
}

export default getErrorMessage;