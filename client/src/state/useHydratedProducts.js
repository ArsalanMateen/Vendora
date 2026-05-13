import { useEffect, useRef, useState } from 'react';
import { batch } from '../api/api-product';
import { useCommerceStore } from './CommerceProvider';

export default function useHydratedProducts(ids) {
  const store = useCommerceStore();

  const key = JSON.stringify(ids);

  const latestIds = useRef(ids);

  latestIds.current = ids;

  const [revision, setRevision] = useState(0);

  const cache = useRef(new Map());

  const [state, setState] = useState({ key, products: [], loading: !!ids.length, error: '' });

  useEffect(() => {
    const controller = new AbortController();
    const requested = latestIds.current;
    if (!requested.length) {
      setState({ key, products: [], loading: false, error: '' });
      return;
    }
    if (requested.every(id => cache.current.has(id))) {
      setState({
        key,
        products: requested.map(id => cache.current.get(id)),
        loading: false,
        error: '',
      });
      return;
    }
    setState(previous => ({ ...previous, key, loading: true, error: '' }));
    batch(requested, controller.signal)
      .then(products => {
        if (controller.signal.aborted) return;
        const found = new Set(products.map(product => product._id));
        products.forEach(product => cache.current.set(product._id, product));
        setState({ key, products, loading: false, error: '' });
        store.actions.removeMissing(requested.filter(id => !found.has(id)));
      })
      .catch(error => {
        if (!controller.signal.aborted)
          setState(previous => ({ ...previous, key, loading: false, error: error.message }));
      });

    return () => controller.abort();
  }, [key, revision, store]);

  return {
    ...(state.key === key ? state : { products: [], loading: !!ids.length, error: '' }),
    retry: () => {
      cache.current.clear();
      setRevision(value => value + 1);
    },
  };
}
