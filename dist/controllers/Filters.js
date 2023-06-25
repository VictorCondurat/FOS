import db from '../db';
export class FilterModel {
    static async getAllergens() {
        const result = await db.any('SELECT unnest(enum_range(NULL::allergen))::text AS allergen');
        return result.map(r => r.allergen);
    }
    static async getBrands() {
        const result = await db.any('SELECT unnest(enum_range(NULL::brand))::text AS brand');
        return result.map(r => r.brand);
    }
    static async getGrades() {
        const result = await db.any('SELECT unnest(enum_range(NULL::grade))::text AS grade');
        return result.map(r => r.grade);
    }
    static async getCategories() {
        const result = await db.any('SELECT unnest(enum_range(NULL::category))::text AS category');
        return result.map(r => r.category);
    }
    static async getCountries() {
        const result = await db.any('SELECT unnest(enum_range(NULL::country))::text AS country');
        return result.map(r => r.country);
    }
    static async getLabels() {
        const result = await db.any('SELECT unnest(enum_range(NULL::label))::text AS label');
        return result.map(r => r.label);
    }
    static async getManufacturingPlaces() {
        const result = await db.any('SELECT unnest(enum_range(NULL::manufacturing_places))::text AS manufacturing_places');
        return result.map(r => r.manufacturing_places);
    }
    static async getAll() {
        return {
            allergens: await FilterModel.getAllergens(),
            brands: await FilterModel.getBrands(),
            categories: await FilterModel.getCategories(),
            countries: await FilterModel.getCountries(),
            grades: await FilterModel.getGrades(),
            labels: await FilterModel.getLabels(),
            manufacturing_places: await FilterModel.getManufacturingPlaces()
        };
    }
}
