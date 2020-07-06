const Scrapper = require('./Scrapper.js')

let path = process.argv[2]
let scrapper = new Scrapper(path)
scrapper.start().catch(error => console.error(error))