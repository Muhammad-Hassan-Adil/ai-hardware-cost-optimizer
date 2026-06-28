import './index.css'
import App from './App.tsx'
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
});

import { ViteReactSSG } from 'vite-react-ssg'

export const createRoot = ViteReactSSG({
  routes: [
    {
      path: '*',
      element: (
        <QueryClientProvider client={queryClient}>
          <HelmetProvider>
            <App />
          </HelmetProvider>
        </QueryClientProvider>
      )
    }
  ]
})
