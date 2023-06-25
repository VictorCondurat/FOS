import db from '../db.js';

export interface Filter {
    id: number;
    name: string;
    options: string[];
}

export class FilterModel {
    static async getAllergens(): Promise<string[]> {
        const result = await db.any('SELECT unnest(enum_range(NULL::allergen))::text AS allergen');
        return result.map(r => r.allergen);
    }

    static async getBrands(): Promise<string[]> {
        const result = await db.any('SELECT unnest(enum_range(NULL::brand))::text AS brand');
        return result.map(r => r.brand);
    }
    static async getGrades(): Promise<string[]> {
        const result = await db.any('SELECT unnest(enum_range(NULL::grade))::text AS grade');
        return result.map(r => r.grade);
    }

    static async getCategories(): Promise<string[]> {
        const result = await db.any('SELECT unnest(enum_range(NULL::category))::text AS category');
        return result.map(r => r.category);
    }
    static async getCountries(): Promise<string[]> {
        const result = await db.any('SELECT unnest(enum_range(NULL::country))::text AS country');
        return result.map(r => r.country);
    }
    static async getLabels(): Promise<string[]> {
        const result = await db.any('SELECT unnest(enum_range(NULL::label))::text AS label');
        return result.map(r => r.label);
    }
    static async getManufacturingPlaces(): Promise<string[]> {
        const result = await db.any('SELECT unnest(enum_range(NULL::manufacturing_place))::text AS manufacturing_place');
        return result.map(r => r.manufacturing_place);
    }

    static async getAll(): Promise<Record<string, string[]>> {
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
