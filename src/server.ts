import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';
import crypto from 'crypto';
import { UserController } from './controllers/UserController.js';
import querystring from 'querystring';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const hostname = '127.0.0.1';
const port = 3000;


const mimeTypes: { [key: string]: string } = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.woff': 'application/font-woff',
    '.woff2': 'application/font-woff2',
};

export const sessions: Map<string, string> = new Map();

export function generateSessionId(): string {
    return crypto.randomBytes(16).toString('hex');
}

const server = http.createServer(async (req, res) => {
    /* ruta default */
    const requestUrl = req.url || '/';

    console.log("Url:", req.url);

    /* GET REQUESTS */
    if (req.method === 'GET') {

        let filePath = path.join(__dirname, requestUrl);
        console.log(filePath);

        /* creare path fisiere in functie de tipul de resursa ceruta */
        if (requestUrl === '/') {
            filePath = path.join(__dirname, 'views', 'index.html');
        }
        else if (requestUrl === '/dashboard.html') {
            const cookies = req.headers.cookie?.split(';');
            const sessionIdCookie = cookies?.find(cookie => cookie.trim().startsWith('sessionId='));
            /* Daca avem cookie cu sessionId intram in dashboard, altfel redirectionam la pagina de login */
            if (sessionIdCookie) {
                filePath = path.join(__dirname, 'views', 'dashboard.html');
            } else {
                filePath = path.join(__dirname, 'views', 'login.html');
            }
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

        else {
            filePath = path.join(__dirname, 'views', path.basename(requestUrl));
        }
        const extname = String(path.extname(filePath)).toLowerCase();
        const contentType = mimeTypes[extname] || 'application/octet-stream';
        try {
            const content = await fs.readFile(filePath);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        } catch (error) {
            res.writeHead(500);
            res.end(`Sorry, an error occurred: ${(error as { code: string }).code}`);
        }
    }
    /* POST REQUESTS */
    else if (req.method === 'POST') {
        let body: any = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
                body = querystring.parse(body);
            } else if (req.headers['content-type'] === 'application/json') {
                body = JSON.parse(body);
            }

            if (requestUrl === '/login') {
                UserController.login(body, res);
            } else if (requestUrl === '/sign-up') {
                UserController.signup(body, res);
            }
            else if (requestUrl === '/logout') {
                UserController.logout(req, res);
            }

        });
    }
    /* PUT REQUESTS */
    else if (req.method === 'PUT') {
        let body: any = '';
        await new Promise<void>((resolve, reject) => {
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
                    body = querystring.parse(body);
                } else if (req.headers['content-type'] === 'application/json') {
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

});
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
