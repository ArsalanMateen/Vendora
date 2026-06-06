import useAuctionClock from './useAuctionClock';
import styles from './Auction.module.css';

const calculateTimeLeft = (date, now) => {
  const difference = date - now;
  let timeLeft = {};

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      timeEnd: false,
    };
  } else {
    timeLeft = { timeEnd: true };
  }

  return timeLeft;
};

export default function Timer({ endTime, update }) {
  const { now, end } = useAuctionClock(endTime, update);

  const timeLeft = calculateTimeLeft(end, now);

  return (
    <div className={styles.timerBox}>
      {!timeLeft.timeEnd ? (
        <>
          <p className={styles.timerLabel}>Time remaining</p>
          <div className={styles.countdown} role="timer" aria-label="Time remaining">
            {[
              ...(timeLeft.days > 0 ? [['Days', timeLeft.days]] : []),
              ['Hours', timeLeft.hours],
              ['Minutes', timeLeft.minutes],
              ['Seconds', timeLeft.seconds],
            ].map(([label, value]) => (
              <div className={styles.countdownUnit} key={label}>
                <strong>{String(value).padStart(2, '0')}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <p className={styles.timerEndNotice}>
            Ends{' '}
            <time dateTime={new Date(endTime).toISOString()}>
              {new Date(endTime).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}{' '}
              at{' '}
              {new Date(endTime).toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </time>
          </p>
        </>
      ) : (
        <div className={styles.timerText}>Bidding has closed</div>
      )}
    </div>
  );
}
