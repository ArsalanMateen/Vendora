const listeners = new Set();
let now = Date.now();
let interval;

const tick = () => {
  now = Date.now();
  listeners.forEach(listener => listener());
};

export const clockSnapshot = () => now;
export function subscribeClock(listener) {
  listeners.add(listener);
  if (!interval) {
    tick();
    interval = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
  }

  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      clearInterval(interval);
      interval = undefined;
      document.removeEventListener('visibilitychange', tick);
    }
  };
}
