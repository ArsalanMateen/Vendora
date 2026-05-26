import { productIds } from './batchProducts.js';
export function checkoutIntent(items) {
  if (!Array.isArray(items) || !items.length || items.length > 100)
    throw new Error('Your bag must contain between 1 and 100 products');
  const ids = productIds(items.map(item => item?.productId || item?.product?._id));
  if (ids.length !== items.length) throw new Error('Duplicate products are not allowed');

  return items.map((item, index) => {
    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1)
      throw new Error('Please choose a valid quantity');

    return { productId: ids[index], quantity: item.quantity };
  });
}

