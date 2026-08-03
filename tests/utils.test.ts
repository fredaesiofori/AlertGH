import test from 'node:test';
import assert from 'node:assert/strict';
import { readStorage, writeStorage } from '../src/utils';

const createStorage = (): Storage => {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  } as Storage;
};

Object.defineProperty(globalThis, 'localStorage', {
  value: createStorage(),
  configurable: true,
  writable: true,
});

test('readStorage returns fallback for invalid JSON', () => {
  const originalGetItem = globalThis.localStorage.getItem;
  globalThis.localStorage.getItem = () => '{bad json';

  try {
    const value = readStorage('demo-key', { ok: true });
    assert.deepEqual(value, { ok: true });
  } finally {
    globalThis.localStorage.getItem = originalGetItem;
  }
});

test('writeStorage does not throw when storage is unavailable', () => {
  const originalSetItem = globalThis.localStorage.setItem;
  globalThis.localStorage.setItem = () => {
    throw new Error('blocked');
  };

  try {
    assert.doesNotThrow(() => writeStorage('demo-key', { ok: true }));
  } finally {
    globalThis.localStorage.setItem = originalSetItem;
  }
});
