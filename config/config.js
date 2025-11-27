require('dotenv').config();

module.exports = {
  development: {
    dialect: 'postgres', // or 'mysql', 'sqlite', etc.
    host: process.env.DATABASE_HOST, // your database host
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  },
  staging: {
    dialect: 'postgres', // or 'mysql', 'sqlite', etc.
    host: process.env.DATABASE_HOST, // your database host
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  },
  production: {
    dialect: 'postgres', // or 'mysql', 'sqlite', etc.
    host: process.env.DATABASE_HOST, // your database host
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  },
};
