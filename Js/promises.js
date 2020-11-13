const puppeteer = require('puppeteer');

let scrape = async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();

    await page.goto('https://www.osom.com/search?q=GUESS+1981+EDT+100ML&view=spring');
    await page.waitFor(1000)


    const result = await page.evaluate(() => {
        let data = []; // Create an empty array that will store our data
        let img_list= [];
        let elements = document.querySelectorAll('.info'); // Select all Products
        let images = document.querySelectorAll('.image'); // Select all Products


        for (var element of elements){ // Loop through each proudct
            let url = element.childNodes[0].baseURI;
            let brand = element.childNodes[2].innerText;
            let product_name = element.childNodes[5].innerText; 
            let product_retail = element.childNodes[6].nextSibling.nextSibling.childNodes[1].innerText; 
            let product_deal = element.childNodes[6].nextSibling.nextSibling.childNodes[3].innerText;
            data.push({url, brand, product_name, product_retail, product_deal}); // Push an object with the data onto our array
        };

        for (var img of images){
            let img_url = img.childNodes[0].nextElementSibling.attributes[2].value;
            img_list.push(img_url)
        };
        console.log(img_list)

        return img_list; // Return our data array
    });

    browser.close();
    return result; // Return the data
};

scrape().then((value) => {
    console.log(value); // Success!
});
