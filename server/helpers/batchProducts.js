export function productIds(ids) {
  if (
    !Array.isArray(ids) ||
    ids.length > 100 ||
    ids.some(id => typeof id !== 'string' || !/^[a-f\d]{24}$/i.test(id))
  )
    throw new Error('Provide up to 100 valid product IDs');

  return [...new Set(ids.map(id => id.toLowerCase()))];
}
