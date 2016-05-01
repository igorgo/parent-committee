/**
 * Created by igorgo on 01.05.2016.
 */
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/parents-committee.db',function(err){
    if (err) console.error(err);
    else console.log("Sqlite database is open");
});
module.exports = db;