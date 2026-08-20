/**
 * Service taxonomy helpers.
 *
 * The catalog is a 3-level tree returned by GET /vendors/service-categories:
 *
 *   category                  e.g. "Hair Services"
 *     subcategory             e.g. "Textures & Smoothening"
 *       sub-subcategory       e.g. "Keratin"   (optional "sub-type")
 *
 * A service row only stores `category_id` plus `subcategory_id`, and that
 * `subcategory_id` holds the DEEPEST node the vendor picked — it may point at a
 * level-2 subcategory OR a level-3 sub-type. These helpers turn that single id
 * back into the full readable path so the UI can group and label services.
 */

export const UNCATEGORISED_LABEL = 'Other Services';
export const NO_SUBCATEGORY_LABEL = 'General';

/**
 * Flatten the category tree into id -> path lookups.
 * Built once per categories payload so per-service resolution stays O(1)
 * instead of re-walking the tree for every card.
 *
 * @param {Array} categories - tree from useGetServiceCategoriesQuery
 * @returns {{ byNode: Map, byCategory: Map, categoryOrder: Map }}
 */
export const buildTaxonomyIndex = (categories = []) => {
  const byNode = new Map();
  const byCategory = new Map();
  const categoryOrder = new Map();

  categories.forEach((category, index) => {
    byCategory.set(category.id, category);
    categoryOrder.set(category.id, index);

    (category.subcategories || []).forEach((sub) => {
      byNode.set(sub.id, {
        categoryId: category.id,
        categoryName: category.name,
        subcategoryId: sub.id,
        subcategoryName: sub.name,
        subSubcategoryId: null,
        subSubcategoryName: null,
      });

      (sub.subcategories || []).forEach((subSub) => {
        byNode.set(subSub.id, {
          categoryId: category.id,
          categoryName: category.name,
          subcategoryId: sub.id,
          subcategoryName: sub.name,
          subSubcategoryId: subSub.id,
          subSubcategoryName: subSub.name,
        });
      });
    });
  });

  return { byNode, byCategory, categoryOrder };
};

/**
 * Resolve one service into its full taxonomy path.
 *
 * Falls back gracefully when the stored node is missing from the tree (it was
 * deactivated in the catalog): the ids are preserved so the edit form still
 * round-trips, but the names come back null and the UI shows a neutral label.
 *
 * @returns {{categoryId, categoryName, subcategoryId, subcategoryName, subSubcategoryId, subSubcategoryName}}
 */
export const resolveServiceTaxonomy = (service, index) => {
  const node = service?.subcategory_id ? index.byNode.get(service.subcategory_id) : null;

  if (node) {
    return { ...node };
  }

  const category = service?.category_id ? index.byCategory.get(service.category_id) : null;

  return {
    categoryId: service?.category_id || null,
    // `service.category` is only present on some API shapes; keep it as a hint.
    categoryName: category?.name || service?.category || null,
    subcategoryId: service?.subcategory_id || null,
    subcategoryName: null,
    subSubcategoryId: null,
    subSubcategoryName: null,
  };
};

/** Every name in the path, for search matching. */
export const taxonomySearchText = (taxonomy) =>
  [taxonomy?.categoryName, taxonomy?.subcategoryName, taxonomy?.subSubcategoryName]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

/**
 * Group services into category sections, each holding subcategory sub-groups.
 *
 * Categories keep their catalog display_order; unknown ones sort last. Within a
 * category, subcategories sort alphabetically with the "General" bucket
 * (services saved without a subcategory) last.
 *
 * @param {Array<{service: Object, taxonomy: Object}>} entries
 * @param {Object} index - from buildTaxonomyIndex
 * @returns {Array<{categoryId, categoryName, count, subgroups: Array}>}
 */
export const groupServicesByTaxonomy = (entries, index) => {
  const categoryGroups = new Map();

  entries.forEach(({ service, taxonomy }) => {
    const categoryId = taxonomy.categoryId || '__uncategorised__';
    if (!categoryGroups.has(categoryId)) {
      categoryGroups.set(categoryId, {
        categoryId,
        categoryName: taxonomy.categoryName || UNCATEGORISED_LABEL,
        count: 0,
        subgroupMap: new Map(),
      });
    }

    const group = categoryGroups.get(categoryId);
    group.count += 1;

    const subcategoryId = taxonomy.subcategoryId || '__none__';
    if (!group.subgroupMap.has(subcategoryId)) {
      group.subgroupMap.set(subcategoryId, {
        subcategoryId,
        subcategoryName: taxonomy.subcategoryName || NO_SUBCATEGORY_LABEL,
        services: [],
      });
    }
    group.subgroupMap.get(subcategoryId).services.push({ service, taxonomy });
  });

  const orderOf = (categoryId) =>
    index.categoryOrder.has(categoryId)
      ? index.categoryOrder.get(categoryId)
      : Number.MAX_SAFE_INTEGER;

  return Array.from(categoryGroups.values())
    .map(({ subgroupMap, ...group }) => ({
      ...group,
      subgroups: Array.from(subgroupMap.values()).sort((a, b) => {
        if (a.subcategoryId === '__none__') return 1;
        if (b.subcategoryId === '__none__') return -1;
        return a.subcategoryName.localeCompare(b.subcategoryName);
      }),
    }))
    .sort((a, b) => {
      const diff = orderOf(a.categoryId) - orderOf(b.categoryId);
      return diff !== 0 ? diff : a.categoryName.localeCompare(b.categoryName);
    });
};
