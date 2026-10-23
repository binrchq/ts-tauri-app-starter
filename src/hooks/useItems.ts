import { useCallback, useEffect, useState } from 'react';
import { api } from '@/api';
import type { Item, ItemInput, ItemStatus } from '@/types';

function sortByUpdatedAt(items: Item[]) {
  return [...items].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.items.list();
      setItems(sortByUpdatedAt(data));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const createItem = useCallback(async (input: ItemInput) => {
    const created = await api.items.create(input);
    setItems((current) => sortByUpdatedAt([created, ...current]));
    return created;
  }, []);

  const updateItem = useCallback(async (id: string, input: ItemInput) => {
    const updated = await api.items.update(id, input);
    setItems((current) =>
      sortByUpdatedAt(current.map((item) => (item.id === id ? updated : item))),
    );
    return updated;
  }, []);

  /** Partial update for star / archive toggles from list and inspector. */
  const patchItem = useCallback(
    async (id: string, changes: { favorite?: boolean; status?: ItemStatus }) => {
      const patched = await api.items.patch(id, changes);
      setItems((current) =>
        sortByUpdatedAt(current.map((item) => (item.id === id ? patched : item))),
      );
      return patched;
    },
    [],
  );

  const deleteItem = useCallback(async (id: string) => {
    await api.items.remove(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  return { items, loading, error, reload, createItem, updateItem, patchItem, deleteItem };
}