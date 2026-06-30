const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border-light">
      {/* Image skeleton */}
      <div className="w-full h-52 skeleton" />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Brand */}
        <div className="w-16 h-3 skeleton" />

        {/* Title */}
        <div className="w-full h-4 skeleton" />
        <div className="w-3/4 h-4 skeleton" />

        {/* Rating */}
        <div className="w-24 h-3 skeleton" />

        {/* Price */}
        <div className="w-20 h-6 skeleton" />

        {/* Button */}
        <div className="w-full h-10 skeleton mt-2" />
      </div>
    </div>
  );
};

export default SkeletonCard;
