const { MongoClient } = require("mongodb");

// -------- CONFIG --------
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "tgstoragebot";
const COLLECTION = "UserStorageData";
// ------------------------

if (!MONGO_URI) throw new Error("MONGO_URI not set");

const client = new MongoClient(MONGO_URI);
let col;

async function init() {
    if (!col) {
        await client.connect();
        col = client.db(DB_NAME).collection(COLLECTION);
    }
}

// -------- CACHE --------
const CACHE = new Map();
const TTL = 600000; // 10 min

function now() { return Date.now(); }

function getCache(k) {
    const c = CACHE.get(k);
    if (!c) return undefined;

    if (now() - c.time > TTL) {
        CACHE.delete(k);
        return undefined;
    }

    c.time = now();
    return c.value;
}

function setCache(k, v) {
    CACHE.set(k, { value: v, time: now() });
}

function delCache(k) {
    CACHE.delete(k);
}

// -------- PATH --------
function parse(path) {
    return path
        .replace(/\[['"](.+?)['"]\]/g, ".$1")
        .split(".")
        .filter(Boolean);
}

// -------- OBJECT OPS --------
function getN(obj, path) {
    return path.reduce((a, b) => (a ? a[b] : undefined), obj);
}

function setN(obj, path, val) {
    let cur = obj;
    for (let i = 0; i < path.length - 1; i++) {
        if (!cur[path[i]] || typeof cur[path[i]] !== "object") {
            cur[path[i]] = {};
        }
        cur = cur[path[i]];
    }
    cur[path[path.length - 1]] = val;
}

function delN(obj, path) {
    let cur = obj;
    for (let i = 0; i < path.length - 1; i++) {
        if (!cur[path[i]]) return;
        cur = cur[path[i]];
    }
    delete cur[path[path.length - 1]];
}

// -------- ROOT --------
async function getRoot(root) {
    await init();

    const cached = getCache(root);
    if (cached !== undefined) return cached;

    const doc = await col.findOne({ _id: root });
    const data = doc ? doc.data : null;

    setCache(root, data);
    return data;
}

async function saveRoot(root, data) {
    await init();

    await col.updateOne(
        { _id: root },
        { $set: { data } },
        { upsert: true }
    );

    setCache(root, data);
}

// -------- CORE --------

async function set(key, value) {
    const p = parse(key);
    const root = p.shift();

    let data = (await getRoot(root)) || {};
    setN(data, p, value);

    await saveRoot(root, data);
    return true;
}

async function get(key) {
    const p = parse(key);
    const root = p.shift();

    const data = await getRoot(root);
    if (!data) return null;

    const val = p.length ? getN(data, p) : data;
    return val === undefined ? null : val;
}

async function update(key, value) {
    if ((await get(key)) === null) return false;
    return set(key, value);
}

async function del(key) {
    const p = parse(key);
    const root = p.shift();

    let data = await getRoot(root);
    if (!data) return false;

    if (p.length === 0) {
        await col.deleteOne({ _id: root });
        delCache(root);
        return true;
    }

    delN(data, p);
    await saveRoot(root, data);
    return true;
}

// -------- NUMBER --------
async function add(key, val) {
    if (typeof val !== "number") throw Error("Value must be number");
    const cur = await get(key);
    if (typeof cur !== "number") throw Error("Stored not number");
    return set(key, cur + val);
}

async function subtract(key, val) {
    if (typeof val !== "number") throw Error("Value must be number");
    const cur = await get(key);
    if (typeof cur !== "number") throw Error("Stored not number");
    return set(key, cur - val);
}

// -------- ARRAY --------
function ensureArr(v) {
    if (!Array.isArray(v)) throw Error("Not array");
}

async function push(key, v) {
    const arr = await get(key);
    ensureArr(arr);
    arr.push(v);
    return set(key, arr);
}

async function unshift(key, v) {
    const arr = await get(key);
    ensureArr(arr);
    arr.unshift(v);
    return set(key, arr);
}

async function pop(key) {
    const arr = await get(key);
    ensureArr(arr);
    const val = arr.pop();
    await set(key, arr);
    return val;
}

async function shift(key) {
    const arr = await get(key);
    ensureArr(arr);
    const val = arr.shift();
    await set(key, arr);
    return val;
}

async function pull(key, v) {
    const arr = await get(key);
    ensureArr(arr);
    return set(key, arr.filter(x => x !== v));
}

// -------- EXTRA --------
async function has(key) {
    return (await get(key)) !== null;
}

async function all(root) {
    return await get(root);
}

// -------- ARRAY QUERY HELPERS --------

async function find(key, fn) {
    const arr = await get(key);
    ensureArr(arr);
    return arr.find(fn) || null;
}

async function filter(key, fn) {
    const arr = await get(key);
    ensureArr(arr);
    return arr.filter(fn);
}

async function updateWhere(key, cond, updater) {
    const arr = await get(key);
    ensureArr(arr);

    let changed = false;

    for (let i = 0; i < arr.length; i++) {
        if (cond(arr[i])) {
            arr[i] = updater(arr[i]);
            changed = true;
        }
    }

    if (changed) await set(key, arr);
    return changed;
}

// -------- EXPORT --------
module.exports = {
    set, get, update, delete: del,
    push, unshift, pop, shift, pull,
    add, subtract,
    has, all,
    find, filter, updateWhere
};