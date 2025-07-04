import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import ReactDOM from 'react-dom/client';
import { Loader2Icon } from 'lucide-react';
import { routeTree } from './routeTree.gen';
import './index.css';

import NotFound from '@/components/not-found';
import ErrorComponent from '@/components/error-component';
import BouncingLoader from './components/BouncingLoader';

const queryClient = new QueryClient();

// Set up a Router instance
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  defaultPendingComponent: () => <BouncingLoader />,
  defaultNotFoundComponent: NotFound,
  defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
});

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('app')!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
