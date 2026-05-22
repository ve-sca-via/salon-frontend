export const OTHERS_SUBCATEGORY_NAME = 'Others';

export const isOthersSubcategory = (subcategory) =>
  subcategory?.name?.trim().toLowerCase() === 'others';

export const findOthersSubcategory = (category) => {
  if (!category?.subcategories?.length) return null;
  return category.subcategories.find(isOthersSubcategory) || null;
};

/** Catalog subcategories first, "Others" last */
export const orderSubcategoriesForDisplay = (subcategories = []) => {
  const rest = [];
  const others = [];
  subcategories.forEach((sub) => {
    if (isOthersSubcategory(sub)) others.push(sub);
    else rest.push(sub);
  });
  return [...rest, ...others];
};

export const resolveCategoryById = (categories, categoryId) =>
  categories.find((c) => c.id === categoryId) || null;
