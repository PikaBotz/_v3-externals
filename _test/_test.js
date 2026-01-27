// "for:anya.v3"

import { cmd } from "../../lib/plugins.js";

import { getSecretMessage, calculateMath } from "../../lib/_test.helper.js";

export const install = {

    module: "test-package-v1",

    files: [
        {

            url: "https://raw.githubusercontent.com/PikaBotz/_v3-externals/refs/heads/main/_Helper/_test.helper.js", 

            path: "./lib/_test.helper.js",

            force: true 
        }
    ]
};

export default [
    cmd({
        name: "testexternal",
        category: "owner",
        desc: "Tests static dependency imports.",
        react: "🔗"
    }, async (c, msg) => {

        const msg1 = getSecretMessage();

        const msg2 = calculateMath(10, 50);

        return msg.reply(`${msg1}\n\n${msg2}`);
    })
];

