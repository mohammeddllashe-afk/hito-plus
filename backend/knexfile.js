require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/hito_dev',
    migrations: {
      directory: __dirname + '/migrations'
    }
  }
};
