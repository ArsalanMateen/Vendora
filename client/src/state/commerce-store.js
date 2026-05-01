const validId = value => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);

export const SAVED_KEY = 'vendora-saved-products';
export function normalizeSaved(value) {
  return [
    ...new Set(
      (Array.isArray(value) ? value : [])
        .map(item => (typeof item === 'string' ? item : item?._id))
        .filter(validId)
        .map(id => id.toLowerCase())
    ),
  ];
}
export function normalizeCart(value) {
  const items = new Map();
  for (const item of Array.isArray(value) ? value : []) {
    const id = item?.productId || item?.product?._id;
    const quantity = Number(item?.quantity);
    if (!validId(id) || !Number.isSafeInteger(quantity) || quantity < 1) continue;
    const productId = id.toLowerCase();
    const total = (items.get(productId)?.quantity || 0) + quantity;
    if (Number.isSafeInteger(total)) items.set(productId, { productId, quantity: total });
  }

  return [...items.values()];
}
export function createCommerceStore(storage) {
  const parse = key => {
    try {
      return JSON.parse(storage?.getItem(key) || '[]');
    } catch {
      return [];
    }
  };

  let snapshot = { cart: normalizeCart(parse('cart')), savedIds: normalizeSaved(parse(SAVED_KEY)) };
  let savedSet = new Set(snapshot.savedIds);
  const listeners = new Set();

  const persist = (key, value) => {
    try {
      const json = JSON.stringify(value);
      if (storage.getItem(key) !== json) storage.setItem(key, json);
    } catch {
      /* Keep the current session usable when storage is unavailable. */
    }
  };

  const commit = (next, write = true) => {
    const cartChanged = JSON.stringify(next.cart) !== JSON.stringify(snapshot.cart);
    const savedChanged = JSON.stringify(next.savedIds) !== JSON.stringify(snapshot.savedIds);
    if (!cartChanged && !savedChanged) return;
    snapshot = {
      cart: cartChanged ? next.cart : snapshot.cart,
      savedIds: savedChanged ? next.savedIds : snapshot.savedIds,
    };
    if (savedChanged) savedSet = new Set(snapshot.savedIds);
    if (write) {
      if (cartChanged) persist('cart', snapshot.cart);
      if (savedChanged) persist(SAVED_KEY, snapshot.savedIds);
    }
    listeners.forEach(listener => listener());
  };

  const actions = {
    toggleSaved(id) {
      if (!validId(id)) return;
      commit({
        ...snapshot,
        savedIds: savedSet.has(id)
          ? snapshot.savedIds.filter(value => value !== id)
          : [...snapshot.savedIds, id],
      });
    },
    add(id) {
      if (!validId(id)) return;
      const item = snapshot.cart.find(item => item.productId === id);
      commit({
        ...snapshot,
        cart: item
          ? snapshot.cart.map(value =>
              value === item ? { ...value, quantity: value.quantity + 1 } : value
            )
          : [...snapshot.cart, { productId: id, quantity: 1 }],
      });
    },
    quantity(id, quantity) {
      if (!Number.isSafeInteger(quantity) || quantity < 1) return;
      commit({
        ...snapshot,
        cart: snapshot.cart.map(item => (item.productId === id ? { ...item, quantity } : item)),
      });
    },
    removeCart(id) {
      commit({ ...snapshot, cart: snapshot.cart.filter(item => item.productId !== id) });
    },
    clearCart() {
      commit({ ...snapshot, cart: [] });
    },
    removeMissing(ids) {
      const removed = new Set(ids);
      commit({
        cart: snapshot.cart.filter(item => !removed.has(item.productId)),
        savedIds: snapshot.savedIds.filter(id => !removed.has(id)),
      });
    },
  };

  return {
    getSnapshot: () => snapshot,
    isSaved: id => savedSet.has(id),
    actions,
    subscribe(listener) {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
    migrate() {
      persist('cart', snapshot.cart);
      persist(SAVED_KEY, snapshot.savedIds);
    },
    storageChanged(event) {
      if (event.key === null || ['cart', SAVED_KEY].includes(event.key))
        commit(
          { cart: normalizeCart(parse('cart')), savedIds: normalizeSaved(parse(SAVED_KEY)) },
          false
        );
    },
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
