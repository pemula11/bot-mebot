const fs = require("fs");
const logger = require("../lib/pino");
const User = require("../model/user");
const UserRepository = require('./interfaces/userRepository');

const defaultData = { 
  users: {},
  chats: {},
  settings: {},
};



class DatabaseHandler extends UserRepository {
  constructor() {
    super();
    const dataDir = `${__dirname}/../data`;
    this.path = `${dataDir}/database.json`;
    try {
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        if (!fs.existsSync(this.path)) {
            const data = JSON.stringify(defaultData);
            fs.writeFileSync(this.path, data);
            this.database = defaultData;
        } else {
            const raw = fs.readFileSync(this.path, "utf-8");
            if (!raw || raw.trim().length === 0) {
                this.database = defaultData;
                fs.writeFileSync(this.path, JSON.stringify(defaultData));
            } else {
                try {
                    this.database = JSON.parse(raw);
                } catch (e) {
                    logger.error({ e }, "Invalid JSON in database.json, reinitializing");
                    this.database = defaultData;
                    fs.writeFileSync(this.path, JSON.stringify(defaultData));
                }
            }
        }
    } catch (error) {
        logger.error({ error }, "Failed initializing database file, using in-memory default");
        this.database = defaultData;
    }
    
  }

    async load() {
        try {
            const data = fs.readFileSync(this.path, "utf-8");
            return JSON.parse(data);
        } catch (error) {
            logger.error({ error }, "Failed to load database file, returning current memory state");
            return this.database;
        }
    }

    async loadUserDB() {
       
        return this.database.users;
    }

  async saveUser(sender, data = {}) {
    try {
        const dbUser = await this.loadUserDB();
   
        dbUser[sender] = { ...data};
        await this.save();
    } catch (error) {
        logger.error({error});
    }
  }

  async getUser(id) {
    if (this.database.users[id]) {
     // return Object.assign(new User(), this.database.users[id]);
     return this.database.users[id];
    }
    return null;
  }

  async setUserField(id, field, value) {
    if (this.database.users[id]) {
        this.database.users[id][field] = value;
        await this.save();
    } else {
        throw new Error(`User with id ${id} does not exist.`);
    }
  }

  async addUsageData(id, usage = 1) {
    if (this.database.users[id]) {
        this.database.users[id].totalUsage += usage;
        await this.save();
    } else {
        throw new Error(`User with id ${id} does not exist.`);
    }
  }





  async delete(id) {
    // const senders = await this.load();
    // const newData = senders.filter((s) => s.sender !== id);
    // fs.writeFileSync(this.path, JSON.stringify(newData));
  }

  async save() {
    try {
        fs.writeFileSync(this.path, JSON.stringify(this.database));
    } catch (error) {
        logger.error({ error }, "Failed saving database file");
    }
  }

}

module.exports = DatabaseHandler;