import React, { createContext, useContext } from 'react';
import { useDataSync } from '@/hooks/use-data-sync';
import { dataSyncService } from '@/lib/services/dataSync';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DataSyncContextType {
  syncNow: () => Promise<boolean>;
  lastSync: Date | null;
}

// Create context with default values
const DataSyncContext = createContext<DataSyncContextType>({
  syncNow: async () => false,
  lastSync: null
});

// Custom hook to use the data sync context
export const useDataSyncContext = () => useContext(DataSyncContext);

function DataSync() {
  useDataSync();
  return null;
}

export function DataSyncProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Function to manually trigger a sync
  const syncNow = async (): Promise<boolean> => {
    if (!user?.uid) {
      toast({
        title: 'Not Logged In',
        description: 'Please log in to sync your data.',
        variant: 'destructive',
      });
      return false;
    }
    
    try {
      const success = await dataSyncService.syncToFirestore(user.uid);
      
      if (success) {
        toast({
          title: 'Sync Complete',
          description: 'Your data has been successfully synchronized.',
        });
      } else {
        toast({
          title: 'Sync Failed',
          description: 'Could not sync your data. Please try again later.',
          variant: 'destructive',
        });
      }
      
      return success;
    } catch (error) {
      console.error('Manual sync error:', error);
      toast({
        title: 'Sync Error',
        description: 'An error occurred during synchronization.',
        variant: 'destructive',
      });
      return false;
    }
  };
  
  // Get the last sync time
  const lastSync = user?.uid ? dataSyncService.getLastSyncTime(user.uid) : null;
  
  // Context value
  const contextValue: DataSyncContextType = {
    syncNow,
    lastSync
  };
  
  return (
    <DataSyncContext.Provider value={contextValue}>
      <DataSync />
      {children}
    </DataSyncContext.Provider>
  );
}