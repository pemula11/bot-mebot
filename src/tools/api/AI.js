const axios = require('axios');
const logger = require('../../lib/pino');


class ApiAI {
    constructor() {
        this.ryzenApi = 'http://api.ryzendesu.vip/api/ai/';
    }


    async ChatGPTResponse(question){
        let text = encodeURIComponent(question);
        
        try {
            let res = await axios.get(`http://api.ryzendesu.vip/api/ai/chatgpt?text=${text}`);
           // console.log("res: ", this.ryzenApi);
            if (res.data.response === "error" || res.data.success === false){
                return "Maaf, Terjadi Kesalahan!";
            }
            
            return res.data.response;
        } catch (error) {
            logger.error("error while use ChatGPT: ", {error});
        }    
    }


}

module.exports = ApiAI;