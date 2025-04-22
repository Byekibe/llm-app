import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api/v1';

const baseQuery = fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers, { }) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  });
  
  export const baseQueryWithReauth: BaseQueryFn<FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);
  
    if (result.error?.status === 401) {
      // Try to get a new token
      const refreshToken = localStorage.getItem('refresh_token');
      
      // Custom query for refresh that uses refresh token in Authorization header
      const refreshResult = await fetch(`${baseUrl}/auths/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${refreshToken}`,  // Send refresh token in header
          'Content-Type': 'application/json'
        }
      });
  
      if (refreshResult.ok) {
        const data = await refreshResult.json();
        // Store the new access token
        localStorage.setItem('access_token', data.access_token);
        
        // Retry the original query with new access token
        result = await baseQuery(args, api, extraOptions);
      } else {
        // If refresh failed, clear tokens and redirect to login
        localStorage.clear();
        window.location.href = '/auth/login';
      }
    }
  
    return result;
  };
  