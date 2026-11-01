// 동전점 "처음으로" 취소 동작 검증 (브라우저용)
// 사용법: http://localhost:8080/app/ 을 열고 개발자 도구 콘솔에 이 파일 내용을 붙여 넣어 실행합니다.
// 기본 설정으로 되돌린 뒤 점을 몇 번 진행하므로, 바꿔 둔 설정이 있으면 다시 골라 주세요.

(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const $ = (id) => document.getElementById(id);
  const errors = [];
  const onError = (e) => errors.push(e.message || String(e.reason));
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onError);

  const state = () => ({
    progress: $("progress").textContent,
    filled: document.querySelectorAll("#board .slot.filled").length,
    cast: !$("cast").hidden,
    result: !$("result").hidden,
    setup: !$("setup").hidden,
    coins: [...document.querySelectorAll("#coins .coin-mark")].map((c) => c.textContent).join(""),
  });
  const results = [];
  const expect = (name, ok, detail) => results.push({ name, ok, detail: JSON.stringify(detail) });

  $("reset-settings").click();

  // 1. 동전이 도는 도중 취소 → 즉시 새 점
  $("start").click();
  await sleep(30);
  $("throw").click();
  await sleep(200);
  $("abort").click();
  $("start").click();
  await sleep(1000);
  let s = state();
  expect("도는 중 취소 후 새 점이 깨끗함", s.cast && s.filled === 0 && s.progress === "0" && s.coins === "???", s);

  // 2. 여섯 번째 던지기 직후(결과 전환 대기 중) 취소
  for (let i = 0; i < 6; i++) {
    $("throw").click();
    await sleep(720);
  }
  $("abort").click();
  await sleep(1200);
  s = state();
  expect("6번째 직후 취소 시 결과 화면이 뜨지 않음", s.setup && !s.result && !s.cast, s);

  // 3. 6번째 직후 취소 → 즉시 새 점
  $("start").click();
  await sleep(30);
  for (let i = 0; i < 6; i++) {
    $("throw").click();
    await sleep(720);
  }
  $("abort").click();
  $("start").click();
  await sleep(1200);
  s = state();
  expect("6번째 직후 취소 후 새 점이 깨끗함", s.cast && !s.result && s.filled === 0, s);

  expect("오류 없음", errors.length === 0, errors);
  window.removeEventListener("error", onError);
  window.removeEventListener("unhandledrejection", onError);
  $("abort").click();
  console.table(results);
  console.log(results.every((r) => r.ok) ? "PASS" : "FAIL");
})();
