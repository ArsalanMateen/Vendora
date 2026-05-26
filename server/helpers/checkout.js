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
export function authoritativeItems(intent, products) {
  const found = new Map(products.map(product => [String(product._id), product]));

  return intent.map(item => {
    const product = found.get(item.productId);
    if (!product || !product.shop?._id)
      throw new Error('A product in your bag is no longer available');
    if (item.quantity > product.quantity)
      throw new Error(`Only ${product.quantity} of ${product.name} are available`);
    if (!Number.isFinite(product.price) || product.price < 0)
      throw new Error('This product price is unavailable');

    return {
      product: product._id,
      shop: product.shop._id,
      quantity: item.quantity,
      price: product.price,
    };
  });
}
