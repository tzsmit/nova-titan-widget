
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SimpleMainWidget } from './components/widget/SimpleMainWidget';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { useEffect } from 'react';
import { appInitializer } from './services/appInitializer';
// import './App.css';

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
  useEffect(() => {
    // Initialize app with roster sync
    console.log('🚀 Nova Titan Elite App starting...');
    
    appInitializer.initialize().then(() => {
      console.log('✅ Nova Titan Elite App fully initialized with roster data');
    }).catch((error) => {
      console.error('❌ App initialization failed:', error);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <div className="min-h-screen">
          <SimpleMainWidget />
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;