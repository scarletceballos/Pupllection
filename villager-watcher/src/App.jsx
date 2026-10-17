import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE = "https://dog.ceo/api";
const PAGE_SIZE = 12;
const FAVORITES_KEY = "pupllection-favorites";
const FLOATERS = ["", "🐾", "🦴", "", "🐾", "🎾", "", "🦴", "🐾", ""];
const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "standalone", label: "Standalone" },
  { value: "sub", label: "Sub-breeds" },
];

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function buildBreedEntries(breedMap) {
  const entries = [];

  for (const [breed, subBreeds] of Object.entries(breedMap)) {
    const family = {
      family: breed,
      familyLabel: capitalize(breed),
      familySize: Math.max(subBreeds.length, 1),
    };

    if (subBreeds.length === 0) {
      entries.push({
        ...family,
        id: breed,
        label: capitalize(breed),
        path: `breed/${breed}`,
        isSub: false,
      });
      continue;
    }

    for (const sub of subBreeds) {
      entries.push({
        ...family,
        id: `${breed}-${sub}`,
        label: `${capitalize(breed)} ${capitalize(sub)}`,
        path: `breed/${breed}/${sub}`,
        isSub: true,
      });
    }
  }

  return entries;
}

function loadFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
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
            <img
              src={imageUrl}
              alt={`${breed.label} photo`}
              loading="lazy"
              onError={() => setStatus("failed")}
            />
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
          <h3>{breed.label}</h3>

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

function App() {
  const [breeds, setBreeds] = useState([]);
  const [search, setSearch] = useState("");
  const [familyFilter, setFamilyFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("all");
  const [minSize, setMinSize] = useState("");
  const [maxSize, setMaxSize] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState("az");
  const [favorites, setFavorites] = useState(loadFavorites);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
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
          setError(
            "We couldn't reach the dog API. Check your internet connection and try again."
          );
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

  const families = useMemo(() => {
    const unique = new Map(breeds.map((breed) => [breed.family, breed.familyLabel]));
    return [...unique].sort((a, b) => a[1].localeCompare(b[1]));
  }, [breeds]);

  const filteredBreeds = useMemo(() => {
    const query = search.trim().toLowerCase();
    const min = minSize === "" ? 0 : Number(minSize);
    const max = maxSize === "" ? Infinity : Number(maxSize);

    const matches = breeds.filter((breed) => {
      const matchesName = breed.label.toLowerCase().includes(query);
      const matchesFamily = familyFilter === "All" || breed.family === familyFilter;
      const matchesType =
        typeFilter === "all" || (typeFilter === "sub") === breed.isSub;
      const matchesSize = breed.familySize >= min && breed.familySize <= max;
      const matchesFavorite = !favoritesOnly || favorites.includes(breed.id);

      return (
        matchesName &&
        matchesFamily &&
        matchesType &&
        matchesSize &&
        matchesFavorite
      );
    });

    return matches.sort((a, b) =>
      sortOrder === "az"
        ? a.label.localeCompare(b.label)
        : b.label.localeCompare(a.label)
    );
  }, [
    breeds,
    search,
    familyFilter,
    typeFilter,
    minSize,
    maxSize,
    favoritesOnly,
    favorites,
    sortOrder,
  ]);

  const visibleBreeds = filteredBreeds.slice(0, visibleCount);

  const breedFamilyCount = families.length;

  const subBreedCount = useMemo(
    () => breeds.filter((breed) => breed.isSub).length,
    [breeds]
  );

  const largestFamily = useMemo(
    () =>
      breeds.reduce(
        (largest, breed) =>
          !largest || breed.familySize > largest.familySize ? breed : largest,
        null
      ),
    [breeds]
  );

  function updateFilter(setter) {
    return (event) => {
      setter(event.target.value);
      setVisibleCount(PAGE_SIZE);
    };
  }

  function toggleFavoritesOnly(event) {
    setFavoritesOnly(event.target.checked);
    setVisibleCount(PAGE_SIZE);
  }

  function toggleFavorite(id) {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((favoriteId) => favoriteId !== id)
        : [...current, id]
    );
  }

  function resetFilters() {
    setSearch("");
    setFamilyFilter("All");
    setTypeFilter("all");
    setMinSize("");
    setMaxSize("");
    setFavoritesOnly(false);
    setSortOrder("az");
    setVisibleCount(PAGE_SIZE);
  }

  function surpriseMe() {
    if (breeds.length === 0) {
      return;
    }

    const pick = breeds[Math.floor(Math.random() * breeds.length)];

    resetFilters();
    setSearch(pick.label);
  }

  return (
    <div className="site-shell">
      <div className="bubble-field" aria-hidden="true">
        {FLOATERS.map((icon, index) => (
          <span key={index} className="floater">
            {icon}
          </span>
        ))}
      </div>

      <header className="site-header">
        <a className="brand" href="#" aria-label="Pupllection home">
          <span className="brand-icon">🐶</span>
          <span>Pupllection</span>
        </a>

        <span className="header-label">A GALLERY OF GOOD DOGGIES</span>
      </header>

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
            Browse dog breeds and sub-breeds, then shuffle through random photos
            of each one until you find your next best friend.
          </p>
        </section>

        <section className="stats-grid" aria-label="Dog statistics">
          <article className="stat-card">
            <span className="stat-icon">🐕</span>
            <p className="stat-label">Breed families</p>
            <h2>{breedFamilyCount.toLocaleString()}</h2>
            <p className="stat-note">Top-level breeds in the API</p>
          </article>

          <article className="stat-card">
            <span className="stat-icon">🦴</span>
            <p className="stat-label">Sub-breeds</p>
            <h2>{subBreedCount.toLocaleString()}</h2>
            <p className="stat-note">Varieties within a breed</p>
          </article>

          <article className="stat-card">
            <span className="stat-icon">🏆</span>
            <p className="stat-label">Largest family</p>
            <h2 className="stat-highlight">
              {largestFamily ? largestFamily.familyLabel : "-"}
            </h2>
            <p className="stat-note">
              {largestFamily
                ? `${largestFamily.familySize} varieties`
                : "Calculated from loaded data"}
            </p>
          </article>

          <article className="stat-card">
            <span className="stat-icon">🎾</span>
            <p className="stat-label">Showing now</p>
            <h2>{filteredBreeds.length.toLocaleString()}</h2>
            <p className="stat-note">Matches your filters</p>
          </article>
        </section>

        <div className="paw-trail" aria-hidden="true">
          <span>🐾</span>
          <span>🐾</span>
          <span>🐾</span>
          <span>🐾</span>
          <span>🐾</span>
        </div>

        <section className="directory-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE BREED GALLERY</span>
              <h2>Find your pup</h2>
              <p>Search and filter breeds, then save the ones you love</p>
            </div>

            <span className="result-count">
              {filteredBreeds.length} breeds
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
              <input
                type="checkbox"
                checked={favoritesOnly}
                onChange={toggleFavoritesOnly}
              />
              <span>♥ Favorites only ({favorites.length})</span>
            </label>

            <div className="filter-actions">
              <button
                type="button"
                className="surprise-button"
                onClick={surpriseMe}
                disabled={breeds.length === 0}
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
              <button type="button" onClick={() => setReloadKey((key) => key + 1)}>
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
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>

              {visibleCount < filteredBreeds.length && (
                <div className="load-more">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                  >
                    Show more breeds
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <footer className="site-footer">
          <span>🐶 Woof Woof 🐶</span>
          <span>Photos and breed list from Dog CEO</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
