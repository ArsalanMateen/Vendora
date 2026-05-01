import { getCommerceStore } from '../state/commerce-store.js';
const cart = {
  addItem(item, cb) {
    getCommerceStore().actions.add(item._id);
    cb?.();
  },
  updateCart(id, quantity) {
    getCommerceStore().actions.quantity(id, quantity);
  },
  removeItem(id) {
    getCommerceStore().actions.removeCart(id);
  },
  emptyCart(cb) {
    getCommerceStore().actions.clearCart();
    cb?.();
  },
};
export default cart;
