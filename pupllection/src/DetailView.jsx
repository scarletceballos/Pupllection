import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_BASE, pluralize, samplePhotos } from "./breedData";

const GALLERY_SIZE = 7;

function BreedProfile({ breed, breeds, isFavorite, onToggleFavorite }) {
  const [photos, setPhotos] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  const [copyState, setCopyState] = useState("idle");
  const linkInput = useRef(null);

  const path = breed.path;

  useEffect(() => {
    let ignore = false;

    async function fetchPhotos() {
      try {
        const response = await fetch(`${API_BASE}/${path}/images`);

        if (!response.ok) {
          throw new Error("Photo list request failed.");
        }

        const data = await response.json();
        const list = Array.isArray(data.message) ? data.message : [];

        if (!ignore) {
          setPhotos(list);
          setGallery(samplePhotos(list, GALLERY_SIZE));
          setStatus("ready");
        }
      } catch {
        if (!ignore) {
          setStatus("failed");
        }
      }
    }

    fetchPhotos();

    return () => {
      ignore = true;
    };
  }, [path, attempt]);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${breed.label} | Pupllection`;
    return () => {
      document.title = previousTitle;
    };
  }, [breed.label]);

  useEffect(() => {
    if (copyState === "idle") return undefined;
    const timer = setTimeout(() => setCopyState("idle"), 2500);
    return () => clearTimeout(timer);
  }, [copyState]);

  const sortedBreeds = useMemo(
    () => [...breeds].sort((a, b) => a.label.localeCompare(b.label)),
    [breeds]
  );
  const position = sortedBreeds.findIndex((b) => b.id === breed.id);
  const previous = position > 0 ? sortedBreeds[position - 1] : null;
  const next = position >= 0 && position < sortedBreeds.length - 1 ? sortedBreeds[position + 1] : null;

  const familyMembers = useMemo(
    () => breeds.filter((b) => b.family === breed.family),
    [breeds, breed.family]
  );

  const shareUrl = window.location.href;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyState("copied");
    } catch {
      linkInput.current?.select();
      setCopyState("failed");
    }
  }

  function retry() {
    setStatus("loading");
    setAttempt((count) => count + 1);
  }

  const mainPhoto = gallery[0];
  const morePhotos = gallery.slice(1);

  return (
    <>
      <Link className="back-link" to="/">
        ← Back to the gallery
      </Link>

      <article className="detail-card">
        <div className="window-bar" aria-hidden="true">
          <span />
          <span />
          <span />
          <em>🐾</em>
        </div>

        <div className="detail-main">
          <div className="detail-photo">
            {status === "ready" && mainPhoto && <img src={mainPhoto} alt={`${breed.label} photo`} />}
            {status === "ready" && !mainPhoto && (
              <span className="dog-photo-placeholder">No photos for this breed</span>
            )}
            {status === "loading" && (
              <span className="dog-photo-placeholder" aria-label="Loading photo">
                🐾
              </span>
            )}
            {status === "failed" && <span className="dog-photo-placeholder">No photo right now</span>}
          </div>

          <div className="detail-info">
            <span className="eyebrow">{breed.isSub ? "SUB-BREED" : "STANDALONE BREED"}</span>
            <h1>{breed.label}</h1>

            <dl className="dog-facts">
              <div>
                <dt>Family</dt>
                <dd>{breed.familyLabel}</dd>
              </div>
              <div>
                <dt>Type</dt>
                <dd>{breed.isSub ? "Sub-breed" : "Standalone breed"}</dd>
              </div>
              <div>
                <dt>Varieties in family</dt>
                <dd>{breed.familySize}</dd>
              </div>
              <div>
                <dt>Photos in the collection</dt>
                <dd>{status === "ready" ? photos.length.toLocaleString() : "-"}</dd>
              </div>
            </dl>

            <div className="dog-actions">
              <button
                type="button"
                className={`favorite-button${isFavorite ? " is-favorite" : ""}`}
                aria-pressed={isFavorite}
                onClick={() => onToggleFavorite(breed.id)}
              >
                {isFavorite ? "♥ Saved" : "♡ Save"}
              </button>
              <button
                type="button"
                className="shuffle-button"
                onClick={() => setGallery(samplePhotos(photos, GALLERY_SIZE))}
                disabled={status !== "ready" || photos.length === 0}
              >
                Shuffle photos
              </button>
            </div>

            <div className="share-box">
              <label htmlFor="share-link">Direct link to this breed</label>
              <div className="share-row">
                <input id="share-link" ref={linkInput} type="text" readOnly value={shareUrl} onFocus={(e) => e.target.select()} />
                <button type="button" className="ghost-button" onClick={copyLink}>
                  Copy link
                </button>
              </div>
              <p className="share-status" role="status">
                {copyState === "copied" && "Link copied!"}
                {copyState === "failed" && "Couldn't copy automatically. The link is selected, so press Ctrl+C or Cmd+C."}
              </p>
            </div>
          </div>
        </div>
      </article>

      {status === "failed" && (
        <div className="message error-message">
          <h3>Couldn't fetch photos</h3>
          <p>The dog API didn't answer. Check your connection and try again.</p>
          <button type="button" onClick={retry}>
            Try Again
          </button>
        </div>
      )}

      {status === "ready" && morePhotos.length > 0 && (
        <section className="detail-section">
          <h2>More photos of {breed.label}</h2>
          <div className="photo-grid">
            {morePhotos.map((url) => (
              <div className="photo-tile" key={url}>
                <img src={url} alt={`${breed.label}`} loading="lazy" />
              </div>
            ))}
          </div>
        </section>
      )}

      {familyMembers.length > 1 && (
        <section className="detail-section">
          <h2>
            More in the {breed.familyLabel} family{" "}
            <span className="count-pill">{familyMembers.length} varieties</span>
          </h2>
          <div className="family-links">
            {familyMembers.map((member) =>
              member.id === breed.id ? (
                <span key={member.id} className="family-pill is-current" aria-current="page">
                  {member.label}
                </span>
              ) : (
                <Link key={member.id} className="family-pill" to={`/breed/${member.id}`}>
                  {member.label}
                </Link>
              )
            )}
          </div>
        </section>
      )}

      <nav className="pager" aria-label="Browse breeds">
        {previous ? (
          <Link to={`/breed/${previous.id}`}>← {previous.label}</Link>
        ) : (
          <span />
        )}
        <span className="pager-count">
          {position + 1} of {sortedBreeds.length} {pluralize(sortedBreeds.length, "breed")}
        </span>
        {next ? <Link to={`/breed/${next.id}`}>{next.label} →</Link> : <span />}
      </nav>
    </>
  );
}

export default function DetailView({ breeds, loading, error, onRetry, favorites, onToggleFavorite }) {
  const { breedId } = useParams();
  const breed = breeds.find((b) => b.id === breedId);

  let content;

  if (loading) {
    content = (
      <div className="message">
        <span className="loading-leaf">🐾</span>
        <p>Fetching this pup...</p>
      </div>
    );
  } else if (error) {
    content = (
      <div className="message error-message">
        <h3>Looks like the kennel is closed</h3>
        <p>{error}</p>
        <button type="button" onClick={onRetry}>
          Try Again
        </button>
      </div>
    );
  } else if (!breed) {
    content = (
      <div className="empty-state">
        <span>🔎</span>
        <h3>We couldn't find that breed</h3>
        <p>There's no breed called "{breedId}" in the collection.</p>
        <Link className="details-link" to="/">
          Back to the gallery
        </Link>
      </div>
    );
  } else {
    content = (
      <BreedProfile
        key={breed.id}
        breed={breed}
        breeds={breeds}
        isFavorite={favorites.includes(breed.id)}
        onToggleFavorite={onToggleFavorite}
      />
    );
  }

  return <main className="dashboard page-section">{content}</main>;
}
