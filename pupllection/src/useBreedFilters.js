import { useMemo, useState } from "react";

export const PAGE_SIZE = 12;

// Filter state lives in App (via this hook) so it survives navigating to a
// detail page and back.
export function useBreedFilters(breeds, favorites) {
  const [search, setSearch] = useState("");
  const [familyFilter, setFamilyFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("all");
  const [minSize, setMinSize] = useState("");
  const [maxSize, setMaxSize] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState("az");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

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

      return matchesName && matchesFamily && matchesType && matchesSize && matchesFavorite;
    });

    return matches.sort((a, b) =>
      sortOrder === "az" ? a.label.localeCompare(b.label) : b.label.localeCompare(a.label)
    );
  }, [breeds, search, familyFilter, typeFilter, minSize, maxSize, favoritesOnly, favorites, sortOrder]);

  const visibleBreeds = filteredBreeds.slice(0, visibleCount);

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

  // Used by the "try these filters" suggestions: reset, then apply a preset.
  function applyPreset({ type = "all", family = "All", min = "" } = {}) {
    resetFilters();
    setTypeFilter(type);
    setFamilyFilter(family);
    setMinSize(min === "" ? "" : String(min));
  }

  function surpriseMe() {
    if (breeds.length === 0) return;
    const pick = breeds[Math.floor(Math.random() * breeds.length)];
    resetFilters();
    setSearch(pick.label);
  }

  function showMore() {
    setVisibleCount((count) => count + PAGE_SIZE);
  }

  return {
    search,
    familyFilter,
    typeFilter,
    minSize,
    maxSize,
    favoritesOnly,
    sortOrder,
    setSearch,
    setFamilyFilter,
    setTypeFilter,
    setMinSize,
    setMaxSize,
    setSortOrder,
    families,
    filteredBreeds,
    visibleBreeds,
    updateFilter,
    toggleFavoritesOnly,
    resetFilters,
    applyPreset,
    surpriseMe,
    showMore,
  };
}
