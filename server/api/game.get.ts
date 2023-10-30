import fs from 'fs'
import path from 'path';

export default defineEventHandler(async(event) => {
    const query = getQuery(event);
    const page = typeof query.page == 'string' && parseInt(query.page) || 1;
    const pageSize = typeof query.perPage == 'string' && parseInt(query.perPage) || 10;
    const orderBy = query.sortColumn;
    const orderDirection = query.sortDirection;

    //const filePath = path.join("/tmp", "game_list_v2.json");
    //const fileData = fs.readFileSync(filePath, 'utf-8');
    //const gameList = JSON.parse(fileData);

    const gameList = await $fetch('https://steam.haci.dev/game_list_v2.json')

    let sortedGames = Object.values(gameList);

    if (query.tlMin && typeof query.tlMin == 'string') {
        const min = parseFloat(query.tlMin)?.toFixed(2).split('.').join('')
        sortedGames = sortedGames.filter((game) => game.price.TR.final >= min )
    }

    if (query.tlMax && typeof query.tlMax == 'string') {
        const max = parseFloat(query.tlMax)?.toFixed(2).split('.').join('')
        sortedGames = sortedGames.filter((game) => game.price.TR.final <= max )
    }

    if (query.name && typeof query.name == 'string') {
        const nameRegex = new RegExp(query.name.replace(/İ/g, 'i'),'ig'); 
        console.log('nameRegex: ', nameRegex)
        sortedGames = sortedGames.filter((game) => game.name.search(nameRegex) > -1)
    }

    if (orderBy) {
        sortedGames = sortedGames.sort((a, b) => {
            let sortA = a[orderBy];
            let sortB = b[orderBy];

            switch (orderBy) {
                case 'price.TR.final':
                    sortA = a.price.TR.final;
                    sortB = b.price.TR.final;
                    break;
                case 'price.AZ.final':
                    sortA = a.price.AZ.final;
                    sortB = b.price.AZ.final;
                    break;
                case 'discount':
                    sortA = a.tr_currency_discount;
                    sortB = b.tr_currency_discount;
                    break;
            }

            if (orderDirection === 'asc') {
                return sortA - sortB;
            } else {
                return sortB - sortA;
            }
        });
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const gamesForPage = Object.values(sortedGames).slice(startIndex, endIndex);

    return { data: gamesForPage, totalGames: Object.keys(sortedGames).length, name: query.name };
})