const puppeteer = require('puppeteer');
const path = require('path')
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fetch = require("node-fetch");


let scrape = async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto('https://www.osom.com/collections/femenino-perfumeria-belleza');
    await page.waitFor(5000);

    var i = 1;
    do{
        try {
            const visibleInput = await page.waitForSelector('a.ss-infinite-loadmore-button', {visible: true, timeout: 5000 });
            // console.log('Found visible Element');
            await page.click('a.ss-infinite-loadmore-button');
        } catch (e) {
            // console.log('Could NOT find any more visible element ', e.message)
            i = 0;
        }
    }while(Boolean(i))

    const result = await page.evaluate(() => {
        let data = []; // Create an empty array that will store our data
        let items = document.querySelector("div.ss-item-container ");
        let mydata = document.querySelector("div.ss-item-container ").children.length;

        for(i = 0; i < mydata; i++){ 
            let items_children = items.children[i].children[0].children[1]
            let image_children = items.children[i].children[0].children[0].children[0]
            let sku_children = items.children[i]
             
            data.push(extract_content(items_children, image_children, sku_children))
        }

        function extract_content(info_data, img_data, sku_data) {
            const brand = info_data.children[0].innerText;
            let product_name = info_data.children[1].innerText

            let img_url =img_data.children[0].children[0].attributes[2].value.replace('");', '').replace('background-image: url("', 'https:');
            let prod_url = img_data.attributes[0].value.replace("//","https://")
            let sku = sku_data.children[0].offsetParent.attributes[7].value
            // get the product desc
            // let dates = prod_dates(prod_url + ".json")
            // let xe = get_desc(url)


             // content for offer, retail and deal
            let retail_tag = info_data.children[2].childNodes[1].innerText; 
            let deal_tag = info_data.children[2].childNodes[3].innerText;
            let is_offer_values = is_offer(deal_tag, retail_tag);
            let offer = is_offer_values[0];
            let product_deal = is_offer_values[1]; 
            let product_retail = is_offer_values[2];

            return {brand, product_name, offer, product_retail, product_deal, img_url, sku, prod_url, data}
        };

        // function prod_dates(url){
            
        // }

        
        function is_offer(product_deal, product_retail){
            if(product_deal.length !== 0){
                var offer = 1;
            }else{
                offer = 0;
		        product_deal = product_retail;
		        product_retail = '';

            }
            return [offer, product_deal,product_retail]
        }

        return data

    });
        
    browser.close();
    return result;
}

scrape().then((value) => {

    const csvWriter = createCsvWriter({
        path: process.cwd() + path.sep + 'file2.csv',
        fieldDelimiter: ';',
        header: [
            {id: 'prod_url', title: 'Product URL'}, 
            {id: 'brand', title: 'Product Brand'}, 
            {id: 'product_name', title: 'Product Name'}, 
            {id: 'offer', title: 'Offer'}, 
            {id: 'product_retail', title: 'Retail Price'}, 
            {id: 'product_deal', title: 'Deal Price'}, 
            {id: 'img_url', title: 'Image URL'}, 
            {id: 'sku', title: 'SKU'}
        ]
    });

    csvWriter.writeRecords(value).then(() => {
     console.log(' ----------------------> ...Data successfully written to file <---------------------- ');
    });

    console.log(value)
})