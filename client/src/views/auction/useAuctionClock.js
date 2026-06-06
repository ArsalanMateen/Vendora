import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { subscribeClock, clockSnapshot } from './auction-clock';

const idleSubscription = () => () => {};

export default function useAuctionClock(endTime, onEnd) {
  const end = new Date(endTime).getTime();

  const [endedWindow, setEndedWindow] = useState(null);

  const now = useSyncExternalStore(
    endedWindow !== end ? subscribeClock : idleSubscription,
    clockSnapshot,
    clockSnapshot
  );

  const callback = useRef(onEnd);

  callback.current = onEnd;

  const notified = useRef(null);

  useEffect(() => {
    if (now < end || notified.current === end) return;
    notified.current = end;
    setEndedWindow(end);
    callback.current?.();
  }, [now, end]);

  return { now, end };
}
