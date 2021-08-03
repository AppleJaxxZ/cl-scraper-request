const request = require("request-promise");
const cheerio = require("cheerio");

const url = "https://allentown.craigslist.org/d/software-qa-dba-etc/search/sof";
const scrapeResults = [];

async function scrapeJobHeader() {
  try {
    const htmlResults = await request.get(url);
    const $ = await cheerio.load(htmlResults);

    $(".result-info").each((index, element) => {
      const resultTitle = $(element).find(".result-title");
      const title = resultTitle.text();
      const url = resultTitle.attr("href");
      const dateTime = new Date($(element).find("time").attr("datetime"));

      const hood = $(element).find(".nearby").text().trim();
      const scrapeResult = { title, url, dateTime, hood };

      scrapeResults.push(scrapeResult);
    });

    return scrapeResults;
  } catch (err) {
    console.log(err);
  }
}

async function scrapeDescription(jobsWithHeaders) {
  return await Promise.all(
    jobsWithHeaders.map(async (job) => {
      try {
        const htmlResults = await request.get(job.url);
        const $ = await cheerio.load(htmlResults);
        $(".print-qrcode-container").remove();
        job.description = $("#postingbody").text();
        job.address = $(".postingtitletext")
          .find("small")
          .text()
          .replace("(", "")
          .replace(")", "");
        job.compensation = $("span").find("b").text();

        return job;
      } catch (error) {
        console.error(error);
      }
    })
  );
}

async function scrapeCraigslist() {
  const jobsWithHeaders = await scrapeJobHeader();
  const jobsFullData = await scrapeDescription(jobsWithHeaders);
  console.log(jobsFullData);
}

scrapeCraigslist();
