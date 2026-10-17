export default function StarRating({ value, onChange, readOnly = false }) {
  return (
    <div className="star-rating" aria-label={`Avaliação ${value} de 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= Math.round(value);

        if (readOnly) {
          return (
            <span className={isActive ? "star star--active" : "star"} key={star}>
              ★
            </span>
          );
        }

        return (
          <button
            className={isActive ? "star star--active" : "star"}
            type="button"
            key={star}
            onClick={() => onChange(star)}
            aria-label={`Avaliar com ${star} estrela${star > 1 ? "s" : ""}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
