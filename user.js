var CacheController = require('node-cache'),
    botUtils        = require('./bot-utils'),
    util            = require('util');

var nodeCache = new CacheController();

function User() {
    this.id;
    this.name;
    this.locale;

    this.save = () => {
        console.log('Saving object %s', util.inspect(this));
        nodeCache.set(this.id, this, function(err, success) {
            if(err) {
                console.log('Error while saving user %s', err);
            }
        });
    }
};

module.exports = {
    getUser: (session) => {
        var user = nodeCache.get(botUtils.getSessionUserId(session));

        if(user == undefined) {
            console.log('User was not found. Creating a new user');
            user = new User();
            user.id = botUtils.getSessionUserId(session);
            user.name = botUtils.getSessionUserName(session);
        }

        return user;
    }
};