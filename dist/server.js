import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const hostname = '127.0.0.1';
const port = 3000;
const server = http.createServer(async (req, res) => {
    const requestUrl = req.url || '/';
    let filePath = path.join(__dirname, requestUrl);
    if (requestUrl === '/') {
        filePath = path.join(__dirname, 'views', 'index.html');
    }
    else if (requestUrl.startsWith('/styles')) {
        filePath = path.join(__dirname, 'views', requestUrl);
    }
    else if (requestUrl.startsWith('/scripts')) {
        filePath = path.join(__dirname, 'views', 'scripts', path.basename(requestUrl).replace('.ts', '.js'));
    }
    else if (requestUrl.startsWith('/images') || requestUrl.startsWith('/fonts')) {
        filePath = path.join(__dirname, '..', 'public', requestUrl);
    }
    else {
        filePath = path.join(__dirname, 'views', path.basename(requestUrl));
    }
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
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
    }
    catch (error) {
        res.writeHead(500);
        res.end(`Sorry, an error occurred: ${error.code}`);
    }
});
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
