import { sessions } from '../server.js';
import { ListsModel } from '../models/ListsModel.js';
export class ListController {
    static async getLists(req, res) {
        console.log("Get lists activated");
        try {
            const sessionId = req.headers.cookie.split('=')[1];
            const username = sessions.get(sessionId);
            console.log("Username", username);
            if (!username) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not authenticated' }));
                return;
            }
            const result = await ListsModel.getListsByUser(username);
            console.log("Result", result);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        }
        catch (error) {
            res.writeHead(500);
            res.end(`Error: ${error.message}`);
        }
    }
    static async addList(req, res, body) {
        try {
            const sessionId = req.headers.cookie.split('=')[1];
            const username = sessions.get(sessionId);
            if (!username) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not authenticated' }));
                return;
            }
            const result = await ListsModel.addListForUser(body.name, username);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result[0]));
        }
        catch (error) {
            res.writeHead(500);
            res.end(`Error: ${error.message}`);
        }
    }
    static async addItem(req, res, body) {
        try {
            const sessionId = req.headers.cookie.split('=')[1];
            const username = sessions.get(sessionId);
            if (!username) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not authenticated' }));
                return;
            }
            const result = await ListsModel.addItemToList(body.listId, body.productId);
            if (result) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: "Item successfully added to list" }));
            }
            else {
                throw new Error("Failed to add item to list");
            }
        }
        catch (error) {
            res.writeHead(500);
            res.end(`Error: ${error.message}`);
        }
    }
    static async removeItem(req, res, body) {
        try {
            const sessionId = req.headers.cookie.split('=')[1];
            const username = sessions.get(sessionId);
            if (!username) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not authenticated' }));
                return;
            }
            const result = await ListsModel.removeItemFromList(body.listId, body.productId);
            if (result) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: "Item successfully removed from list" }));
            }
            else {
                throw new Error("Failed to remove item from list");
            }
        }
        catch (error) {
            res.writeHead(500);
            res.end(`Error: ${error.message}`);
        }
    }
}
