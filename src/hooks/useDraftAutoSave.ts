import { useEffect, useRef, useCallback } from 'react';
import { DraftManager } from '../lib/drafts/draftManager';
import { ListingDraft, Message } from '../lib/types/listing';

interface UseDraftAutoSaveOptions {
  userId: string;
  draft: ListingDraft;
  step: number;
  messages: Message[];
  enabled?: boolean;
  saveInterval?: number;
}

interface UseDraftAutoSaveReturn {
  save: () => Promise<boolean>;
  forceSave: () => void;
  isOnline: boolean;
  lastSaved: Date | null;
}

export function useDraftAutoSave({
  userId,
  draft,
  step,
  messages,
  enabled = true,
  saveInterval = 2000
}: UseDraftAutoSaveOptions): UseDraftAutoSaveReturn {
  const draftManagerRef = useRef<DraftManager | null>(null);
  const lastSavedRef = useRef<Date | null>(null);
  const isOnlineRef = useRef<boolean>(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDraftRef = useRef<string>('');

  // Initialize draft manager
  useEffect(() => {
    if (userId && enabled) {
      draftManagerRef.current = new DraftManager(userId);
      
      return () => {
        if (draftManagerRef.current) {
          draftManagerRef.current.cleanup();
        }
      };
    }
  }, [userId, enabled]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      isOnlineRef.current = true;
    };

    const handleOffline = () => {
      isOnlineRef.current = false;
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      isOnlineRef.current = navigator.onLine;

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Save function
  const save = useCallback(async (): Promise<boolean> => {
    if (!draftManagerRef.current || !enabled) return false;

    try {
      const success = await draftManagerRef.current.save(draft, step, messages);
      if (success) {
        lastSavedRef.current = new Date();
      }
      return success;
    } catch (error) {
      console.error('Error in useDraftAutoSave save:', error);
      return false;
    }
  }, [draft, step, messages, enabled]);

  // Force save function
  const forceSave = useCallback(() => {
    if (draftManagerRef.current && enabled) {
      draftManagerRef.current.forceSave();
      lastSavedRef.current = new Date();
    }
  }, [enabled]);

  // Auto-save when data changes
  useEffect(() => {
    if (!enabled || !draftManagerRef.current) return;

    // Create a hash of the current draft state to detect changes
    const currentDraftHash = JSON.stringify({ draft, step, messagesLength: messages.length });
    
    // Only save if data has actually changed
    if (currentDraftHash !== lastDraftRef.current) {
      lastDraftRef.current = currentDraftHash;
      
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout for debounced save
      saveTimeoutRef.current = setTimeout(() => {
        draftManagerRef.current?.markDirty();
        save();
      }, saveInterval);
    }

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [draft, step, messages, enabled, saveInterval, save]);

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      forceSave();
    };

    if (typeof window !== 'undefined' && enabled) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [forceSave, enabled]);

  return {
    save,
    forceSave,
    isOnline: isOnlineRef.current,
    lastSaved: lastSavedRef.current
  };
}