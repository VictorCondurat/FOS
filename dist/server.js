import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';
import crypto from 'crypto';
import querystring from 'querystring';
import { UserController } from './controllers/UserController.js';
import { FilterController } from './controllers/FilterController.js';
import { ProductController } from './controllers/ProductController.js';
import { FavoriteController } from './controllers/FavoriteController.js';
import { ListController } from './controllers/ListController.js';
import { FilterModel } from './models/Filters.js';
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const hostname = '127.0.0.1';
const port = 3000;
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.woff': 'application/font-woff',
    '.woff2': 'application/font-woff2',
};
export const sessions = new Map();
export function generateSessionId() {
    return crypto.randomBytes(16).toString('hex');
}
export function parseCookies(cookie) {
    const list = {};
    cookie && cookie.split(';').forEach(cookie => {
        const parts = cookie.split('=');
        if (parts.length > 0) {
            const key = parts.shift();
            if (key) {
                list[key.trim()] = decodeURI(parts.join('='));
            }
        }
    });
    return new Map(Object.entries(list));
}
const server = http.createServer(async (req, res) => {
    /* ruta default */
    const requestUrl = req.url || '/';
    console.log("Url:", req.url);
    /* GET REQUESTS */
    if (req.method === 'GET') {
        let filePath = path.join(__dirname, requestUrl);
        console.log(filePath);
        if (requestUrl === '/') {
            filePath = path.join(__dirname, 'views', 'index.html');
        }
        else if (requestUrl === '/dashboard.html') {
            const cookies = req.headers.cookie?.split(';');
            const sessionIdCookie = cookies?.find(cookie => cookie.trim().startsWith('sessionId='));
            if (sessionIdCookie) {
                filePath = path.join(__dirname, 'views', 'dashboard.html');
            }
            else {
                filePath = path.join(__dirname, 'views', 'login.html');
            }
        }
        else if (requestUrl === '/user-info') {
            UserController.getUserInfo(req, res);
            return;
        }
        else if (requestUrl === '/get-favorites') {
            console.log("Called the Get favorites server route");
            UserController.getFavorites(req, res);
            return;
        }
        else if (requestUrl === '/filter') {
            try {
                const filters = await FilterModel.getAll();
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                res.end(JSON.stringify(filters));
                return;
            }
            catch (error) {
                console.error(error);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
                return;
            }
        }
        else if (requestUrl === '/statistics') {
            UserController.getStats(req, res);
            return;
        }
        else if (requestUrl.startsWith('/styles')) {
            filePath = path.join(__dirname, 'views', requestUrl);
        }
        else if (requestUrl.startsWith('/scripts')) {
            filePath = path.join(__dirname, 'views', 'scripts', path.basename(requestUrl).replace('.ts', '.js'));
        }
        else if (requestUrl.startsWith('/images')) {
            filePath = path.join(__dirname, '..', 'public', requestUrl);
        }
        else if (requestUrl === '/filters') {
            FilterController.getFilters(req, res);
            return;
        }
        else if (requestUrl === '/statistics/pdf') {
            UserController.exportStatsPdf(req, res);
            return;
        }
        else if (requestUrl === '/statistics/json') {
            UserController.exportStatsJson(req, res);
            return;
        }
        else if (requestUrl === '/export-user-info') {
            UserController.exportUserInfo(req, res);
            return;
        }
        else if (url.parse(requestUrl).pathname === '/products') {
            ProductController.getProducts(req, res);
            return;
        }
        else if (url.parse(requestUrl).pathname === '/product.html') {
            const params = new URLSearchParams(url.parse(requestUrl).search || "");
            const productId = params.get('productId');
            console.log("Server Received product id", productId);
            ProductController.getProductDetail(req, res, productId);
            return;
        }
        else if (requestUrl === '/lists') {
            console.log("Server side get lists");
            ListController.getLists(req, res);
            return;
        }
        else {
            filePath = path.join(__dirname, 'views', path.basename(requestUrl));
        }
        const extname = String(path.extname(filePath)).toLowerCase();
        const contentType = mimeTypes[extname] || 'application/octet-stream';
        try {
            const content = await fs.readFile(filePath);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
        catch (error) {
            res.writeHead(500);
            res.end(`Sorry, an error occurred: ${error.code}`);
        }
    }
    /* POST REQUESTS */
    else if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
                body = querystring.parse(body);
            }
            else if (req.headers['content-type'] === 'application/json') {
                body = JSON.parse(body);
            }
            if (requestUrl === '/login') {
                UserController.login(body, res);
            }
            else if (requestUrl === '/sign-up') {
                UserController.signup(body, res);
            }
            else if (requestUrl === '/logout') {
                UserController.logout(req, res);
            }
            else if (requestUrl === '/lists') {
                ListController.addList(req, res, body);
            }
            else if (requestUrl === '/lists/addItem') {
                ListController.addItem(req, res, body);
            }
            else if (requestUrl == '/favorite') {
                FavoriteController.addFavorite(req, res, body);
            }
            else if (requestUrl === '/update-prefs') {
                UserController.updateUserPrefs(body, req, res);
            }
            else if (requestUrl === '/products/multiple') {
                UserController.getListProducts(body, res);
            }
            else if (requestUrl === '/products/filtered') {
                console.log("Entered Filtered products");
                console.log("request body", body);
                console.log(req.headers);
                ProductController.getFilteredProducts(body, res);
            }
        });
    }
    /* PUT REQUESTS */
    else if (req.method === 'PUT') {
        let body = '';
        await new Promise((resolve, reject) => {
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
                    body = querystring.parse(body);
                }
                else if (req.headers['content-type'] === 'application/json') {
                    body = JSON.parse(body);
                }
                resolve();
            });
            req.on('error', (err) => {
                reject(err);
            });
        });
        if (requestUrl === '/update-profile') {
            UserController.updateUser(body, req, res);
        }
    }
    /* DELETE REQUESTS */
    else if (req.method === 'DELETE') {
        const requestUrl = req.url || '';
        if (requestUrl.startsWith('/favorites/remove/')) {
            const productId = requestUrl.split('/').pop() || '';
            UserController.removeProduct(productId, req, res);
        }
        else if (requestUrl.startsWith('/lists/') && requestUrl.includes('/products/')) {
            const paths = requestUrl.split('/');
            const listId = paths[2];
            const productId = paths[4];
            ListController.removeItem(listId, productId, req, res);
        }
        else if (requestUrl.startsWith('/lists/')) {
            console.log("request", req);
            ListController.removeList(req, res);
        }
    }
});
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
