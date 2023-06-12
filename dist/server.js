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
// Session configuration
const sessionCookieName = 'session'; // Name of the session cookie
const sessionExpirationTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
function generateRandomSessionId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const sessionIdLength = 32;
    let sessionId = '';
    for (let i = 0; i < sessionIdLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        sessionId += characters.charAt(randomIndex);
    }
    return sessionId;
}
const server = http.createServer(async (req, res) => {
    const requestUrl = req.url || '/';
    if (requestUrl === '/sign-up' && req.method === 'POST') {
        // Handling the '/sign-up' route for POST requests (user registration)
        // Parsing the request body
        const requestBody = await new Promise((resolve, reject) => {
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
        const { uname, email, psw, 'psw-repeat': pswRepeat } = querystring.parse(requestBody);
        // Check if passwords match
        if (psw !== pswRepeat) {
            res.writeHead(400); // Bad request status code
            res.end('Passwords do not match');
            return;
        }
        // Insert user credentials into the database
        const connection = await oracledb.getConnection(dbConfig);
        const query = `INSERT INTO users (uname, email, password) VALUES ('${uname}', '${email}', '${psw}')`;
        await connection.execute(query);
        await connection.commit();
        res.writeHead(302, { 'Location': 'login.html' }); // Redirect to login.html
        res.end();
    }
    else if (requestUrl === '/login' && req.method === 'POST') {
        // Handling the '/login' route for POST requests (user login)
        // Parsing the request body
        const requestBody = await new Promise((resolve, reject) => {
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
        const query = `SELECT uname, email, preferred_foods, alergen, diet FROM users WHERE uname=:uname AND password=:pass`;
        const result = await connection.execute(query, [uname, pass]);
        console.log(result);
        console.log(uname);
        if (result.rows && result.rows.length > 0) {
            // Inside the '/login' route for successful login
            // User credentials are valid
            const sessionData = { sessionId: generateRandomSessionId(), uname }; // Store necessary session data (e.g., username and session ID)
            const sessionCookieValue = Buffer.from(JSON.stringify(sessionData)).toString('base64');
            const sessionCookie = serialize(sessionCookieName, sessionCookieValue, {
                expires: new Date(Date.now() + sessionExpirationTime),
                httpOnly: true,
                path: '/',
                secure: true,
                sameSite: 'none' // Update the sameSite attribute value to "None"
            });
            res.setHeader('Set-Cookie', sessionCookie);
            res.writeHead(302, { 'Location': 'index.html' }); // Redirect to index.html
            res.end();
        }
        else {
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
                const query = `SELECT uname,preferred_foods, alergen, diet FROM users WHERE uname='${uname}'`;
                const result = await connection.execute(query);
                if (result.rows && result.rows.length > 0) {
                    const users = result.rows.map((row) => ({
                        uname: row[0],
                        preferredFoods: row[1],
                        alergen: row[2],
                        diet: row[3],
                    }));
                    await connection.close();
                    console.log(JSON.stringify(users)); // Log the user data to check the format
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(users));
                }
                else {
                    res.writeHead(500);
                    res.end('No user found.');
                }
            }
            catch (error) {
                res.writeHead(500);
                res.end(`Sorry, an error occurred: ${error.message}`);
            }
        }
        else {
            res.writeHead(401); // Unauthorized status code
            res.end('Unauthorized');
        }
    }
    else if (requestUrl === '/update-profile' && req.method === 'POST') {
        // Check if the session cookie exists
        const cookies = parse(req.headers.cookie || '');
        const sessionCookie = cookies[sessionCookieName];
        if (sessionCookie) {
            try {
                const sessionDataString = Buffer.from(sessionCookie, 'base64').toString();
                const sessionData = JSON.parse(sessionDataString);
                const { uname } = sessionData;
                const requestBody = await new Promise((resolve, reject) => {
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
                const parsedData = JSON.parse(requestBody);
                const { preferred_foods, allergen, diet } = parsedData;
                // Update the user's profile in the database
                const connection = await oracledb.getConnection(dbConfig);
                let query = 'UPDATE users SET ';
                const updateFields = [];
                if (preferred_foods) {
                    updateFields.push(`preferred_foods = '${preferred_foods}'`);
                }
                if (allergen) {
                    updateFields.push(`alergen = '${allergen}'`);
                }
                if (diet) {
                    updateFields.push(`diet = '${diet}'`);
                }
                if (updateFields.length > 0) {
                    query += updateFields.join(', ');
                    query += ` WHERE uname = '${uname}'`;
                    await connection.execute(query);
                    await connection.commit();
                }
                await connection.close();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end();
            }
            catch (error) {
                res.writeHead(500);
                res.end(`Sorry, an error occurred: ${error.message}`);
            }
        }
        else {
            res.writeHead(401); // Unauthorized status code
            res.end('Unauthorized');
        }
    }
    else {
        let filePath = path.join(__dirname, requestUrl); // Constructing the file path based on the request URL
        if (requestUrl === '/') {
            // If the request URL is '/', serve the index.html file
            filePath = path.join(__dirname, 'views', 'index.html');
        }
        else if (requestUrl.startsWith('/styles')) {
            // If the request URL starts with '/styles', serve the corresponding style file
            filePath = path.join(__dirname, 'views', requestUrl);
        }
        else if (requestUrl.startsWith('/scripts')) {
            // If the request URL starts with '/scripts', serve the corresponding JavaScript file
            filePath = path.join(__dirname, 'views', 'scripts', path.basename(requestUrl).replace('.ts', '.js'));
        }
        else if (requestUrl.startsWith('/images') || requestUrl.startsWith('/fonts')) {
            // If the request URL starts with '/images' or '/fonts', serve the corresponding file from the 'public' directory
            filePath = path.join(__dirname, '..', 'public', requestUrl);
        }
        else {
            // For any other request URL, assume it corresponds to a file in the 'views' directory
            filePath = path.join(__dirname, 'views', path.basename(requestUrl));
        }
        const extname = String(path.extname(filePath)).toLowerCase(); // Extracting the file extension from the file path
        const mimeTypes = {
            // Mapping file extensions to MIME types for content type determination
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.jpg': 'image/jpeg',
            '.png': 'image/png',
            '.woff': 'application/font-woff',
            '.woff2': 'application/font-woff2',
        };
        const contentType = mimeTypes[extname] || 'application/octet-stream'; // Determining the content type based on the file extension
        try {
            const content = await fs.readFile(filePath); // Reading the file content asynchronously
            res.writeHead(200, { 'Content-Type': contentType }); // Setting the response headers with the determined content type
            res.end(content, 'utf-8'); // Sending the file content as the response body
        }
        catch (error) {
            res.writeHead(500); // Internal server error status code
            res.end(`Sorry, an error occurred: ${error.code}`); // Sending an error message as the response body
        }
    }
});
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
