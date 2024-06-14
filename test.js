(function () {
    const { log } = console;
    const { requestAnimationFrame, setInterval, setTimeout } = window;
    const units = [];
    for (let i = 0; i < 100; i++) units[i] = [];
    const me = {
        type: 0,
        pid: -1,
        id: 0,
        x: 0,
        y: 0,
        angle: 0,
        info: 0,
        action: 0,
        speed: 0,
        extra: 0
    }
    const CLIENT_PACKETS = {
        CHAT: 8,
        CRAFT: 2,
        REVIVE: 33,
        MOVE: 19,
        DROP: 7,
        CAMERA: 12,
        ATTACK: 24,
        RECYCLE: 20,
        EQUIP: 16,
        BUILD: 15,
        TAKE_CHEST_ITEM: 27,
        USE: 25,
        ANGLE: 27,
        DROP_TO_CHEST: 13,
        STOP_ATTACK: 38,
        DROP_WEAPON: 11,
        JOIN_TOTEM: 38
    }
    const SERVER_PACKETS = {
        UNITS: 0,
        GAUGES: 16
    }
    const SERVER_STRING_PACKETS = {
        HANDSHAKE: 3
    }
    const BIND_TYPES = {
        DEFAULT: 0,
        TOGGLE: 1,
        SINGLE: 2
    }

    const vars = {
        //user
        chat: "ΔⲆᐃⵠΔ",
        terminal: "ⵠᐃⵠᐃᐃ",

        invenParent: "ⵠⲆΔⲆ",
        inven: "ⲆΔΔⵠᐃ",

        allies: "ⵠΔΔΔΔ",

        userProps: "ⲆⲆᐃ",

        alive: "ΔⵠⲆΔᐃ",

        ghost: "ΔⲆⵠΔⵠ",

        gauges: "ⵠⲆⲆⵠ",
        health: "ⵠⲆⵠᐃ",

        weaponCooldown: "ΔⵠⲆⲆΔ",
        weaponCooldownTime: "ⵠΔⵠ",

        // world
        units: "ᐃᐃΔ",
        pid: "ΔⵠΔΔ",

        // global
        wsParent: "ΔⵠⲆⵠ",
        ws: "ᐃᐃⵠⵠ",

        sprite: "Ⲇᐃ",
        draw: "ΔⵠⲆⲆ"
    }

    //#region Utils

    let getDist = (e, i) => Math.sqrt((e.x - i.x) ** 2 + (e.y - i.y) ** 2);

    let getNearest = (e, i = []) => {
        let t = { distance: 9999999, entity: null };
        for (let r = 0; r < i.length; r++) {
            let n = i[r], a = getDist(e, i[r]);
            t.distance > a && (t.distance = a, t.entity = n);
        }
        return t;
    }


    function isAlly(id) {
        if (user && (id == user.id || user[vars.allies].includes(id))) {
            return true;
        }
        return false
    }


    function getUserPosition() {
        let userpos = user[vars.userProps];
        let userposx = userpos.x;
        let userposy = userpos.y;
        return [userposx, userposy];
    }

    function invenContains(id) {
        if (user[vars.invenParent][vars.inven].find(e => e.id == id))
            return true;
        return false;
    }

    //#endregion

    //#region Cheats
    class CheatManager {
        constructor() {
            this.cheats = [];
        }

        register(cheat) {
            this.cheats.push(cheat);
        }
    }
    class Bind {
        constructor(type, key) {
            this.type = type;
            this.key = key;
        }
    }
    class Cheat {
        constructor(title, bind, cooldown) {
            this.title = title ?? "New function";
            this.stamp = 0;
            this.enabled = false;
            this.bind = bind;
            this.cooldown = cooldown ?? -1;
        }

        run() { }
    }

    class AutoCraft extends Cheat {
        constructor() {
            super("AutoCraft", new Bind(BIND_TYPES.TOGGLE, "KeyK"), 100);
            this.lastID = -1;
        }

        run() {
            if (this.lastID != -1)
                socket.send(JSON.stringify([CLIENT_PACKETS.CRAFT, this.lastID]));
        }
    }
    class AutoRecycle extends Cheat {
        constructor() {
            super("AutoRecycle", new Bind(BIND_TYPES.TOGGLE, "KeyL"), 100);
            this.lastID = -1;
        }

        run() {
            if (this.lastID != -1)
                socket.send(JSON.stringify([CLIENT_PACKETS.RECYCLE, this.lastID]));
        }
    }
    class AutoSpike extends Cheat {
        constructor() {
            super("AutoSpike", new Bind(BIND_TYPES.DEFAULT, "KeyC"), 50);
        }

        run() {
            const spikes = [219, 123, 170, 169, 168, 160, 162]; // 162 wood wall, red to wood spike descending
            let bestSpike = null;
            for (let i = 0; i < spikes.length; ++i) {
                if (invenContains(spikes[i])) {
                    bestSpike = spikes[i];
                    break;
                }
            }
            if (bestSpike != null) {
                const pi2 = Math.PI * 2;
                const me = user.control
                socket.send(JSON.stringify([CLIENT_PACKETS.BUILD, bestSpike, Math.floor((me.angle + pi2) % pi2 * (255 - 0) / pi2), 0]))
                for (let i = 7; i <= 47; i += 10) {
                    socket.send(JSON.stringify([CLIENT_PACKETS.BUILD, bestSpike, Math.floor((me.angle + pi2) % pi2 * (255 + i) / pi2), 0]))
                    socket.send(JSON.stringify([CLIENT_PACKETS.BUILD, bestSpike, Math.floor((me.angle + pi2) % pi2 * (255 - i) / pi2), 0]))
                }
            }
        }
    }
    class AutoWall extends Cheat {
        constructor() {
            super("AutoWall", new Bind(BIND_TYPES.DEFAULT, "Space"), 50);
        }

        run() {
            let hasWall = false;
            if (invenContains(162)) {
                hasWall = true;
            }
            if (hasWall) {
                const me = user.control
                const pi2 = Math.PI * 2;
                socket.send(JSON.stringify([CLIENT_PACKETS.BUILD, 162, Math.floor((me.angle + pi2) % pi2 * (255 - 0) / pi2), 0]))
            }
        }
    }
    class AutoCrown extends Cheat {
        constructor() {
            super("AutoCrown", new Bind(BIND_TYPES.TOGGLE, "KeyJ"), 100);
            this.equippedCrown = false;
        }

        run() {
            if (user[vars.ghost].enabled) {
                let resStones = world[vars.units][22];

                let closest = getNearest(me, resStones);
                if (closest.distance <= 250) {
                    socket.send(JSON.stringify([CLIENT_PACKETS.REVIVE, closest.entity[vars.pid], closest.entity.id]))
                    setTimeout(() => {
                        if (!this.equippedCrown) {
                            this.equippedCrown = true;
                            socket.send(JSON.stringify([CLIENT_PACKETS.EQUIP, 79]));

                            const hammers = [39, 38, 37, 36, 35]; // red to stone hammer descending
                            let bestHammer = null;

                            for (let i = 0; i < hammers.length; ++i) {
                                if (invenContains(hammers[i])) {
                                    bestHammer = hammers[i];
                                    break;
                                }
                            }
                            if (bestHammer != null) {
                                setTimeout(() => {
                                    socket.send(JSON.stringify([CLIENT_PACKETS.EQUIP, bestHammer]));
                                }, 250);

                            }
                            setTimeout(() => {
                                this.equippedCrown = false;
                            }, 300);
                        }
                    }, 250);
                }
            }
        }
    }

    //           if (r.main.misc.weaponinchest.enable && 0 != this.weaponRange(a.right)) {
    // let e = this.getNearest(a, o);
    // e.distance >= 250 && client.socket.send(JSON.stringify([10, Ie.CHEST, Math.floor(256 * Math.random()), 0])), null != e.entity && (e = e.entity, this.getDist(a, e) <= 250 && (e.iid = e.id, client.give_item(e, a.right, 100), client.take_chest(e)));
    //}
    class AutoSteal extends Cheat {
        constructor() {
            super("AutoSteal", new Bind(BIND_TYPES.DEFAULT, "KeyQ"), 100);
        }

        run() {
            const chests = world[vars.units][11];
            for (const chest of chests) {
                const distance = getDist(me, chest);
                if (distance <= 250) {
                    socket.send(JSON.stringify([CLIENT_PACKETS.TAKE_CHEST_ITEM, chest[vars.pid], chest.id]));
                }
            }
        }
    }
    class AutoTotem extends Cheat {
        constructor() {
            super("AutoTotem", new Bind(BIND_TYPES.TOGGLE, "KeyH"), 100);
        }

        run() {
            if (user[vars.allies].length == 0) {
                const totems = world[vars.units][29];

                let closest = getNearest(me, totems);
                if (closest.distance <= 250) {
                    socket.send(JSON.stringify([CLIENT_PACKETS.JOIN_TOTEM, closest.entity[vars.pid], closest.entity.id]));
                }
            }
        }
    }
    class OneThousandInChest extends Cheat {
        constructor() {
            super("OneThousandInChest", new Bind(BIND_TYPES.TOGGLE, "KeyU"), 100);
        }
    }
    class DropWeapon extends Cheat {
        constructor() {
            super("DropWeapon", new Bind(BIND_TYPES.DEFAULT, "KeyV"), 1000);
        }

        run() {
            if (this.equippedId != -1) {
                socket.send(JSON.stringify([CLIENT_PACKETS.DROP_WEAPON, this.equippedId]));
            }
        }
    }
    class Xray extends Cheat {
        constructor() {
            super("Xray", new Bind(BIND_TYPES.TOGGLE, "KeyE"), 100);
        }
    }
    function getCookieValue(name) {
        const regex = new RegExp(`(^| )${name}=([^;]+)`);
        const match = document.cookie.match(regex);
        if (match) {
            return match[2];
        }
    }
    class CopyToken extends Cheat {
        constructor() {
            super("CopyToken", new Bind(BIND_TYPES.SINGLE, "Backquote"), 100);
        }

        run() {
            let copypaste = "```\n" + getCookieValue("starve_token") + "\n" + getCookieValue("starve_token_id") + "\n```";
            prompt("Copy to clipboard: Ctrl+C, Enter", copypaste);
        }
    }
    class AutoFire extends Cheat {
        constructor() {
            super("AutoFire", new Bind(BIND_TYPES.DEFAULT, "KeyX"), 300);
        }

        run() {
            const fires = [113, 118]; // 113 small fire, 118 big fire
            let worstFire = null;
            for (let i = 0; i < fires.length; ++i) {
                if (invenContains(fires[i])) {
                    worstFire = fires[i];
                    break;
                }
            }
            if (worstFire != null) {
                const pi2 = Math.PI * 2;
                const me = user.control
                socket.send(JSON.stringify([CLIENT_PACKETS.BUILD, worstFire, Math.floor((me.angle + pi2) % pi2 * (255 - 0) / pi2), 0]))
            }
        }
    }

    class AutoItem extends Cheat {
        constructor(id, title, bind, cooldown) {
            super(title, bind, cooldown);
            this.id = id;
        }
        run() {
            let hasItem = false;
            if (invenContains(this.id)) {
                hasItem = true;
            }
            if (hasItem) {
                const me = user.control;
                const pi2 = Math.PI * 2;
                socket.send(JSON.stringify([CLIENT_PACKETS.BUILD, this.id, Math.floor((me.angle + pi2) % pi2 * (255 - 0) / pi2), 0]));
            }
        }
    }
    class AutoBridge extends AutoItem {
        constructor() {
            super(125, "AutoBridge", new Bind(BIND_TYPES.TOGGLE, "KeyT"), 100);
        }
    }
    class AutoAloe extends AutoItem {
        constructor() {
            super(1, "AutoAloe", new Bind(BIND_TYPES.TOGGLE, "KeyJ"), 100);
        }
    }
    class AutoRoof extends AutoItem {
        constructor() {
            super(190, "AutoRoof", new Bind(BIND_TYPES.TOGGLE, "KeyI"), 100);
        }
    }

    class AutoBottle extends Cheat {
        constructor() {
            super("AutoBottle", new Bind(BIND_TYPES.TOGGLE, "KeyB"), 40);
            this.id = 127;
            this.bottled = false;
        }

        run() {
            if (user[vars.gauges][vars.health] <= (50 / 200)) {
                let hasBottle = false;
                if (invenContains(this.id)) {
                    hasBottle = true;
                }
                if (hasBottle && !this.bottled) {
                    log("running");
                    this.bottled = true;
                    socket.send(JSON.stringify([CLIENT_PACKETS.EQUIP, this.id]));
                    setTimeout(() => {
                        this.bottled = false;
                    }, 10000);
                }
            }
        }
    }

    class AutoPutChest extends Cheat {
        constructor() {
            super("AutoPutChest", new Bind(BIND_TYPES.TOGGLE, "KeyP"), 100);
        }
        run() {

        }
    }

    //add reconnect support

    // auto extr

    // auto 20 ame spikes - find the cost of that in wood

    //auto put in chest

    // group by bind types

    const cheatManager = new CheatManager();
    const autocraft = new AutoCraft();
    const autorecycle = new AutoRecycle();
    const autospike = new AutoSpike();
    const autowall = new AutoWall();
    const autocrown = new AutoCrown();
    const autobridge = new AutoBridge();
    const autosteal = new AutoSteal();
    const autototem = new AutoTotem();
    const onethousandinchest = new OneThousandInChest();
    const dropweapon = new DropWeapon();
    const xray = new Xray();
    const copytoken = new CopyToken();
    const autofire = new AutoFire();
    const autoroof = new AutoRoof();
    const autobottle = new AutoBottle();
    const autoaloe = new AutoAloe();
    const autoputchest = new AutoPutChest();

    cheatManager.register(autocraft);
    cheatManager.register(autorecycle);
    cheatManager.register(autospike);
    cheatManager.register(autowall);
    cheatManager.register(autocrown);
    cheatManager.register(autobridge);
    cheatManager.register(autosteal);
    cheatManager.register(autototem);
    cheatManager.register(onethousandinchest);
    cheatManager.register(dropweapon);
    cheatManager.register(xray);
    cheatManager.register(copytoken);
    cheatManager.register(autofire);
    cheatManager.register(autoroof);
    cheatManager.register(autobottle);
    cheatManager.register(autoaloe);
    cheatManager.register(autoputchest);

    //#endregion

    //#region obj props

    //user

    let user = null;
    let master = Symbol();
    Object.defineProperty(Object.prototype, "reconnect", {
        get() {
            return this[master];
        },
        set(data) {
            this[master] = data;
            if (user == null) {
                user = this;
                window.user = user;
            }
        },
    });

    let world = null;
    Object.defineProperty(Object.prototype, "mode", {
        get() {
            return this[master];
        },
        set(data) {
            this[master] = data;
            if (world == null) {
                world = this;
                window.world = world;
            }
        },
    });


    Object.defineProperty(Screen.prototype, "width", {
        get: function () {
            return 3840;
        },
        set: function (v) {
            this[_v] = v;
        }
    });

    Object.defineProperty(Screen.prototype, "height", {
        get: function () {
            return 2160;
        },
        set: function (v) {
            this[_v] = v;
        }
    });

    //#endregion

    let canvas;
    let ctx;
    window.addEventListener('load', function () {
        canvas = document.getElementById("game_canvas");
        ctx = canvas.getContext("2d");

        ctx.drawImage = new Proxy(ctx.drawImage, {
            apply() {
                if (xray.enabled) arguments[1].globalAlpha = .5;
                return Reflect.apply(...arguments);
            }
        });

        loadColouredSpikes();
    });


    function render() {
        const cheats = cheatManager.cheats.filter(cheat => cheat.enabled);
        const now = Date.now();

        if (ingame && socket.readyState === WebSocket.CLOSED) {
            ingame = false;
            dropweapon.equippedId = -1;
            getSocket();
            return;
        }

        for (let i = 0; i < cheats.length; i++) {
            const cheat = cheats[i];

            if (now - cheat.stamp >= cheat.cooldown) {
                cheat.stamp = now;
                cheat.run();
            }

            ctx.save();
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.font = "20px Baloo Paaji";
            ctx.strokeText(cheat.title, 10, (i * 20) + 20);
            ctx.fillText(cheat.title, 10, (i * 20) + 20);
            ctx.restore();

            if (cheat.bind.type == BIND_TYPES.SINGLE) {
                cheat.enabled = false;
            }
        }
        requestAnimationFrame(render);
    }

    const weaponValues = [57, 0, 5, 6, 30, 19, 62, 63, 9, 12, 13, 14, 15, 33, 34, 16, 17, 18];

    let socket = null;
    let ingame = false;

    let originalSocketSend = null;
    function getSocket() {
        if (!ingame && window != undefined && window[vars.wsParent] != undefined && window[vars.wsParent][vars.ws] != undefined && window[vars.wsParent][vars.ws].readyState === WebSocket.OPEN) { // && socket != null && socket.readyState === WebSocket.CLOSED
            //&& user != null && user[vars.alive] != undefined && user[vars.alive]) {
            ingame = true;

            socket = window[vars.wsParent][vars.ws];
            socket.addEventListener('message', messageHandler);
            socket.addEventListener('close', closeHandler);
            log("state after" + socket.readyState);

            var socketProxy = new Proxy(socket.send, {
                apply: function (target, thisArg, args) {
                    const raw = args[0];
                    let message = [];
                    switch (typeof raw) {
                        case "string": {
                            message = JSON.parse(raw);
                            const type = message[0];

                            switch (type) {
                                case CLIENT_PACKETS.CRAFT: {
                                    socket.send(JSON.stringify([CLIENT_PACKETS.EQUIP, 28]));
                                    autocraft.lastID = message[1];
                                } break;
                                case CLIENT_PACKETS.RECYCLE: {
                                    autorecycle.lastID = message[1];
                                } break;
                                case CLIENT_PACKETS.DROP_TO_CHEST: {
                                    if (onethousandinchest.enabled && message[2] == 10) {
                                        message[2] = 200;
                                        for (let i = 0; i < 4; i++) {
                                            socket.send(JSON.stringify([CLIENT_PACKETS.DROP_TO_CHEST, message[1], 200, message[3], message[4]]));
                                        }
                                    }
                                } break;
                                case CLIENT_PACKETS.EQUIP: {
                                    if (!user[vars.weaponCooldown].wait || user[vars.weaponCooldown].timeout[vars.weaponCooldownTime] < 0.1) {
                                        let id = parseInt(message[1]);
                                        if (id == 7 || !weaponValues.includes(id)) {
                                            dropweapon.equippedId = -1;
                                        }
                                        else {
                                            dropweapon.equippedId = id;
                                        }
                                    }
                                } break;
                                case CLIENT_PACKETS.DROP_WEAPON: {
                                    dropweapon.equippedId = -1;
                                } break;
                            }
                            args[0] = JSON.stringify(message);
                        } break;
                        case "object": {
                        } break;
                    }
                    return target.apply(thisArg, args);
                }
            });

            socket.send = socketProxy;
            requestAnimationFrame(render);

        } else {
            setTimeout(getSocket, 200);
        }
    }
    getSocket();

    //#region listeners
    function messageHandler(event) {
        switch (typeof event.data) {
            case "string": {
                const message = JSON.parse(event.data);
                const type = message.shift();
                switch (type) {
                    case SERVER_STRING_PACKETS.HANDSHAKE: {
                        me.x = message[2];
                        me.pid = message[8];
                        me.y = message[9];
                    } break;
                }
            } break;
            case "object": {
                const message = Array.from(new Uint8Array(event.data));
                const type = message.shift();

                switch (type) {
                    case SERVER_PACKETS.UNITS: {
                        message.shift();
                        const length = message.length / 18;

                        for (let i = 0; i < length; i++) {
                            const i18 = i * 18;

                            const pid = message[i18];
                            const angle = message[i18 + 1];
                            const action = message[i18 + 2] | message[i18 + 3] << 8;
                            const type = message[i18 + 4] | message[i18 + 5] << 8;
                            const x = message[i18 + 6] | message[i18 + 7] << 8;
                            const y = message[i18 + 8] | message[i18 + 9] << 8;
                            const id = message[i18 + 10] | message[i18 + 11] << 8;
                            const info = message[i18 + 12] | message[i18 + 13] << 8;
                            const speed = message[i18 + 14] | message[i18 + 15] << 8;
                            const extra = message[i18 + 16] | message[i18 + 17] << 8;

                            if (pid === me.pid) {
                                me.pid = pid;
                                me.angle = angle;
                                me.type = type;
                                me.x = x;
                                me.y = y;
                                me.id = id;
                                me.action = action;
                                me.info = info;
                                me.speed = speed;
                                me.extra = extra;
                            }

                            const uid = pid * 1000 + id;
                            if (type < 100) {
                                units[type][uid] = (action & 1 ? undefined : { pid, angle, action, type, x, y, id, info, speed, extra });
                            }
                        }
                    } break;
                    case SERVER_PACKETS.GAUGES: {
                    } break;
                }
            } break;
        }
    }

    const closeHandler = (event) => {
        for (let i = 0; i < 100; i++) units[i] = [];
        socket.removeEventListener('message', messageHandler);
        socket.removeEventListener('close', closeHandler);
    };


    window.addEventListener("keydown", function (event) {
        if ((socket != null && socket.readyState != WebSocket.OPEN) || user == null || (user[vars.chat] != undefined && user[vars.chat].open) || (user[vars.terminal] != undefined && user[vars.terminal].open)) {
            return;
        }
        for (const cheat of cheatManager.cheats) {
            if (cheat.bind.key === event.code) {
                switch (cheat.bind.type) {
                    case BIND_TYPES.DEFAULT: {
                        cheat.enabled = true;
                    } break;
                    case BIND_TYPES.TOGGLE: {
                        cheat.enabled = !cheat.enabled;
                    } break;
                    case BIND_TYPES.SINGLE: {
                        cheat.enabled = true;
                    } break;
                }
            }
        }
    });

    window.addEventListener("keyup", function (event) {
        if ((socket != null && socket.readyState != WebSocket.OPEN) || user == null || (user[vars.chat] != undefined && user[vars.chat].open) || (user[vars.terminal] != undefined && user[vars.terminal].open)) {
            return;
        }
        for (const cheat of cheatManager.cheats) {
            if (cheat.bind.key === event.code) {
                switch (cheat.bind.type) {
                    case BIND_TYPES.DEFAULT: {
                        cheat.enabled = false;
                    } break;
                }
            }
        }
    });

    //#endregion


    const trevdaInterval = setInterval(function () {
        if (document.getElementById("trevda")?.style?.display) {
            clearInterval(trevdaInterval);
            document.getElementById("trevda").style.display = "none";
        }
    }, 1);


    function loadColouredSpikes() {
        window.ReiditeSpikeAlly = new Image;
        window.ReiditeSpikeAlly.src = "https://raw.githubusercontent.com/XmreLoux/blackspikes/main/day-reidite-spike-enemy.png.111.png"
        window.AmethystSpikeAlly = new Image;
        window.AmethystSpikeAlly.src = "https://github.com/XmreLoux/blackspikes/blob/main/day-amethyst-spike-ally.png312312.png?raw=true"
        window.DiamondSpikeAlly = new Image;
        window.DiamondSpikeAlly.src = "https://github.com/XmreLoux/blackspikes/blob/main/day-diamond-spike-ally.png?raw=true"
        window.GoldSpikeAlly = new Image;
        window.GoldSpikeAlly.src = "https://github.com/XmreLoux/blackspikes/blob/main/day-gold-spike-ally%20remaster%20by%20hersgori.png?raw=true"
        window.StoneSpikeAlly = new Image;
        window.StoneSpikeAlly.src = "https://github.com/XmreLoux/blackspikes/blob/main/day-stone-spike-ally1.png?raw=true"
        window.WoodSpikeAlly = new Image;
        window.WoodSpikeAlly.src = "https://github.com/XmreLoux/blackspikes/blob/main/day-wood-spike-all1232y.png?raw=true"

        window.ReiditeSpikeEnemy = new Image;
        window.ReiditeSpikeEnemy.src = "https://github.com/XmreLoux/blackspikes/blob/main/day-reidite-spike-enemy.png12312.png?raw=true"
        window.AmethystSpikeEnemy = new Image;
        window.AmethystSpikeEnemy.src = "https://github.com/XmreLoux/blackspikes/blob/main/day-amethyst-spike-enemy.1213png1.png?raw=true"
        window.DiamondSpikeEnemy = new Image;
        window.DiamondSpikeEnemy.src = "https://github.com/XmreLoux/blackspikes/blob/main/day-diamond-spike-enemy.png1.png1.png?raw=true"
        window.GoldSpikeEnemy = new Image;
        window.GoldSpikeEnemy.src = "https://github.com/XmreLoux/blackspikes/blob/main/day-gold-spike-enemy.png1132.png1.png?raw=true"
        window.StoneSpikeEnemy = new Image;
        window.StoneSpikeEnemy.src = "https://github.com/XmreLoux/blackspikes/blob/main/day-stone-spike-enemy.png1.png?raw=true"
        window.WoodSpikeEnemy = new Image;
        window.WoodSpikeEnemy.src = "https://github.com/XmreLoux/blackspikes/blob/main/day-wood-spike-enemy.png123.png1.png?raw=true"

        window.ReiditeSpikeDoorAlly = new Image;
        window.ReiditeSpikeDoorAlly.src = "https://github.com/XmreLoux/blackspikes/blob/main/day-reidite-spike-door-ally%20remastered%20by%20hersgori.png?raw=true"
        window.AmethystSpikeDoorAlly = new Image;
        window.AmethystSpikeDoorAlly.src = "https://github.com/XmreLoux/blackspikes/blob/main/day-amethyst-spike-door-ally.png?raw=true"
        window.DiamondSpikeDoorAlly = new Image;
        window.DiamondSpikeDoorAlly.src = "https://github.com/XmreLoux/blackspikes/blob/main/day-diamond-spike-door-ally.png?raw=true"
        window.GoldSpikeDoorAlly = new Image;
        window.GoldSpikeDoorAlly.src = "https://github.com/XmreLoux/blackspikes/blob/main/day-gold-spike-door-ally.png?raw=true"
        window.StoneSpikeDoorAlly = new Image;
        window.StoneSpikeDoorAlly.src = "https://github.com/XmreLoux/blackspikes/blob/main/day-stone-spike-door-ally.png?raw=true"
        window.WoodSpikeDoorAlly = new Image;
        window.WoodSpikeDoorAlly.src = "https://github.com/XmreLoux/blackspikes/blob/main/day-wood-spike-door-ally.png?raw=true"

        window.ReiditeSpikeDoorEnemy = new Image;
        window.ReiditeSpikeDoorEnemy.src = "https://github.com/XmreLoux/blackspikes/blob/main/day-reidite-spike-door-enemy.png?raw=true"
        window.AmethystSpikeDoorEnemy = new Image;
        window.AmethystSpikeDoorEnemy.src = "https://github.com/XmreLoux/blackspikes/blob/main/day-amethyst-spike-door-enemy.png?raw=true"
        window.DiamondSpikeDoorEnemy = new Image;
        window.DiamondSpikeDoorEnemy.src = "https://github.com/XmreLoux/blackspikes/blob/main/day-diamond-spike-door-enemy.png?raw=true"
        window.GoldSpikeDoorEnemy = new Image;
        window.GoldSpikeDoorEnemy.src = "https://github.com/XmreLoux/blackspikes/blob/main/day-gold-spike-door-enemy.png?raw=true"
        window.StoneSpikeDoorEnemy = new Image;
        window.StoneSpikeDoorEnemy.src = "https://github.com/XmreLoux/blackspikes/blob/main/day-stone-spike-door-enemy.png?raw=true"
        window.WoodSpikeDoorEnemy = new Image;
        window.WoodSpikeDoorEnemy.src = "https://github.com/XmreLoux/blackspikes/blob/main/day-wood-spike-door-enemy.png?raw=true"

        window.ReiditeDoorAlly = new Image;
        window.ReiditeDoorAlly.src = "https://raw.githubusercontent.com/XmreLoux/images/main/door_reidite2.png"
        window.AmethystDoorAlly = new Image;
        window.AmethystDoorAlly.src = "https://raw.githubusercontent.com/XmreLoux/images/main/door_amethyst1.png"
        window.DiamondDoorAlly = new Image;
        window.DiamondDoorAlly.src = "https://raw.githubusercontent.com/XmreLoux/images/main/door_diamond2.png"
        window.GoldDoorAlly = new Image;
        window.GoldDoorAlly.src = "https://raw.githubusercontent.com/XmreLoux/images/main/door_gold2.png"
        window.StoneDoorAlly = new Image;
        window.StoneDoorAlly.src = "https://raw.githubusercontent.com/XmreLoux/images/main/door_stone1.png"
        window.WoodDoorAlly = new Image;
        window.WoodDoorAlly.src = "https://raw.githubusercontent.com/XmreLoux/images/main/door_wood2.png"

        window.ReiditeDoorEnemy = new Image;
        window.ReiditeDoorEnemy.src = "https://raw.githubusercontent.com/XmreLoux/images/main/door_reidite1.png"
        window.AmethystDoorEnemy = new Image;
        window.AmethystDoorEnemy.src = "https://raw.githubusercontent.com/XmreLoux/images/main/door_amethyst2.png"
        window.DiamondDoorEnemy = new Image;
        window.DiamondDoorEnemy.src = "https://raw.githubusercontent.com/XmreLoux/images/main/door_diamond1.png"
        window.GoldDoorEnemy = new Image;
        window.GoldDoorEnemy.src = "https://raw.githubusercontent.com/XmreLoux/images/main/door_gold1.png"
        window.StoneDoorEnemy = new Image;
        window.StoneDoorEnemy.src = "https://raw.githubusercontent.com/XmreLoux/images/main/door_stone2.png"
        window.WoodDoorEnemy = new Image;
        window.WoodDoorEnemy.src = "https://raw.githubusercontent.com/XmreLoux/images/main/door_wood1.png"

        let ITEMS = {
            SPIKE: 5,
            STONE_SPIKE: 12,
            GOLD_SPIKE: 13,
            DIAMOND_SPIKE: 14,
            AMETHYST_SPIKE: 20,
            REIDITE_SPIKE: 52,

            WOOD_DOOR: 10,
            STONE_DOOR: 15,
            GOLD_DOOR: 16,
            DIAMOND_DOOR: 17,
            AMETHYST_DOOR: 21,
            REIDITE_DOOR: 51,

            ROOF: 38,

            WOOD_SPIKE_DOOR: 45,
            STONE_SPIKE_DOOR: 46,
            GOLD_SPIKE_DOOR: 47,
            DIAMOND_SPIKE_DOOR: 48,
            AMETHYST_SPIKE_DOOR: 49,
            REIDITE_SPIKE_DOOR: 53
        }

        const Settings = {
            ColouredSpikes: true
        };

        window[vars.sprite][10000] = [WoodSpikeAlly, WoodSpikeAlly];
        window[vars.sprite][10001] = [WoodSpikeEnemy, WoodSpikeEnemy];

        window[vars.sprite][10002] = [StoneSpikeAlly, StoneSpikeAlly];
        window[vars.sprite][10003] = [StoneSpikeEnemy, StoneSpikeEnemy];

        window[vars.sprite][10004] = [GoldSpikeAlly, GoldSpikeAlly];
        window[vars.sprite][10005] = [GoldSpikeEnemy, GoldSpikeEnemy];

        window[vars.sprite][10006] = [DiamondSpikeAlly, DiamondSpikeAlly];
        window[vars.sprite][10007] = [DiamondSpikeEnemy, DiamondSpikeEnemy];

        window[vars.sprite][10008] = [AmethystSpikeAlly, AmethystSpikeAlly];
        window[vars.sprite][10009] = [AmethystSpikeEnemy, AmethystSpikeEnemy];

        window[vars.sprite][10010] = [ReiditeSpikeAlly, ReiditeSpikeAlly];
        window[vars.sprite][10011] = [ReiditeSpikeEnemy, ReiditeSpikeEnemy];


        window[vars.sprite][10012] = [WoodSpikeDoorAlly, WoodSpikeDoorAlly];
        window[vars.sprite][10013] = [WoodSpikeDoorEnemy, WoodSpikeDoorEnemy];

        window[vars.sprite][10014] = [StoneSpikeDoorAlly, StoneSpikeDoorAlly];
        window[vars.sprite][10015] = [StoneSpikeDoorEnemy, StoneSpikeDoorEnemy];

        window[vars.sprite][10016] = [GoldSpikeDoorAlly, GoldSpikeDoorAlly];
        window[vars.sprite][10017] = [GoldSpikeDoorEnemy, GoldSpikeDoorEnemy];

        window[vars.sprite][10018] = [DiamondSpikeDoorAlly, DiamondSpikeDoorAlly];
        window[vars.sprite][10019] = [DiamondSpikeDoorEnemy, DiamondSpikeDoorEnemy];

        window[vars.sprite][10020] = [AmethystSpikeDoorAlly, AmethystSpikeDoorAlly];
        window[vars.sprite][10021] = [AmethystSpikeDoorEnemy, AmethystSpikeDoorEnemy];

        window[vars.sprite][10022] = [ReiditeSpikeDoorAlly, ReiditeSpikeDoorAlly];
        window[vars.sprite][10023] = [ReiditeSpikeDoorEnemy, ReiditeSpikeDoorEnemy];

        window[vars.sprite][10024] = [WoodDoorAlly, WoodDoorAlly];
        window[vars.sprite][10025] = [WoodDoorEnemy, WoodDoorEnemy];

        window[vars.sprite][10026] = [StoneDoorAlly, StoneDoorAlly];
        window[vars.sprite][10027] = [StoneDoorEnemy, StoneDoorEnemy];

        window[vars.sprite][10028] = [GoldDoorAlly, GoldDoorAlly];
        window[vars.sprite][10029] = [GoldDoorEnemy, GoldDoorEnemy];

        window[vars.sprite][10030] = [DiamondDoorAlly, DiamondDoorAlly];
        window[vars.sprite][10031] = [DiamondDoorEnemy, DiamondDoorEnemy];

        window[vars.sprite][10032] = [AmethystDoorAlly, AmethystDoorAlly];
        window[vars.sprite][10033] = [AmethystDoorEnemy, AmethystDoorEnemy];

        window[vars.sprite][10034] = [ReiditeDoorAlly, ReiditeDoorAlly];
        window[vars.sprite][10035] = [ReiditeDoorEnemy, ReiditeDoorEnemy];


        let push = Array.prototype.push;

        Array.prototype.push = function (p) {
            if (p && null != p.type && null != p.id && p.x && p.y) {
                log(p);
                switch (p.type) {
                    case ITEMS.SPIKE: {
                        let l = p[vars.draw];
                        p[vars.draw] = function (a) {
                            return Settings.ColouredSpikes ? (isAlly(p[vars.pid]) ? l.apply(this, [1e4]) : l.apply(this, [10001])) : l.apply(this, arguments);
                        };
                        break;
                    }
                    case ITEMS.STONE_SPIKE: {
                        let i = p[vars.draw];
                        p[vars.draw] = function (a) {
                            return Settings.ColouredSpikes ? (isAlly(p[vars.pid]) ? i.apply(this, [10002]) : i.apply(this, [10003])) : i.apply(this, arguments);
                        };
                        break;
                    }
                    case ITEMS.GOLD_SPIKE: {
                        let e = p[vars.draw];
                        p[vars.draw] = function (a) {
                            return Settings.ColouredSpikes ? (isAlly(p[vars.pid]) ? e.apply(this, [10004]) : e.apply(this, [10005])) : e.apply(this, arguments);
                        };
                        break;
                    }
                    case ITEMS.DIAMOND_SPIKE: {
                        let t = p[vars.draw];
                        p[vars.draw] = function (a) {
                            return Settings.ColouredSpikes ? (isAlly(p[vars.pid]) ? t.apply(this, [10006]) : t.apply(this, [10007])) : t.apply(this, arguments);
                        };
                        break;
                    }
                    case ITEMS.AMETHYST_SPIKE: {
                        let r = p[vars.draw];
                        p[vars.draw] = function (a) {
                            return Settings.ColouredSpikes ? (isAlly(p[vars.pid]) ? r.apply(this, [10008]) : r.apply(this, [10009])) : r.apply(this, arguments);
                        };
                        break;
                    }
                    case ITEMS.REIDITE_SPIKE: {
                        let y = p[vars.draw];
                        p[vars.draw] = function (a) {
                            return Settings.ColouredSpikes ? (isAlly(p[vars.pid]) ? y.apply(this, [10010]) : y.apply(this, [10011])) : y.apply(this, arguments);
                        };
                        break;
                    }


                    case ITEMS.WOOD_DOOR: {
                        let s = p[vars.draw];
                        p[vars.draw] = function (a) {
                            return Settings.ColouredSpikes ? (arguments[0] != 166 ? s.apply(this, arguments) : isAlly(p[vars.pid]) ? s.apply(this, [10024]) : s.apply(this, [10025])) : s.apply(this, arguments);
                        };
                        break;
                    }
                    case ITEMS.STONE_DOOR: {
                        let d = p[vars.draw];
                        p[vars.draw] = function (a) {
                            return arguments[0] != 171 ? d.apply(this, arguments) : Settings.ColouredSpikes ? (isAlly(p[vars.pid]) ? d.apply(this, [10026]) : d.apply(this, [10027])) : d.apply(this, arguments);
                        };
                        break;
                    }
                    case ITEMS.GOLD_DOOR: {
                        let $ = p[vars.draw];
                        p[vars.draw] = function (a) {
                            return arguments[0] != 172 ? $.apply(this, arguments) : Settings.ColouredSpikes ? (isAlly(p[vars.pid]) ? $.apply(this, [10028]) : $.apply(this, [10029])) : $.apply(this, arguments);
                        };
                        break;
                    }
                    case ITEMS.DIAMOND_DOOR: {
                        let h = p[vars.draw];
                        p[vars.draw] = function (a) {
                            return arguments[0] != 173 ? h.apply(this, arguments) : Settings.ColouredSpikes ? (isAlly(p[vars.pid]) ? h.apply(this, [10030]) : h.apply(this, [10031])) : h.apply(this, arguments);
                        };
                        break;
                    }
                    case ITEMS.AMETHYST_DOOR: {
                        let n = p[vars.draw];
                        p[vars.draw] = function (a) {
                            return Settings.ColouredSpikes ? (arguments[0] != 124 ? n.apply(this, arguments) : isAlly(p[vars.pid]) ? n.apply(this, [10032]) : n.apply(this, [10033])) : n.apply(this, arguments);
                        };
                        break;
                    }
                    case ITEMS.REIDITE_DOOR: {
                        let o = p[vars.draw];
                        p[vars.draw] = function (a) {
                            return arguments[0] != 218 ? o.apply(this, arguments) : Settings.ColouredSpikes ? (isAlly(p[vars.pid]) ? o.apply(this, [10034]) : o.apply(this, [10035])) : o.apply(this, arguments);
                        };
                        break;
                    }


                    case ITEMS.WOOD_SPIKE_DOOR: {
                        let _ = p[vars.draw];
                        p[vars.draw] = function (a) {
                            return Settings.ColouredSpikes ? (arguments[0] != 212 ? _.apply(this, arguments) : isAlly(p[vars.pid]) ? _.apply(this, [10012]) : _.apply(this, [10013])) : _.apply(this, arguments);
                        };
                        break;
                    }
                    case ITEMS.STONE_SPIKE_DOOR: {
                        let D = p[vars.draw];
                        p[vars.draw] = function (a) {
                            return arguments[0] != 213 ? D.apply(this, arguments) : Settings.ColouredSpikes ? (isAlly(p[vars.pid]) ? D.apply(this, [10014]) : D.apply(this, [10015])) : D.apply(this, arguments);
                        };
                        break;
                    }
                    case ITEMS.GOLD_SPIKE_DOOR: {
                        let u = p[vars.draw];
                        p[vars.draw] = function (a) {
                            return arguments[0] != 214 ? u.apply(this, arguments) : Settings.ColouredSpikes ? (isAlly(p[vars.pid]) ? u.apply(this, [10016]) : u.apply(this, [10017])) : u.apply(this, arguments);
                        };
                        break;
                    }
                    case ITEMS.DIAMOND_SPIKE_DOOR: {
                        let c = p[vars.draw];
                        p[vars.draw] = function (a) {
                            return arguments[0] != 215 ? c.apply(this, arguments) : Settings.ColouredSpikes ? (isAlly(p[vars.pid]) ? c.apply(this, [10018]) : c.apply(this, [10019])) : c.apply(this, arguments);
                        };
                        break;
                    }
                    case ITEMS.AMETHYST_SPIKE_DOOR: {
                        let I = p[vars.draw];
                        p[vars.draw] = function (a) {
                            return Settings.ColouredSpikes ? (arguments[0] != 216 ? I.apply(this, arguments) : isAlly(p[vars.pid]) ? I.apply(this, [10020]) : I.apply(this, [10021])) : I.apply(this, arguments);
                        };
                        break;
                    }
                    case ITEMS.REIDITE_SPIKE_DOOR: {
                        let w = p[vars.draw];
                        p[vars.draw] = function (a) {
                            return Settings.ColouredSpikes ? (arguments[0] != 220 ? w.apply(this, arguments) : isAlly(p[vars.pid]) ? w.apply(this, [10022]) : w.apply(this, [10023])) : w.apply(this, arguments);
                        };
                        break;
                    }
                }
            }
            return push.apply(this, arguments);
        };
    }
})();