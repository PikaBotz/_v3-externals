// "for:anya.v3"

import { cmd, func } from "../../lib/index.js";

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
        alias: ["check" + name.split("check")[0], ...(alias || [])],
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
  
      cmd(
      {
        name: "charactercheck",
        alias: ["checkcharacter", "characheck", "checkchara"],
        react: "🎭",
        category: "fun",
        usage: "members",
        exp: 20,
        rule: 5,
        desc: `Check tagged/mentioned member's character score.`,
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

            const characters = [
                // Positive Traits
                "good", "helpful", "joyful", "kind", "brave", "friendly", "cheerful", 
                "ambitious", "energetic", "honest", "funny", "creative", "thoughtful", 
                "caring", "optimistic", "curious", "adventurous", "trustworthy", 
                "practical", "loyal", "patient", "sincere", "supportive", "generous", 
                "wise", "humble", "passionate", "perceptive", "resilient", "mature", 
                "sensitive", "tolerant", "modest", "open-minded", "empathetic", 
                "compassionate", "charming", "adaptable", "dedicated", "enthusiastic", 
                "gentle", "genuine", "hardworking", "humorous", "independent", 
                "insightful", "inspiring", "level-headed", "nurturing", "polite", 
                "positive", "responsible", "selfless", "sophisticated", "spontaneous", 
                "sympathetic", "understanding", "warm", "wise", "witty", "generous", 
                "diligent", "modest", "reliable", "tactful", "versatile", 
                "considerate", "optimistic", "faithful", "forgiving", "grateful", 
                "idealistic", "just", "lively", "persistent", "resourceful", "sociable", 
                "steadfast", "unselfish", "vigilant", "thoughtful",

                // Negative Traits
                "bad", "mean", "cowardly", "hostile", "gloomy", "lazy", "dishonest", 
                "serious", "impulsive", "selfish", "pessimistic", "indifferent", 
                "fearful", "untrustworthy", "dreamy", "disloyal", "impatient", 
                "insincere", "critical", "stingy", "foolish", "arrogant", "apathetic", 
                "oblivious", "fragile", "childish", "insensitive", "intolerant", 
                "antisocial", "showy", "aggressive", "bossy", "cold", "controlling", 
                "cynical", "defensive", "demanding", "disrespectful", "domineering", 
                "envious", "greedy", "harsh", "hateful", "ignorant", "imprudent", 
                "insecure", "jealous", "manipulative", "moody", "narcissistic", 
                "overbearing", "paranoid", "petty", "prejudiced", "reckless", 
                "rude", "self-centered", "spiteful", "stubborn", "superficial", 
                "unforgiving", "vain", "vindictive", "apathetic", "boastful", 
                "chaotic", "clumsy", "conceited", "deceitful", "defiant", 
                "dependent", "disorganized", "distant", "egotistical", "fearful", 
                "grumpy", "impatient", "inflexible", "inconsistent", "insensitive", 
                "lazy", "moody", "obsessive", "overconfident", "overcritical", 
                "overemotional", "overzealous", "passive-aggressive", "pompous", 
                "possessive", "resentful", "sarcastic", "secretive", "self-indulgent", 
                "short-tempered", "sneaky", "stingy", "ungrateful", "unstable", 
                "untrustworthy", "vague", "vengeful", "volatile", "withdrawn",

                // Neutral/Mixed Traits
                "serious", "emotional", "quiet", "introverted", "extroverted", 
                "observant", "reserved", "unpredictable", "practical", "idealistic", 
                "realistic", "skeptical", "logical", "dreamer", "philosophical", 
                "competitive", "ambitious", "spontaneous", "traditional", "free-spirited", 
                "eccentric", "detached", "indifferent", "melancholic", "stoic", 
                "neutral", "objective", "frugal", "shy", "bold", "analytical", 
                "balanced", "calm", "cautious", "careful", "charismatic", 
                "complicated", "conservative", "decisive", "diplomatic", "empathic", 
                "emotional", "imaginative", "intuitive", "judgmental", "laid-back", 
                "liberal", "minimalistic", "modest", "mysterious", "nervous", 
                "open", "pragmatic", "quiet", "rational", "reflective", 
                "reserved", "risk-taking", "sentimental", "skeptical", "straightforward", 
                "subtle", "unassuming", "unique", "unorthodox", "vulnerable", "zealous"
            ];
            
        let cap = `🇨 🇭 🇦 🇷 🇦 🇨 🇹 🇪 🇷\n\n`;
        const randchara = () => func.pickRandom(characters);
        const percentage = () => Math.floor(Math.random() * 101);

        for (const i of mem) {
          cap += `\`\`\`Name : @${i.split("@")[0]}\nCharacter : ${randchara()} (${percentage()}%)\`\`\`\n\n`;
        }

        return {
          executed: true,
          metadata: await msg.reply(cap.trim(), { mentions: mem }),
        };
      }
    )
];
