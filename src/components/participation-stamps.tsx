type ParticipationStampsProps = {
  totalParticipations: number;
  totalStamps: number;
};

export function ParticipationStamps({
  totalParticipations,
  totalStamps,
}: ParticipationStampsProps) {
  const normalizedParticipations = Math.max(
    0,
    Math.floor(totalParticipations),
  );
  const normalizedStamps = Math.max(
    0,
    Math.floor(totalStamps),
  );

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
          スタンプ
        </h2>

        <p className="modern-stamp-description">
          参加を記録するたびに、数字が増えていきます。
        </p>
      </div>

      <div
        className="modern-stamp"
        role="img"
        aria-label={`累計スタンプ数、現在${normalizedStamps}個`}
      >
        <span className="modern-stamp-number">
          {normalizedStamps}
        </span>

        <span className="modern-stamp-unit">
          個
        </span>
      </div>

      <p className="stat-pill participation-count-summary">
        <strong>{normalizedParticipations}回</strong>
        <span>累計参加回数</span>
      </p>
    </section>
  );
}
