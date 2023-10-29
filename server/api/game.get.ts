import fs from 'fs'

export default defineEventHandler((event) => {
    const query = getQuery(event);
    const page = typeof query.page == 'string' && parseInt(query.page) || 1;
    const pageSize = typeof query.perPage == 'string' && parseInt(query.perPage) || 10;
    const orderBy = query.sortColumn;
    const orderDirection = query.sortDirection;

    const filePath = process.cwd() + '/public/game_list.json';
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const gameList = JSON.parse(fileData);

    let sortedGames = Object.values(gameList);
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

    return { data: gamesForPage, totalGames: Object.keys(sortedGames).length};
})