import db from '../db.js';

export class ListsModel {
    static async getListsByUser(username: string) {
        console.log("Model username", username);
        const query = 'SELECT * FROM lists WHERE user_id=(SELECT id FROM users WHERE username=$1)';
        console.log("Query", query);
        const values = [username];
        const result = await db.query(query, values);
        console.log("Query result:", result);
        return [...result] || [];
    }

    static async addListForUser(name: string, username: string) {
        if (!name) {
            throw new Error("List name cannot be null or empty.");
        }
        const existingListQuery = 'SELECT * FROM lists WHERE name = $1 AND user_id = (SELECT id FROM users WHERE username = $2)';
        const existingListValues = [name, username];
        const existingListResult = await db.query(existingListQuery, existingListValues);

        if (existingListResult.length > 0) {
            throw new Error(`A list with the name "${name}" already exists for the user "${username}".`);
        }
        const query = 'INSERT INTO lists(name, user_id) VALUES($1, (SELECT id FROM users WHERE username=$2)) RETURNING *';
        console.log("Query to add list:", query);
        const values = [name, username];
        console.log("Query values:", values);
        return await db.query(query, values);
    }
    static async addItemToList(listId: number, productId: number) {
        const res = await db.query(`
            UPDATE public.lists
            SET items = array_append(items, $1)
            WHERE list_id = $2
        `, [productId, listId]);

        return res.rowCount > 0;
    }
    static async removeItemFromList(listId: number, productId: number) {
        const res = await db.query(`
            UPDATE public.lists
            SET items = array_remove(items, $1)
            WHERE list_id = $2
        `, [productId, listId]);
        return res.rowCount > 0;
    }
}
