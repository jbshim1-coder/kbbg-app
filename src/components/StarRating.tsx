"use client";

import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  max?: number;
  readOnly?: boolean;
}

export default function StarRating({ value, onChange, max = 5, readOnly = false }: StarRatingProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => !readOnly && onChange(star)}
          className={`text-2xl transition-colors ${readOnly ? "cursor-default" : ""}`}
          aria-label={`${star} star`}
          disabled={readOnly}
        >
          <span className={star <= (hover || value) ? "text-yellow-400" : "text-gray-300"}>
            ★
          </span>
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm text-gray-500 font-medium">{value}/{max}</span>
      )}
    </div>
  );
}
