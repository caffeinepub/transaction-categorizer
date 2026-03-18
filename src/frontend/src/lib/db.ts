import type { MappingRule, Transaction } from "../types";

const DB_NAME = "fintrack-db";
const DB_VERSION = 1;

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("transactions")) {
        db.createObjectStore("transactions", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("mappingRules")) {
        db.createObjectStore("mappingRules", { keyPath: "keyword" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadTransactions(): Promise<Transaction[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("transactions", "readonly");
    const store = tx.objectStore("transactions");
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as Transaction[]);
    req.onerror = () => reject(req.error);
  });
}

export async function saveTransactions(txs: Transaction[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("transactions", "readwrite");
    const store = tx.objectStore("transactions");
    store.clear();
    for (const item of txs) {
      store.put(item);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadMappingRules(): Promise<MappingRule[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("mappingRules", "readonly");
    const store = tx.objectStore("mappingRules");
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as MappingRule[]);
    req.onerror = () => reject(req.error);
  });
}

export async function saveMappingRules(rules: MappingRule[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("mappingRules", "readwrite");
    const store = tx.objectStore("mappingRules");
    store.clear();
    for (const rule of rules) {
      store.put(rule);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearAll(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["transactions", "mappingRules"], "readwrite");
    tx.objectStore("transactions").clear();
    tx.objectStore("mappingRules").clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
