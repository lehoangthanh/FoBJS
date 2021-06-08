fetch("###URL###", {
    "credentials": "include",
    "headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:73.0) Gecko/20100101 Firefox/73.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Accept-Language": "de,en-US;q=0.7,en;q=0.3",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache",
        "sec-ch-ua": " Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90",
        "sec-ch-ua-mobile": "?0",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-site",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": 1
    },
    "referrer": "https://###WorldServer###0.forgeofempires.com/",
    "method": "GET",
    "mode": "cors"
}).catch((e) => console.log(e));