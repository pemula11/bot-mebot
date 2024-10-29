const fs = require("fs");
const logger = require("../lib/pino");
const User = require("../model/user");

const defaultData = { 
  users: {},
  chats: {},
  settings: {},
};



class DatabaseHandler {
  constructor() {
    this.path = `${__dirname}/../data/database.json`;
    if (!fs.existsSync(this.path)) {
        
        const data = JSON.stringify(defaultData);
        fs.writeFileSync(this.path, data);
        this.database = defaultData;
        console.log("database: ", data);
    }
    else{
      
        this.database = JSON.parse(fs.readFileSync(this.path, "utf-8"));
      
    }
    
  }

    async load() {
        const data = fs.readFileSync(this.path, "utf-8");
        const senders = JSON.parse(data);
        return senders;
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
        logger.error(error);
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
        console.log(error);
    }
  }

}

module.exports = DatabaseHandler;