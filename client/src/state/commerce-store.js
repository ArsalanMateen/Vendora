const validId = value => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
export const SAVED_KEY = 'vendora-saved-products';
export function normalizeSaved(value) {
  return [...new Set((Array.isArray(value) ? value : []).filter(validId))];
}
export function normalizeCart(value) {
  return (Array.isArray(value) ? value : []).filter(item => validId(item.productId) && Number.isSafeInteger(item.quantity) && item.quantity > 0);
}
export function createCommerceStore(storage) {
  const read = key => {
    try {
      return JSON.parse(storage?.getItem(key) || '[]');
    } catch {
      return [];
    }
  };
  let snapshot = {
    cart: normalizeCart(read('cart')),
    savedIds: normalizeSaved(read(SAVED_KEY))
  };
  const listeners = new Set();
  const commit = next => {
    snapshot = next;
    try {
      storage?.setItem('cart', JSON.stringify(next.cart));
      storage?.setItem(SAVED_KEY, JSON.stringify(next.savedIds));
    } catch {}
    listeners.forEach(listener => listener());
  };
  return {
    getSnapshot: () => snapshot,
    isSaved: id => snapshot.savedIds.includes(id),
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    migrate() {},
    storageChanged() {},
    actions: {
      toggleSaved(id) {
        if (validId(id)) commit({
          ...snapshot,
          savedIds: snapshot.savedIds.includes(id) ? snapshot.savedIds.filter(value => value !== id) : [...snapshot.savedIds, id]
        });
      },
      add(id) {
        if (!validId(id)) return;
        const item = snapshot.cart.find(item => item.productId === id);
        commit({
          ...snapshot,
          cart: item ? snapshot.cart.map(value => value === item ? {
            ...value,
            quantity: value.quantity + 1
          } : value) : [...snapshot.cart, {
            productId: id,
            quantity: 1
          }]
        });
      },
      quantity(id, quantity) {
        if (Number.isSafeInteger(quantity) && quantity > 0) commit({
          ...snapshot,
          cart: snapshot.cart.map(item => item.productId === id ? {
            ...item,
            quantity
          } : item)
        });
      },
      removeCart(id) {
        commit({
          ...snapshot,
          cart: snapshot.cart.filter(item => item.productId !== id)
        });
      },
      clearCart() {
        commit({
          ...snapshot,
          cart: []
        });
      },
      removeMissing(ids) {
        const removed = new Set(ids);
        commit({
          cart: snapshot.cart.filter(item => !removed.has(item.productId)),
          savedIds: snapshot.savedIds.filter(id => !removed.has(id))
        });
      }
    }
  };
}
let store;
export function getCommerceStore() {
  if (!store) {
    let storage;
    try {
      storage = window.localStorage;
    } catch {}
    store = createCommerceStore(storage);
  }
  return store;
}
