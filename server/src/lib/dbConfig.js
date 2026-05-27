/**

 * Opciones de conexión MariaDB/MySQL compartidas (pool, scripts de migración).

 * En BD gestionada (Aiven, TiDB): DB_SSL=true en .env

 */

import fs from 'node:fs';



export function getDbConnectionOptions(overrides = {}) {

    const sslEnabled = process.env.DB_SSL === 'true';

    const caPath = process.env.DB_SSL_CA_PATH;

    const connectTimeout = parseInt(process.env.DB_CONNECT_TIMEOUT, 10) || 30000;

    const sslOptions = sslEnabled

        ? {

              rejectUnauthorized: true,

              minVersion: 'TLSv1.2',

              ca: caPath ? fs.readFileSync(caPath) : undefined,

          }

        : false;

    return {

        host: process.env.DB_HOST || 'localhost',

        port: parseInt(process.env.DB_PORT, 10) || 3306,

        user: process.env.DB_USER || 'root',

        password: process.env.DB_PASSWORD || '',

        database: process.env.DB_NAME || 'sistema_soporte',

        allowPublicKeyRetrieval: true,

        connectTimeout,

        socketTimeout: connectTimeout,

        ssl: sslOptions,

        ...overrides,

    };

}



export function getDbPoolOptions(overrides = {}) {

    return {

        ...getDbConnectionOptions(),

        connectionLimit: 5,

        acquireTimeout: 30000,

        timeout: 30000,

        ...overrides,

    };

}



export function getDbLabel() {

    return `${process.env.DB_NAME || 'sistema_soporte'}@${process.env.DB_HOST || 'localhost'}`;

}


