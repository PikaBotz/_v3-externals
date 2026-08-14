// "for:anya.v3"

import Cg from "../../config.js";

import {
    cmd,
    func
} from "../../lib/index.js";

import {
    getTikPornVideos
} from "../../lib/downloader/tik-porn.core.js";

export const install = {

    module: "tik-porn-package-v1",

    files: [{

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
        if (msg.isGroup && !group.nsfw) return {
            executed: false,
            metadata: await msg.reply(Cg.RESPONSE.nsfwDisabled)
        }
        const {
            key
        } = await msg.reply(Cg.RESPONSE.wait);

        const randomVideo = await getTikPornVideos({
            page: "random",
            limit: 1
        });

        const metadata = await msg.reply({
            video: {
                url: randomVideo[0].url
            },
            caption: `> _Size: ${randomVideo[0].size}_`
        });

        await msg.delete(key);

        return {
            executed: true,
            metadata
        }
    })
];
