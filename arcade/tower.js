import { cmd, cooldownForSpecificCommands } from "../../lib/index.js";
import { Leveling } from "../../src/leveling/manager.js";

export const TowersLogic = {
    config: {
        1: { entry: 500, rows: 8, cols: 4, bombs: 1 },
        2: { entry: 2500, rows: 8, cols: 3, bombs: 1 },
        3: { entry: 10000, rows: 8, cols: 2, bombs: 1 }
    },
    createBoard: (rows, cols, bombs) => {
        let board = [];
        for (let r = 0; r < rows; r++) {
            let row = Array(cols).fill().map(() => ({ type: 'safe', picked: false }));
            let bombCount = 0;
            while (bombCount < bombs) {
                let idx = Math.floor(Math.random() * cols);
                if (row[idx].type !== 'bomb') {
                    row[idx].type = 'bomb';
                    bombCount++;
                }
            }
            board.push(row);
        }
        return board;
    },
    getMultiplier: (cols, bombs, floorsCleared) => {
        if (floorsCleared === 0) return 1.0;
        const safeChance = (cols - bombs) / cols;
        const exactProb = Math.pow(safeChance, floorsCleared);
        return (1 / exactProb) * 0.95; 
    },
    renderBoard: (board, currentRow, revealAll = false, hitCol = -1) => {
        let str = "";
        let rowCount = board.length;
        
        for (let r = board.length - 1; r >= 0; r--) {
            let rowStr = revealAll ? `${rowCount} ` : "";
            
            for (let c = 0; c < board[r].length; c++) {
                const tile = board[r][c];
                if (revealAll) {
                    if (r === currentRow && c === hitCol) rowStr += "💥 ";
                    else if (tile.type === 'bomb') rowStr += "💣 ";
                    else if (tile.picked) rowStr += "✅ ";
                    else rowStr += "🚪 "; 
                } else {
                    if (r > currentRow) rowStr += "🔒 ";
                    else if (r === currentRow) rowStr += "🚪 ";
                    else {
                        if (tile.picked) rowStr += "✅ ";
                        else rowStr += "⬛ ";
                    }
                }
            }
            if (r === currentRow && !revealAll) rowStr += " ⬅️";
            str += rowStr.trim() + "\n";
            rowCount--;
        }
        return `\`\`\`${str.trim()}\`\`\``;
    },
    getMap: (cols) => {
        let mapStr = "`Reference:` ```";
        for (let i = 1; i <= cols; i++) mapStr += `${i}  `;
        return mapStr.trim() + "```";
    }
};

export default [
    cmd({
        name: "towers",
        alias: ["tower"],
        react: "🏢",
        category: "arcade",
        premium: true,
        desc: "Climb the tower! Pick safe doors to multiply your money, but avoid the bombs.",
    }, async (AnyaBotV3, msg, { args, prefix, command }) => {
        if (args[0] && /^--info$/i.test(args[0])) {
            const infoText = `*🏢 TOWERS - HOW TO PLAY*\n\n` +
                             `1️⃣ Start a game using \`${prefix + command} <level>\`.\n` +
                             `2️⃣ You will see a tower with 8 floors.\n` +
                             `3️⃣ Start at the bottom row (indicated by ⬅️).\n` +
                             `4️⃣ Reply with a door number (e.g., \`1\`, \`2\`, \`3\`) to pick a box on your current floor.\n` +
                             `5️⃣ If it's safe ✅, you move up one floor and your multiplier increases!\n` +
                             `6️⃣ If it's a bomb 💣, the tower collapses and you lose your entry fee.\n` +
                             `7️⃣ Type \`cashout\` at any time to take your pending money and leave!`;
            return { executed: false, metadata: await msg.reply(infoText) };
        }

        const check = cooldownForSpecificCommands(msg.sender, "towers", 60 * 1000, 3);
        if (check?.cooldown) {
            return { executed: false, metadata: await msg.reply(`_*Towers Cooldown! 🧊*_\n\nLimit reached _(3 games in 1 minute)_.\nTry again after _*${check.time}*_.`) };
        }

        while (global.towersMatchmakingLock) await new Promise(resolve => setTimeout(resolve, 50));
        global.towersMatchmakingLock = true;

        try {
            let dbData = (await global.db.get({ category: "ARCADE", id: "towers_sessions" })) || { sessions: {} };
            const sender = msg.sender;

            if (dbData.sessions[sender]) {
                const session = dbData.sessions[sender];
                const currentMult = TowersLogic.getMultiplier(session.cols, session.bombs, session.currentRow);
                const currentPending = Math.floor(session.entry * currentMult);
                const boardDisplay = TowersLogic.renderBoard(session.board, session.currentRow, false);
                
                const resumeMsg = `⚠️ *You already have an active climb running!*\n> _Reply with a door number to continue or type \`cashout\`._\n\n` +
                                  `*🏢 TOWERS [Multiplier: \`${currentMult.toFixed(2)}x\`] 🏢*\n> _Level : ${session.level}_\n\n` +
                                  `${boardDisplay}\n\n${TowersLogic.getMap(session.cols)}\n\n` +
                                  `*💰 Pending: ${currentPending} 💵*`;

                return { executed: false, metadata: await msg.reply(resumeMsg) };
            }

            const level = parseInt(args[0]);
            if (![1, 2, 3].includes(level)) {
                const helpText = `*Choose your Towers Level 🏢*\n\n` +
                                 `\`\`\`1:\`\`\` _500 💵 Entry | 4 Doors_\n` +
                                 `\`\`\`2:\`\`\` _2,500 💵 Entry | 3 Doors_\n` +
                                 `\`\`\`3:\`\`\` _10,000 💵 Entry | 2 Doors_\n\n` +
                                 `*e.g.: ${prefix + command} 2*\n> _Type \`${prefix + command} --info\` for instructions._`;
                return { executed: false, metadata: await msg.reply(helpText) };
            }

            const cfg = TowersLogic.config[level];
            const lvl = await Leveling.init(sender);
            const currentMoney = lvl.user.money || 0;

            if (currentMoney < cfg.entry) {
                return { executed: false, metadata: await msg.reply(`⚠️ *Insufficient Funds!*\n\nYou need at least ${cfg.entry} 💵 to play Level ${level}.`) };
            }

            await lvl.addUserItems([{ amount: cfg.entry, id: "money", name: "money", update: "deduct", icon: "💵" }]);

            const newSession = {
                chatId: msg.chat,
                level: level,
                entry: cfg.entry,
                rows: cfg.rows,
                cols: cfg.cols,
                bombs: cfg.bombs,
                board: TowersLogic.createBoard(cfg.rows, cfg.cols, cfg.bombs),
                currentRow: 0,
                startTime: Date.now()
            };

            dbData.sessions[sender] = newSession;
            await global.db.create({ category: "ARCADE", id: "towers_sessions", data: dbData });

            const boardDisplay = TowersLogic.renderBoard(newSession.board, 0, false);
            const initialMsg = `*🏢 TOWERS [Multiplier: \`1.00x\`] 🏢*\n> _Level : ${level}_\n\n${boardDisplay}\n\n${TowersLogic.getMap(cfg.cols)}\n\n*💰 Pending: ${cfg.entry} 💵*\n> Reply with a door number or type *cashout*`;

            return { executed: true, metadata: await msg.reply(initialMsg), usePremiumCredit: 1 };

        } finally {
            global.towersMatchmakingLock = false;
        }
    }),

    cmd({ on: "text" }, async (AnyaBotV3, msg) => {
        const text = msg.body?.trim();
        const isCashout = /^cashout$/i.test(text);
        const isMove = /^[1-4]$/.test(text);

        if (isCashout || isMove) {
            while (global.towersMatchmakingLock) await new Promise(resolve => setTimeout(resolve, 50));
            global.towersMatchmakingLock = true;

            try {
                let dbData = await global.db.get({ category: "ARCADE", id: "towers_sessions" });
                if (!dbData || !dbData.sessions || !dbData.sessions[msg.sender]) return;
                
                let session = dbData.sessions[msg.sender];
                if (session.chatId !== msg.chat) return;

                const lvl = await Leveling.init(msg.sender);

                if (isCashout) {
                    if (session.currentRow === 0) {
                        await msg.reply(`⚠️ You haven't climbed any floors yet! Clear at least one floor before cashing out.`);
                        return;
                    }
                    const mult = TowersLogic.getMultiplier(session.cols, session.bombs, session.currentRow);
                    const payout = Math.floor(session.entry * mult);
                    await lvl.addUserItems([{ amount: payout, id: "money", name: "money", update: "add", icon: "💵" }]);
                    
                    delete dbData.sessions[msg.sender];
                    await global.db.create({ category: "ARCADE", id: "towers_sessions", data: dbData });
                    
                    await msg.reply(`*💰 CASHOUT SUCCESSFUL!*\n\n*Multiplier:* \`${mult.toFixed(2)}x\`\n*Profit:* +${payout - session.entry} 💵\n\n*Total Payout:* ${payout} 💵`);
                    return;
                }

                const moveChoice = parseInt(text);
                if (moveChoice < 1 || moveChoice > session.cols) {
                    await msg.reply(`⚠️ Invalid door! Please pick a number between 1 and ${session.cols}.`);
                    return;
                }

                const colIndex = moveChoice - 1;
                session.board[session.currentRow][colIndex].picked = true;

                if (session.board[session.currentRow][colIndex].type === 'bomb') {
                    const boardDisplay = TowersLogic.renderBoard(session.board, session.currentRow, true, colIndex);
                    delete dbData.sessions[msg.sender];
                    await global.db.create({ category: "ARCADE", id: "towers_sessions", data: dbData });
                    
                    await msg.reply(`\`\`\`💥💥 TOWER COLLAPSED! 💥💥\`\`\`\n\n*You hit a bomb! Game Over.*\n_You lost your ${session.entry} 💵 entry fee._\n\n*Autopsy:*\n${boardDisplay}`);
                    return;
                }

                session.currentRow++;

                if (session.currentRow === session.rows) {
                    const mult = TowersLogic.getMultiplier(session.cols, session.bombs, session.currentRow);
                    const payout = Math.floor(session.entry * mult);
                    const boxType = session.level >= 2 ? "epic" : "premium";
                    
                    await lvl.addExp(3000, { silent: true });
                    await lvl.addUserItems([
                        { amount: payout, id: "money", name: "money", update: "add", icon: "💵" },
                        { amount: 1, id: `mysterybox_${boxType}`, name: `${boxType} mysterybox`, update: "add", icon: "🎁" }
                    ]);

                    const boardDisplay = TowersLogic.renderBoard(session.board, session.currentRow, true, -1);
                    delete dbData.sessions[msg.sender];
                    await global.db.create({ category: "ARCADE", id: "towers_sessions", data: dbData });

                    await msg.reply(`*🏆 TOP FLOOR REACHED! 🏆*\n\n${boardDisplay}\n\n*You conquered the entire tower!*\n*Multiplier:* \`${mult.toFixed(2)}x\`\n\n*💰 MASSIVE REWARDS:*\n+ ${payout} 💵\n+ 3000 EXP\n🎁 + 1 ${boxType} Mysterybox`);
                    return;
                }

                await global.db.create({ category: "ARCADE", id: "towers_sessions", data: dbData });
                
                const currentMult = TowersLogic.getMultiplier(session.cols, session.bombs, session.currentRow);
                const currentPending = Math.floor(session.entry * currentMult);
                const boardDisplay = TowersLogic.renderBoard(session.board, session.currentRow, false);
                
                const updatedMsg = `*🏢 TOWERS [Multiplier: \`${currentMult.toFixed(2)}x\`] 🏢*\n> _Level : ${session.level}_\n\n${boardDisplay}\n\n${TowersLogic.getMap(session.cols)}\n\n*💰 Pending: ${currentPending} 💵*\n> Reply with a door number or type *cashout*`;
                await msg.reply(updatedMsg);

            } finally {
                global.towersMatchmakingLock = false;
            }
        }
    })
];
