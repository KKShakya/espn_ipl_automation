(async () => {
    try {
        const puppeteer = require("puppeteer");
        const fs = require("fs");
        let XLSX = require("xlsx") ;

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
        let linkArr = await page.evaluate(() => {
            let cardArr = document.querySelectorAll("a.match-info-link-FIXTURES");
            console.log(cardArr);
            let linkArr = [];
            cardArr.forEach(ele => {
                linkArr.push(ele.getAttribute("href"));

            })
            // let link = cardArr[0].querySelector("a.match-info-link-FIXTURES")
            // console.log(link)
            return linkArr;
        })
        // console.log(linkArr) ;

        for (let j = 0; j < linkArr.length; j++) {
            let link = linkArr[j];
            let scorepage = await browser.newPage();
            await scorepage.goto(`https://www.espncricinfo.com${link}`);
            await scorepage.waitForTimeout(2000);


            let eventData = await scorepage.evaluate(() => {
                let event = document.querySelector(".event");
                let team1name = event.querySelectorAll("p.name")[0].innerText;
                let team2name = event.querySelectorAll("p.name")[1].innerText;

                // console.log(team1.innerText) ;
                // console.log(team2.innerText) ;

                let battingDoc = document.querySelectorAll("table.table.batsman");
                let bowlingDoc = document.querySelectorAll("table.table.bowler");
                // console.log(bowlingDoc) ;
                // console.log(battingDoc)

                let bowlerInfo = [];
                let batterInfo = [];

                bowlingDoc.forEach(ele => {
                    let tr = ele.querySelectorAll("tbody tr");
                    let bowlingArr = [];
                    // console.log(tr) ;

                    for (let i = 0; i < tr.length; i++) {
                        let bowlerData = tr[i].querySelectorAll("td");
                        if (bowlerData.length != 1) {
                            // console.log(bowlerData)
                            let name = bowlerData[0].innerText;
                            let overs = bowlerData[1].innerText;
                            let maiden = bowlerData[2].innerText;
                            let run = bowlerData[3].innerText;
                            let wicket = bowlerData[4].innerText;
                            let economy = bowlerData[5].innerText;

                            let data = {
                                bowlerName: name,
                                overs,
                                maiden,
                                run,
                                wicket,
                                economy
                            }
                            bowlingArr.push(data);
                        }

                    }
                    bowlerInfo.push(bowlingArr);
                    // console.log(bowlingArr)
                })




                battingDoc.forEach(ele => {
                    let tr = ele.querySelectorAll("tbody tr:nth-child(odd)");
                    // console.log(tr) ;
                    let battingArr = [];

                    for (let i = 0; i < tr.length - 1; i++) {
                        let batterData = tr[i].querySelectorAll("td");

                        let name = batterData[0].innerText;
                        // console.log(batterData) ;
                        let runScored = batterData[2].innerText;
                        let balls = batterData[3].innerText;
                        let strikeRate = batterData[7].innerText;

                        let data = {
                            batterName: name,
                            runScored,
                            balls,
                            strikeRate
                        }
                        battingArr.push(data);
                    }
                    // console.log(battingArr) ;
                    batterInfo.push(battingArr);

                })

                let eventData = [];
                let team1 = {
                    name: team1name,
                    batting: batterInfo[0],
                    bowling: bowlerInfo[1]
                }
                let team2 = {
                    name: team2name,
                    batting: batterInfo[1],
                    bowling: bowlerInfo[0]
                }

                eventData.push(team1);
                eventData.push(team2);
                console.log(eventData);

                // console.log(bowlerInfo) ;
                // console.log(batterInfo) ;
                return eventData;

            })

            fs.writeFileSync(`data/match${j + 1} data.json`, JSON.stringify(eventData));
            let name1 = eventData[0].name;
            let name2 = eventData[1].name;
            const team1batting = XLSX.utils.json_to_sheet(eventData[0].batting);
            const team2batting = XLSX.utils.json_to_sheet(eventData[1].batting);
            const team1bowling = XLSX.utils.json_to_sheet(eventData[0].bowling);
            const team2bowling = XLSX.utils.json_to_sheet(eventData[1].bowling);
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, team1batting, `${name1}Bat`);
            XLSX.utils.book_append_sheet(wb, team1bowling, `${name1}Bowl`);
            XLSX.utils.book_append_sheet(wb, team2batting, `${name2}Bat`);
            XLSX.utils.book_append_sheet(wb, team2bowling, `${name2}Bowl`);
            XLSX.writeFile(wb, `Excel_Data/Match${j + 1}.xlsx`);
            // XLSX.appendFile(team2, `match${j+1}.export.xlsx`) ;

            await scorepage.waitForTimeout(500)
            await scorepage.close();



        }






    }//try block closes
    catch (e) {
        console.log(e);
    }
})()