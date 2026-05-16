// "for:anya.v3"

import { cmd, func } from "../lib/index.js";

const funCheckCommands = [
  { name: "gaycheck", react: "👨🏼‍❤️‍👨🏻" },
  { name: "cutecheck", react: "🥺" },
  { name: "lesbicheck", alias: ["lesbiancheck"], react: "💄" },
  { name: "hornycheck", react: "💦" },
  { name: "prettycheck", react: "🦋" },
  { name: "lovelycheck", react: "🌹" },
  { name: "uglycheck", react: "🤢" },
  { name: "handsomecheck", react: "🌟" },
  { name: "smartcheck", react: "😼" },
  { name: "dumbcheck", react: "🥴" },
  { name: "strongcheck", react: "💪🏻" },
  { name: "weakcheck", react: "😩" },
  { name: "perfectcheck", react: "✨" },
  { name: "flirtycheck", react: "😚" },
  { name: "simpcheck", react: "🫠" },
  { name: "genzcheck", react: "🤓" },
  { name: "sigmacheck", react: "🔥" },
  { name: "rizzcheck", alias: ["rizcheck"], react: "😏" },
  { name: "maturecheck", react: "❤️" },
  { name: "vibeycheck", react: "🎶" },
  { name: "wholesomecheck", react: "🥰" },
  { name: "toxiccheck", react: "☠️" },
  { name: "dripcheck", react: "💧" },
  { name: "savagecheck", react: "😈" },
  { name: "cringecheck", react: "😬" },
  { name: "edgycheck", react: "🖤" },
  { name: "nerdcheck", react: "🤓" },
  { name: "chadcheck", react: "😎" },
  { name: "goblincheck", react: "👹" },
  { name: "gigaChadcheck", react: "💪" },
  { name: "sturdycheck", react: "🕺" },
  { name: "wokecheck", react: "🌍" },
  { name: "basiccheck", react: "💁‍♀️" },
  { name: "suscheck", react: "👀" },
  { name: "basedcheck", react: "🧠" },
  { name: "kingcheck", react: "👑" },
  { name: "queencheck", react: "👸" },
  { name: "lgbtqcheck", react: "🏳️‍🌈" },
  { name: "beautifulcheck", alias: ["beautycheck"], react: "😍" },
];

export default [
  ...funCheckCommands.map(({ name, alias, react }) =>
    cmd(
      {
        name,
        alias: alias || null,
        react,
        category: "fun",
        usage: "members",
        exp: 20,
        rule: 5,
        desc: `Check ${name.split("check")[0]} score of the tagged members.`,
      },
      async (AnyaBotV3, msg, { args, prefix, command, gc_metadata }) => {
        let mem = [];
        const isRandom = /random/i.test(args.join(" "));

        if (isRandom) {
          if (gc_metadata.participants.length < 3) {
            return {
              executed: false,
              metadata: await msg.reply("*❎ Minimum 3 members required to use random pick.*"),
            };
          }
          mem.push(func.pickRandom(gc_metadata.participants.map((v) => v.id)));
        } else if (msg.mentions && msg.mentions.length > 0) {
          mem = msg.mentions;
        } else if (msg.quoted && msg.quoted.sender) {
          mem.push(msg.quoted.sender);
        } else {
          return {
            executed: false,
            metadata: await msg.reply(`Tag a member!\n\n> _or use *${prefix + command} random* for a random pick._`),
          };
        }

        let cap = `*${react} « ${name.toUpperCase()} » ${react}*\n\n`;
        const percentage = () => Math.floor(Math.random() * 101);

        for (const i of mem) {
          cap += `\`\`\`Name : @${i.split("@")[0]}\nProbability : ${percentage()}%\`\`\`\n\n`;
        }

        return {
          executed: true,
          metadata: await msg.reply(cap.trim(), { mentions: mem }),
        };
      }
    )
  ),
];
