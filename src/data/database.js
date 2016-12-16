var sql = require('mssql');

var config = {
    user: 'phoceis_dev',
    password: 'PhocAsia_8-2016/',
    server: 'phoceis-asia.database.windows.net',
    database: 'Phoceis Bot',

    options: {
        encrypt: true // Use this if you're on Windows Azure
    }
};

var standardCatch = function(err) {
    console.log('An error occurred in database module: %s', err);
};

module.exports = {
    getUser: (id, callback) => {
        sql.connect(config).then(function() {
            // Try to find user with given id
            sql.query`SELECT * FROM bot_user WHERE id = ${id}`.then(function(recordset) {
                // If does not exist, create it
                if(recordset.length == 0) {
                    sql.query`EXEC CreateUser ${id}`.then(function(recordset) {
                        if(recordset.length > 0) {
                            callback(recordset[0]);
                        }
                        else {
                            callback();
                        }
                    }).catch(standardCatch);
                }
                else {
                    callback(recordset[0]);
                }
            }).catch(standardCatch);
        }).catch(standardCatch);
    },

    saveUser: (user, callback) => {
        console.log(util.inspect(user));
        sql.connect(config).then(function() {
            // Try to find user with given id
            sql.query`EXEC UpdateUser ${user.id}, ${user.first_name}, ${user.last_name}, ${user.city}, ${user.sex}, ${user.company}, ${user.phone_number}, ${user.email_address}, ${user.locale}`.then(function(result) {
                if(callback) {
                    if (result[0].result == 1) {
                        callback(true);
                    }
                    else {
                        callback(false);
                    }
                }
            }).catch(standardCatch);
        }).catch(standardCatch);
    }
};
