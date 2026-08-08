type ParticipationStampsProps = {
  totalParticipations: number;
};

export function ParticipationStamps({
  totalParticipations,
}: ParticipationStampsProps) {
  const normalizedParticipations = Math.max(
    0,
    Math.floor(totalParticipations),
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
          参加回数
        </h2>

        <p className="modern-stamp-description">
          参加を記録するたびに、数字が増えていきます。
        </p>
      </div>

      <div
        className="modern-stamp"
        role="img"
        aria-label={`参加回数、現在${normalizedParticipations}回`}
      >
        <span className="modern-stamp-number">
          {normalizedParticipations}
        </span>

        <span className="modern-stamp-unit">
          回
        </span>
      </div>
    </section>
  );
}
