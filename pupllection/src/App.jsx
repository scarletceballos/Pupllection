import { useEffect, useMemo, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useMatch,
  useNavigationType,
} from "react-router-dom";
import "./App.css";
import AboutPage from "./AboutPage.jsx";
import { InsightsSection } from "./ChartsPanel.jsx";
import DetailView from "./DetailView.jsx";
import { API_BASE, buildBreedEntries, computeInsights } from "./breedData.js";
import { useBreedFilters } from "./useBreedFilters.js";

const FAVORITES_KEY = "pupllection-favorites";
const FLOATERS = ["", "🐾", "🦴", "", "🐾", "🎾", "", "🦴", "🐾", ""];
const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "standalone", label: "Standalone" },
  { value: "sub", label: "Sub-breeds" },
];

function loadFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

// Jump to the top on new pages, but leave back/forward navigation alone so
// the browser can restore the scroll position.
function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [pathname, navigationType]);

  return null;
}

function Sidebar({ insights, favoritesCount }) {
  const onBreedPage = useMatch("/breed/:breedId") !== null;
  const leaders = insights ? insights.largestFamilies : [];
  const leader = leaders[0];

  return (
    <aside className="sidebar" aria-label="Sidebar">
      <nav className="side-nav" aria-label="Main">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `side-link${isActive || onBreedPage ? " active" : ""}`}
        >
          <span aria-hidden="true">🐕</span> Dashboard
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => `side-link${isActive ? " active" : ""}`}>
          <span aria-hidden="true">📖</span> About the data
        </NavLink>
      </nav>

      <div className="side-stats" aria-label="Dog statistics">
        <h2 className="side-heading">At a glance</h2>

        <div className="side-stat">
          <span className="stat-label">Breed families</span>
          <strong>{insights ? insights.familyCount.toLocaleString() : "-"}</strong>
          <span className="stat-note">Top-level breeds in the API</span>
        </div>

        <div className="side-stat">
          <span className="stat-label">Sub-breeds</span>
          <strong>{insights ? insights.subBreedCount.toLocaleString() : "-"}</strong>
          <span className="stat-note">Varieties within a breed</span>
        </div>

        <div className="side-stat">
          <span className="stat-label">Largest family</span>
          <strong className="side-stat-text">{leader ? leader.label : "-"}</strong>
          <span className="stat-note">
            {leader
              ? `${leader.subCount} varieties${leaders.length > 1 ? ` (tied with ${leaders.length - 1} more)` : ""}`
              : "Calculated from loaded data"}
          </span>
        </div>

        <div className="side-stat">
          <span className="stat-label">Saved pups</span>
          <strong>♥ {favoritesCount}</strong>
          <span className="stat-note">Stored in this browser</span>
        </div>
      </div>
    </aside>
  );
}

function DogCard({ breed, isFavorite, onToggleFavorite }) {
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("loading");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function fetchPhoto() {
      try {
        const response = await fetch(`${API_BASE}/${breed.path}/images/random`);

        if (!response.ok) {
          throw new Error("Photo request failed.");
        }

        const data = await response.json();

        if (!ignore) {
          setImageUrl(data.message);
          setStatus("ready");
        }
      } catch {
        if (!ignore) {
          setStatus("failed");
        }
      }
    }

    fetchPhoto();

    return () => {
      ignore = true;
    };
  }, [breed.path, refreshKey]);

  const detailPath = `/breed/${breed.id}`;

  return (
    <article className="dog-card">
      <div className="window-bar" aria-hidden="true">
        <span />
        <span />
        <span />
        <em>🐾</em>
      </div>

      <div className="dog-card-main">
        <div className="dog-photo">
          {status === "ready" && (
            <Link to={detailPath} className="photo-link" tabIndex={-1} aria-hidden="true">
              <img
                src={imageUrl}
                alt=""
                loading="lazy"
                onError={() => setStatus("failed")}
              />
            </Link>
          )}
          {status === "loading" && (
            <span className="dog-photo-placeholder" aria-label="Loading photo">
              🐾
            </span>
          )}
          {status === "failed" && (
            <span className="dog-photo-placeholder">No photo right now</span>
          )}
        </div>

        <div className="dog-card-body">
          <h3>
            <Link to={detailPath}>{breed.label}</Link>
          </h3>

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
          </dl>

          <div className="dog-actions">
            <Link className="details-link" to={detailPath} aria-label={`View details for ${breed.label}`}>
              View details →
            </Link>
            <button
              type="button"
              className="shuffle-button"
              onClick={() => setRefreshKey((key) => key + 1)}
            >
              New photo
            </button>
            <button
              type="button"
              className={`favorite-button${isFavorite ? " is-favorite" : ""}`}
              aria-pressed={isFavorite}
              onClick={() => onToggleFavorite(breed.id)}
            >
              {isFavorite ? "♥ Saved" : "♡ Save"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function Dashboard({ filters, favorites, onToggleFavorite, loading, error, onRetry, insights, totalBreeds }) {
  const {
    search,
    familyFilter,
    typeFilter,
    minSize,
    maxSize,
    favoritesOnly,
    sortOrder,
    families,
    filteredBreeds,
    visibleBreeds,
    updateFilter,
    toggleFavoritesOnly,
    resetFilters,
    surpriseMe,
    showMore,
    setSearch,
    setFamilyFilter,
    setTypeFilter,
    setMinSize,
    setMaxSize,
    setSortOrder,
  } = filters;

  function handlePreset(presetFilters) {
    filters.applyPreset(presetFilters);
    document.getElementById("breed-gallery")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="dashboard">
      <section className="hero">
        <div className="hero-bubbles" aria-hidden="true">
          <span className="hero-bubble">🐶</span>
          <span className="hero-bubble">🦴</span>
          <span className="hero-bubble">🐾</span>
          <span className="hero-bubble">🎾</span>
        </div>
        <h1>Discover a New Pup Bud!</h1>
        <p>
          Browse dog breeds and sub-breeds, then shuffle through random photos of each one until you find
          your next best friend.
        </p>
      </section>

      <div className="paw-trail" aria-hidden="true">
        <span>🐾</span>
        <span>🐾</span>
        <span>🐾</span>
        <span>🐾</span>
        <span>🐾</span>
      </div>

      <InsightsSection insights={insights} loading={loading} onApplyPreset={handlePreset} />

      <section className="directory-section" id="breed-gallery">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE BREED GALLERY</span>
            <h2>Find your pup</h2>
            <p>Search and filter breeds, then open one to see more about it</p>
          </div>

          <span className="result-count">
            {filteredBreeds.length} of {totalBreeds} breeds
          </span>
        </div>

        <div className="filters">
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search breeds, like beagle or husky..."
              value={search}
              onChange={updateFilter(setSearch)}
              aria-label="Search dog breeds"
            />
          </label>

          <label className="filter-control">
            <span>Family</span>
            <select value={familyFilter} onChange={updateFilter(setFamilyFilter)}>
              <option value="All">All families</option>
              {families.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-control">
            <span>Sort</span>
            <select value={sortOrder} onChange={updateFilter(setSortOrder)}>
              <option value="az">A to Z</option>
              <option value="za">Z to A</option>
            </select>
          </label>
        </div>

        <div className="filters filters-secondary">
          <fieldset className="radio-group">
            <legend>Type</legend>
            <div className="radio-options">
              {TYPE_OPTIONS.map((option) => (
                <label key={option.value} className="radio-pill">
                  <input
                    type="radio"
                    name="breed-type"
                    value={option.value}
                    checked={typeFilter === option.value}
                    onChange={updateFilter(setTypeFilter)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="filter-control bounds">
            <span>Varieties in family</span>
            <div className="bounds-inputs">
              <input
                type="number"
                min="1"
                inputMode="numeric"
                placeholder="Min"
                value={minSize}
                onChange={updateFilter(setMinSize)}
                aria-label="Minimum varieties in family"
              />
              <span aria-hidden="true">to</span>
              <input
                type="number"
                min="1"
                inputMode="numeric"
                placeholder="Max"
                value={maxSize}
                onChange={updateFilter(setMaxSize)}
                aria-label="Maximum varieties in family"
              />
            </div>
          </div>

          <label className="toggle-check">
            <input type="checkbox" checked={favoritesOnly} onChange={toggleFavoritesOnly} />
            <span>♥ Favorites only ({favorites.length})</span>
          </label>

          <div className="filter-actions">
            <button
              type="button"
              className="surprise-button"
              onClick={surpriseMe}
              disabled={totalBreeds === 0}
            >
              🎲 Surprise me
            </button>
            <button type="button" className="ghost-button" onClick={resetFilters}>
              Reset
            </button>
          </div>
        </div>

        {loading && (
          <div className="message">
            <span className="loading-leaf">🐾</span>
            <p>Calling all the dogs...</p>
          </div>
        )}

        {!loading && error && (
          <div className="message error-message">
            <h3>Looks like the kennel is closed</h3>
            <p>{error}</p>
            <button type="button" onClick={onRetry}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && filteredBreeds.length === 0 && (
          <div className="empty-state">
            <span>🔎</span>
            <h3>No breeds found</h3>
            <p>Try different filters, or clear them to see every breed</p>
            <button type="button" onClick={resetFilters}>
              Clear all filters
            </button>
          </div>
        )}

        {!loading && !error && visibleBreeds.length > 0 && (
          <>
            <div className="dog-list">
              {visibleBreeds.map((breed) => (
                <DogCard
                  key={breed.id}
                  breed={breed}
                  isFavorite={favorites.includes(breed.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>

            {visibleBreeds.length < filteredBreeds.length && (
              <div className="load-more">
                <button type="button" onClick={showMore}>
                  Show more breeds
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function App() {
  const [breeds, setBreeds] = useState([]);
  const [favorites, setFavorites] = useState(loadFavorites);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function fetchBreeds() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE}/breeds/list/all`);

        if (!response.ok) {
          throw new Error("Failed to fetch breed data.");
        }

        const data = await response.json();

        if (!ignore) {
          setBreeds(buildBreedEntries(data.message));
        }
      } catch (err) {
        console.error(err);
        if (!ignore) {
          setError("We couldn't reach the dog API. Check your internet connection and try again.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchBreeds();

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
      // Storage can be unavailable (private mode); favorites just won't persist.
    }
  }, [favorites]);

  const insights = useMemo(() => computeInsights(breeds), [breeds]);
  const filters = useBreedFilters(breeds, favorites);

  function toggleFavorite(id) {
    setFavorites((current) =>
      current.includes(id) ? current.filter((favoriteId) => favoriteId !== id) : [...current, id]
    );
  }

  function retry() {
    setReloadKey((key) => key + 1);
  }

  return (
    <div className="site-shell">
      <ScrollToTop />

      <div className="bubble-field" aria-hidden="true">
        {FLOATERS.map((icon, index) => (
          <span key={index} className="floater">
            {icon}
          </span>
        ))}
      </div>

      <header className="site-header">
        <Link className="brand" to="/" aria-label="Pupllection home">
          <span className="brand-icon">🐶</span>
          <span>Pupllection</span>
        </Link>

        <span className="header-label">A GALLERY OF GOOD DOGGIES</span>
      </header>

      <div className="app-body">
        <Sidebar insights={insights} favoritesCount={favorites.length} />

        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                filters={filters}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                loading={loading}
                error={error}
                onRetry={retry}
                insights={insights}
                totalBreeds={breeds.length}
              />
            }
          />
          <Route
            path="/breed/:breedId"
            element={
              <DetailView
                breeds={breeds}
                loading={loading}
                error={error}
                onRetry={retry}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
              />
            }
          />
          <Route path="/about" element={<AboutPage insights={insights} />} />
          <Route
            path="*"
            element={
              <main className="dashboard page-section">
                <div className="empty-state">
                  <span>🐕</span>
                  <h3>That page ran away</h3>
                  <p>We couldn't find what you were looking for.</p>
                  <Link className="details-link" to="/">
                    Back to the gallery
                  </Link>
                </div>
              </main>
            }
          />
        </Routes>
      </div>

      <footer className="site-footer">
        <span>🐶 Woof Woof 🐶</span>
        <span>Photos and breed list from Dog CEO</span>
      </footer>
    </div>
  );
}

export default App;
