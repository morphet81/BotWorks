var CacheController = require('node-cache'),
    botUtils        = require('./bot-utils'),
    util            = require('util');

var nodeCache = new CacheController();

function User() {
    this.id;
    this.name;
    this.locale;

    this.save = () => {
        nodeCache.set(this.id, this);
    }
};

module.exports = {
    getUser: (session) => {
        var user = nodeCache.get(botUtils.getSessionUserId(session));

        if(user == undefined) {
            user = new User();
            user.id = botUtils.getSessionUserId(session);
            user.name = botUtils.getSessionUserName(session);
        }

        return user;
    }
};