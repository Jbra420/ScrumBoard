// ============================================================
// ScrumBoard Pro — IndexedDB Persistent Database Service
// ============================================================

const DB_NAME = 'scrumboard_db';
const DB_VERSION = 1;
const STORES = ['projects', 'members', 'sprints', 'epics', 'stories', 'tasks', 'meetings', 'state'];

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      STORES.forEach(store => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' });
        }
      });
    };
  });
}

export const dbService = {
  /**
   * Retrieves all items from a specified store.
   */
  getAll: <T>(storeName: string): Promise<T[]> => {
    return openDB().then(db => {
      return new Promise<T[]>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result as T[]);
        req.onerror = () => reject(req.error);
      });
    });
  },

  /**
   * Saves a full collection of items to a store, clearing any existing records first.
   */
  saveAll: <T extends { id: string }>(storeName: string, items: T[]): Promise<void> => {
    return openDB().then(db => {
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        
        const clearReq = store.clear();
        clearReq.onsuccess = () => {
          items.forEach(item => {
            store.put(item);
          });
        };

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    });
  },

  /**
   * Adds or updates a single item in a store.
   */
  saveOne: <T extends { id: string }>(storeName: string, item: T): Promise<void> => {
    return openDB().then(db => {
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.put(item);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    });
  },

  /**
   * Deletes a single item from a store by its ID.
   */
  deleteOne: (storeName: string, id: string): Promise<void> => {
    return openDB().then(db => {
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    });
  },

  /**
   * Clears all stores in the database.
   */
  clearAll: (): Promise<void> => {
    return openDB().then(db => {
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORES, 'readwrite');
        STORES.forEach(store => {
          tx.objectStore(store).clear();
        });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    });
  },

  /**
   * Exports all database stores as a single JSON object.
   */
  exportData: async (): Promise<Record<string, any>> => {
    const backup: Record<string, any> = {};
    for (const store of STORES) {
      backup[store] = await dbService.getAll(store);
    }
    return backup;
  },

  /**
   * Imports database data from a JSON object, replacing all current records.
   */
  importData: async (backup: Record<string, any[]>): Promise<void> => {
    await dbService.clearAll();
    for (const store of STORES) {
      if (Array.isArray(backup[store])) {
        await dbService.saveAll(store, backup[store]);
      }
    }
  }
};
