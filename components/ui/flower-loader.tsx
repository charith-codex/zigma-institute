"use client";

// Premium Radial Loading Component with circular dots
export function FlowerLoader({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <svg
        className="animate-spin"
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Dot 1 - Largest and fully opaque */}
        <circle cx="25" cy="5" r="3.5" fill="currentColor" opacity="1" />

        {/* Dot 2 */}
        <circle cx="35.5" cy="8" r="3.2" fill="currentColor" opacity="0.9" />

        {/* Dot 3 */}
        <circle cx="42" cy="15.5" r="3" fill="currentColor" opacity="0.8" />

        {/* Dot 4 */}
        <circle cx="45" cy="25" r="2.7" fill="currentColor" opacity="0.65" />

        {/* Dot 5 */}
        <circle cx="42" cy="34.5" r="2.4" fill="currentColor" opacity="0.5" />

        {/* Dot 6 */}
        <circle cx="35.5" cy="42" r="2.1" fill="currentColor" opacity="0.35" />

        {/* Dot 7 */}
        <circle cx="25" cy="45" r="1.8" fill="currentColor" opacity="0.25" />

        {/* Dot 8 */}
        <circle cx="14.5" cy="42" r="1.5" fill="currentColor" opacity="0.2" />

        {/* Dot 9 */}
        <circle cx="8" cy="34.5" r="1.3" fill="currentColor" opacity="0.15" />

        {/* Dot 10 */}
        <circle cx="5" cy="25" r="1.2" fill="currentColor" opacity="0.12" />

        {/* Dot 11 */}
        <circle cx="8" cy="15.5" r="1.1" fill="currentColor" opacity="0.1" />

        {/* Dot 12 */}
        <circle cx="14.5" cy="8" r="1" fill="currentColor" opacity="0.08" />
      </svg>
    </div>
  );
}
