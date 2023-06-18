import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';
import { UserController } from './controllers/UserController.js';
import querystring from 'querystring';
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
const server = http.createServer(async (req, res) => {
    const requestUrl = req.url || '/';
    console.log("Url:", req.url);
    if (req.method === 'POST') {
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
                UserController.login(body, req, res);
            }
            else if (requestUrl === '/sign-up') {
                UserController.signup(body, req, res);
            }
            if (requestUrl === '/logout') {
                res.setHeader('Set-Cookie', `username=; HttpOnly; Max-Age=0;`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Logout successful' }));
            }
        });
    }
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
                resolve(); // Resolve the promise once the request body is fully processed
            });
            req.on('error', (err) => {
                reject(err); // Reject the promise if there's an error
            });
        });
        if (requestUrl === '/update-profile') {
            UserController.updateUser(body, req, res);
        }
    }
    else {
        if (req.method === 'GET') {
            if (requestUrl === '/user-info') {
                UserController.getUserInfo(req, res);
                return;
            }
        }
        let filePath = path.join(__dirname, requestUrl);
        console.log(filePath);
        if (requestUrl === '/') {
            filePath = path.join(__dirname, 'views', 'index.html');
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
        else if (requestUrl === '/dashboard.html') {
            const cookies = req.headers.cookie?.split(';');
            const usernameCookie = cookies?.find(cookie => cookie.trim().startsWith('username='));
            if (usernameCookie) {
                filePath = path.join(__dirname, 'views', 'dashboard.html');
            }
            else {
                filePath = path.join(__dirname, 'views', 'login.html');
            }
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
});
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
