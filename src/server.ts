import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';
import oracledb from 'oracledb';
import querystring from 'querystring';
import { parse, serialize } from 'cookie';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const hostname = '127.0.0.1';
const port = 3000;

const dbConfig = {
    user: 'student',
    password: 'student',
    connectString: '//localhost:1521/xe',
};

interface User {
    uname: string;
    email: string;
    password: string;
    preferredFoods: string[];
    alergen: string;
    diet: string;
}

const sessionCookieName = 'session';
const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const server = http.createServer(async (req, res) => {
    const requestUrl = req.url || '/';
    if (requestUrl === '/login' && req.method === 'POST') {
        const requestBody = await new Promise<string>((resolve, reject) => {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk.toString();
            });
            req.on('end', () => {
                resolve(body);
            });
            req.on('error', (error) => {
                reject(error);
            });
        });

        const { uname, pass } = querystring.parse(requestBody);

        // Verify the user's credentials
        const connection = await oracledb.getConnection(dbConfig);
        const query = `SELECT uname, email, password, preferred_foods, alergen, diet FROM users WHERE uname='${uname}' AND password='${pass}'`;
        const result = await connection.execute(query);
        if (result.rows && result.rows.length > 0) {
            // User credentials are valid
            const sessionData = { uname }; // Store necessary session data (e.g., username)
            const sessionCookieValue = Buffer.from(JSON.stringify(sessionData)).toString('base64');
            const sessionCookie = serialize(sessionCookieName, sessionCookieValue, {
                expires: new Date(Date.now() + sessionDuration),
                httpOnly: true,
                path: '/',
            });

            res.setHeader('Set-Cookie', sessionCookie);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end();
        } else {
            // User credentials are invalid
            res.writeHead(401); // Unauthorized status code
            res.end('Invalid username or password');
        }

    }
    else if (requestUrl === '/get-user') {
        // Check if the session cookie exists
        const cookies = parse(req.headers.cookie || '');
        const sessionCookie = cookies[sessionCookieName];

        if (sessionCookie) {
            try {
                const sessionDataString = Buffer.from(sessionCookie, 'base64').toString();
                const sessionData = JSON.parse(sessionDataString);
                const { uname } = sessionData;

                // Fetch user data from the database based on the session information
                const connection = await oracledb.getConnection(dbConfig);
                const query = `SELECT uname, email, password, preferred_foods, alergen, diet FROM users WHERE uname='${uname}'`;
                const result = await connection.execute(query);

                if (result.rows && result.rows.length > 0) {
                    const users: User[] = result.rows.map((row: any) => ({
                        uname: row[0] as string,
                        email: row[1] as string,
                        password: row[2] as string,
                        preferredFoods: (row[3] as string).split(','),
                        alergen: row[4] as string,
                        diet: row[5] as string,
                    }));
                    await connection.close();

                    // Render the user profile page with the retrieved user data


                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(users));
                } else {
                    res.writeHead(500);
                    res.end('No user found.');
                }
            } catch (error) {
                res.writeHead(500);
                res.end(`Sorry, an error occurred: ${(error as { message: string }).message}`);
            }
        } else {
            res.writeHead(401); // Unauthorized status code
            res.end('Unauthorized');
        }
    } else {
        let filePath = path.join(__dirname, requestUrl);

        if (requestUrl === '/') {
            filePath = path.join(__dirname, 'views', 'index.html');
        } else if (requestUrl.startsWith('/styles')) {
            filePath = path.join(__dirname, 'views', requestUrl);
        } else if (requestUrl.startsWith('/scripts')) {
            filePath = path.join(__dirname, 'views', 'scripts', path.basename(requestUrl).replace('.ts', '.js'));
        } else if (requestUrl.startsWith('/images') || requestUrl.startsWith('/fonts')) {
            filePath = path.join(__dirname, '..', 'public', requestUrl);
        } else {
            filePath = path.join(__dirname, 'views', path.basename(requestUrl));
        }

        const extname = String(path.extname(filePath)).toLowerCase();
        const mimeTypes: { [key: string]: string } = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.jpg': 'image/jpeg',
            '.png': 'image/png',
            '.woff': 'application/font-woff',
            '.woff2': 'application/font-woff2',
        };

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
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
