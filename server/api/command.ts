import fs from 'fs'
import path from 'path';

export default defineEventHandler(async (event) => {
  const filePath = path.resolve(process.cwd(), 'game_list.json'); // Dosya yolu
  const appListResponse = await $fetch('https://api.steampowered.com/ISteamApps/GetAppList/v0001/')
  const appList = appListResponse?.applist?.apps?.app
  const falseAppList = []
  const chunkSize = 300;
  let gameList = {};

  console.log('appList', appList.length)

  try {
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf-8');
      gameList = JSON.parse(fileData);

      // Eğer veriler varsa, en son kaydedilen oyunun appid'sini al
      const lastAppId = Object.keys(gameList).map(key => key.split('-')[1]).pop()
      if (lastAppId > 0) {
        const lastAppIndex = appList.findIndex(game => game.appid == lastAppId);
        console.log('lastAppId: ', lastAppId, 'lastAppIndex: ', lastAppIndex)
        if (lastAppIndex >= 0) {
          appList.splice(0, lastAppIndex + 1);
        }
      }
      console.log('Yeni appList:', appList.length);
    }
  } catch (error) {
    console.error('Dosya okuma hatası:', error);
  }

  try {
    for (let startIndex = 0; startIndex < appList.length; startIndex += chunkSize) {
      const chunkedAppList = appList.slice(startIndex, startIndex + chunkSize);
      const appIds = chunkedAppList.map((game) => game.appid).join(',');

      const trPricingResponse = await $fetch(`https://store.steampowered.com/api/appdetails?appids=${appIds}&cc=TR&filters=price_overview`).catch((error) => {
        console.log('tr error: ', error);
        throw error;
      })
      const azPricingResponse = await $fetch(`https://store.steampowered.com/api/appdetails?appids=${appIds}&cc=AZ&filters=price_overview`).catch((error) => console.log('az error: ', error))

      const chunkedGameList = {};

      for (const index in chunkedAppList) {
        const game = chunkedAppList[index];
        const appId = game.appid

        if (!trPricingResponse[appId]?.success || !azPricingResponse[appId]?.success) {
          falseAppList.push(appId)
          continue
        }

        //if (trPricingResponse[appId]?.data.type !== 'game') continue
        if (!trPricingResponse[appId]?.data.price_overview) continue

        chunkedGameList['app-' + appId] = {
          id: game.appid,
          name: game.name,
          //capsule_image: trPricingResponse[appId]?.data.capsule_image,
          price: {
            TR: trPricingResponse[appId]?.data.price_overview || null,
            AZ: azPricingResponse[appId]?.data.price_overview || null,
          },
        };

      }
      console.log('falseAppList', falseAppList.length)
      Object.assign(gameList, chunkedGameList);

      // Verileri bir dosyaya yazın
      const dataToWrite = JSON.stringify(gameList, null, 2);

      try {
        fs.writeFileSync(filePath, dataToWrite, 'utf-8');
        console.log('Veriler dosyaya yazıldı: game_list.json');
      } catch (error) {
        console.error('Dosyaya yazma hatası:', error);
        return 'not saved'
      }
    }
  } catch (error) {
    console.log('error: ', error)
  }

  return 'bitti gameList'
})
