export default function TopBanner({ show, tone, text, link }) {
  if (!show || !text) return null;

  const bannerTone = tone?.toLowerCase?.() || "info";
  const bannerLines = String(text).split("\\n");  // <- important

  const classNames = [
    "banner",
    `banner--${bannerTone}`,
    link ? "banner--clickable" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames} role="status">
      {link ? (
        <a href={link} className="banner-link">
          {bannerLines.map((line, i) => (
            <span key={i}>
              {line}
              {i < bannerLines.length - 1 && <br />}
            </span>
          ))}
        </a>
      ) : (
        bannerLines.map((line, i) => (
          <span key={i}>
            {line}
            {i < bannerLines.length - 1 && <br />}
          </span>
        ))
      )}
    </div>
  );
}