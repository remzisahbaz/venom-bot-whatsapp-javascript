
  const fs = require('fs');
  const mime = require('mime-types');
  const venom = require('venom-bot');
  const  botCode ='<rc>';
  
  const puppeteer = require('puppeteer');

  async function runHeadless() {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
  
    // Use the page object to perform actions in the headless browser
  
    await browser.close();
  }
  
  runHeadless();
  

  venom.create({
    
    session: 'yemek' // Oturum adı
  }).then((client) => start(client))
    .catch((error) => {
      console.log(error);
    });
  
  function start(client) {
    client.onMessage(async (message) => {
      console.log(message.type);

    //  console.log(message);
    
    //group mesajı değilse
      if (!message.isGroupMsg) {

        //eğer açıklama eklenip gelen bir mesaj ise
       if(isAnyCaptionOfMessage(message)){
        console.log("caption var :");

        //botcode key i ile başlayan
        if( message.caption.startsWith(botCode)){

          //geln mesaj tipi video ise
           if(message.type === 'video') {
            console.log('caption  :'+getFileNameFromContent(message));
            const buffer =await  client.decryptFile(message);
            saveMediaFile(buffer,client,message);
           }
           //gelen mesaj tipi document ise
           else if (message.type === 'document') {
            const buffer =await  client.decryptFile(message);
            console.log('gelen dosya adı :',message.filename);

            //gelen document excel dosyası mı?
            if (isExcel(message.filename)) {
            saveExcelFile(buffer,message)
            await client.sendText(message.from, 'Gönderdiğiniz excel dosyası alındı ve kaydedildi. ');
          }
          //gelen document video dosyası mı?
          else if (isVideo(message.filename)) {
            saveMediaFile(buffer,client,message);
          }
        }
        
      }else{
        console.log("bot olmayan, kişisel belgeler gönderildi")
      }
     } 

     //açıklama eklenmeden gelen mesaj (text mesajı)
     else{
          //gelen text mesaj mı?
        if(message.type === 'chat'){ 

            if(message.body.startsWith(botCode)){

            
             //   saveChatTest(message.body);
            
            //   message.body.substring(botCode.length).trim();

                //starts with <rc> #Kurban-xx#
         const content= message.body.substring(botCode.length);//.split(/\s/);
 
        //  const text = " #kurban-2# www.google.com ";
        //   const regex2 = /#([^#]+)#\s*([^#]+)/;
        //   const matches2 = text.match(regex2);

        //   const a = [matches2[1], matches2[2]];
        //   console.log(a);  // Output: ['kurban-2', 'abcd']
         const regex = /#([^#]+)#\s*([^#]+)/;
         const matches = content.match(regex);
         const b = [matches[1], matches[2]];
         console.log(b);  // Output: ['kurban-2', 'abcd']
         
          if (matches) {
            const videoLink=matches[2];
            const folderName= matches[1]
          sendVideoToExcelNumbers(client,folderName,videoLink);  
              }           
                      }else{
              console.log("kişisel mesaj gönderiler")
            }
          }}
  

      }
    }
    );
  }

  //caption var mı
 function  isAnyCaptionOfMessage(message){
  return message.hasOwnProperty('caption');
  }
//eğer bir excel ise
function isExcel(fileName){
  return fileName.endsWith('.xls') || fileName.endsWith('.xlsx');
}
//eğer video  ise
function isVideo(fileName){
  return fileName.endsWith('.mp4') || fileName.endsWith('.avi');
}
//   const path = require('path');
// const { machine } = require('os');

  
// İçerikten dosya adını ayıkla
function getFileNameFromContent(content) {

  const caption = content.caption;
  //bot code: <rc>
  return caption.substring(botCode.length).trim().replace(/#/g,"");
}

 function saveMediaFile(buffer,client,message) {
  const fileName=getFileNameFromContent(message);
  //dosya dolu ve dosya_adi.<uzantısı>
  const fileFullName=`${fileName}.${mime.extension(message.mimetype)}`;
  const folderName=`${fileName}`;
  const filePath = `./${folderName}/${fileFullName}`;

  console.log('kayıt yolu :'+filePath);
  //exist file
  fs.readdir(folderName, (err, files) => {
    if (err) {

      console.error('Error reading folder:', err);
    } else {
      
      if (!files.includes(fileFullName)) {

  fs.writeFile(filePath, buffer,{ encoding: 'base64' }, (err) => {
    if (err) {
      console.log('Dosya kaydedilirken bir hata oluştu:', err);
    } else {
      console.log('Dosya başarıyla kaydedildi:', filePath);
      //it is OK!
      client.sendText(message.from, `${fileName} isimli video kaydedildi. Hisse sahiplerine gönderilecektir.\n Allah razı olsun ebeden.`);
      
  
      console.error('chatId:', message.from);
     // sendVideoToNumbers(message.from,filePath);
    // Excel dosyasındaki numaralara video gönderme işlemini başlat

    sendVideoToExcelNumbers(fileName,videoLink);
    }
  });
}
else {
  console.log('Video file already exists.');
  client.sendText(message.from, `${fileName} isimli video daha önce kaydedildi. Kolay gelsin, iyi çalışmalar.`);
}
}});

}

function saveChatTest(body){
  console.log("save chatTest metodu ");
  //starts with <!> #Kurban-xx#
  const content= body.substring(3).trim();
  const regex = /(#Kurban-\d+)#((?:\s*\d+\s*)+)/;
  const matches = content.match(regex);
 
if (matches) {
  console.log("if (matches) ");
  const folderName = matches[1].replace(/#/g,"");
  const stockHolderGsmNumbers = matches[2].trim().split(/\s+/);
  console.log(`folderName=${folderName}`);
  console.log(`stockHolder =${stockHolderGsmNumbers}`);
  //new folder
  createFolder(folderName);
  createCSVFileAndWrite(folderName,stockHolderGsmNumbers);
}

  
}

function   createFolder(folderName){
  if (!fs.existsSync(folderName)) {
  fs.mkdir(folderName, (err) => {
  if (err) {
    console.error('Error creating folder:', err);
  } else {
    console.log('Folder created successfully!');
  }
});
  }
}

function createCSVFileAndWrite(folderName,stockHolderGsmNumbers){
const csvData = stockHolderGsmNumbers.join('\n');
const filePath=`./${folderName}/${folderName}.csv`;
fs.writeFile(filePath, csvData, 'utf8', (err) => {
  if (err) {
    console.error('Error creating CSV file:', err);
  } else {
    console.log('CSV file created successfully!');
  }
});
}

//video gönderme
const csv = require('csv-parser');
function  sendVideo(client,folderName){
  
  const videoFilePath = `./${folderName}/${folderName}.mp4`;
  const csvFilePath = `./${folderName}/${folderName}.csv`;

  fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (data) => {
    const phoneNumber = data.phone;
    console.log(`Video sent to numara : ${phoneNumber}`);
    const message = {
      content: videoFilePath,
      caption: 'Kurban Kesimi Videosu ',
      isPtt: false,
      isVideo: true,
      quotedMsg: undefined
    };

    console.log(`Video sent to message : ${message}`);

    client.sendText(phoneNumber, 'Kurban Kesim Videosu ...\n Allah kabul eylesin inşaallah. ').then(() => {
      client.sendMediaMessage(phoneNumber.trim(), message).then(() => {
        console.log(`Video sent to ${phoneNumber}`);
      }).catch((error) => {
        console.error(`Error sending video to ${phoneNumber}:`, error);
      });
    })
    .catch((error) => {
      console.error(`Error sending text message to ${phoneNumber}:`, error);
    });
  })
  .on('end', () => {
    console.log('CSV file processed successfully');
    //client.close();
  })
  .on('error', (error) => {
    console.error('Error reading CSV file:', error);
   // client.close();
  });
}


/******************************************** */


//EXCEL DOSYASI OKU
const excel = require('exceljs');
// Excel dosyasını okuyan ve numaraları alıp video gönderme işlemini başlatan fonksiyon
async function sendVideoToExcelNumbers(client,filePath,videoLink) {

  const startRow = 2;
  const endRow = 8;

  const videoFilePath = `./${filePath}/${filePath}.mp4`;
  const excelFilePath = `./${filePath}/${filePath}.xlsx`;

  try {
    const workbook = new excel.Workbook();
    await workbook.xlsx.readFile(excelFilePath);

    const worksheet = workbook.getWorksheet('Sayfa1');
    const senderMessage=[];

    for (let i = startRow; i <= endRow; i++) {
      const row = worksheet.getRow(i);
      const cell = row.getCell(3); // c sütununa erişim : numara 
      const cellLastName=row.getCell(2); // b sütununa erişim : soyadı
      const cellName=row.getCell(1); // a sütununa erişim : adı
      

      if (cell && cell.value) {
    
       if (cellName && cellName.value) {
   
       if (cellLastName && cellLastName.value) {

      const gsm=cell.value.toString().trim();
      const name= cellName.value.toString().trim();
      const lastName  =cellLastName.value.toString().trim();

      const item = {
        name: name,
        lastName:lastName,
        gsm: gsm
      };

      senderMessage.push(item);
      }
    }
  }

    }
      //numaralara link gönderme
  await  sendVideoLinkToNumbers (client,senderMessage,videoLink)
  //  await sendVideoToNumbers(numbers,videoFilePath);
  } catch (error) {
    console.error('Error reading Excel file:', error);
  }
}

// Dosyadaki numaralara video gönderen fonksiyon
async function sendVideoToNumbers(numbers,videoFilePath) {
  try {
    const client = await venom.create();
    const number='905307718154@c.us';
    const caption=";";
    for (const number of numbers) {

      const message = {
        to: `${number}@c.us`,
        path: videoFilePath,
        filename:'kurban.mp4',
        caption: "Kurban Kesim Videosu "
      };
      console.error('dosya gönderme:');
     // await client.sendFileFromBase64(message.to,convertToBase64(videoFilePath), mime.lookup(videoFilePath), caption);
   //  await client.sendMediaMessage(message.to,convertToBase64(videoFilePath), mime.lookup(videoFilePath), caption);
    await client.sendText(message.to, `${fileName} isimli video kaydedildi. Hisse sahiplerine gönderilecektir.\n Allah razı olsun ebeden.`);
    }

    await client.close();

    console.log('Video sent to all numbers successfully.');
  } catch (error) {
    console.error('Error sending video:', error);
  }
}


//excelden okunan kayıtları senderMessage ile alıyoruz 
async function sendVideoLinkToNumbers(client,senderMessage,videoLink) {
  const imagePath='./sakev.png';
  try {

  await senderMessage.forEach((message,index) =>{
    console.log(`Mesaj ${index + 1}:`);
    console.log('Ad:', message.name);
    console.log('Soyad:', message.lastName);
    console.log('Numara:', message.gsm);
    console.log('------------------------');

  client.sendText(`${message.gsm}@c.us`, `Sayın *${message.name} ${message.lastName}* 
                                              \n Kurbanınız kesilmiş olup izlemek ve indirmek için bu linki tıklayabilirsiniz:
                                              \n ${videoLink} 
                                              \n Allah ibadetlerimizi kabul eylesin.
                                              
                                              \nİrtibat Destek: ************* 05*****`);

// Resmi belirtilen alıcıya gönder
sendImageToRecipient(client,`${message.gsm}@c.us`, './bayram.jpg');
  });
    console.log('sent to all numbers successfully.');
  } catch (error) {
    console.error('Error sending :', error);
  }
}


// Resim gönderme fonksiyonu
async function sendImageToRecipient(client,recipient, imagePath) {
  try {
    // Resmi gönder
    await client.sendImage(recipient, imagePath,'kurban.jpg', 'Bayramınız mübarek olsun');
    console.log('Resim gönderildi');
  } catch (error) {
    console.error('Resim gönderilirken bir hata oluştu:', error);
  }
}




function convertToBase64(filePath) {
  const fileData = fs.readFileSync(filePath);
  const base64Data = fileData.toString('base64');
  return base64Data;
}

/******************************************************************* */


function saveExcelFile(buffer, message){

const fileName = getFileNameFromContent(message);

// Dosyanın MIME türünü kontrol edin
const mimeType = mime.lookup(fileName);
try {
   // Dizin oluşturma
   createFolder(fileName);
  // Excel dosyası ise kaydet
  const savePath  = `./${fileName}/${fileName}.xlsx`;
  fs.writeFile(savePath, buffer, (err) => {
    if (err) {
      console.error('Dosya kaydedilirken bir hata oluştu:', err);
    } else {
      console.log('Excel dosyası başarıyla kaydedildi:', savePath);
    }
  });
} catch(e) {
  console.log('Kaydetme hatası.',e);
}

}
