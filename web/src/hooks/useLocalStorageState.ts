"use client";

import { useEffect, useMemo, useState } from "react";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function getStorage(): StorageLike | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const storage = useMemo(() => getStorage(), []);
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!storage) {
      queueMicrotask(() => setHydrated(true));
      return;
    }

    const raw = storage.getItem(key);
    if (!raw) {
      queueMicrotask(() => setHydrated(true));
      return;
    }

    try {
      queueMicrotask(() => setValue(JSON.parse(raw) as T));
    } catch {
      storage.removeItem(key);
    } finally {
      queueMicrotask(() => setHydrated(true));
    }
  }, [key, storage]);

  useEffect(() => {
    if (!storage || !hydrated) return;
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore quota / serialization errors.
    }
  }, [hydrated, key, storage, value]);

  return { value, setValue, hydrated } as const;
}

