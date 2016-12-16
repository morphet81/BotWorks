var botUtils        = require('../tools/bot-utils'),
    util            = require('util'),
    database        = require('./database');

var User = function() {
    this.save = (callback) => {
        database.saveUser(this, callback);
    };

    this.setFirstName = (firstName) => {
        this.first_name = firstName;
        this.save();
    };

    this.setLocale = (locale) => {
        this.locale = locale;
        this.save();
    };
};

var userFromMSSql = (record) => {
    var user = new User();

    user.id = record.id;
    user.first_name = record.first_name;
    user.last_name = record.last_name;
    user.city = record.city;
    user.sex = record.sex;
    user.company = record.company;
    user.phone_number = record.phone_number;
    user.email_address = record.email_address;
    user.locale = record.locale;

    return user;
};

module.exports = {
    getUser: (session, callback) => {
        database.getUser(botUtils.getSessionUserId(session), function (record) {
            if(callback) {
                if(record) {
                    callback(userFromMSSql(record));
                }
                else {
                    callback(undefined);
                }
            }
        });
    }
};