// "for:anya.v3"

import { cmd } from "../../lib/plugins.js";

import { getTikPornVideos } from "../../lib/downloader/tik-porn.core.js";

export const install = {

    module: "tik-porn-package-v1",

    files: [
        {

            url: "https://raw.githubusercontent.com/PikaBotz/_v3-externals/refs/heads/main/_Helper/downloader/tik-porn.core.js", 

            path: "./lib/downloader/tik-porn.core.js",

            force: true 
        },
        
                {

            url: "https://raw.githubusercontent.com/PikaBotz/_v3-externals/refs/heads/main/_Helper/downloader/tik-porn.scrape.py", 

            path: "./lib/downloader/tik-porn.scrape.py",

            force: true 
        }
    ]
};

export default [
    cmd({
        name: "tikporn",
        alias: ["tiktokporn", "porntik", "tporn", "pornt"],
        category: "nsfw",
        desc: "Get tiktok size short porn videos.",
        react: "😋"
    }, async (c, msg) => {

        return {
        executed: true,
        metadata: await msg.reply("Working...")
        }
    })
];
