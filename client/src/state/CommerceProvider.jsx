import { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { getCommerceStore } from './commerce-store.js';
const CommerceContext = createContext(null);
export default function CommerceProvider({ children, store: suppliedStore }) {
  const [store] = useState(() => suppliedStore || getCommerceStore());

  useEffect(() => {
    store.migrate();
    window.addEventListener('storage', store.storageChanged);

    return () => window.removeEventListener('storage', store.storageChanged);
  }, [store]);

  return <CommerceContext.Provider value={store}>{children}</CommerceContext.Provider>;
}
export function useCommerceStore() {
  return useContext(CommerceContext) || getCommerceStore();
}
export function useCommerce() {
  const store = useCommerceStore();

  return {
    ...useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot),
    actions: store.actions,
  };
}
export function useSaved(id) {
  const store = useCommerceStore();

  return useSyncExternalStore(
    store.subscribe,
    () => store.isSaved(id),
    () => false
  );
}
