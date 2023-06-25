import { sessions, parseCookies } from '../server.js';
import { User } from '../models/user.js';
import http from 'http';

export class FavoriteController {
    static async addFavorite(req: http.IncomingMessage, res: http.ServerResponse, body: any) {
        console.log("addFavorite");
        const { method } = req;
        if (method === 'POST') {
            console.log("POST");

            const { productId } = body;
            const cookies = parseCookies(req.headers.cookie);
            const sessionId = cookies.get('sessionId');
            console.log("session ID:", sessionId);
            if (sessionId) {
                const username = sessions.get(sessionId);
                console.log("Username:", username);
                if (username) {
                    await User.addFavoriteProduct(username, productId);
                    res.writeHead(200);
                    res.end('Product added to favorites');
                } else {
                    res.writeHead(401);
                    res.end('Session not found');
                }
            } else {
                console.log("Found no Session");
                res.writeHead(401);
                res.end('Session not found');
            }
        } else {
            res.writeHead(405);
            res.end('Method not allowed');
        }
    }
};
