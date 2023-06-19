



const venom = require('venom-bot');

venom.create().then((client) => {
  client.onMessage((message) => {
    getClientInfo(client, message.sender.id)
      .then((senderName) => {
        console.log('Gönderen Kişi:', senderName);
    if (message.body.startsWith('!!')) {
      const command = message.body.substring(2).trim();
      console.log(command);
      console.log(message.from);
      

      if (command === 'selam') {
        
        const response = 'Merhaba! Nasıl yardımcı olabilirim?';
        client.sendText(message.from, response);
      } else if (command === 'saat') {
        const currentTime = new Date().toLocaleTimeString();
        const response = `Şu an saat ${currentTime}`;
        client.sendText(message.from, response);
      }
    }
  })
  .catch((error) => {
    console.log(error);
  });
});
}).catch((error) => {
console.log(error);
});

async function getClientInfo(client, contactId) {
const profile = await client.getNumberProfile(contactId);
const senderName = profile.name || profile.pushname || profile.formattedName;
return senderName;
}
