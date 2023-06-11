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

// Interface representing the User object
interface User {
    // uname: string;
    //email: string;
    preferredFoods: string[];
    alergen: string;
    diet: string;
}

// Session configuration
const sessionCookieName = 'session'; // Name of the session cookie
const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const server = http.createServer(async (req, res) => {
    const requestUrl = req.url || '/';
    if (requestUrl === '/sign-up' && req.method === 'POST') {
        // Handling the '/sign-up' route for POST requests (user registration)

        // Parsing the request body
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

        res.writeHead(302, { 'Location': 'index.html' }); // Redirect to index.html
        res.end();
    }

    else if (requestUrl === '/login' && req.method === 'POST') {
        // Handling the '/login' route for POST requests (user login)

        // Parsing the request body
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
        const query = `SELECT uname, email, preferred_foods, alergen, diet FROM users WHERE uname='${uname}' AND password='${pass}'`;
        const result = await connection.execute(query);
        if (result.rows && result.rows.length > 0) {
            // Inside the '/login' route for successful login

            // User credentials are valid
            const sessionData = { uname }; // Store necessary session data (e.g., username)
            const sessionCookieValue = Buffer.from(JSON.stringify(sessionData)).toString('base64');
            const sessionCookie = serialize(sessionCookieName, sessionCookieValue, {
                expires: new Date("Tue, 06 Jul 2023 15:57:16 GMT"),
                httpOnly: true,
                path: '/',
                secure: true,
                sameSite: 'none', // Update the sameSite attribute value to "none"
            });



            res.setHeader('Set-Cookie', sessionCookie);
            res.writeHead(302, { 'Location': 'index.html' }); // Redirect to index.html
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
                const query = `SELECT preferred_foods, alergen, diet FROM users WHERE uname='${uname}'`;
                const result = await connection.execute(query);

                if (result.rows && result.rows.length > 0) {
                    const users: User[] = result.rows.map((row: any) => ({
                        /*uname: row[0] as string,
                        email: row[1] as string,*/
                        preferredFoods: (row[0] as string).split(','),
                        alergen: row[1] as string,
                        diet: row[2] as string,
                    }));
                    await connection.close();

                    console.log(JSON.stringify(users)); // Log the user data to check the format

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

                const parsedData = JSON.parse(requestBody);
                const { /*email*/ preferred_foods, allergen, diet } = parsedData;

                // Update the user's profile in the database
                const connection = await oracledb.getConnection(dbConfig);
                let query = 'UPDATE users SET ';
                const updateFields = [];

                /* if (email) {
                     updateFields.push(`email = '${email}'`);
                 }*/
                if (preferred_foods) {
                    updateFields.push(`preferred_foods = '${preferred_foods}'`);
                }

                if (allergen) {
                    updateFields.push(`alergen = '${allergen}'`);
                }
                if (diet) {
                    updateFields.push(`diet = '${diet}'`);
                }
                console.log(updateFields);
                if (updateFields.length > 0) {
                    query += updateFields.join(', ');
                    query += ` WHERE uname = '${uname}'`;

                    await connection.execute(query);
                    await connection.commit();
                }

                await connection.close();

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end();
            } catch (error) {
                res.writeHead(500);
                res.end(`Sorry, an error occurred: ${(error as { message: string }).message}`);
            }

        } else {
            res.writeHead(401); // Unauthorized status code
            res.end('Unauthorized');
        }
    }


    else {
        let filePath = path.join(__dirname, requestUrl); // Constructing the file path based on the request URL

        if (requestUrl === '/') {
            // If the request URL is '/', serve the index.html file
            filePath = path.join(__dirname, 'views', 'index.html');
        } else if (requestUrl.startsWith('/styles')) {
            // If the request URL starts with '/styles', serve the corresponding style file
            filePath = path.join(__dirname, 'views', requestUrl);
        } else if (requestUrl.startsWith('/scripts')) {
            // If the request URL starts with '/scripts', serve the corresponding JavaScript file
            filePath = path.join(__dirname, 'views', 'scripts', path.basename(requestUrl).replace('.ts', '.js'));
        } else if (requestUrl.startsWith('/images') || requestUrl.startsWith('/fonts')) {
            // If the request URL starts with '/images' or '/fonts', serve the corresponding file from the 'public' directory
            filePath = path.join(__dirname, '..', 'public', requestUrl);
        } else {
            // For any other request URL, assume it corresponds to a file in the 'views' directory
            filePath = path.join(__dirname, 'views', path.basename(requestUrl));
        }

        const extname = String(path.extname(filePath)).toLowerCase(); // Extracting the file extension from the file path
        const mimeTypes: { [key: string]: string } = {
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
        } catch (error) {
            res.writeHead(500); // Internal server error status code
            res.end(`Sorry, an error occurred: ${(error as { code: string }).code}`); // Sending an error message as the response body
        }

    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});