import { cmd } from "../lib/plugins.js";

export const install = {
    files: [
        {

            url: "https://gist.githubusercontent.com/USER/HASH/raw/_test.js", 
            path: "./lib/_test.js",
            force: true 

        }
    ]
};

export default [
    cmd({
        name: "testinstall",
        category: "owner",
        desc: "Tests the external plugin dependency system.",
        react: "🧪"
    }, async (c, msg) => {
        try {

            const helper = await import(`../lib/_test.js?t=${Date.now()}`);

            return msg.reply(helper.getTestMessage());

        } catch (e) {
            console.error(e);
            return msg.reply("❌ Error: Could not load dependency ./lib/_test.js");
        }
    })
];

