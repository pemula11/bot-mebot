const axios = require('axios');
async function ChatGPTResponse(question){
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

const handler = async (text, dataMessage = null) => {
    if ((!text || text === '')) return "Please provide a text!";
    return ChatGPTResponse(text);

}

    handler.command = ['tanyaAI'];
    handler.premium = false;
    handler.register = true;
    handler.help = ['tanyaAI <text>'];
    handler.limit = true;
    
    module.exports =  handler;