import fs from 'fs'

export default defineEventHandler(async (event) => {
    const filePath = process.cwd() + '/game_list_11_11.json'
    const fileData = fs.readFileSync(filePath, 'utf-8')
    const gameList = JSON.parse(fileData)
    const usdToTry = 29

    for (const key in gameList) {
        const game = gameList[key]
        if (game.price.TR && game.price.AZ) {
            const trFinal = parseInt(game.price.TR.final)
            const azFinal = parseInt((game.price.AZ.final * usdToTry).toFixed(0))

            const trCurrencyDiscount = trFinal - azFinal
            const trCurrencyDiscountPercent = ((azFinal - trFinal) / azFinal) * 100

            game.tr_currency_discount = trCurrencyDiscount
            game.tr_currency_discount_percent = trCurrencyDiscountPercent
        }
    }

    fs.writeFileSync(process.cwd() + '/public/game_list_v2_11_11.json', JSON.stringify(gameList, null, 2), 'utf-8')
})