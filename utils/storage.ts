
import { ProjectData, Folder } from '../types';

const DB_NAME = 'HexCalibratorDB';
const DB_VERSION = 2; // Incremented for Phase 2
const STORE_PROJECTS = 'projects';
const STORE_FOLDERS = 'folders';

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORE_FOLDERS)) {
        db.createObjectStore(STORE_FOLDERS, { keyPath: 'id' });
      }
    };
  });
};

// --- PROJECTS ---

export const saveProject = async (project: ProjectData): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_PROJECTS], 'readwrite');
    const store = transaction.objectStore(STORE_PROJECTS);
    const request = store.put(project);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getProject = async (id: string): Promise<ProjectData | undefined> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_PROJECTS], 'readonly');
    const store = transaction.objectStore(STORE_PROJECTS);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getAllProjects = async (): Promise<ProjectData[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_PROJECTS], 'readonly');
    const store = transaction.objectStore(STORE_PROJECTS);
    const request = store.getAll();

    request.onsuccess = () => {
        const projects = request.result as ProjectData[];
        projects.sort((a, b) => b.lastModified - a.lastModified);
        resolve(projects);
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteProject = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_PROJECTS], 'readwrite');
    const store = transaction.objectStore(STORE_PROJECTS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// --- FOLDERS ---

export const saveFolder = async (folder: Folder): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_FOLDERS], 'readwrite');
    const store = transaction.objectStore(STORE_FOLDERS);
    const request = store.put(folder);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAllFolders = async (): Promise<Folder[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_FOLDERS], 'readonly');
    const store = transaction.objectStore(STORE_FOLDERS);
    const request = store.getAll();
    request.onsuccess = () => {
        const folders = request.result as Folder[];
        folders.sort((a, b) => b.createdAt - a.createdAt);
        resolve(folders);
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteFolder = async (id: string): Promise<void> => {
  const db = await initDB();
  // When PERMANENTLY deleting a folder, we need to handle orphans.
  // This function assumes the UI has already warned the user.
  // In a robust app, we might check for children here, but for now we trust the upper layer logic.
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_FOLDERS], 'readwrite');
    const store = transaction.objectStore(STORE_FOLDERS);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
