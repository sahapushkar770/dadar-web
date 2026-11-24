// ==========================================================
// SAHA ENTERPRISE - FIRESTORE DATA LAYER
//
// Firestore is the source of truth. On every page load this module:
//   1. waits for login (redirects to login.html if not signed in)
//   2. one-time migrates any old browser (localStorage) data to Firestore
//   3. loads parties / areas / products / bills / trash / bill counter
//      from Firestore into localStorage (used as a fast local cache)
//   4. loads the page's own scripts (listed in data-scripts)
//
// After that, whenever page code calls localStorage.setItem() for one of
// the synced keys, the change is written to Firestore automatically.
// So the existing page scripts keep working unchanged.
//
// Firestore layout (all under the signed-in user):
//   users/{uid}/data/parties | areas | products   -> { value: "<json array>" }
//   users/{uid}/data/billCounter                  -> { value: <number> }
//   users/{uid}/bills/{billId}                    -> { billId, json }
//   users/{uid}/trash/{billId}                    -> { billId, json }
// ==========================================================

import { auth, db } from "./auth/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection, doc, getDocs, setDoc, deleteDoc, writeBatch
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// key -> how it is stored
const SINGLE_KEYS = ["parties", "areas", "products"];
const KEYED = {
    bills:        { col: "bills", id: b => b && b.billId },
    deletedBills: { col: "trash", id: e => e && e.bill && e.bill.billId }
};
const COUNTER_KEY = "billCounter";
const SYNCED = new Set([...SINGLE_KEYS, ...Object.keys(KEYED), COUNTER_KEY]);

// Kept local only (just "which party is open right now")
const UID_KEY = "saha_uid";
const BACKUP_KEY = "saha_backup_before_sync";

const origSetItem = Storage.prototype.setItem;
const origRemoveItem = Storage.prototype.removeItem;

let uid = null;
let ready = false;
let queue = Promise.resolve();            // writes run one after another
const snapshots = { bills: new Map(), deletedBills: new Map() };

// ---------- small UI helpers ----------

function showOverlay(text) {
    const el = document.createElement("div");
    el.id = "storeOverlay";
    el.style.cssText =
        "position:fixed;inset:0;background:#fff;z-index:99999;display:flex;" +
        "align-items:center;justify-content:center;font:18px sans-serif;color:#444";
    el.textContent = text;
    document.body.appendChild(el);
    return el;
}

function toast(msg) {
    const el = document.createElement("div");
    el.textContent = msg;
    el.style.cssText =
        "position:fixed;bottom:16px;left:50%;transform:translateX(-50%);" +
        "background:#b00020;color:#fff;padding:10px 16px;border-radius:8px;" +
        "z-index:99999;font:14px sans-serif;max-width:90%";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 6000);
}

let pendingWrites = 0;

function enqueue(fn) {
    pendingWrites++;
    queue = queue.then(fn).catch(err => {
        console.error("Firestore sync failed:", err);
        toast("Could not save to the cloud. Check your internet connection.");
    }).then(() => { pendingWrites--; });
}

// ---------- refs ----------

const dataDoc = key => doc(db, "users", uid, "data", key);
const keyedCol = key => collection(db, "users", uid, KEYED[key].col);

// ---------- writes (called from the setItem hook) ----------

function parseArray(value) {
    try {
        const v = JSON.parse(value);
        return Array.isArray(v) ? v : [];
    } catch (e) {
        return [];
    }
}

function syncKeyed(key, value) {
    const { id } = KEYED[key];
    const next = new Map();

    for (const item of parseArray(value)) {
        const itemId = id(item);
        if (!itemId) {
            console.warn("Skipping record without billId:", item);
            continue;
        }
        next.set(String(itemId), JSON.stringify(item));
    }

    const prev = snapshots[key];
    const ops = [];

    for (const [itemId, json] of next) {
        if (prev.get(itemId) !== json) ops.push({ type: "set", itemId, json });
    }
    for (const itemId of prev.keys()) {
        if (!next.has(itemId)) ops.push({ type: "delete", itemId });
    }

    snapshots[key] = next;
    if (ops.length === 0) return;

    const colRef = keyedCol(key);
    const u = uid;

    enqueue(async () => {
        // batches are limited to 500 operations
        for (let i = 0; i < ops.length; i += 400) {
            const batch = writeBatch(db);
            for (const op of ops.slice(i, i + 400)) {
                const ref = doc(colRef, op.itemId);
                if (op.type === "set") batch.set(ref, { billId: op.itemId, json: op.json });
                else batch.delete(ref);
            }
            await batch.commit();
        }
    });
}

function syncKey(key, value) {
    if (!uid) return;

    if (KEYED[key]) return syncKeyed(key, value);

    if (key === COUNTER_KEY) {
        const n = Number(value) || 1;
        return enqueue(() => setDoc(dataDoc(key), { value: n }));
    }

    enqueue(() => setDoc(dataDoc(key), { value }));
}

// Hook: every localStorage.setItem for a synced key also goes to Firestore
Storage.prototype.setItem = function (key, value) {
    origSetItem.call(this, key, value);
    if (ready && this === window.localStorage && SYNCED.has(key)) {
        syncKey(key, String(value));
    }
};

// ---------- load / migrate ----------

function readLocal() {
    const out = {};
    for (const k of SYNCED) {
        const v = localStorage.getItem(k);
        if (v !== null) out[k] = v;
    }
    return out;
}

function localHasData(local) {
    return ["parties", "products", "bills", "deletedBills"].some(k =>
        local[k] && parseArray(local[k]).length > 0
    );
}

async function loadRemote() {
    const [dataSnap, billsSnap, trashSnap] = await Promise.all([
        getDocs(collection(db, "users", uid, "data")),
        getDocs(collection(db, "users", uid, "bills")),
        getDocs(collection(db, "users", uid, "trash"))
    ]);

    const remote = {};
    dataSnap.forEach(d => {
        const v = d.data().value;
        remote[d.id] = d.id === COUNTER_KEY ? String(v) : v;
    });

    const toList = snap => {
        const rows = [];
        snap.forEach(d => {
            try { rows.push({ id: d.id, json: d.data().json, obj: JSON.parse(d.data().json) }); }
            catch (e) { console.warn("Bad record", d.id); }
        });
        rows.sort((a, b) => a.id.localeCompare(b.id));
        return rows;
    };

    return { remote, bills: toList(billsSnap), trash: toList(trashSnap) };
}

// Upload what is currently in this browser's localStorage (one time)
async function migrateLocalToCloud(local) {
    const writes = [];

    for (const k of SINGLE_KEYS) {
        if (local[k]) writes.push(() => setDoc(dataDoc(k), { value: local[k] }));
    }
    if (local[COUNTER_KEY]) {
        writes.push(() => setDoc(dataDoc(COUNTER_KEY), { value: Number(local[COUNTER_KEY]) || 1 }));
    }

    for (const key of Object.keys(KEYED)) {
        const items = parseArray(local[key]);
        for (let i = 0; i < items.length; i += 400) {
            const chunk = items.slice(i, i + 400);
            writes.push(async () => {
                const batch = writeBatch(db);
                for (const item of chunk) {
                    const itemId = KEYED[key].id(item);
                    if (!itemId) continue;
                    batch.set(doc(keyedCol(key), String(itemId)),
                        { billId: String(itemId), json: JSON.stringify(item) });
                }
                await batch.commit();
            });
        }
    }

    for (const w of writes) await w();
}

async function hydrate() {
    const local = readLocal();
    let { remote, bills, trash } = await loadRemote();

    const remoteEmpty =
        Object.keys(remote).length === 0 && bills.length === 0 && trash.length === 0;

    if (remoteEmpty && localHasData(local)) {
        // First run after this update: move the old browser data to Firestore
        await migrateLocalToCloud(local);
        ({ remote, bills, trash } = await loadRemote());
    } else if (!remoteEmpty && localHasData(local) &&
               localStorage.getItem(UID_KEY) !== uid) {
        // Cloud already has data; keep a copy of this browser's old data just in case
        origSetItem.call(localStorage, BACKUP_KEY, JSON.stringify(local));
    }

    // Fill the local cache from Firestore
    for (const k of SINGLE_KEYS) {
        if (remote[k] !== undefined) origSetItem.call(localStorage, k, remote[k]);
        else origRemoveItem.call(localStorage, k);
    }
    if (remote[COUNTER_KEY] !== undefined) origSetItem.call(localStorage, COUNTER_KEY, remote[COUNTER_KEY]);
    else origRemoveItem.call(localStorage, COUNTER_KEY);

    origSetItem.call(localStorage, "bills", JSON.stringify(bills.map(r => r.obj)));
    origSetItem.call(localStorage, "deletedBills", JSON.stringify(trash.map(r => r.obj)));

    snapshots.bills = new Map(bills.map(r => [r.id, r.json]));
    snapshots.deletedBills = new Map(trash.map(r => [r.id, r.json]));

    origSetItem.call(localStorage, UID_KEY, uid);
}

// ---------- run page scripts after data is ready ----------

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = src;
        s.async = false;
        s.onload = resolve;
        s.onerror = () => reject(new Error("Failed to load " + src));
        document.body.appendChild(s);
    });
}

async function runPageScripts() {
    const tag = document.querySelector("script[data-scripts]");
    if (!tag) return;

    const scripts = tag.getAttribute("data-scripts").split(",").map(s => s.trim()).filter(Boolean);

    // The page has already finished loading, so DOMContentLoaded / window.onload
    // would never fire for scripts added now. Catch them and call them ourselves.
    const domReadyHandlers = [];
    const origDocAdd = document.addEventListener;
    document.addEventListener = function (type, fn, opts) {
        if (type === "DOMContentLoaded") domReadyHandlers.push(fn);
        else origDocAdd.call(this, type, fn, opts);
    };

    try {
        for (const src of scripts) await loadScript(src);
    } finally {
        document.addEventListener = origDocAdd;
    }

    const wasComplete = document.readyState === "complete";

    domReadyHandlers.forEach(fn => fn.call(document, new Event("DOMContentLoaded")));

    if (wasComplete && typeof window.onload === "function") {
        window.onload(new Event("load"));
    }
}

// ---------- start ----------

const overlay = showOverlay("Loading your data…");

onAuthStateChanged(auth, async user => {
    if (ready) return;

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    uid = user.uid;

    try {
        // different account on this browser -> drop the previous user's cache
        const lastUid = localStorage.getItem(UID_KEY);
        if (lastUid && lastUid !== uid) {
            [...SYNCED, "selectedParty", BACKUP_KEY].forEach(k => origRemoveItem.call(localStorage, k));
        }

        await hydrate();
        ready = true;
        await runPageScripts();
        overlay.remove();
    } catch (err) {
        console.error(err);
        overlay.textContent =
            "Could not load data from the cloud. Check your internet connection and Firestore rules, then refresh.";
    }
});

// Warn if the user closes the tab while a save is still going out
window.addEventListener("beforeunload", e => {
    if (pendingWrites > 0) { e.preventDefault(); e.returnValue = ""; }
});
