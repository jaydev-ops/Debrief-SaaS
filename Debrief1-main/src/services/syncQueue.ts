import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'debrief_offline';
const STORE_NAME = 'sync_queue';

export interface QueuedOperation {
  id: string; // temp UUID
  type: "CREATE_NOTE" | "DELETE_NOTE" | "SEND_MESSAGE";
  payload: any;
  timestamp: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

export const syncQueue = {
  async enqueue(op: QueuedOperation) {
    const db = await getDB();
    await db.put(STORE_NAME, op);
  },
  
  async getAll(): Promise<QueuedOperation[]> {
    const db = await getDB();
    const ops = await db.getAll(STORE_NAME);
    return ops.sort((a, b) => a.timestamp - b.timestamp);
  },
  
  async remove(id: string) {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
  },
  
  async clear() {
    const db = await getDB();
    await db.clear(STORE_NAME);
  }
};
