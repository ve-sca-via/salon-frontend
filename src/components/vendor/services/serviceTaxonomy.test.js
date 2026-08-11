import { describe, it, expect } from 'vitest';
import {
  buildTaxonomyIndex,
  resolveServiceTaxonomy,
  groupServicesByTaxonomy,
  taxonomySearchText,
} from './serviceTaxonomy';

/** Mirrors GET /vendors/service-categories: 3-level tree, level-2 always has a list. */
const categories = [
  {
    id: 'cat-hair',
    name: 'Hair Services',
    subcategories: [
      {
        id: 'sub-textures',
        name: 'Textures & Smoothening',
        subcategories: [
          { id: 'ss-keratin', name: 'Keratin' },
          { id: 'ss-rebonding', name: 'Rebonding' },
        ],
      },
      { id: 'sub-haircut', name: 'Haircut', subcategories: [] },
    ],
  },
  {
    id: 'cat-skin',
    name: 'Skin Services',
    subcategories: [{ id: 'sub-facial', name: 'Facial', subcategories: [] }],
  },
];

const index = buildTaxonomyIndex(categories);

const service = (overrides) => ({
  id: 'svc',
  name: 'Service',
  category_id: 'cat-hair',
  ...overrides,
});

describe('resolveServiceTaxonomy', () => {
  it('resolves a level-2 subcategory id to category + subcategory', () => {
    const result = resolveServiceTaxonomy(service({ subcategory_id: 'sub-haircut' }), index);

    expect(result).toMatchObject({
      categoryId: 'cat-hair',
      categoryName: 'Hair Services',
      subcategoryId: 'sub-haircut',
      subcategoryName: 'Haircut',
      subSubcategoryId: null,
      subSubcategoryName: null,
    });
  });

  it('resolves a level-3 sub-type id back up through its parent subcategory', () => {
    const result = resolveServiceTaxonomy(service({ subcategory_id: 'ss-keratin' }), index);

    expect(result).toMatchObject({
      categoryName: 'Hair Services',
      subcategoryId: 'sub-textures',
      subcategoryName: 'Textures & Smoothening',
      subSubcategoryId: 'ss-keratin',
      subSubcategoryName: 'Keratin',
    });
  });

  it('falls back to the category when no subcategory is stored', () => {
    const result = resolveServiceTaxonomy(service({ subcategory_id: null }), index);

    expect(result.categoryName).toBe('Hair Services');
    expect(result.subcategoryId).toBeNull();
  });

  it('keeps unknown (deactivated) node ids so the edit form still round-trips', () => {
    const result = resolveServiceTaxonomy(service({ subcategory_id: 'sub-retired' }), index);

    expect(result.subcategoryId).toBe('sub-retired');
    expect(result.subcategoryName).toBeNull();
    expect(result.categoryName).toBe('Hair Services');
  });
});

describe('taxonomySearchText', () => {
  it('includes every level so search matches subcategory and sub-type names', () => {
    const taxonomy = resolveServiceTaxonomy(service({ subcategory_id: 'ss-keratin' }), index);

    expect(taxonomySearchText(taxonomy)).toContain('keratin');
    expect(taxonomySearchText(taxonomy)).toContain('textures');
  });
});

describe('groupServicesByTaxonomy', () => {
  const entries = [
    { id: 'a', subcategory_id: 'ss-keratin' },
    { id: 'b', subcategory_id: 'sub-textures' },
    { id: 'c', subcategory_id: 'sub-haircut' },
    { id: 'd', subcategory_id: null },
    { id: 'e', category_id: 'cat-skin', subcategory_id: 'sub-facial' },
  ].map((overrides) => {
    const svc = service(overrides);
    return { service: svc, taxonomy: resolveServiceTaxonomy(svc, index) };
  });

  it('groups into categories in catalog order with subcategory subgroups', () => {
    const groups = groupServicesByTaxonomy(entries, index);

    expect(groups.map((g) => g.categoryName)).toEqual(['Hair Services', 'Skin Services']);

    const hair = groups[0];
    expect(hair.count).toBe(4);
    // Alphabetical, with the no-subcategory bucket last
    expect(hair.subgroups.map((s) => s.subcategoryName)).toEqual([
      'Haircut',
      'Textures & Smoothening',
      'General',
    ]);
    // Both the level-2 and the level-3 service land in the same subgroup
    expect(hair.subgroups[1].services).toHaveLength(2);
  });

  it('sorts services with an unknown category last', () => {
    const orphan = service({ id: 'orphan', category_id: 'cat-gone', subcategory_id: null });
    const groups = groupServicesByTaxonomy(
      [...entries, { service: orphan, taxonomy: resolveServiceTaxonomy(orphan, index) }],
      index
    );

    expect(groups[groups.length - 1].categoryName).toBe('Other Services');
  });
});
