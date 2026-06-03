import crypto from 'node:crypto';
import mongoose from 'mongoose';

export function listQuery(params, filter, field = 'created', direction = -1) {
  const limit = params.limit === undefined ? 12 : Number(params.limit);
  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 50 ||
    (params.limit && !/^\d+$/.test(params.limit))
  )
    throw new Error('Invalid limit');
  const identity = crypto
    .createHash('sha256')
    .update(JSON.stringify([filter, field, direction]))
    .digest('hex');
  let pageFilter = filter;
  if (params.cursor) {
    let cursor;
    try {
      if (
        typeof params.cursor !== 'string' ||
        params.cursor.length > 1000 ||
        !/^[A-Za-z0-9_-]+$/.test(params.cursor)
      )
        throw new Error();
      cursor = JSON.parse(Buffer.from(params.cursor, 'base64url').toString());
      if (
        cursor.identity !== identity ||
        !/^[a-f\d]{24}$/i.test(cursor.id) ||
        !Number.isFinite(Date.parse(cursor.value))
      )
        throw new Error();
    } catch {
      throw new Error('Invalid cursor');
    }
    const op = direction === 1 ? '$gt' : '$lt';
    const value = new Date(cursor.value);
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

  return {
    limit,
    pageFilter,
    sort: { [field]: direction, _id: direction },
    encode: row =>
      Buffer.from(JSON.stringify({ identity, id: String(row._id), value: row[field] })).toString(
        'base64url'
      ),
  };
}
export function listResult(rows, totalCount, query, key) {
  const data = rows.slice(0, query.limit);
  const hasMore = rows.length > query.limit;

  return {
    [key]: data,
    totalCount,
    hasMore,
    nextCursor: hasMore ? query.encode(data[data.length - 1]) : null,
  };
}
