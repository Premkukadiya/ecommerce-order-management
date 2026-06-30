import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const StarRating = ({ rating, size = 'text-sm', showValue = false, count = null }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.25 && rating % 1 < 0.75;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0) - (rating % 1 >= 0.75 ? 1 : 0);
  const adjustedFull = rating % 1 >= 0.75 ? fullStars + 1 : fullStars;

  for (let i = 0; i < adjustedFull; i++) {
    stars.push(<FaStar key={`full-${i}`} className="text-amber-400" />);
  }
  if (hasHalf) {
    stars.push(<FaStarHalfAlt key="half" className="text-amber-400" />);
  }
  const remaining = 5 - stars.length;
  for (let i = 0; i < remaining; i++) {
    stars.push(<FaRegStar key={`empty-${i}`} className="text-amber-400" />);
  }

  return (
    <div className={`flex items-center gap-1 ${size}`}>
      <div className="flex">{stars}</div>
      {showValue && (
        <span className="text-text-secondary font-medium ml-1">
          {rating.toFixed(1)}
        </span>
      )}
      {count !== null && (
        <span className="text-text-muted text-xs">
          ({count})
        </span>
      )}
    </div>
  );
};

export default StarRating;
