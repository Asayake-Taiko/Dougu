// import { allMocks } from '../mocks';

// const mockFetcher = async (path: string) => {
//   await new Promise(resolve => setTimeout(resolve, 500));
  
//   if (allMocks[path]) {
//     return allMocks[path];
//   }
//   throw new Error(`No mock data for ${path}`);
// };

// const realFetcher = async (path: string) => {
//   const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}${path}`);
//   if (!response.ok) { 
//     throw new Error(`API error: ${response.status}`);
//   }
//   return response.json();
// };

// export const fetcher = process.env.EXPO_PUBLIC_IS_DEV === 'true' ? mockFetcher : realFetcher;