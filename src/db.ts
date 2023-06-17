
import pgPromise from 'pg-promise';

const pgp = pgPromise();

const db = pgp({
    host: 'localhost',
    port: 5432,
    database: 'FOS',
    user: 'postgres',
    password: 'Pass4Postgres1!'
});
export default db;
