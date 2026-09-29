export interface LabelInput {
  bikeId: string
  brand: string
  /** Model family from bikedb, e.g. "Domane". May be an empty string. */
  family: string
  /** Frame name without generation, e.g. "Domane SL 5". */
  frameName: string
  /** Generation as a string, e.g. "4", or "" when unknown. */
  generation: string
  /** Model year, 0 when unknown. */
  year: number
}

/** One short display label per bikeId, for the bikes currently shown. */
export function displayLabels(bikes: LabelInput[]): Map<string, string> {
  // Step 1: De-duplicate by bikeId, keeping first occurrence and order
  const seenIds = new Set<string>()
  const deduplicated: LabelInput[] = []
  for (const bike of bikes) {
    if (!seenIds.has(bike.bikeId)) {
      seenIds.add(bike.bikeId)
      deduplicated.push(bike)
    }
  }

  // Step 2: Compute base labels
  const baseLabels = new Map<string, string>()
  for (const bike of deduplicated) {
    const baseLabel =
      bike.family === '' ? `${bike.brand} ${bike.frameName}` : `${bike.brand} ${bike.family}`
    baseLabels.set(bike.bikeId, baseLabel)
  }

  // Step 3: Group bikes by base label
  const groupsByLabel = new Map<string, LabelInput[]>()
  for (const bike of deduplicated) {
    const baseLabel = baseLabels.get(bike.bikeId)!
    if (!groupsByLabel.has(baseLabel)) {
      groupsByLabel.set(baseLabel, [])
    }
    groupsByLabel.get(baseLabel)!.push(bike)
  }

  // Step 4: Build labels for each group
  const labels = new Map<string, string>()

  for (const [baseLabel, group] of groupsByLabel) {
    if (group.length === 1) {
      // Single member: just use base label
      labels.set(group[0].bikeId, baseLabel)
    } else {
      // Multiple members: add extra words and generation if needed
      const memberLabels: { bike: LabelInput; label: string }[] = []

      for (const bike of group) {
        let label = baseLabel

        // Get extra words from frameName
        const frameWords = bike.frameName.split(/\s+/).filter((w) => w.length > 0)
        const familyLower = bike.family.toLowerCase()
        const extraWords = frameWords.filter((w) => w.toLowerCase() !== familyLower)

        // Find shared words (case-insensitive comparison)
        const allExtraWords = group.map((b) =>
          b.frameName
            .split(/\s+/)
            .filter((w) => w.length > 0)
            .filter((w) => w.toLowerCase() !== b.family.toLowerCase()),
        )

        const sharedWords = new Set<string>()
        if (allExtraWords.length > 0 && allExtraWords[0].length > 0) {
          for (const word of allExtraWords[0]) {
            if (
              allExtraWords.every((words) =>
                words.some((w) => w.toLowerCase() === word.toLowerCase()),
              )
            ) {
              sharedWords.add(word.toLowerCase())
            }
          }
        }

        // Remove shared words, keeping original spelling from this bike
        const remainingWords = extraWords.filter((w) => !sharedWords.has(w.toLowerCase()))

        // Add remaining words to label
        if (remainingWords.length > 0) {
          label += ' ' + remainingWords.join(' ')
        }

        // Check if we need to add generation
        const allGenerationsSame = new Set(group.map((b) => b.generation)).size === 1

        if (!allGenerationsSame && bike.generation !== '') {
          label += ` Gen ${bike.generation}`
        }

        memberLabels.push({ bike, label })
      }

      // Step 5: Handle identical labels with year disambiguation
      const labelCounts = new Map<string, { bike: LabelInput; label: string }[]>()
      for (const item of memberLabels) {
        if (!labelCounts.has(item.label)) {
          labelCounts.set(item.label, [])
        }
        labelCounts.get(item.label)!.push(item)
      }

      for (const [label, items] of labelCounts) {
        if (items.length === 1) {
          // Unique label, no disambiguation needed
          labels.set(items[0].bike.bikeId, label)
        } else {
          // Multiple items with same label, need disambiguation
          const allYearsDifferent =
            items.every((item) => item.bike.year > 0) &&
            new Set(items.map((item) => item.bike.year)).size === items.length

          if (allYearsDifferent) {
            // Use year disambiguation
            for (const item of items) {
              labels.set(item.bike.bikeId, `${label} (${item.bike.year})`)
            }
          } else {
            // Use numeric disambiguation in input order
            for (let i = 0; i < items.length; i++) {
              labels.set(items[i].bike.bikeId, `${label} (${i + 1})`)
            }
          }
        }
      }
    }
  }

  return labels
}
