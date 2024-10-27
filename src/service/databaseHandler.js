const fs = require("fs");

class DatabaseHandler {
  constructor() {
    this.path = `${__dirname}/../data/database.json`;
    if (!fs.existsSync(this.path)) {
        if (fs.existsSync(this.path)){

            fs.writeFileSync(this.path, JSON.stringify({}));
        }
        this.db = {};
    }
  }

    async load() {
        const data = fs.readFileSync(this.path, "utf-8");
        const senders = JSON.parse(data);
        return senders;
    }

  async save(sender) {
    try {
        const senders = await this.load();
        const newSender = {sender};
        senders.push(newSender);
        fs.writeFileSync(this.path, JSON.stringify(senders));
    } catch (error) {
        console.log(error);
    }
  }

  async get(id) {
    const senders = await this.load();
    console.log(senders);
    return senders.find((s) => s.sender === id);
  }

  async set(id, data) {
    return await this.db.set(id, data);
  }

  async delete(id) {
    const senders = await this.load();
    const newData = senders.filter((s) => s.sender !== id);
    fs.writeFileSync(this.path, JSON.stringify(newData));
  }

}

module.exports = DatabaseHandler;