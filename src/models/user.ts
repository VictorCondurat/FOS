import db from '../db.js';
import bcrypt from 'bcrypt';
import pkg from 'lodash';
const { isEqual } = pkg;
export class User {
    id: number;
    email: string;
    password: string;
    username: string;
    allergens: string[];
    brands: string[];
    categories: string[];
    countries: string[];
    grades: string[];
    labels: string[];
    places: string[];
    constructor(
        id: number,
        email: string,
        password: string,
        username: string,
        allergens: string[] = [],
        brands: string[] = [],
        categories: string[] = [],
        countries: string[] = [],
        grades: string[] = [],
        labels: string[] = [],
        places: string[] = []
    ) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.username = username;
        this.allergens = allergens;
        this.brands = brands;
        this.categories = categories;
        this.countries = countries;
        this.grades = grades;
        this.labels = labels;
        this.places = places;
    }

    static async create(email: string, password: string, username: string) {

        try {
            const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
            if (existingUser.length > 0) {
                throw new Error('User with this email already exists');
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await db.query('INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING id', [email, hashedPassword, username]);
            console.log('Running query:', 'INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING id', [email, password, username]);
            console.log('Result:', result);

            if (result.length > 0) {
                const row = result[0];
                return new User(row.id, email, password, username);
            } else {
                throw new Error('User not created');
            }
        } catch (err: unknown) {
            console.error('Error during user creation:', err);
            return null;
        }
    }

    static async addFavoriteProduct(username: string, productId: number) {
        console.log(username);
        console.log(productId);
        try {
            const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);
            if (user && !user.favorites.includes(productId)) {
                await db.query('UPDATE users SET favorites = array_append(favorites, $1) WHERE username = $2', [productId, username]);
                return;
            }
        } catch (error) {
            console.error(error);
            return null;
        }
    }
    static async getUserByUsername(username: string) {
        try {
            const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
            console.log('getUserByUsername result:', result);
            if (result.length > 0) {
                const row = result[0];
                return new User(row.iid, row.email, row.password, row.username);
            } else {
                return null;
            }
        } catch (err: unknown) {
            console.error('Error in getUserByUsername:', err);
            return null;
        }
    }

    static async getUserByInfo(username: string): Promise<User | null> {
        try {
            const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
            if (result.length > 0) {
                const row = result[0];
                console.log('Row:', row);

                return new User(
                    row.id,
                    row.email,
                    row.password,
                    row.username,
                    row.allergents,
                    row.brands,
                    row.categories,
                    row.region,
                    row.grades,
                    row.labels,
                    row.places
                );
            } else {
                return null;
            }
        } catch (err: unknown) {
            console.error('Error in getUserByInfo:', err);
            return null;
        }
    }


    static async updateUser(username: string, email?: string, newUsername?: string): Promise<boolean> {
        try {
            const existingUser = await db.query('SELECT * FROM users WHERE username = $1', [username]);

            if (existingUser.rowCount === 0) {
                throw new Error('User not found');
            }

            let params = [];
            let query = 'UPDATE users SET ';
            let updates = [];

            if (email) {
                const existingUserMail = await db.query('SELECT * FROM users WHERE email = $1', [email]);

                if (existingUserMail.rowCount > 0 && existingUserMail.rows[0].username !== username) {
                    throw new Error('User with this email already exists');
                }

                params.push(email);
                updates.push(`email = $${params.length}`);
            }

            if (newUsername) {
                const existingUserName = await db.query('SELECT * FROM users WHERE username = $1', [newUsername]);

                if (existingUserName.rowCount > 0) {
                    throw new Error('User with this username already exists');
                }

                params.push(newUsername);
                updates.push(`username = $${params.length}`);
            }

            if (updates.length === 0) {
                throw new Error("No fields to update were provided");
            }

            query += updates.join(", ") + ` WHERE username = $${params.length + 1}`;
            params.push(username);

            await db.query(query, params);
            return true;
        } catch (err: unknown) {
            console.error('Error in updateUser:', err);
            return false;
        }
    }
    static async getStatistics(username: string): Promise<{ num_allergens: number, num_grades: number }> {
        const query = `
    SELECT
        COUNT(DISTINCT allergent) AS num_allergens,
        COUNT(DISTINCT grade) AS num_grades
    FROM
        users,
        LATERAL unnest(allergents) AS allergent,
        LATERAL unnest(grades) AS grade
    WHERE
        username = $1
`;


        try {
            const result = await db.query(query, [username]);
            const statistics = result.rows && result.rows.length > 0 ? result.rows[0] : null;
            return statistics;
        } catch (error) {
            console.error('Error retrieving statistics:', error);
            throw error;
        }
    }
    static async updateUserPrefs(username: string, prefs: any): Promise<boolean> {
        try {
            const {
                allergens = [],
                brands = [],
                categories = [],
                countries = [],
                grades = [],
                labels = [],
                places = [],
            } = prefs;

            // Check if the fields were initially non-empty and remain unchanged
            const shouldUpdateAllergens = allergens.length > 0 && !isEqual(allergens, []);
            const shouldUpdateBrands = brands.length > 0 && !isEqual(brands, []);
            const shouldUpdateCategories = categories.length > 0 && !isEqual(categories, []);
            const shouldUpdateGrades = grades.length > 0 && !isEqual(grades, []);
            const shouldUpdateLabels = labels.length > 0 && !isEqual(labels, []);
            const shouldUpdatePlaces = places.length > 0 && !isEqual(places, []);

            const query = `
                UPDATE users
                SET
                    allergents = ${shouldUpdateAllergens ? '$1::allergen[]' : 'allergents'},
                    grades = ${shouldUpdateGrades ? '$2::grade[]' : 'grades'},
                    brands = ${shouldUpdateBrands ? '$3::brand[]' : 'brands'},
                    labels = ${shouldUpdateLabels ? '$4::label[]' : 'labels'},
                    places = ${shouldUpdatePlaces ? '$5::manufacturing_place[]' : 'places'},
                    categories = ${shouldUpdateCategories ? '$6::category[]' : 'categories'},
                    region = ${countries.length > 0 ? '$7::country' : 'region'}
                WHERE username = $8`;

            await db.query(query, [
                shouldUpdateAllergens ? allergens : null,
                shouldUpdateGrades ? grades : null,
                shouldUpdateBrands ? brands : null,
                shouldUpdateLabels ? labels : null,
                shouldUpdatePlaces ? places : null,
                shouldUpdateCategories ? categories : null,
                countries.length > 0 ? countries[0] : null,
                username,
            ]);

            return true;
        } catch (err: unknown) {
            console.error('Error in updateUserPrefs:', err);
            return false;
        }
    }

}


