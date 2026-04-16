import crypto from 'node:crypto';
import mongoose from 'mongoose';

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
  const identity = crypto
    .createHash('sha256')
    .update(JSON.stringify([sort, filter]))
    .digest('hex');
  const [field, direction] = sorts[sort];
  let pageFilter = filter;
  const rawCursor = text('cursor', 1500);
  if (rawCursor) {
    let cursor;
    try {
      if (!/^[A-Za-z0-9_-]+$/.test(rawCursor)) throw new Error();
      cursor = JSON.parse(Buffer.from(rawCursor, 'base64url').toString());
      if (cursor.v !== 1 || cursor.identity !== identity || !/^[a-f\d]{24}$/i.test(cursor.id))
        throw new Error();
      if (
        field === 'created'
          ? typeof cursor.value !== 'string' || !Number.isFinite(Date.parse(cursor.value))
          : field === 'price'
            ? typeof cursor.value !== 'number' || !Number.isFinite(cursor.value)
            : typeof cursor.value !== 'string'
      )
        throw new Error();
    } catch {
      throw new Error('Invalid or incompatible cursor');
    }
    const value = field === 'created' ? new Date(cursor.value) : cursor.value;
    const op = direction === 1 ? '$gt' : '$lt';
    pageFilter = {
      $and: [
        filter,
        {
          $or: [
            { [field]: { [op]: value } },
            { [field]: value, _id: { [op]: mongoose.Types.ObjectId(cursor.id) } },
          ],
        },
      ],
    };
  }

  const nextCursor = product =>
    Buffer.from(
      JSON.stringify({ v: 1, identity, id: String(product._id), value: product[field] })
    ).toString('base64url');

  return { filter, pageFilter, limit, sort: { [field]: direction, _id: direction }, nextCursor };
}

export async function productPage(model, params, shop) {
  const query = productQuery(params, shop);
  const [rows, totalCount] = await Promise.all([
    model
      .find(query.pageFilter)
      .select(CARD_FIELDS)
      .sort(query.sort)
      .limit(query.limit + 1)
      .populate('shop', '_id name')
      .lean()
      .exec(),
    model.countDocuments(query.filter),
  ]);
  const hasMore = rows.length > query.limit;
  const products = rows.slice(0, query.limit);

  return {
    products,
    totalCount,
    hasMore,
    nextCursor: hasMore ? query.nextCursor(products[products.length - 1]) : null,
  };
}
