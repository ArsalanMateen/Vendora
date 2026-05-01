import { getCommerceStore } from '../state/commerce-store.js';

export const toggleSavedProduct = product => getCommerceStore().actions.toggleSaved(product._id);
