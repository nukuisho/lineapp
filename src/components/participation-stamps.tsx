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
          参加の記録
        </h2>

        <p className="modern-stamp-description">
          参加を記録するたびに、数字が増えていきます。
        </p>
      </div>

      <div className="stats-grid">
        <p className="stat-pill">
          <strong>{normalizedParticipations}回</strong>
          <span>累計参加回数</span>
        </p>
        <p className="stat-pill">
          <strong>{normalizedStamps}個</strong>
          <span>累計スタンプ数</span>
        </p>
      </div>
    </section>
  );
}
