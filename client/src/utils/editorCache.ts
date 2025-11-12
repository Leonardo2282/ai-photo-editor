const CACHE_PREFIX = 'photo_editor_state_';

export interface CachedEdit {
  id: number;
  resultUrl: string;
  prompt: string;
  createdAt: Date | null;
  isSaved: boolean;
  userId: string;
  imageId: number;
  savedImageId: number | null;
}

export interface EditorCacheState {
  imageId: number;
  edits: CachedEdit[];
  currentBaseEditId: number | null;
  generateInputText: string;
  overwriteLastSave: boolean;
  lastUpdated: number;
}

export const EditorCache = {
  save: (imageId: number, state: Partial<EditorCacheState>): boolean => {
    try {
      const cacheKey = `${CACHE_PREFIX}${imageId}`;
      const cacheData: EditorCacheState = {
        imageId,
        edits: state.edits || [],
        currentBaseEditId: state.currentBaseEditId ?? null,
        generateInputText: state.generateInputText || '',
        overwriteLastSave: state.overwriteLastSave || false,
        lastUpdated: Date.now()
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log('[EditorCache] State saved:', cacheKey);
      return true;
    } catch (error) {
      console.error('[EditorCache] Failed to save:', error);
      return false;
    }
  },

  load: (imageId: number): EditorCacheState | null => {
    try {
      const cacheKey = `${CACHE_PREFIX}${imageId}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) {
        console.log('[EditorCache] No cached state found for:', imageId);
        return null;
      }
      
      const data = JSON.parse(cached);
      console.log('[EditorCache] State loaded:', cacheKey, data);
      return data;
    } catch (error) {
      console.error('[EditorCache] Failed to load:', error);
      return null;
    }
  },

  clear: (imageId: number): boolean => {
    try {
      const cacheKey = `${CACHE_PREFIX}${imageId}`;
      localStorage.removeItem(cacheKey);
      console.log('[EditorCache] State cleared:', cacheKey);
      return true;
    } catch (error) {
      console.error('[EditorCache] Failed to clear:', error);
      return false;
    }
  },

  clearAll: (): boolean => {
    try {
      const keys = Object.keys(localStorage);
      const editorKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      editorKeys.forEach(key => localStorage.removeItem(key));
      console.log('[EditorCache] All caches cleared:', editorKeys.length);
      return true;
    } catch (error) {
      console.error('[EditorCache] Failed to clear all:', error);
      return false;
    }
  }
};

export interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel: () => void;
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): DebouncedFunction<T> => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  const debounced = (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      func(...args);
    }, delay);
  };
  
  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  
  return debounced;
};
