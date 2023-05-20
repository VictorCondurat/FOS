import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';
import oracledb from 'oracledb';

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

const server = http.createServer(async (req, res) => {
    const requestUrl = req.url || '/';

    if (requestUrl === '/get-user') {
        try {
            const connection = await oracledb.getConnection(dbConfig);
            const query = 'SELECT uname, email, password, preferred_foods, alergen, diet FROM users WHERE ROWNUM <= 1';

            const result = await connection.execute(query);

            await connection.close();
            console.log(result);
            if (result.rows) {
                const users: User[] = result.rows.map((row: any) => ({
                    uname: row[0] as string,
                    email: row[1] as string,
                    password: row[2] as string,
                    preferredFoods: (row[3] as string).split(','),
                    alergen: row[4] as string,
                    diet: row[5] as string,
                }));

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(users));
            } else {
                res.writeHead(500);
                res.end('No rows found in the result.');
            }
        } catch (error) {
            res.writeHead(500);
            res.end(`Sorry, an error occurred: ${(error as { message: string }).message}`);
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
