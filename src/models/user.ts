import db from '../db.js';

export class User {
    id: number;
    email: string;
    password: string;
    username: string;

    constructor(id: number, email: string, password: string, username: string) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.username = username;
    }

    static async create(email: string, password: string, username: string) {
        try {
            const result = await db.query('INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING iid', [email, password, username]);
            if (result.rows.length > 0) {
                const row = result.rows[0];
                return new User(row.iid, email, password, username);
            } else {
                throw new Error('User not created');
            }
        } catch (err: unknown) {
            console.error(err);
            return null;
        }
    }

    static async getUserByUsername(username: string) {
        try {
            const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
            if (result.rows.length > 0) {
                const row = result.rows[0];
                return new User(row.iid, row.email, row.password, row.username);
            } else {
                return null;
            }
        } catch (err: unknown) {
            console.error(err);
            return null;
        }
    }
}
