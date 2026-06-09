import useAuctionClock from './useAuctionClock';

export default function AuctionCountdown({ endTime, onEnd }) {
  const { end, now } = useAuctionClock(endTime, onEnd);

  const seconds = Math.max(0, Math.floor((end - now) / 1000));
  const days = Math.floor(seconds / 86400),
    hours = Math.floor(seconds / 3600) % 24,
    minutes = Math.floor(seconds / 60) % 60;

  return (
    <span>
      {now >= end
        ? 'Bidding has closed'
        : days
          ? `${days}d ${hours}h remaining`
          : hours
            ? `${hours}h ${minutes}m remaining`
            : `${minutes}m ${seconds % 60}s remaining`}
    </span>
  );
}
