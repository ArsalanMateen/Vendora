


export const CARD_FIELDS = '_id name price category quantity image shop created';
const sorts = {
  newest: ['created', -1],
  'price-low': ['price', 1],
  'price-high': ['price', -1],
  name: ['name', 1],
};
export function productQuery(params = {}, shop) {
  const text = (key, max = 200) => {
    const value = params[key];
    if (value === undefined || value === '') return '';
    if (typeof value !== 'string' || value.length > max) throw new Error(`Invalid ${key}`);

    return value.trim();
  };

  const sort = text('sort') || 'newest';
  if (!Object.hasOwn(sorts, sort)) throw new Error('Invalid sort');
  const rawLimit = text('limit');
  if (rawLimit && !/^\d+$/.test(rawLimit)) throw new Error('Invalid limit');
  const limit = rawLimit ? Number(rawLimit) : 12;
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 50)
    throw new Error('Limit must be between 1 and 50');
  const filter = {};
  if (shop) filter.shop = shop;
  const search = text('search');
  if (search)
    filter.name = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  const category = text('category');
  if (category && category !== 'All') filter.category = category;
  const stock = text('stockOnly') || text('stock');
  if (stock && !['true', 'false'].includes(stock)) throw new Error('Invalid stockOnly');
  if (stock === 'true') filter.quantity = { $gt: 0 };
  const price = {};
  for (const [key, op] of [
    ['minPrice', '$gte'],
    ['maxPrice', '$lte'],
  ]) {
    const raw = text(key);
    if (!raw) continue;
    if (!/^\d+(\.\d+)?$/.test(raw) || !Number.isFinite(Number(raw)))
      throw new Error(`Invalid ${key}`);
    price[op] = Number(raw);
  }
  if (price.$gte > price.$lte)
    throw new Error('Maximum price must be greater than or equal to minimum price');
  if (Object.keys(price).length) filter.price = price;
  return { filter, pageFilter: filter, limit, sort: { [sorts[sort][0]]: sorts[sort][1], _id: sorts[sort][1] } };
}
