
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainWidget } from './components/widget/MainWidget';
import ErrorBoundary from './components/ui/ErrorBoundary';
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-nova-metallic-900 via-nova-navy-900 to-nova-metallic-800 p-4">
          <div className="max-w-6xl mx-auto">
            <MainWidget />
          </div>
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;