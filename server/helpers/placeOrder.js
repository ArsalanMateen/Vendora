import { checkoutIntent, authoritativeItems } from './checkout.js';

export async function placeOrder(
  input,
  token,
  user,
  { Product, Order, payment, startSession, makeId }
) {
  let session, charge;
  const orderId = makeId();
  try {
    const intent = checkoutIntent(input.products);
    if (typeof token !== 'string' || !token.startsWith('tok_'))
      throw new Error('Please provide valid payment details');
    session = await startSession();
    let result;
    await session.withTransaction(async () => {
      const products = await Product.find({ _id: { $in: intent.map(item => item.productId) } })
        .select('_id name price quantity shop')
        .populate('shop', '_id')
        .session(session)
        .lean();
      const items = authoritativeItems(intent, products);
      const order = new Order({
        _id: orderId,
        products: items,
        user,
        customer_name: input.customer_name,
        customer_email: input.customer_email,
        delivery_address: input.delivery_address,
      });
      await order.validate();
      for (const item of items) {
        const update = await Product.updateOne(
          { _id: item.product, quantity: { $gte: item.quantity } },
          { $inc: { quantity: -item.quantity } },
          { session }
        );
        if (!(update.nModified || update.modifiedCount))
          throw new Error('Stock changed. Please refresh your bag.');
      }
      const cents = Math.round(
        items.reduce((sum, item) => sum + item.quantity * item.price, 0) * 100
      );
      if (cents < 50) throw new Error('The order total must be at least $0.50');
      charge = await payment.charges.create(
        { amount: cents, currency: 'usd', source: token, description: 'Vendora order' },
        { idempotencyKey: `vendora-order-${orderId}` }
      );
      order.payment_id = charge.id;
      result = await order.save({ session });
    });
    return result;
  } catch (error) {
    if (charge) {
      // A commit response can be lost after the order was persisted. Check before compensating.
      const persisted = await Order.findById(orderId).lean();
      if (persisted) return persisted;
      try {
        await payment.refunds.create(
          { charge: charge.id },
          { idempotencyKey: `vendora-refund-${orderId}` }
        );
      } catch {
        console.error('Order payment compensation requires review:', String(orderId));
      }
    }
    throw error;
  } finally {
    if (session) await session.endSession();
  }
}
