type ParticipationStampsProps = {
  count: number;
};

export function ParticipationStamps({
  count,
}: ParticipationStampsProps) {
  const normalizedCount = Math.max(0, Math.floor(count));

  return (
    <section
      className="participation-card modern-participation-card"
      aria-labelledby="participation-card-title"
    >
      <div className="modern-stamp-heading">
        <p className="modern-stamp-eyebrow">
          ACTIVITY RECORD
        </p>

        <h2 id="participation-card-title">
          参加の記録
        </h2>

        <p className="modern-stamp-description">
          参加を記録するたびに、数字が増えていきます。
        </p>
      </div>

      <div
        className="modern-stamp"
        role="img"
        aria-label={`累計参加回数、現在${normalizedCount}回`}
      >
        <span
          className="modern-stamp-top"
          aria-hidden="true"
        >
          THANK YOU
        </span>

        <span className="modern-stamp-number">
          {normalizedCount}
        </span>

        <span className="modern-stamp-unit">
          回
        </span>

        <span
          className="modern-stamp-decoration"
          aria-hidden="true"
        >
          INAGI ORCHARD
        </span>
      </div>
    </section>
  );
}
