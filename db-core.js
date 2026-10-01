// ============================================================================
// db-core.js —— FlashcardDB 共享核心（fc.html / q.html / e.html / typing.html / t2.html 共用）
//
// 职责：数据库名 / 版本号 / 表名常量、建表逻辑、版本探测与打开策略，全部集中于此。
// 以后升级 DB_VERSION 或增删表，只改这一个文件，5 个页面自动同步。
//
// 用法（主线程页面）：
//   <script src="db-core.js"></script>
//   FlashcardDB.openFlashcardDB({ mode: 'reader' })  // e/typing/t2：只读页面
//   FlashcardDB.openFlashcardDB({ mode: 'owner' })   // fc/q：负责建库/升级的页面
//
// 用法（Blob Web Worker，fc.html / q.html）：
//   importScripts('<db-core.js 绝对 URL>');
//   const { DB_NAME, DB_VERSION, STORE_ALL, ... } = self.FlashcardDB;
// ============================================================================
(function (root) {
    'use strict';

    var DB_NAME = 'FlashcardDB';
    // v6: 新增 dictionaries 表支持多词库；words 主键改为 "dictId#序号"（旧数据自动迁移）
    var DB_VERSION = 6;

    var STORE_ALL = 'words';           // 全词库（多词库同表，按 dictId 前缀分区）
    var STORE_WRONG = 'wrong_words';   // 错词本
    var STORE_AUDIO = 'audio_cache';   // 语音缓存
    var STORE_EXAMPLE = 'example_cache'; // DeepSeek 例句缓存
    var STORE_DICTS = 'dictionaries';  // 词库注册表

    var ALL_STORES = [STORE_ALL, STORE_WRONG, STORE_AUDIO, STORE_EXAMPLE, STORE_DICTS];

    // 建表逻辑：所有页面/Worker 的 onupgradeneeded 统一走这里，保证表结构一致
    function ensureStores(db) {
        if (!db.objectStoreNames.contains(STORE_ALL)) db.createObjectStore(STORE_ALL, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(STORE_WRONG)) db.createObjectStore(STORE_WRONG, { keyPath: 'wordKey' });
        if (!db.objectStoreNames.contains(STORE_AUDIO)) db.createObjectStore(STORE_AUDIO, { keyPath: 'word' });
        if (!db.objectStoreNames.contains(STORE_EXAMPLE)) db.createObjectStore(STORE_EXAMPLE, { keyPath: 'word' });
        if (!db.objectStoreNames.contains(STORE_DICTS)) db.createObjectStore(STORE_DICTS, { keyPath: 'id' });
    }

    function storesReady(db) {
        for (var i = 0; i < ALL_STORES.length; i++) {
            if (!db.objectStoreNames.contains(ALL_STORES[i])) return false;
        }
        return true;
    }

    // owner 模式（fc.html / q.html 的 Worker）：直接以 DB_VERSION 打开并负责建库/升级建表
    function openAsOwner(resolve, reject) {
        var request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = function (e) { ensureStores(e.target.result); };
        request.onsuccess = function (e) { resolve(e.target.result); };
        request.onerror = function () { reject(request.error || new Error('IndexedDB 打开失败')); };
        request.onblocked = function () { reject(new Error('IndexedDB 升级被其他标签页阻塞，请关闭其他打开过本页面的标签页后刷新')); };
    }

    // reader 模式（e.html / typing.html / t2.html）：
    // 不能固定用 indexedDB.open(DB_NAME, N)——其他页面可能已把库升到更高版本，
    // 用更低版本打开会直接抛 VersionError。改为「先不带版本号探测 → 表齐全就直接用
    // → 仅在版本过低且缺表时升级到 DB_VERSION」，将来升到 v7/v8 也不会被卡死。
    function openAsReader(resolve, reject) {
        var probe = indexedDB.open(DB_NAME); // 不带版本号：以库当前版本打开，不会触发 VersionError
        probe.onerror = function () { reject(probe.error || new Error('无法打开数据库 (FlashcardDB)')); };
        probe.onblocked = function () { reject(new Error('数据库被其他标签页占用，请关闭其他打开过本页面的标签页后刷新')); };
        probe.onupgradeneeded = function (e) { ensureStores(e.target.result); }; // 库不存在时（新建 v1）顺手建表
        probe.onsuccess = function () {
            var db = probe.result;
            // 表齐全，或库版本已不低于 DB_VERSION（由 owner 页面建好）：直接使用
            // 注：各读写函数内部都有 objectStoreNames.contains 兜底，缺表时降级为空结果而非报错
            if (storesReady(db) || db.version >= DB_VERSION) { resolve(db); return; }

            // 旧版低版本库且缺表：关闭后按 DB_VERSION 重新打开触发升级建表
            var oldVersion = db.version;
            db.close();
            var req = indexedDB.open(DB_NAME, Math.max(DB_VERSION, oldVersion + 1));
            req.onerror = function () { reject(req.error || new Error('无法升级数据库 (FlashcardDB)')); };
            req.onblocked = function () { reject(new Error('数据库升级被其他标签页阻塞，请关闭其他打开过本页面的标签页后刷新')); };
            req.onupgradeneeded = function (e) { ensureStores(e.target.result); };
            req.onsuccess = function () { resolve(req.result); };
        };
    }

    // 统一入口：openFlashcardDB({ mode: 'owner' | 'reader' })，默认 reader
    function openFlashcardDB(options) {
        var mode = (options && options.mode) || 'reader';
        return new Promise(function (resolve, reject) {
            if (typeof indexedDB === 'undefined') { reject(new Error('当前浏览器不支持 IndexedDB')); return; }
            if (mode === 'owner') openAsOwner(resolve, reject);
            else openAsReader(resolve, reject);
        });
    }

    root.FlashcardDB = {
        DB_NAME: DB_NAME,
        DB_VERSION: DB_VERSION,
        STORE_ALL: STORE_ALL,
        STORE_WRONG: STORE_WRONG,
        STORE_AUDIO: STORE_AUDIO,
        STORE_EXAMPLE: STORE_EXAMPLE,
        STORE_DICTS: STORE_DICTS,
        ALL_STORES: ALL_STORES,
        ensureStores: ensureStores,
        storesReady: storesReady,
        openFlashcardDB: openFlashcardDB
    };
})(typeof self !== 'undefined' ? self : this);
