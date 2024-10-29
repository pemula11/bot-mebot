class User {
    /**
     * @param {string} name - The name of the user.
     * @param {string} jid - The JID (Jabber ID) of the user.
     * @param {boolean} isRegister - Whether the user is registered.
     * @param {string} registeredTime - The time when the user registered.
     * @param {boolean} premium - Whether the user has premium status.
     * @param {boolean} banned - Whether the user is banned.
     * @param {string} bannedTime - The time when the user was banned.
     * @param {string} bannedReason - The reason why the user was banned.
     * @param {number} limit - The limit associated with the user.
     * @param {string} lastClaim - The last claim made by the user.
     * @param {string} lastClaimTime - The time when the last claim was made.
     */
    constructor(name = '', jid = '', isRegister = false, registeredTime = '', premium = false, banned = false, bannedTime = '', bannedReason = '', limit = 20,  lastClaimTime = '', totalUsage = 0) {
        this.name = name;
        this.jid = jid;
        this.isRegister = isRegister;
        this.registeredTime = registeredTime;
        this.premium = premium;
        this.banned = banned;
        this.bannedTime = bannedTime;
        this.bannedReason = bannedReason;
        this.limit = limit;
        this.lastClaimTime = lastClaimTime;
        this.totalUsage = totalUsage;
    }

    get getName() {
        return this.name;
    }

    get getJid() {
        return this.jid;
    }

    get getIsRegister() {
        return this.isRegister;
    }

    get getRegisteredTime() {
        return this.registeredTime;
    }

    get getPremium() {
        return this.premium;
    }

    get getBanned() {
        return this.banned;
    }

    get getBannedTime() {
        return this.bannedTime;
    }

    get getBannedReason() {
        return this.bannedReason;
    }

    get getLimit() {
        return this.limit;
    }

    get getLastClaimTime() {
        return this.lastClaimTime;
    }

    get getTotalUsage() {
        return this.totalUsage;
    }




   

}

module.exports = User;