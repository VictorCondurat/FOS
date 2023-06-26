import db from '../db.js';
export class ListsModel {
    static async getListsByUser(username) {
        console.log("Model username", username);
        const query = 'SELECT * FROM lists WHERE user_id=(SELECT id FROM users WHERE username=$1)';
        console.log("Query", query);
        const values = [username];
        const result = await db.query(query, values);
        console.log("Query result:", result);
        return [...result] || [];
    }
    static async addListForUser(name, username) {
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
    static async addItemToList(listId, productId) {
        const res = await db.query(`
            UPDATE public.lists
            SET items = array_append(items, $1)
            WHERE list_id = $2
        `, [productId, listId]);
        return res.rowCount > 0;
    }
    static async removeItemFromList(listId, productId) {
        console.log("List+Id Removal", listId, productId);
        try {
            await db.query(`
            UPDATE public.lists
            SET items = array_remove(items, $1::text)
            WHERE list_id = $2
        `, [productId.toString(), listId]);
            return true; //return true when the item is removed successfully
        }
        catch (error) {
            console.error("An error occurred while removing item from list: ", error);
            return false;
        }
    }
    static async removeList(listId) {
        try {
            const res = await db.query(`
        DELETE FROM public.lists
        WHERE list_id = $1
    `, [listId]);
        }
        catch (error) {
            console.log(`Error removing list: ${error.message}`);
            return false;
        }
        return true;
    }
    static async getProductIdsForList(listId) {
        const list = await db.oneOrNone('SELECT items FROM lists WHERE list_id = $1', [listId]);
        console.log("Product Lists", list);
        if (list && list.items.length > 0) {
            return list.items;
        }
        else {
            throw new Error(`List with id ${listId} has no products`);
        }
    }
}
