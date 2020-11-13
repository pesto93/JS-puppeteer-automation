const puppeteer = require('puppeteer');
const path = require('path')
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


let scrape = async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();

    await page.goto('https://www.osom.com/search?q=GUESS+1981+EDT+100ML&view=spring');
    await page.waitFor(1000)

    const result = await page.evaluate(() => {
        let data = []; // Create an empty array that will store our data
        let items = document.querySelector("div.ss-item-container ");
        let info = items.querySelectorAll(".info");
        
        for(i = 0; i < info.length; i++){ 
            let info_child = items.querySelectorAll(".info")[i]
            let img_child = items.querySelectorAll(".image")[i]
            let item_child = items.children[i]
            // var product_infomation = extract_content(info_child, img_child);

            data.push(extract_content(info_child, img_child, item_child));
        };

        function extract_content(info_data, img_data, item_data) {
            var base_url = info_data.children[0].baseURI
            var brand = info_data.children[0].innerText
            var product_name = info_data.children[1].innerText
            var img_url =img_data.children[0].attributes[2].value.replace('");', '').replace('background-image: url("', 'https:');
            var sku = item_data.children[0].offsetParent.attributes[7].value
            // content for offer, retail and deal
            var retail_tag = info_data.children[2].childNodes[1].innerText; 
            var deal_tag = info_data.children[2].childNodes[3].innerText;
            var is_offer_values = is_offer(deal_tag, retail_tag);
            var offer = is_offer_values[0];
            var product_deal = is_offer_values[1]; 
            var product_retail = is_offer_values[2];

            return {base_url, brand, product_name, offer, product_retail, product_deal, img_url, sku}
        
        };

        function is_offer(product_deal, product_retail){
            if(product_deal.length != 0){
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
    return result; // Return the data
};

scrape().then((value) => {

    const csvWriter = createCsvWriter({
        path: process.cwd() + path.sep + 'file.csv',
        fieldDelimiter: ';',
        header: [
            {id: 'base_url', title: 'Product URL'}, 
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


    console.log(value); // Success!
});
