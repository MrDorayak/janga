

/* workerTimers */ ! function (e, t) { "object" == typeof exports && "undefined" != typeof module ? t(exports) : "function" == typeof define && define.amd ? define(["exports"], t) : t((e = "undefined" != typeof globalThis ? globalThis : e || self).fastUniqueNumbers = {}) }(this, function (e) { "use strict"; var t, r = void 0 === Number.MAX_SAFE_INTEGER ? 9007199254740991 : Number.MAX_SAFE_INTEGER, n = new WeakMap, i = function (e, t) { return function (n) { var i = t.get(n), o = void 0 === i ? n.size : i < 1073741824 ? i + 1 : 0; if (!n.has(o)) return e(n, o); if (n.size < 536870912) { for (; n.has(o);) o = Math.floor(1073741824 * Math.random()); return e(n, o) } if (n.size > r) throw new Error("Congratulations, you created a collection of unique numbers which uses all available integers!"); for (; n.has(o);) o = Math.floor(Math.random() * r); return e(n, o) } }((t = n, function (e, r) { return t.set(e, r), r }), n), o = function (e) { return function (t) { var r = e(t); return t.add(r), r } }(i); e.addUniqueNumber = o, e.generateUniqueNumber = i, Object.defineProperty(e, "__esModule", { value: !0 }) }), function (e, t) { "object" == typeof exports && "undefined" != typeof module ? t(exports, require("fast-unique-numbers")) : "function" == typeof define && define.amd ? define(["exports", "fast-unique-numbers"], t) : t((e = "undefined" != typeof globalThis ? globalThis : e || self).workerTimersBroker = {}, e.fastUniqueNumbers) }(this, function (e, t) { "use strict"; e.load = function (e) { var r = new Map([[0, function () { }]]), n = new Map([[0, function () { }]]), i = new Map, o = new Worker(e); o.addEventListener("message", function (e) { var t = e.data; if (function (e) { return void 0 !== e.method && "call" === e.method }(t)) { var o = t.params, a = o.timerId, s = o.timerType; if ("interval" === s) { var u = r.get(a); if ("number" == typeof u) { var d = i.get(u); if (void 0 === d || d.timerId !== a || d.timerType !== s) throw new Error("The timer is in an undefined state.") } else { if (void 0 === u) throw new Error("The timer is in an undefined state."); u() } } else if ("timeout" === s) { var f = n.get(a); if ("number" == typeof f) { var l = i.get(f); if (void 0 === l || l.timerId !== a || l.timerType !== s) throw new Error("The timer is in an undefined state.") } else { if (void 0 === f) throw new Error("The timer is in an undefined state."); f(), n.delete(a) } } } else { if (! function (e) { return null === e.error && "number" == typeof e.id }(t)) { var m = t.error.message; throw new Error(m) } var c = t.id, p = i.get(c); if (void 0 === p) throw new Error("The timer is in an undefined state."); var v = p.timerId, h = p.timerType; i.delete(c), "interval" === h ? r.delete(v) : n.delete(v) } }); return { clearInterval: function (e) { var n = t.generateUniqueNumber(i); i.set(n, { timerId: e, timerType: "interval" }), r.set(e, n), o.postMessage({ id: n, method: "clear", params: { timerId: e, timerType: "interval" } }) }, clearTimeout: function (e) { var r = t.generateUniqueNumber(i); i.set(r, { timerId: e, timerType: "timeout" }), n.set(e, r), o.postMessage({ id: r, method: "clear", params: { timerId: e, timerType: "timeout" } }) }, setInterval: function (e, n) { var i = t.generateUniqueNumber(r); return r.set(i, function () { e(), "function" == typeof r.get(i) && o.postMessage({ id: null, method: "set", params: { delay: n, now: performance.now(), timerId: i, timerType: "interval" } }) }), o.postMessage({ id: null, method: "set", params: { delay: n, now: performance.now(), timerId: i, timerType: "interval" } }), i }, setTimeout: function (e, r) { var i = t.generateUniqueNumber(n); return n.set(i, e), o.postMessage({ id: null, method: "set", params: { delay: r, now: performance.now(), timerId: i, timerType: "timeout" } }), i } } }, Object.defineProperty(e, "__esModule", { value: !0 }) }), function (e, t) { "object" == typeof exports && "undefined" != typeof module ? t(exports, require("worker-timers-broker")) : "function" == typeof define && define.amd ? define(["exports", "worker-timers-broker"], t) : t((e = "undefined" != typeof globalThis ? globalThis : e || self).workerTimers = {}, e.workerTimersBroker) }(this, function (e, t) { "use strict"; var r = null, n = function (e, t) { return function () { if (null !== r) return r; var n = new Blob([t], { type: "application/javascript; charset=utf-8" }), i = URL.createObjectURL(n); return (r = e(i)).setTimeout(function () { return URL.revokeObjectURL(i) }, 0), r } }(t.load, '(()=>{var e={67:(e,t,r)=>{var o,i;void 0===(i="function"==typeof(o=function(){"use strict";var e=new Map,t=new Map,r=function(t){var r=e.get(t);if(void 0===r)throw new Error(\'There is no interval scheduled with the given id "\'.concat(t,\'".\'));clearTimeout(r),e.delete(t)},o=function(e){var r=t.get(e);if(void 0===r)throw new Error(\'There is no timeout scheduled with the given id "\'.concat(e,\'".\'));clearTimeout(r),t.delete(e)},i=function(e,t){var r,o=performance.now();return{expected:o+(r=e-Math.max(0,o-t)),remainingDelay:r}},n=function e(t,r,o,i){var n=performance.now();n>o?postMessage({id:null,method:"call",params:{timerId:r,timerType:i}}):t.set(r,setTimeout(e,o-n,t,r,o,i))},a=function(t,r,o){var a=i(t,o),s=a.expected,d=a.remainingDelay;e.set(r,setTimeout(n,d,e,r,s,"interval"))},s=function(e,r,o){var a=i(e,o),s=a.expected,d=a.remainingDelay;t.set(r,setTimeout(n,d,t,r,s,"timeout"))};addEventListener("message",(function(e){var t=e.data;try{if("clear"===t.method){var i=t.id,n=t.params,d=n.timerId,c=n.timerType;if("interval"===c)r(d),postMessage({error:null,id:i});else{if("timeout"!==c)throw new Error(\'The given type "\'.concat(c,\'" is not supported\'));o(d),postMessage({error:null,id:i})}}else{if("set"!==t.method)throw new Error(\'The given method "\'.concat(t.method,\'" is not supported\'));var u=t.params,l=u.delay,p=u.now,m=u.timerId,v=u.timerType;if("interval"===v)a(l,m,p);else{if("timeout"!==v)throw new Error(\'The given type "\'.concat(v,\'" is not supported\'));s(l,m,p)}}}catch(e){postMessage({error:{message:e.message},id:t.id,result:null})}}))})?o.call(t,r,t,e):o)||(e.exports=i)}},t={};function r(o){var i=t[o];if(void 0!==i)return i.exports;var n=t[o]={exports:{}};return e[o](n,n.exports,r),n.exports}r.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return r.d(t,{a:t}),t},r.d=(e,t)=>{for(var o in t)r.o(t,o)&&!r.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{"use strict";r(67)})()})();'); e.clearInterval = function (e) { return n().clearInterval(e) }, e.clearTimeout = function (e) { return n().clearTimeout(e) }, e.setInterval = function (e, t) { return n().setInterval(e, t) }, e.setTimeout = function (e, t) { return n().setTimeout(e, t) }, Object.defineProperty(e, "__esModule", { value: !0 }) });

    const packets = {
        extPut: 9,
        extTake: 1,
        placeBuild: 15,
        joinTotem: 38,
        angle: 19,
        attack: 24,
        stopAttack: 36,
        chestPut: 13,
        chestTake: 27,
        equip: 16,
        recycle: 20,
        craft: 2,
    };

    const Information = {
        Attempted: null,
        BerryTime: null,
        BottleTime: null,
        TotemAttempts: null
    };

    var TimersInt = Date.now(),
        HealthTracker = 2,
        healthInt = Date.now();

    let Settings = {
        EnabledHacks: {
            enabled: true
        },
        Tracers: {
            enabled: true
        },
        Timers: {
            enabled: true
        },
        Percents: {
            enabled: true
        },
        ColoredSpikes: {
            enabled: true
        },
        AutoSpike: {
            key: "Space",
            enabled: false,
            type: 'hold'
        },
        AutoSteal: {
            key: 'KeyE',
            enabled: false,
            type: 'hold'
        },
        Aimbot: {
            enabled: false,
            key: "KeyF",
            a: null,
            t: null,
        },
        AutoCraft: {
            enabled: false,
            key: "KeyC"
        },
        AutoRecycle: {
            enabled: false,
            key: "KeyL"
        },
        TotemInfo: {
            enabled: true,
        },
        AutoTotem: {
            key: 'KeyH',
            enabled: true
        },
        AutoBook: {
            enabled: true
        },
        AutoFeed: {
            enabled: true
        }
    };

    setTimeout(() => {
        let GUI = new GuifyCreator({
            title: "🚬 AstraSpark 🚬",
            theme: {
                colors: {
                    guiBackground: "#0A1634",
                    componentBackground: "grey",
                    componentForeground: "rgb(0,255,255)",
                    textColor: "rgb(0,255,255)",
                    folderBackground: "#0A1634",
                    folderText: "rgb(0,255,255)",
                    hoverColor: '#4D7BEC',
                    hoverTime: 1,
                    componentHighlight: '#8BA9F3'
                },
                font: {
                    family: "Baloo Paaji",
                    size: "20px",
                }
            },
            opacity: .8,
            align: "right",
            width: 550,
            type: 'container',
            open: true,
            draggable: false
        });

        GUI.create({ label: 'Visuals', open: false, type: 'folder' });
        GUI.create({ label: 'Misc & Keybinds', open: false, type: 'folder' });
        GUI.create({ label: 'AutoSpike', open: false, type: 'folder' });
        GUI.create({ label: 'AutoCraft & Recycle', open: false, type: 'folder' });

        GUI.create([
            { label: 'Colored Spikes', type: 'switch', object: Settings.ColoredSpikes, property: 'enabled' },
            { label: 'Timers', type: 'switch', object: Settings.Timers, property: 'enabled' },
            { label: 'Percentages', type: 'switch', object: Settings.Percents, property: 'enabled' },
            { label: 'Tracers', type: 'switch', object: Settings.Tracers, property: 'enabled' },
            { label: 'Totem Info', type: 'switch', object: Settings.TotemInfo, property: 'enabled' },
            { label: 'Show Enabled Hacks', type: 'switch', object: Settings.EnabledHacks, property: 'enabled' },

            [{ folder: 'Visuals' }]
        ]);

        GUI.create([
            { label: 'AutoBook', type: 'switch', object: Settings.AutoBook, property: 'enabled' },
            { label: 'AutoTotem', type: 'switch', object: Settings.AutoTotem, property: 'enabled' },
            { label: 'Aimbot', type: 'switch', object: Settings.Aimbot, property: 'enabled' },
            { label: 'AutoFeed', type: 'switch', object: Settings.AutoFeed, property: 'enabled' },

            { label: 'AutoTotem Key:', type: 'display', object: Settings.AutoTotem, property: 'key' },
            { label: 'Set AutoTotem Key', type: 'button', onClick(e) { setKeyBind(Settings.AutoTotem) } },

            { label: 'Aimbot Key:', type: 'display', object: Settings.Aimbot, property: 'key' },
            { label: 'Set Aimbot Key', type: 'button', onClick(e) { setKeyBind(Settings.Aimbot) } },

            [{ folder: 'Misc & Keybinds' }]
        ]);

        GUI.create([
            { label: 'AutoSpike', type: 'switch', object: Settings.AutoSpike, property: 'enabled' },

            { label: 'AutoSpike Key:', type: 'display', object: Settings.AutoSpike, property: 'key' },
            { label: 'Set AutoSpike Key', type: 'button', onClick(e) { setKeyBind(Settings.AutoSpike) } },

            [{ folder: 'AutoSpike' }]
        ]);

        GUI.create([
            { label: 'AutoCraft', type: 'switch', object: Settings.AutoCraft, property: 'enabled' },

            { label: 'AutoCraft Key:', type: 'display', object: Settings.AutoCraft, property: 'key' },
            { label: 'Set AutoCraft Key', type: 'button', onClick(e) { setKeyBind(Settings.AutoCraft) } },

            { label: 'AutoRecycle', type: 'switch', object: Settings.AutoRecycle, property: 'enabled' },

            { label: 'AutoRecycle Key:', type: 'display', object: Settings.AutoRecycle, property: 'key' },
            { label: 'Set AutoSpike Key', type: 'button', onClick(e) { setKeyBind(Settings.AutoRecycle) } },

            [{ folder: 'AutoCraft & Recycle' }]
        ]);

        function setKeyBind(option) {
            option.key = 'Press a key';
            document.addEventListener('keydown', (function eventListener(event) {
                document.removeEventListener('keydown', eventListener);
                if ('Escape' == event.code) {
                    return option.key = "NONE";
                };
                option.key = event.code;
            }));
        };
    }, 1000);

    let LAST_CRAFT, LAST_RECYCLE;


let world;
let client;
let user;
let mouse;

let master = Symbol()
log(unsafeWindow);

const HookClient = () => {
    Object.defineProperty(Object.prototype, "timeout", {
        get() {
            return this[master]
        },
        set(data) {
            this[master] = data;
            if (!client) {
                client = this;
                unsafeWindow.client = client;
                log(client);
            }
        },
    })
};

const HookMouse = () => {
    Object.defineProperty(Object.prototype, "IDLE", {
        get() {
            return this[master]
        },
        set(data) {
            this[master] = data;
            if (!mouse) {
                mouse = this;
                unsafeWindow.mouse = mouse;
                log(mouse)
            }
        },
    })
}

const HookOpacity = () => {
    Object.defineProperty(Object.prototype, "opacity", {
        get() {
            this[master] = 0.5
            return this[master]

        },
        set(data) {
            this[master] = data;

        },
    })
}

const HookWidth = () => {
    Object.defineProperty(Screen.prototype, "width", {
        get: function () {
            return 3840;
        },
        set: function (v) {
            this[master] = v;
        }
    });
}

const HookHeight = () => {
    Object.defineProperty(Screen.prototype, "height", {
        get: function () {
            return 2160;
        },
        set: function (v) {
            this[master] = v;
        }
    });
}

const HookWorld = () => {
    Object.defineProperty(Object.prototype, "mode", {
        get() {
            return this[master]
        },
        set(data) {
            this[master] = data;
            if (!world) {
                world = this;
                log(world)
                unsafeWindow.world = world;
            }
        },
    })
}

const HookUser = () => {
    Object.defineProperty(Object.prototype, "control", {
        get() {
            return this[master]
        },
        set(data) {
            this[master] = data;
            if (!user) {
                user = this;
                unsafeWindow.user = user;
                log(user)
                RemoveAds();
            }
        },
    })
};

const disableVideo = () => {
    const observer = new MutationObserver(function (mutations) {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (
                    node.src &&
                    (
                        node.src.includes("server.cmpstar.net") ||
                        node.src.includes("sdk.truepush.com") ||
                        node.src.includes("sdki.truepush.com") ||
                        node.src.includes("adinplay") ||
                        node.src.includes("amazon-adsystem.com") ||
                        node.src.includes("www.google-analytics.com") ||
                        node.src.includes("ib.adnxs.com") ||
                        node.src.includes("targeting.unrulymedia.com") ||
                        node.src.includes("www.google-analytics.com") ||
                        node.src.includes("pagead2.googlesyndication.com") ||
                        node.src.includes("doubleclick.net") ||
                        node.src.includes("script.4dex.io")
                    )
                ) {
                    node.src = "";
                    node.innerHTML = "";
                    node.textContent = "";
                }

                if (node.className === "wg-ad-container") {
                    setTimeout(function () {
                        const ad = document.querySelector(".wg-ad-player");
                        ad.currentTime = 20;
                        const holder = ad.parentElement;
                        holder.style.display = 'none';
                    }, 1);
                }
            }
        }
    });

    observer.observe(document, {
        childList: true,
        attributes: true,
        subtree: true
    });
};

const RemoveAds = () => {
    let uwu = document.getElementById("preroll")
    let uws = document.getElementById("trevda")
    let style = document.createElement('style');

    uwu.remove()
    uws.remove()
    style.innerHTML = '.grecaptcha-badge { visibility: hidden; }';

    document.head.appendChild(style);

    disableVideo();
}

HookUser();
HookClient();
HookWorld();
HookOpacity();
HookMouse();
HookWidth();
HookHeight();

    const GetPid = (obj) => {
        var pid = null,
            id_ = [];

        for (let property in obj) {
            /* Grab the id */
            if (!Array.isArray(obj[property]) && !isNaN(obj[property]) && Number(obj[property]) > 0 && Number(obj[property]) <= 100 && !triangles(property)) {
                id_.push(obj[property]) /* Suspected id */
            };
            /* Grab the pid */
            for (let x = 0; x < id_.length; x++) {
                if (obj[property] && ((id_[x] * 1000) == obj[property]) && !triangles(property)) {
                    pid = obj[property];
                    break;
                }
            }
        }

        return pid;
    }

    function ChatOpened() {
        if (document.getElementById("chat_block").style.display === 'inline-block' || document.getElementById("commandMainBox").style.display === 'inline-block') {
            return true;
        } else {
            return false;
        }
    }

    function getUserPosition() {

        let camx;
        let camy;

        for (let prop1 in user) {
            for (let prop2 in user[prop1]) {
                switch (prop2) {
                    case "x":
                        camx = user[prop1][prop2];
                        break;
                    case "y":
                        camy = user[prop1][prop2];
                        break;
                }
            }
        }

        return [camx, camy]
    }

    const getClientId = (id, type) => {
        let counter = 0;
        for (let prop in type) {
            counter++;
            if (counter === id) {
                return type[prop];
            };
        };
    };

    const Send = (data) => {
        let sock = getClientId(1, client);
        sock.send(JSON.stringify(data))
    };

    const GetUnits = () => {
        let units = getClientId(5, world);
        return units;
    };

    const triangles = (name) => {
        for (let i = 0; i < name.length; i++) if ("qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM".includes(name[i])) return true;
        return false;
    };

    const getMyPlayer = () => {
        const id = user.id;
        const units = getClientId(6, world);
        var myPlayer = null;

        if (!units) return;
        for (let i = 0; i < units.length; i++) {
            var counter = 0;

            var id_ = [];

            var finalID = null;

            for (let property in units[i]) {
                counter++;

                /* Grab the id */
                if (!Array.isArray(units[i][property]) && !isNaN(units[i][property]) && Number(units[i][property]) > 0 && Number(units[i][property]) <= 100 && !triangles(property)) {
                    id_.push(units[i][property]) /* Suspected id */
                };
                /* Grab the pid */
                for (let x = 0; x < id_.length; x++) if (units[i] && ((id_[x] * 1000) == units[i][property]) && !triangles(property)) finalID = id_[x];
                if (finalID === id) {
                    myPlayer = units[i];
                    break;
                };
            };
        };

        return myPlayer;
    };


    const inventoryHas = (id) => {

        let inv = getClientId(35, user);
        let inv2;

        let counter = 0;
        for (let prop in inv) {
            counter++;
            if (counter === 4) {
                inv2 = inv[prop];

                if (inv2[id] !== 0 && inv2[id] !== undefined) {
                    return [true, inv2[id]]
                } else {
                    return [false, undefined]
                }
            };
        }
    }

    const isAlive = () => {
        let alive = getClientId(11, user);
        return alive;
    };

    const AutoBook = () => {
        let count = 0;
        for (let property in client) {
            count++;
            if (count === 96) {
                let craft = property

                client[craft] = (id) => {

                    LAST_CRAFT = id;

                    if (Settings.AutoBook.enabled) Send([packets.equip, 28])

                    Send([packets.craft, id]);
                    return;
                };
            }
        }
    };

    const AutoCraft = () => {
        if (LAST_CRAFT !== undefined)
            Send([packets.craft, LAST_CRAFT]);
    };

    const InterceptRecycle = () => {

        let count = 0;
        for (let property in client) {
            count++;
            if (count === 116) {
                let recycle = property

                client[recycle] = (id) => {
                    LAST_RECYCLE = id;

                    Send([packets.recycle, id]);
                };
            };
        };
    };


    const AutoRecycle = () => {
        if (LAST_RECYCLE !== undefined)
            Send([packets.recycle, LAST_RECYCLE]);
    };

    const EnabledHacks = () => {
        try {
            window.ctx = document.getElementById("game_canvas").getContext("2d");
        } catch (error) {
            return;
        }

        let i = 22.5;
        for (hack in Settings) {
            if (Settings[hack].enabled && Settings[hack].key) {
                ctx.save();
                ctx.beginPath();
                ctx.lineWidth = 6;
                ctx.fillStyle = "red";
                ctx.strokeStyle = "black";
                ctx.font = "22px Baloo Paaji";
                ctx.strokeText(hack, 3, i);
                ctx.fillText(hack, 3, i);
                ctx.restore();
                i += 22.5;
            }
        }
    }

    function ColoredSpikes() {
        unsafeWindow.ReiditeSpikeAlly = new Image;
        unsafeWindow.ReiditeSpikeAlly.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-reidite-spike-ally.png"
        unsafeWindow.AmethystSpikeAlly = new Image;
        unsafeWindow.AmethystSpikeAlly.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-amethyst-spike-ally.png"
        unsafeWindow.DiamondSpikeAlly = new Image;
        unsafeWindow.DiamondSpikeAlly.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-diamond-spike-ally.png"
        unsafeWindow.GoldSpikeAlly = new Image;
        unsafeWindow.GoldSpikeAlly.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-gold-spike-ally.png"
        unsafeWindow.StoneSpikeAlly = new Image;
        unsafeWindow.StoneSpikeAlly.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-stone-spike-ally.png"
        unsafeWindow.WoodSpikeAlly = new Image;
        unsafeWindow.WoodSpikeAlly.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-wood-spike-ally.png"

        unsafeWindow.ReiditeSpikeEnemy = new Image;
        unsafeWindow.ReiditeSpikeEnemy.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-reidite-spike-enemy.png"
        unsafeWindow.AmethystSpikeEnemy = new Image;
        unsafeWindow.AmethystSpikeEnemy.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-amethyst-spike-enemy.png"
        unsafeWindow.DiamondSpikeEnemy = new Image;
        unsafeWindow.DiamondSpikeEnemy.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-diamond-spike-enemy.png"
        unsafeWindow.GoldSpikeEnemy = new Image;
        unsafeWindow.GoldSpikeEnemy.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-gold-spike-enemy.png"
        unsafeWindow.StoneSpikeEnemy = new Image;
        unsafeWindow.StoneSpikeEnemy.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-stone-spike-enemy.png"
        unsafeWindow.WoodSpikeEnemy = new Image;
        unsafeWindow.WoodSpikeEnemy.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-wood-spike-enemy.png"

        let ITEMS = {
            SPIKE: 5,
            STONE_SPIKE: 12,
            GOLD_SPIKE: 13,
            DIAMOND_SPIKE: 14,
            AMETHYST_SPIKE: 20,
            REIDITE_SPIKE: 52,
        }

        unsafeWindow.Ⲇᐃ = unsafeWindow['Ⲇᐃ'];

        Ⲇᐃ[10000] = [WoodSpikeAlly, WoodSpikeAlly];
        Ⲇᐃ[10001] = [WoodSpikeEnemy, WoodSpikeEnemy];

        Ⲇᐃ[10002] = [StoneSpikeAlly, StoneSpikeAlly];
        Ⲇᐃ[10003] = [StoneSpikeEnemy, StoneSpikeEnemy];

        Ⲇᐃ[10004] = [GoldSpikeAlly, GoldSpikeAlly];
        Ⲇᐃ[10005] = [GoldSpikeEnemy, GoldSpikeEnemy];

        Ⲇᐃ[10006] = [DiamondSpikeAlly, DiamondSpikeAlly];
        Ⲇᐃ[10007] = [DiamondSpikeEnemy, DiamondSpikeEnemy];

        Ⲇᐃ[10008] = [AmethystSpikeAlly, AmethystSpikeAlly];
        Ⲇᐃ[10009] = [AmethystSpikeEnemy, AmethystSpikeEnemy];

        Ⲇᐃ[10010] = [ReiditeSpikeAlly, ReiditeSpikeAlly];
        Ⲇᐃ[10011] = [ReiditeSpikeEnemy, ReiditeSpikeEnemy];

        function isAlly(id) {
            let team = getClientId(22, user);

            switch (id) {
                case user.id:
                    return true;
                default:
                    if (Array.isArray(team)) {
                        return team.includes(id);
                    }
            }

            return false;
        };

        const Units = GetUnits();

        const GetDraw = (Unit) => {
            for (let prop in Unit) {
                if (Unit[prop].toString().includes('function')) {
                    return prop;
                };
            };
        }

        for (let i = 0; i < Units.length; i++) {
            const UnitsType = Units[i];

            switch (i) {
                case ITEMS.SPIKE: {
                    for (let a = 0; a < UnitsType.length; a++) {
                        var obj = UnitsType[a];
                        obj.ally = user.id === obj.ΔⵠΔΔ || isAlly(obj.ΔⵠΔΔ);
                        let l = obj[Draw];
                        obj[Draw] = function (a) {
                            return Settings.ColoredSpikes ? (obj.ally ? l.apply(this, [1e4]) : l.apply(this, [10001])) : l.apply(this, arguments);
                        };
                    };
                    break;
                };
                case ITEMS.STONE_SPIKE: {
                    for (let a = 0; a < UnitsType.length; a++) {
                        var obj = UnitsType[a];
                        obj.ally = user.id === obj.ΔⵠΔΔ || isAlly(obj.ΔⵠΔΔ);
                        const Draw = GetDraw(obj);
                        let i = obj[Draw];
                        obj[Draw] = function (a) {
                            return Settings.ColoredSpikes ? (obj.ally ? i.apply(this, [10002]) : i.apply(this, [10003])) : i.apply(this, arguments);
                        };
                    };
                    break;
                };
                case ITEMS.GOLD_SPIKE: {
                    for (let a = 0; a < UnitsType.length; a++) {
                        var obj = UnitsType[a];
                        obj.ally = user.id === obj.ΔⵠΔΔ || isAlly(obj.ΔⵠΔΔ);
                        const Draw = GetDraw(obj);
                        log('Gold', obj.id, obj.ally)
                        let e = obj[Draw];
                        obj[Draw] = function (a) {
                            return Settings.ColoredSpikes ? (obj.ally ? e.apply(this, [10004]) : e.apply(this, [10005])) : e.apply(this, arguments);
                        };
                    };
                    break;
                };
                case ITEMS.DIAMOND_SPIKE: {
                    for (let a = 0; a < UnitsType.length; a++) {
                        var obj = UnitsType[a];
                        obj.ally = user.id === obj.ΔⵠΔΔ || isAlly(obj.ΔⵠΔΔ);
                        const Draw = GetDraw(obj);
                        let t = obj[Draw];
                        obj[Draw] = function (a) {
                            return Settings.ColoredSpikes ? (obj.ally ? t.apply(this, [10006]) : t.apply(this, [10007])) : t.apply(this, arguments);
                        };
                    };
                    break;
                };
                case ITEMS.AMETHYST_SPIKE: {
                    for (let a = 0; a < UnitsType.length; a++) {
                        var obj = UnitsType[a];
                        obj.ally = user.id === obj.ΔⵠΔΔ || isAlly(obj.ΔⵠΔΔ);
                        const Draw = GetDraw(obj);
                        let r = obj[Draw];
                        obj[Draw] = function (a) {
                            return Settings.ColoredSpikes ? (obj.ally ? r.apply(this, [10008]) : r.apply(this, [10009])) : r.apply(this, arguments);
                        };
                    };
                    break;
                };
                case ITEMS.REIDITE_SPIKE: {
                    for (let a = 0; a < UnitsType.length; a++) {
                        var obj = UnitsType[a];
                        obj.ally = user.id === obj.ΔⵠΔΔ || isAlly(obj.ΔⵠΔΔ);
                        const Draw = GetDraw(obj);
                        let y = obj[Draw];
                        obj[Draw] = function (a) {
                            return Settings.ColoredSpikes ? (obj.ally ? y.apply(this, [10010]) : y.apply(this, [10011])) : y.apply(this, arguments);
                        };
                    };
                    break;
                };
            };
        };
    };

    const TotemInfo = () => {

        function getdist(a, b) {
            return Math.sqrt(((b.x - a.x) * (b.x - a.x)) + ((b.y - a.y) * (b.y - a.y)));
        }

        const mp = getMyPlayer()

        if (!mp) return;

        const ctx = document.querySelector("canvas").getContext("2d");

        const totem = GetUnits()[29];

        if (totem === undefined || totem.length === undefined || totem.length === 0) {
            return;
        };

        function totinfo() {
            for (let i = 0; i < totem.length; i++) {
                const {
                    x,
                    y,
                    info
                } = totem[i];
                let totw = totem[i];
                ctx.save();
                ctx.lineWidth = 8;
                ctx.font = "26px Baloo Paaji";
                ctx.strokeStyle = totw.info >= 16 ? "red" : "#81f986";
                ctx.fillStyle = totw.info >= 16 ? "red" : "#81f986";

                ctx.strokeText(info >= 16 ? "🔒" : "🔓", (x - 20) + getUserPosition()[0], y + getUserPosition()[1]);
                ctx.fillText(info >= 16 ? "🔒" : "🔓", (x - 20) + getUserPosition()[0], y + getUserPosition()[1]);



                const infoText = totw.info >= 16 ? "People: " + totw.info % 16 : "People: " + totw.info;
                ctx.font = '26px Baloo Paaji';
                ctx.strokeStyle = '#FFFFFF';
                ctx.fillStyle = totw.info >= 16 ? "red" : "#81f986";
                ctx.strokeText(infoText, (totw.x - 45) + getUserPosition()[0], totw.y + getUserPosition()[1] - 35);
                ctx.fillText(infoText, (totw.x - 45) + getUserPosition()[0], totw.y + getUserPosition()[1] - 35);
                ctx.restore();

                ctx.restore();
            };
        };

        if (Settings.AutoTotem.enabled) {
            for (let i = 0; i < totem.length; ++i) {
                if (getdist(mp, totem[i]) <= 300 && (Date.now() - Information.TotemAttempts) > 50) {

                    var pid = null, counter = 0;


                    for (let prop in totem[i]) {
                        counter++;
                        log(counter, prop)
                        if (counter === 2) pid = totem[i][prop];
                    };

                    if (pid == user.id) return log('MY TOTEM', totem[i]);

                    Send([packets.joinTotem, pid /*totem[i].ΔⵠΔΔ*/, totem[i].id])
                    Information.TotemAttempts = Date.now();
                };
            };
        };

        totinfo();
    };

    const GetObjectPid = (obj) => {
        for (let prop in obj) {
            if (!Array.isArray(obj[prop]) && !isNaN(obj[prop]) && Number(obj[prop]) > 1000 && !triangles(prop)) {
                const idSplit = ((obj[prop] - obj.id) / 1000);
                if (idSplit > 0 && idSplit <= 100) return obj[prop];
            };
        };
    };

    const Aimbot = () => {
        function isAlly(id) {
            let team;
            let counter = 0;

            for (let prop1 in user) {
                counter++;

                if (counter === 22) {
                    team = user[prop1];
                    break;
                }
            }

            switch (id) {
                case user.id:
                    return true;
                default:
                    if (Array.isArray(team)) {
                        return team.includes(id / 1000);
                    }
            }
        }

        let myPlayer = getMyPlayer();

        if (!myPlayer) return;

        function HoldWeapon(_, $) {
            switch (_) {
                case 34:
                case 18:
                case 33:
                case 15:
                case 14:
                case 13:
                case 12:
                case 16:
                case 17:
                    return 2;
                case 57:
                case 5:
                case 6:
                case 30:
                case 62:
                case 9:
                case 0:
                case 63:
                case 19:
                    return 1;
                case 64:
                case 65:
                case 66:
                case 67:
                case 68:
                case 70:
                case 69:
                    return 3;
                case 94:
                case 95:
                case 96:
                case 97:
                case 98:
                case 90:
                case 99:
                    return 6;
                case 45:
                    if ($) return 4;
                case -1:
                    if ($) return 5;
            }
            return 0;
        }

        function calcAngle(_, $, o) {
            return _ && $ ? (o ? Math.atan2($.r.y - _.r.y, $.r.x - _.r.x) : Math.atan2($.y - _.y, $.x - _.x)) : null;
        }

        function EnemyToAttack(myPlayer, PlayerList) {
            let nearest = null;
            let distSqrd = -1;
            let HoldingSpear = HoldWeapon(myPlayer.right, false) === 2 ? true : false;

            for (var i = 0, obj = null, d = null; i < PlayerList.length; i++) {
                obj = PlayerList[i];
                if (GetPid(obj) === GetPid(myPlayer) || isAlly(GetPid(obj))) continue;
                d = (myPlayer.x - obj.x) ** 2 + (myPlayer.y - obj.y) ** 2;
                if (HoldingSpear && d < 210) continue;
                if (distSqrd === -1 || d < distSqrd) {
                    distSqrd = d;
                    nearest = obj;
                }
            }

            if (Settings.Aimbot.enabled && Settings.Aimbot.a != null) {
                /* Grab mouse */
                for (let prop in mouse) {
                    if (mouse[prop]['x'] && mouse[prop]['y'] && nearest && nearest.x && nearest.y) {
                        mouse[prop]['x'] = getUserPosition()[0] + nearest.x;
                        mouse[prop]['y'] = getUserPosition()[1] + nearest.y;
                    };
                };
            };

            return nearest;
        }

        function dist2dSQRT(p1, p2) {
            if (p1 && p2) {
                return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
            }
            return null;
        }

        if (Settings.Aimbot.enabled && myPlayer) {
            const weaponType = HoldWeapon(myPlayer.right, true);
            let myRange;
            switch (weaponType) {
                case 1:
                    myRange = myPlayer.fly ? 196.8 : 157.6;
                    break;
                case 2:
                    myRange = myPlayer.fly ? 291.8 : 227.6;
                    break;
                case 3:
                    myRange = 620;
                    break;
                case 4:
                    myRange = myPlayer.fly ? 140 : 125;
                    break;
                case 5:
                    myRange = myPlayer.clothe == 85 || myPlayer.clothe == 83 ? (myPlayer.fly ? 120.8 : 97.6) : null;
                    break;
                default:
                    myRange = null;
                    break;
            }
            if (myRange) {
                const Enemy = EnemyToAttack(myPlayer, GetUnits()[0]);
                if (Enemy) {
                    const RangeBetweenMeAndEnemy = dist2dSQRT(myPlayer, Enemy);
                    if (RangeBetweenMeAndEnemy <= myRange) {
                        Settings.Aimbot.a = calcAngle(myPlayer, Enemy, true);
                        Settings.Aimbot.t = Enemy;
                        const e = 2 * Math.PI;
                        const Angle255 = Math.floor((((Settings.Aimbot.a + e) % e) * 255) / e);

                        Send([packets.angle, Angle255]);
                        if (Settings.Aimbot.a && RangeBetweenMeAndEnemy <= myRange - 22) {
                            Send([packets.attack, Angle255]);
                            Send([packets.stopAttack]);
                        }
                    } else {
                        Settings.Aimbot.a = null;
                        Settings.Aimbot.t = null;
                    }
                } else {
                    Settings.Aimbot.a = null;
                }
            }
        }
    }

    const AutoSteal = () => {
        let myPlayer = getMyPlayer()

        function GetDist(a, b) {
            return Math.sqrt(((b.x - a.x) * (b.x - a.x)) + ((b.y - a.y) * (b.y - a.y)));
        }
        var chests = GetUnits()[11];
        for (let i = 0; i < chests.length; i++) {
            if (GetDist(myPlayer, chests[i]) <= 330) {
                var counter = 0, pid;
                for (let prop in chests[i]) {
                    counter++;
                    log(counter, prop)
                    if (counter === 2) pid = chests[i][prop];
                };

                Send([packets.chestTake, pid, chests[i].id]);

            }
        }
    }

    const Tracers = () => {
        const Players = GetUnits()[0];
        const myPlayer = getMyPlayer();
        const myId = user.id;
        const [x, y] = getUserPosition();

        function isAlly(id) {
            let team = getClientId(22, user);

            switch (id) {
                case user.id:
                    return true;
                default:
                    if (Array.isArray(team)) {
                        return team.includes(id);
                    }
            }

            return false;
        };

        for (let i = 0; i < Players.length; i++) {
            GetPid(Players[i]) !== (myId * 1000) && ctx && myPlayer &&
                (ctx.lineWidth = 2.6,
                    ctx.beginPath(),
                    ctx.moveTo(x + myPlayer.x, y + myPlayer.y),
                    ctx.lineTo(x + Players[i].x, y + Players[i].y),
                    ctx.strokeStyle = isAlly(GetPid(Players[i]) / 1000) ? "cyan" : "red", ctx.stroke()
                );

            ctx.save();
            ctx.restore()
        };
    };

    const AutoSpike = () => {
        let spikeToPlace = undefined;

        if (inventoryHas(219)[0]) {
            spikeToPlace = 219;
        } else if (inventoryHas(123)[0]) {
            spikeToPlace = 123;
        } else if (inventoryHas(170)[0]) {
            spikeToPlace = 170;
        } else if (inventoryHas(169)[0]) {
            spikeToPlace = 169;
        } else if (inventoryHas(168)[0]) {
            spikeToPlace = 168;
        } else if (inventoryHas(162)[0]) {
            spikeToPlace = 162;
        } else if (inventoryHas(113)[0]) {
            spikeToPlace = 113;
        }

        if (spikeToPlace !== undefined && (Date.now() - Information.Attempted > 80)) {

            let pi2 = Math.PI * 2;
            let p = getMyPlayer();

            if (!p) return;
            let angle = p.angle
            if (Settings.Aimbot.a && Settings.Aimbot.enabled) angle = Settings.Aimbot.a;

            let i = Math.floor((((angle + pi2) % pi2) * 255) / pi2)

            Send([packets.placeBuild, spikeToPlace, i, 0]);

            for (let angle_ = 10; angle_ < 30; angle_ += 10) {

                Send([packets.placeBuild, spikeToPlace, (-angle_ + i) % 255, 0]);
                Send([packets.placeBuild, spikeToPlace, (angle_ + i) % 255, 0]);
            };

            Information.Attempted = Date.now();
        }
    };
    var GaugeProp = null,
        HungerProp = null,
        HealthProp = null,
        ColdProp = null,
        WaterProp = null,
        ThirstProp = null,
        HotProp = null,
        BandsProp = null;

    const Gauges = () => {

        if (!GaugeProp) {
            for (let prop in user) {
                var count = 1;
                for (let prop_ in user[prop]) {
                    if (user[prop][prop_] == 1 && !triangles(prop_)) count++;
                }

                if (count === 6) {
                    GaugeProp = prop;
                    break;
                }
            };

            let counter = 0;
            for (let prop in user[GaugeProp]) {
                counter++;
                if (counter === 1) ColdProp = prop;
                if (counter === 2) HealthProp = prop;
                if (counter === 3) HungerProp = prop;
                if (counter === 4) WaterProp = prop;
                if (counter === 5) ThirstProp = prop;
                if (counter === 6) HotProp = prop;
            };

            counter = 0;
            for (let prop in user) {
                counter++;
                if (counter === 46) BandsProp = prop;
            }

            var clientCounter = 0;
            for (let prop in client) {
                clientCounter++;
                if (clientCounter === 57) {
                    client[prop] = (a, b, c, d, e, f, g) => {
                        if (HealthTracker == 2) {
                            HealthTracker = 0;
                            healthInt = Date.now();
                        };

                        HealthTracker++;

                        TimersInt = Date.now();
                        user[GaugeProp][HealthProp] = a / 100;
                        user[GaugeProp][HungerProp] = b / 100;
                        user[GaugeProp][ColdProp] = c / 100;
                        user[GaugeProp][WaterProp] = d / 100;
                        user[GaugeProp][ThirstProp] = e / 100;
                        user[GaugeProp][HotProp] = f / 100;
                        user[BandsProp] = g;
                    };
                };
            };
        };

        window.hunger = user[GaugeProp][HungerProp]; // ᐃⲆᐃ
        window.health = user[GaugeProp][HealthProp]; // ⵠⲆⵠᐃ
        window.cold = user[GaugeProp][ColdProp]; // c
        window.thirst = user[GaugeProp][WaterProp]; // ᐃᐃⵠ
        window.oxygen = user[GaugeProp][ThirstProp]; // ⲆᐃΔ
        window.hot = user[GaugeProp][HotProp]; // ΔⲆᐃΔᐃᐃᐃ
    };

    const StartCTX = () => {

        CanvasRenderingContext2D.prototype.fillRect = new Proxy(CanvasRenderingContext2D.prototype.fillRect, {
            apply: function (target, ctx, _arguments) {
                if (ctx.fillStyle === "#69a148") {
                    if (Settings.Timers.enabled) {
                        ctx.save();
                        ctx.font = '32px Baloo Paaji';
                        ctx.strokeStyle = "black";
                        ctx.lineWidth = 5;
                        ctx.strokeText(Math.floor(6 - (Date.now() - TimersInt) / 1000) + 's', _arguments[0] + 185, _arguments[1] + 18);
                        ctx.strokeText(Math.floor(11 - (Date.now() - healthInt) / 1000) + 's', _arguments[0] - 100, _arguments[1] - 25);
                        ctx.strokeText(`${window.health ? Math.floor(health * 200) : "200"}hp`, _arguments[0] - 115, _arguments[1] + 18);
                        ctx.fillStyle = "red";
                        ctx.fillText(Math.floor(6 - (Date.now() - TimersInt) / 1000) + 's', _arguments[0] + 185, _arguments[1] + 18);
                        ctx.fillText(Math.floor(11 - (Date.now() - healthInt) / 1000) + 's', _arguments[0] - 100, _arguments[1] - 25);
                        ctx.fillText(`${window.health ? Math.floor(health * 200) : "200"}hp`, _arguments[0] - 115, _arguments[1] + 18);
                        ctx.restore();
                    };

                    if (Settings.Percents.enabled) {
                        let OverallHeat = Math.floor(cold * 100) + (100 - Math.floor(hot * 100));
                        ctx.save();
                        ctx.font = '34px Baloo Paaji';
                        ctx.strokeStyle = "#c12819";
                        ctx.lineWidth = 5;
                        ctx.strokeText(`${Math.floor(hunger * 100)}%`, 345, _arguments[1] - 10);
                        ctx.fillStyle = "white";
                        ctx.fillText(`${Math.floor(hunger * 100)}%`, 345, _arguments[1] - 10);
                        ctx.font = '34px Baloo Paaji';
                        ctx.strokeStyle = OverallHeat <= 100 ? "#4f9db2" : "#9c4036";
                        ctx.lineWidth = 5;
                        ctx.strokeText(`${OverallHeat}%`, 575, _arguments[1] - 10);
                        ctx.fillStyle = "white";
                        ctx.fillText(`${OverallHeat}%`, 575, _arguments[1] - 10);
                        ctx.font = '34px Baloo Paaji';
                        ctx.strokeStyle = "#004b87";
                        ctx.lineWidth = 5;
                        ctx.strokeText(`${Math.floor(thirst * 100)}%`, 805, _arguments[1] - 10);
                        ctx.fillStyle = "white";
                        ctx.fillText(`${Math.floor(thirst * 100)}%`, 805, _arguments[1] - 10);
                        ctx.font = '34px Baloo Paaji';
                        ctx.strokeStyle = "#54a34e";
                        ctx.lineWidth = 5;
                        ctx.strokeText(`${Math.floor(health * 100)}%`, 95, _arguments[1] - 10);
                        ctx.fillStyle = "white";
                        ctx.fillText(`${Math.floor(health * 100)}%`, 95, _arguments[1] - 10);
                        if (Math.floor(oxygen * 100) != 100) {
                            ctx.font = '34px Baloo Paaji';
                            ctx.strokeStyle = "#004b87";
                            ctx.lineWidth = 5;
                            ctx.strokeText(`${Math.floor(oxygen * 100)}%`, 465, _arguments[1] - 60);
                            ctx.fillStyle = "white";
                            ctx.fillText(`${Math.floor(oxygen * 100)}%`, 465, _arguments[1] - 60);
                        };
                        ctx.restore();
                    }
                }
                return Function.prototype.apply.apply(target, [ctx, _arguments]);
            }
        });

    };

    const AutoFeed = () => {
        if (hunger < 0.45 && (Date.now() - Information.BerryTime) > 500) {
            if (inventoryHas(110)) {
                Information.BerryTime = Date.now();
                Send([packets.equip, 110]);
            }
        }
        if (thirst < 0.40 && (Date.now() - Information.BottleTime) > 500) {
            if (inventoryHas(127)) {
                Information.BottleTime = Date.now();
                Send([packets.equip, 127]);
            }
        };
    };

    document.addEventListener('keydown', (event) => {
        for (let HACK in Settings) {
            if (Settings[HACK].key && event.code == Settings[HACK].key && Settings[HACK].type === 'hold' && !ChatOpened()) Settings[HACK].enabled = true;
        };
    });

    document.addEventListener('keyup', (event) => {
        for (let HACK in Settings) {
            if (Settings[HACK].key && event.code == Settings[HACK].key && Settings[HACK].type === 'hold' && !ChatOpened()) Settings[HACK].enabled = false;
        };
    });

    document.addEventListener('keypress', (event) => {
        for (let HACK in Settings) {
            if (Settings[HACK].key && event.code == Settings[HACK].key && Settings[HACK].type !== 'hold' && !ChatOpened()) Settings[HACK].enabled = !Settings[HACK].enabled;
        };
    });

    const EnableScript = () => {
        if (isAlive() === true) {
            if (Settings.AutoSpike.enabled) AutoSpike();
            if (Settings.AutoSteal.enabled) AutoSteal();
            if (Settings.Aimbot.enabled) Aimbot();

            if (Settings.EnabledHacks.enabled) EnabledHacks();

            if (Settings.AutoRecycle.enabled) AutoRecycle();
            if (Settings.AutoCraft.enabled) AutoCraft();

            AutoBook();
            InterceptRecycle();
            Gauges();
            AutoFeed();

            if (Settings.ColoredSpikes.enabled) ColoredSpikes()

            if (Settings.TotemInfo.enabled) TotemInfo();
            if (Settings.Tracers.enabled) Tracers();
        }

        requestAnimationFrame(EnableScript);
    };

    var start = false;

    const StartScript = () => {
        if (user !== undefined && world !== undefined && client && client.ΔⲆᐃᐃⵠ !== undefined && world && world.ⲆΔⲆΔⲆⵠΔ && !start) {
            start = true;
            try {
                EnableScript();
                StartCTX();
            } catch (e) {
                EnableScript();
            }

            unsafeWindow.alert("Script On");
        };
    }

    setInterval(StartScript, 800);