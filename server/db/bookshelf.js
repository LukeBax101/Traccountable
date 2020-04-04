const fs = require('fs');
const path = require('path');

const password = fs.readFileSync(path.join(__dirname,  `../../secrets/password`), 'utf8').trim();
const knex = require('knex')({
  client: 'pg',
  connection: {
    host     : '127.0.0.1',
    port     : '5431',
    user     : 'postgres',
    password,
    database : 'postgres',
    charset  : 'utf8'
  }
});
const bookshelf = require('bookshelf')(knex);
bookshelf.plugin(require('bookshelf-uuid'));

module.exports = bookshelf;
