const commands = {
   
    'tanyaAI':  "Tanya ke chatGPT \n\nContoh: /tanyaAI Apa itu AI? \n",
    'downloadFB': "Download Video dari Facebook \n\nContoh: /fb linkVideo \n",
    'findAnime': '/findAnime',
    'downloadYTvideo': "Download Video dari YouTube \n\nContoh: /ytvid LinkYT \n",
    'downloadYTmp3': "Download Audio dari YouTube \n\nContoh: /ytmp3 LinkYT \n",
    'downloadTT': "Download Video dari TikTok \n\nContoh: /tt LinkTT \n",
    'downloadIG': "Download Video dari Instagram \n\nContoh: /ig linkReels \n",
}

const helpMessage = `
 Saya adalah bot yang bisa membantu anda dalam hal berikut: 
\n 1.*/tanyaAI* : ${commands.tanyaAI} 
\n 2. */fb*     : ${commands.downloadFB}
\n 3. */ytvid*  : ${commands.downloadYTvideo}
\n 4. */ytmp3*  : ${commands.downloadYTmp3}
\n 5. */tt*     : ${commands.downloadTT}
\n 6. */ig*     : ${commands.downloadIG}
`;

const introMessage = `Halo 👋, Kamu belum terdaftar pada Bot kami. \n silahkan ketik  */start* untuk memulai bot. 
        \n Jika butuh bantuan ketik /help \n Terima Kasih`;

function profile  (name = '', jid = '', premium = false, banned = false, bannedTime = '', bannedReason = '', limit = 20,  lastClaimTime = '', totalUsage = 0, registerTime = '') {
    return `Berikut profile akun mu: \n *Nomor*: ${jid} \n
*Tanggal Daftar*:  ${registerTime} \n *Premium*: ${premium ? 'Ya' : 'Tidak'} \n *Terkena Banned*: ${banned ? 'Ya' : 'Tidak'} \nAlasan Banned: ${bannedReason} \n *Limit*: ${limit}
\n*Terakhir Claim*: ${lastClaimTime} \n *Total Penggunaan Bot*: ${totalUsage}`;
};

module.exports = {commands, helpMessage, profile, introMessage};