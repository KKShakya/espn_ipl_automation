(async () => {
    try {
        const puppeteer = require("puppeteer");
        const fs = require("fs");
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,

            args: ['--start-maximized']
        });
        const page = await browser.newPage();
        await page.goto("https://www.google.com/");
        await page.type("input", "Ipl 2021 espncricinfo", { delay: 200 })
        await page.click("input.gNO89b")

        //goto espncricinfo
        await page.waitForSelector("a[href='https://www.espncricinfo.com/series/ipl-2021-1249214']")
        await page.click("a[href='https://www.espncricinfo.com/series/ipl-2021-1249214']")

        //goto match results
        await page.waitForSelector("a[href='/series/ipl-2021-1249214/match-results']")
        await page.click("a[href='/series/ipl-2021-1249214/match-results']")

        //evaluating team names
        // await page.waitForTimeout(3000)
        // const result = await page.evaluate(()=>{
        //     let array=[]
        //      let arr=document.querySelectorAll(".match-info.match-info-FIXTURES");
        //      arr.forEach((ele)=>{
        //        let teamName=ele.querySelectorAll("p.name")
        //        let team1 = teamName[0].innerText
        //        let team2 = teamName[1].innerText
        //       //pushing inside array
        //        array.push({
        //            team1,
        //            team2
        //        })

        //      })
        //        return array;

        //     })
        //     // file written for teams
        //      fs.writeFileSync("team.json",JSON.stringify(result))


        //evaluating links of matches
        await page.waitForTimeout(3000);
        let linksto_Open = await page.evaluate(() => {
            let linkarr = [];
            let arr = document.querySelectorAll(".match-info-link-FIXTURES");
            arr.forEach(ele => {
                //    let url= "https://www.espncricinfo.com" + ele.getAttribute("href");
                linkarr.push("https://www.espncricinfo.com" + ele.getAttribute("href"))
            })
            return linkarr;
        })

        // file written for match links
        fs.writeFileSync("linkfile.json", JSON.stringify(linksto_Open))

        //opening each link
        for(let idx = 0;idx<linksto_Open.length;idx++) {
            const eachlink = linksto_Open[idx];
            try {
                // const newtab = browser.newPage();
                await page.goto(eachlink);
                // await waitForSelector(".global-footer")
                let data = await page.evaluate(() => {

                    let team1 = {};
                    let team2 = {};
                    team1.name = document.querySelectorAll(".event div.teams p.name")[0].innerText; 
                   team2.name = document.querySelectorAll(".event div.teams p.name")[1].innerText;
                   console.log(team1);
                 return {
                     team1,
                     team2
                 }

                  //fetching tables


                })
                     fs.writeFileSync(`data/${idx}team.json`,JSON.stringify(data));
                    await page.waitForTimeout(100);
            } catch (error) {
                 console.log(error);
            }
        }

       

    }//try block closes
    catch (e) {
        console.log(e);
    }
})()