// 로컬 HTTP 서버를 먼저 켠 뒤 node tests/261121_1715_language.browser_Shana.cjs
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:8080";
const modulePath = "/assets/i18n/261121_1715_language_Shana.js";
const ko = JSON.parse(fs.readFileSync("assets/i18n/261121_1715_ko_Shana.json", "utf8"));
const findKey = (source) => Object.keys(ko.messages).find((key) => ko.messages[key] === source);
const ready = (p) => p.waitForFunction(() => window.iyeokLanguage).then(() => p.evaluate(() => window.iyeokLanguage.ready));
async function main() {
  const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
  try {
    for (const width of [390, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion: "reduce" });
      const p = await context.newPage();
      const errors = [];
      p.on("pageerror", (e) => errors.push(e.message));
      await p.goto(base + "/"); await ready(p);
      await p.selectOption("[data-language-select]", "en");
      await p.waitForFunction(() => document.documentElement.dataset.language === "en");
      assert.match(await p.locator("[data-language-status]").innerText(), /번역 준비 중/);
      assert.equal(await p.locator("html").getAttribute("lang"), "ko");
      for (const path of ["/app/", "/yarrow/", "/yarrow/learn/", "/yarrow/options/"]) {
        await p.goto(base + path); await ready(p);
        assert.equal(await p.evaluate(() => window.iyeokLanguage.getLanguage()), "en", path);
        assert.ok((await p.locator("main").innerText()).trim());
        assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, path);
      }
      const coin = await context.newPage(); await coin.goto(base + "/app/"); await ready(coin); await coin.waitForLoadState("networkidle");
      await coin.click("#start"); await coin.locator("#cast").waitFor({ state: "visible" });
      await coin.click("#throw"); await coin.waitForFunction(() => !document.getElementById("throw").disabled);
      const count = await coin.locator("#progress").innerText();
      const learn = await context.newPage(); await learn.goto(base + "/yarrow/learn/"); await ready(learn);
      await learn.click("#next");
      const scene = await learn.locator("#scene-title").innerText();
      await p.goto(base + "/"); await ready(p); await p.selectOption("[data-language-select]", "ko");
      await coin.waitForFunction(() => window.iyeokLanguage.getLanguage() === "ko");
      await learn.waitForFunction(() => window.iyeokLanguage.getLanguage() === "ko");
      assert.equal(await coin.locator("#progress").innerText(), count, "language change keeps coin progress");
      assert.equal(await learn.locator("#scene-title").innerText(), scene, "language change keeps lesson state");
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`PASS ${width}px: preference, all pages, other tabs, no reset, no overflow`);
    }

    // 준비 중 파일에 번역을 채웠을 때 실제로 적용·복원되는지, 공개 파일과 분리된 fixture로 확인한다.
    const context = await browser.newContext({ serviceWorkers: "block" });
    const fixtures = {
      [findKey("동전점 맛보기")]: "TEST COIN",
      [findKey("바로 시작")]: "TEST START <b>literal</b>",
      "runtime.split": "TEST {left}/{right}/{total}",
    };
    assert.ok(!Object.hasOwn(fixtures, "undefined"));
    await context.route("**/261121_1715_en_Shana.json", (r) => r.fulfill({ json: { messages: fixtures } }));
    const p = await context.newPage(); await p.goto(base + "/app/"); await ready(p); await p.waitForLoadState("networkidle");
    await p.evaluate(() => window.iyeokLanguage.setLanguage("en"));
    assert.equal(await p.locator("#start").innerText(), "TEST START <b>literal</b>");
    assert.equal(await p.locator("#start b").count(), 0, "translations are text, not injected HTML");
    await p.evaluate(() => {
      const output = document.createElement("p"); output.id = "fixture-dynamic";
      output.textContent = "왼쪽 24 · 오른쪽 25 · 합계 49"; document.body.append(output);
    });
    await p.waitForFunction(() => document.getElementById("fixture-dynamic").textContent === "TEST 24/25/49");
    await p.evaluate(() => window.iyeokLanguage.setLanguage("ko"));
    assert.equal(await p.locator("#start").innerText(), "바로 시작");
    assert.equal(await p.locator("#fixture-dynamic").innerText(), "왼쪽 24 · 오른쪽 25 · 합계 49");
    assert.equal(await p.evaluate(() => window.iyeokLanguage.t("runtime.split", { left: 1, right: 48, total: 49 })), "왼쪽 1 · 오른쪽 48 · 합계 49");
    await p.evaluate(() => window.iyeokLanguage.setLanguage("unknown"));
    assert.equal(await p.evaluate(() => window.iyeokLanguage.getLanguage()), "ko");
    await context.close();
    console.log("PASS translation fixture: static/dynamic, interpolation, Korean restore, invalid locale, safe text");

    const denied = await browser.newContext({ serviceWorkers: "block" });
    await denied.addInitScript(() => Object.defineProperty(window, "localStorage", { get() { throw new Error("disabled"); } }));
    const d = await denied.newPage(); await d.goto(base + "/"); await ready(d);
    await d.selectOption("[data-language-select]", "en");
    assert.match(await d.locator("[data-language-status]").innerText(), /저장할 수 없습니다/);
    await denied.close();
    const failed = await browser.newContext({ serviceWorkers: "block" });
    await failed.route("**/261121_1715_en_Shana.json", (r) => r.fulfill({ status: 503, body: "unavailable" }));
    const f = await failed.newPage(); await f.goto(base + "/"); await ready(f); await f.selectOption("[data-language-select]", "en");
    await f.waitForFunction(() => document.querySelector("[data-language-status]").textContent.includes("불러오지 못해"));
    assert.match(await f.locator("h1").innerText(), /나의 주역/);
    await failed.close();
    console.log("PASS blocked storage / unavailable translation keep usable Korean");

    const offline = await browser.newContext({ reducedMotion: "reduce" });
    const app = await offline.newPage(); await app.goto(base + "/app/"); await ready(app); await app.waitForLoadState("networkidle");
    await app.evaluate(() => window.iyeokLanguage.setLanguage("en"));
    await app.evaluate(() => {
      let count = 0;
      crypto.getRandomValues = (a) => { a[0] = count++ % 3 === 0 ? 0 : 0xffffffff; return a; };
    });
    await app.click("#start");
    for (let i = 0; i < 6; i++) {
      await app.click("#throw"); await app.waitForFunction(() => !document.getElementById("throw").disabled);
    }
    await app.click("#throw"); await app.waitForFunction(() => document.getElementById("texts").textContent.includes("乾"));
    assert.match(await app.locator("#texts").innerText(), /샤나\(GPT\)/);
    await app.waitForFunction(async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      return reg?.active?.state === "activated" && navigator.serviceWorker.controller && (await caches.keys()).includes("iyeok-app-v71");
    });
    await offline.setOffline(true); await app.reload(); await ready(app); await app.waitForLoadState("networkidle");
    assert.equal(await app.evaluate(() => window.iyeokLanguage.getLanguage()), "en");
    assert.match(await app.locator("[data-language-status]").innerText(), /번역 준비 중/);
    await app.click("#start"); await app.locator("#cast").waitFor({ state: "visible" });
    await offline.close();
    console.log("PASS coin result/original content and offline language scaffold");

    const lesson = await browser.newContext({ reducedMotion: "reduce" });
    const l = await lesson.newPage(); await l.goto(base + "/yarrow/learn/"); await ready(l);
    await l.evaluate(() => window.iyeokLanguage.setLanguage("en"));
    const splits = [24, 18, 16]; let split = 0;
    for (let step = 0; step < 60; step++) {
      if ((await l.locator('.board-line[data-line="1"] .board-label').innerText()).includes("7")) break;
      if (await l.locator("#split-panel").isVisible()) {
        await l.click("#mode-manual");
        await l.locator("#split-range").fill(String(splits[split++]));
        await l.click("#split-confirm");
      } else if (await l.locator("#action").isVisible() && await l.locator("#action").isEnabled()) {
        await l.click("#action");
      } else {
        await l.locator("#next").waitFor({ state: "visible" });
        await l.click("#next");
      }
    }
    assert.match(await l.locator('.board-line[data-line="1"] .board-label').innerText(), /7/);
    assert.equal(split, 3);
    await lesson.close();
    console.log("PASS language scaffold keeps three-pass lesson and first line 7");
  } finally { await browser.close(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
