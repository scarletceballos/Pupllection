export const API_BASE = "https://dog.ceo/api";

export function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function buildBreedEntries(breedMap) {
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

export function joinList(items) {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function percent(part, whole) {
  return whole === 0 ? 0 : Math.round((part / whole) * 100);
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

// Returns up to `count` random photos without mutating the original array.
export function samplePhotos(photos, count) {
  const pool = [...photos];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

// Everything the charts, sidebar and "story" text need, derived from the
// fetched data so no number or claim is hard-coded.
export function computeInsights(breeds) {
  if (breeds.length === 0) return null;

  const familyMap = new Map();
  for (const breed of breeds) {
    if (!familyMap.has(breed.family)) {
      familyMap.set(breed.family, {
        family: breed.family,
        label: breed.familyLabel,
        subCount: breed.isSub ? breed.familySize : 0,
      });
    }
  }

  const families = [...familyMap.values()];
  const withSubs = families
    .filter((f) => f.subCount > 0)
    .sort((a, b) => b.subCount - a.subCount || a.label.localeCompare(b.label));

  const subBreedCount = withSubs.reduce((sum, f) => sum + f.subCount, 0);
  const maxSubs = withSubs.length > 0 ? withSubs[0].subCount : 0;
  const averageSubs = withSubs.length > 0 ? subBreedCount / withSubs.length : 0;
  const largestFamilies = withSubs.filter((f) => f.subCount === maxSubs);
  const topThree = withSubs.slice(0, 3);
  const topThreeTotal = topThree.reduce((sum, f) => sum + f.subCount, 0);

  const distribution = [];
  for (let n = 0; n <= maxSubs; n++) {
    distribution.push({
      subs: n,
      label: n === 0 ? "None" : String(n),
      families: families.filter((f) => f.subCount === n).length,
    });
  }

  return {
    familyCount: families.length,
    standaloneCount: families.length - withSubs.length,
    withSubs,
    subBreedCount,
    maxSubs,
    averageSubs,
    largestFamilies,
    topThree,
    topThreeShare: percent(topThreeTotal, subBreedCount),
    biggerThanAverage: withSubs.filter((f) => f.subCount > averageSubs).length,
    distribution,
  };
}
