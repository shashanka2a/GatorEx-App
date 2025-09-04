import { ListingDraft, Message } from '../types/listing';

export interface DraftSession {
  id: string;
  userId: string;
  draft: ListingDraft;
  currentStep: number;
  messages: Message[];
  lastSaved: string;
  sessionStarted: string;
  isActive: boolean;
  metadata: {
    userAgent: string;
    deviceType: 'mobile' | 'desktop';
    totalSteps: number;
    completionPercentage: number;
  };
}

export class DraftManager {
  private static readonly STORAGE_PREFIX = 'gatorex_draft_session_';
  private static readonly MESSAGES_PREFIX = 'gatorex_messages_';
  private static readonly AUTO_SAVE_INTERVAL = 2000; // 2 seconds
  private static readonly MAX_DRAFTS_PER_USER = 3;

  private userId: string;
  private sessionId: string;
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private isOnline: boolean = true;
  private pendingChanges: boolean = false;

  constructor(userId: string) {
    this.userId = userId;
    this.sessionId = this.generateSessionId();
    this.setupOnlineListener();
    this.startAutoSave();
  }

  private generateSessionId(): string {
    return `${this.userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupOnlineListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        if (this.pendingChanges) {
          this.forceSave();
        }
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
      });

      // Save before page unload
      window.addEventListener('beforeunload', () => {
        this.forceSave();
      });

      // Save when tab becomes hidden
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.forceSave();
        }
      });
    }
  }

  private startAutoSave(): void {
    this.autoSaveTimer = setInterval(() => {
      if (this.pendingChanges) {
        this.save();
      }
    }, DraftManager.AUTO_SAVE_INTERVAL);
  }

  public async save(draft?: ListingDraft, step?: number, messages?: Message[]): Promise<boolean> {
    try {
      const session = this.getCurrentSession();
      
      const updatedSession: DraftSession = {
        ...session,
        draft: draft || session.draft,
        currentStep: step !== undefined ? step : session.currentStep,
        messages: messages || session.messages,
        lastSaved: new Date().toISOString(),
        isActive: true,
        metadata: {
          ...session.metadata,
          completionPercentage: this.calculateCompletionPercentage(draft || session.draft)
        }
      };

      // Save to localStorage
      localStorage.setItem(
        `${DraftManager.STORAGE_PREFIX}${this.sessionId}`,
        JSON.stringify(updatedSession)
      );

      // Save messages separately to avoid size limits
      if (messages && messages.length > 0) {
        localStorage.setItem(
          `${DraftManager.MESSAGES_PREFIX}${this.sessionId}`,
          JSON.stringify(messages)
        );
      }

      // Try to sync to server if online
      if (this.isOnline) {
        await this.syncToServer(updatedSession);
      }

      this.pendingChanges = false;
      return true;
    } catch (error) {
      console.error('Error saving draft:', error);
      return false;
    }
  }

  public forceSave(): void {
    if (this.pendingChanges) {
      this.save();
    }
  }

  public markDirty(): void {
    this.pendingChanges = true;
  }

  public getCurrentSession(): DraftSession {
    try {
      const saved = localStorage.getItem(`${DraftManager.STORAGE_PREFIX}${this.sessionId}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading current session:', error);
    }

    // Return default session
    return this.createNewSession();
  }

  public getMostRecentDraft(): DraftSession | null {
    try {
      const allKeys = Object.keys(localStorage).filter(key => 
        key.startsWith(DraftManager.STORAGE_PREFIX) && key.includes(this.userId)
      );

      let mostRecent: DraftSession | null = null;
      let mostRecentTime = 0;

      for (const key of allKeys) {
        try {
          const session: DraftSession = JSON.parse(localStorage.getItem(key) || '{}');
          const lastSavedTime = new Date(session.lastSaved).getTime();
          
          if (session.userId === this.userId && lastSavedTime > mostRecentTime) {
            mostRecent = session;
            mostRecentTime = lastSavedTime;
          }
        } catch (error) {
          console.error('Error parsing draft session:', error);
        }
      }

      return mostRecent;
    } catch (error) {
      console.error('Error getting most recent draft:', error);
      return null;
    }
  }

  public async loadMostRecentDraft(): Promise<{
    session: DraftSession | null;
    messages: Message[];
    shouldResume: boolean;
  }> {
    const recentDraft = this.getMostRecentDraft();
    
    if (!recentDraft) {
      return { session: null, messages: [], shouldResume: false };
    }

    // Check if draft is recent enough to resume (within 7 days)
    const lastSavedTime = new Date(recentDraft.lastSaved).getTime();
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const shouldResume = lastSavedTime > sevenDaysAgo && recentDraft.isActive;

    // Load messages
    let messages: Message[] = [];
    try {
      const savedMessages = localStorage.getItem(`${DraftManager.MESSAGES_PREFIX}${recentDraft.id}`);
      if (savedMessages) {
        messages = JSON.parse(savedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }

    // Update session ID to continue with this draft
    if (shouldResume) {
      this.sessionId = recentDraft.id;
    }

    return { session: recentDraft, messages, shouldResume };
  }

  private createNewSession(): DraftSession {
    return {
      id: this.sessionId,
      userId: this.userId,
      draft: {
        title: '',
        price: null,
        images: [],
        category: '',
        condition: '',
        meetingSpot: '',
        description: ''
      },
      currentStep: 0,
      messages: [],
      lastSaved: new Date().toISOString(),
      sessionStarted: new Date().toISOString(),
      isActive: true,
      metadata: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        deviceType: this.detectDeviceType(),
        totalSteps: 7,
        completionPercentage: 0
      }
    };
  }

  private detectDeviceType(): 'mobile' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';
    return window.innerWidth <= 768 ? 'mobile' : 'desktop';
  }

  private calculateCompletionPercentage(draft: ListingDraft): number {
    const fields = [
      draft.title,
      draft.price,
      draft.images.length > 0,
      draft.category,
      draft.condition,
      draft.meetingSpot,
      draft.description
    ];
    
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }

  private async syncToServer(session: DraftSession): Promise<void> {
    try {
      // Only sync essential data to server to avoid payload size issues
      const syncData = {
        sessionId: session.id,
        userId: session.userId,
        draft: session.draft,
        currentStep: session.currentStep,
        lastSaved: session.lastSaved,
        completionPercentage: session.metadata.completionPercentage
      };

      await fetch('/api/drafts/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(syncData)
      });
    } catch (error) {
      console.error('Error syncing to server:', error);
      // Don't throw - local storage is primary, server is backup
    }
  }

  public async deleteDraft(sessionId?: string): Promise<void> {
    const idToDelete = sessionId || this.sessionId;
    
    try {
      localStorage.removeItem(`${DraftManager.STORAGE_PREFIX}${idToDelete}`);
      localStorage.removeItem(`${DraftManager.MESSAGES_PREFIX}${idToDelete}`);
      
      // Mark as inactive on server
      if (this.isOnline) {
        await fetch('/api/drafts/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: idToDelete })
        });
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  }

  public cleanup(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    this.forceSave();
  }

  public getAllUserDrafts(): DraftSession[] {
    try {
      const allKeys = Object.keys(localStorage).filter(key => 
        key.startsWith(DraftManager.STORAGE_PREFIX) && key.includes(this.userId)
      );

      return allKeys
        .map(key => {
          try {
            return JSON.parse(localStorage.getItem(key) || '{}') as DraftSession;
          } catch {
            return null;
          }
        })
        .filter((session): session is DraftSession => 
          session !== null && session.userId === this.userId
        )
        .sort((a, b) => new Date(b.lastSaved).getTime() - new Date(a.lastSaved).getTime());
    } catch (error) {
      console.error('Error getting all user drafts:', error);
      return [];
    }
  }

  public cleanupOldDrafts(): void {
    try {
      const userDrafts = this.getAllUserDrafts();
      
      // Keep only the most recent drafts
      if (userDrafts.length > DraftManager.MAX_DRAFTS_PER_USER) {
        const toDelete = userDrafts.slice(DraftManager.MAX_DRAFTS_PER_USER);
        toDelete.forEach(draft => {
          this.deleteDraft(draft.id);
        });
      }

      // Delete drafts older than 30 days
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      userDrafts.forEach(draft => {
        if (new Date(draft.lastSaved).getTime() < thirtyDaysAgo) {
          this.deleteDraft(draft.id);
        }
      });
    } catch (error) {
      console.error('Error cleaning up old drafts:', error);
    }
  }
}