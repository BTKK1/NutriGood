import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dataSyncService } from '@/lib/services/dataSync';
import { useToast } from '@/hooks/use-toast';

export function useDataSync() {
  const { user, isNewUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.uid) return;

    // Skip sync setup for brand new users until they complete onboarding
    if (isNewUser) {
      console.log("New user detected - skipping initial data sync until onboarding is complete");
      return;
    }

    // Set up periodic sync (every 5 minutes)
    const syncInterval = setInterval(async () => {
      try {
        const success = await dataSyncService.syncToFirestore(user.uid);
        if (success) {
          console.log('✅ Periodic sync completed for UID:', user.uid);
        }
      } catch (error) {
        console.error('Periodic sync error:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Initial sync and data restoration - only for existing users
    const initializeSync = async () => {
      try {
        if (isNewUser) return;

        if (user.onboardingComplete) {
          const hasFirestoreData = await dataSyncService.hasFirestoreData(user.uid);

          if (hasFirestoreData) {
            await dataSyncService.restoreFromFirestore(user.uid);
            toast({
              title: 'Data Restored',
              description: 'Your data has been restored from backup.',
            });
          } else {
            await dataSyncService.syncToFirestore(user.uid);
            toast({
              title: 'Data Backed Up',
              description: 'Your data has been backed up successfully.',
            });
          }
        }
      } catch (error) {
        console.error('Initial sync error:', error);
        if (!isNewUser) {
          toast({
            title: 'Sync Error',
            description: 'Failed to initialize data sync. Please try again later.',
            variant: 'destructive',
          });
        }
      }
    };

    initializeSync();

    return () => clearInterval(syncInterval);
  }, [user?.uid, isNewUser, user?.onboardingComplete, toast]);
}