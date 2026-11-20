const EMPTY_DOCUMENT = {
  entries: [],
  pet: null,
  entryTombstones: {},
  petUpdatedAt: 0,
};

export function normalizeSyncDocument(value) {
  const entries = Array.isArray(value?.entries)
    ? value.entries.filter(entry => entry && typeof entry.id === 'string' && typeof entry.date === 'string')
    : [];
  const entryTombstones = {};
  if (value?.entryTombstones && typeof value.entryTombstones === 'object' && !Array.isArray(value.entryTombstones)) {
    for (const [id, timestamp] of Object.entries(value.entryTombstones)) {
      const normalized = Number(timestamp);
      if (id && Number.isFinite(normalized) && normalized > 0) entryTombstones[id] = normalized;
    }
  }
  return {
    ...EMPTY_DOCUMENT,
    ...value,
    entries,
    pet: value?.pet && typeof value.pet === 'object' && !Array.isArray(value.pet) ? value.pet : null,
    entryTombstones,
    petUpdatedAt: Number.isFinite(Number(value?.petUpdatedAt)) ? Number(value.petUpdatedAt) : 0,
  };
}

export function mergeSyncDocuments(primaryValue, secondaryValue) {
  const primary = normalizeSyncDocument(primaryValue);
  const secondary = normalizeSyncDocument(secondaryValue);
  const entryTombstones = { ...primary.entryTombstones };
  for (const [id, timestamp] of Object.entries(secondary.entryTombstones)) {
    entryTombstones[id] = Math.max(entryTombstones[id] || 0, timestamp);
  }

  const entriesById = new Map();
  for (const entry of [...secondary.entries, ...primary.entries]) {
    const current = entriesById.get(entry.id);
    if (!current || (Number(entry.updatedAt) || 0) > (Number(current.updatedAt) || 0)) entriesById.set(entry.id, entry);
  }
  const entries = [...entriesById.values()].filter(entry =>
    (entryTombstones[entry.id] || 0) < (Number(entry.updatedAt) || 0)
  );

  const primaryPetTime = primary.petUpdatedAt;
  const secondaryPetTime = secondary.petUpdatedAt;
  return {
    entries,
    entryTombstones,
    pet: primaryPetTime >= secondaryPetTime ? primary.pet : secondary.pet,
    petUpdatedAt: Math.max(primaryPetTime, secondaryPetTime),
  };
}

export function sameSyncDocument(leftValue, rightValue) {
  const left = normalizeSyncDocument(leftValue);
  const right = normalizeSyncDocument(rightValue);
  const canonical = document => ({
    ...document,
    entries: [...document.entries].sort((a, b) => a.id.localeCompare(b.id)),
    entryTombstones: Object.fromEntries(Object.entries(document.entryTombstones).sort(([a], [b]) => a.localeCompare(b))),
  });
  return JSON.stringify(canonical(left)) === JSON.stringify(canonical(right));
}
