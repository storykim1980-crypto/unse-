/* ==========================================================================
   운세방앗간 · 디자인 리뉴얼 v2.0 UI 컨트롤러  (js/redesign.js)
   ---------------------------------------------------------------
   · app.js(정밀 만세력 엔진)는 단 한 줄도 수정하지 않습니다.
   · 이 파일은 "새 디자인"의 화면 조작(4대 성전 탭, 검색, FAQ, 타로, 띠 운세,
     모바일 메뉴, 공유)만 담당하는 순수 UI 레이어입니다.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 0. 유틸 ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function scrollToSection(id, offset) {
    var el = $(id);
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.pageYOffset - (offset === undefined ? 88 : offset);
    window.scrollTo({ top: top, behavior: 'smooth' });
  }
  window.scrollToSection = scrollToSection;   /* app.js 의 동명 함수를 동일 동작으로 대체 */

  /* 오늘 날짜 기반 결정론적 의사난수 → 매일 자정 자동으로 값이 갱신됩니다 */
  function dailySeed() {
    var d = new Date();
    return (d.getFullYear() * 372) + (d.getMonth() + 1) * 31 + d.getDate();
  }
  function seeded(n) { /* 0 ~ n-1 */
    var x = dailySeed();
    x = (x * 1103515245 + 12345) % 2147483648;
    return x % n;
  }

  /* ---------- 1. 4대 성전(디렉터리) 탭 ---------- */
  var HALLS = ['hall-destiny', 'hall-life', 'hall-modern', 'hall-mystic'];
  var HALL_CLASS = { 'hall-destiny': 'hall-1', 'hall-life': 'hall-2', 'hall-modern': 'hall-3', 'hall-mystic': 'hall-4' };

  function applyHallFilter(hallId) {
    var main = $('result-section');
    if (main) {
      HALLS.forEach(function (h) { main.classList.remove(h + '-active'); });
      main.classList.add(hallId + '-active');
    }
    $$('.toc-list').forEach(function (l) { l.classList.add('hidden'); });
    var toc = $('toc-' + hallId);
    if (toc) toc.classList.remove('hidden');

    var cls = HALL_CLASS[hallId];
    $$('.' + cls).forEach(function (card) {
      var b = card.querySelector('.accordion-body');
      var ic = card.querySelector('.transform');
      if (b) b.classList.remove('hidden');
      if (ic) ic.classList.add('rotate-180');
    });
  }

  window.selectTemple = function (n) {
    var hallId = HALLS[n - 1];
    if (!hallId) return;
    for (var i = 1; i <= 4; i++) {
      var btn = $('btn-temple-' + i);
      var pnl = $('temple-panel-' + i);
      var on = (i === n);
      if (btn) btn.classList[on ? 'add' : 'remove']('is-active');
      if (pnl) pnl.classList[on ? 'add' : 'remove']('is-active');
      var nav = $('nav-temple-' + i);
      if (nav) nav.classList[on ? 'add' : 'remove']('is-active');
    }
    applyHallFilter(hallId);

    /* 리포트가 이미 열려 있는 상태라면 해당 성전의 첫 리포트를 함께 갱신해 줍니다 */
    var main = $('result-section');
    if (main && !main.classList.contains('hidden') && typeof window.selectSajuMenu === 'function') {
      var first = { 'hall-destiny': 'oheng', 'hall-life': 'naming', 'hall-modern': 'health', 'hall-mystic': 'tangsaju' }[hallId];
      if (first) window.selectSajuMenu(first);
    }
  };

  /* ---------- 2. 30대 운세 검색 필터 ---------- */
  window.filterFortuneItems = function (value) {
    var q = (value || '').trim().toLowerCase();
    var clearBtn = $('search-clear-btn');
    var total = 0, hit = 0;

    $$('.fortune-card').forEach(function (card) {
      total++;
      var hay = ((card.getAttribute('data-keywords') || '') + ' ' + card.textContent).toLowerCase();
      var match = !q || hay.indexOf(q) !== -1;
      card.classList[match ? 'remove' : 'add']('is-hidden');
      if (match) hit++;
    });

    if (clearBtn) clearBtn.classList[q ? 'add' : 'remove']('is-on');

    if (q) {
      /* 검색 중에는 결과가 있는 성전 탭을 자동으로 열어 줍니다 */
      for (var i = 1; i <= 4; i++) {
        var pnl = $('temple-panel-' + i);
        if (pnl && pnl.querySelector('.fortune-card:not(.is-hidden)')) { window.selectTemple(i); break; }
      }
    }
    var empty = $('search-empty');
    if (empty) empty.classList[(q && hit === 0) ? 'add' : 'remove']('is-on');
    var counter = $('search-counter');
    if (counter) counter.textContent = q ? (hit + '개 운세가 검색되었습니다') : '전체 30개 운세 · 무료 개방';
  };

  window.clearFortuneSearch = function () {
    var inp = $('grand-fortune-search');
    if (inp) { inp.value = ''; inp.focus(); }
    window.filterFortuneItems('');
  };

  /* ---------- 3. FAQ 아코디언 ---------- */
  function setFaqState(item, open) {
    if (!item) return;
    item.classList[open ? 'add' : 'remove']('is-open');
    var btn = item.querySelector('.um-faq-q');
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  window.toggleFaq = function (n) {
    var item = $('faq-item-' + n);
    if (!item) return;
    var open = item.classList.contains('is-open');
    $$('.um-faq-item').forEach(function (it) { setFaqState(it, false); });
    if (!open) setFaqState(item, true);
  };

  /* ---------- 4. 오늘의 타로 (3장 미스터리 카드) ---------- */
  var TAROT_DECK = [
    { name: 'THE SUN', emoji: '☀️', text: '순조로운 화합' },
    { name: 'STRENGTH', emoji: '🦁', text: '인내와 지혜' },
    { name: 'THE WORLD', emoji: '🌍', text: '황금빛 성취' },
    { name: 'THE STAR', emoji: '⭐', text: '희망과 회복' },
    { name: 'THE EMPRESS', emoji: '👑', text: '풍요와 결실' },
    { name: 'THE CHARIOT', emoji: '🐎', text: '전진과 승리' },
    { name: 'TEMPERANCE', emoji: '⚖️', text: '균형과 조율' }
  ];
  window.flipTarotCard = function (n) {
    var card = $('mini-tarot-' + n);
    if (!card) return;
    card.classList.toggle('is-flipped');
    if (card.classList.contains('is-flipped')) {
      var picked = seeded(TAROT_DECK.length + n);
      var back = card.querySelector('.um-flip-back');
      var d = TAROT_DECK[picked];
      if (back) back.innerHTML = '<span>' + d.emoji + '</span><strong>' + d.name + '</strong><i>' + d.text + '</i>';
    }
  };
  window.resetMiniTarot = function () {
    for (var i = 1; i <= 3; i++) { var c = $('mini-tarot-' + i); if (c) c.classList.remove('is-flipped'); }
    var toast = $('zodiac-toast');
    if (toast) toast.innerHTML = '<span style="color:var(--gold);font-weight:700">✨ 3장의 카드가 새로 섞였습니다. 마음에 끌리는 카드를 터치해 보세요.</span>';
  };

  /* ---------- 5. 12간지 띠별 대길 예보 ---------- */
  var ZODIAC = [
    { sign: '쥐띠', label: '쥐', grade: '순조', text: '재물운이 순조롭고 귀인의 깜짝 연락이 찾아옵니다.' },
    { sign: '소띠', label: '소', grade: '안정', text: '차분하게 내실을 다지면 오후에 이익이 발생합니다.' },
    { sign: '호랑이띠', label: '호', grade: '약진', text: '과감한 추진력이 돋보이는 날입니다. 주저하지 마세요.' },
    { sign: '토끼띠', label: '토', grade: '평온', text: '주변과의 소통에서 감정 조절이 중요한 하루입니다.' },
    { sign: '용띠', label: '용', grade: '대길', text: '문서·계약 성사율 98%! 소망하던 뜻이 드디어 펼쳐집니다.', lucky: true },
    { sign: '뱀띠', label: '뱀', grade: '인덕', text: '동료의 조언을 수용하면 뜻밖의 돌파구가 열립니다.' },
    { sign: '말띠', label: '말', grade: '성취', text: '경쟁에서 승기를 잡고 금전운이 대폭 상승합니다.', lucky: true },
    { sign: '양띠', label: '양', grade: '신중', text: '급한 결정보다는 한 번 더 검토하는 지혜가 필요합니다.' },
    { sign: '원숭이띠', label: '원', grade: '재능', text: '기발한 아이디어가 좋은 평가와 이익으로 이어집니다.' },
    { sign: '닭띠', label: '닭', grade: '정리', text: '미뤄둔 일을 정리하면 마음의 짐이 크게 가벼워집니다.' },
    { sign: '개띠', label: '개', grade: '신뢰', text: '진실한 태도가 신뢰를 얻어 좋은 제안으로 돌아옵니다.' },
    { sign: '돼지띠', label: '돼지', grade: '복록', text: '먹을 복과 인연 복이 함께 들어오는 넉넉한 하루입니다.' }
  ];
  window.showZodiacFortune = function (sign, text) {
    var toast = $('zodiac-toast');
    if (toast) toast.innerHTML = '<strong style="color:var(--gold-lt)">[' + sign + ']</strong> ' + text;
    $$('.um-zodiac button').forEach(function (b) { b.classList.remove('is-lucky'); });
    if (window.event && window.event.currentTarget) window.event.currentTarget.classList.add('is-lucky');
  };
  window.showAllZodiacAlert = function () {
    var toast = $('zodiac-toast');
    if (!toast) return;
    var lines = ZODIAC.map(function (z) { return '<b style="color:var(--gold-lt)">' + z.label + '</b> ' + z.grade; }).join(' · ');
    toast.innerHTML = '오늘의 12간지 총평 — ' + lines;
  };

  /* 데일리 지표(재물/인연/성취) — 날짜 기반으로 매일 자동 갱신 */
  function paintDailyMeters() {
    var defs = [
      { id: 'meter-money', base: 78 },
      { id: 'meter-love', base: 80 },
      { id: 'meter-achieve', base: 76 }
    ];
    var values = [];
    defs.forEach(function (d, i) {
      var v = d.base + (seeded(21) - 4) + i * 2;
      if (v > 97) v = 97; if (v < 68) v = 68;
      values.push(v);
      var fill = $(d.id + '-fill'), pct = $(d.id + '-pct');
      if (fill) fill.style.width = v + '%';
      if (pct) pct.textContent = v + '%';
    });
    var head = $('daily-meter-title');
    if (head) head.textContent = '재물 ' + values[0] + '% · 인연 ' + values[1] + '%';
  }

  /* 리포트 엔진이 계산한 일진 수치가 있으면 라운지 카드와 동기화 */
  function syncDailyFromEngine() {
    var map = [['daily-pct-money', 'meter-money'], ['daily-pct-love', 'meter-love'], ['daily-pct-job', 'meter-achieve']];
    var synced = 0;
    map.forEach(function (pair) {
      var src = $(pair[0]);
      if (!src) return;
      var m = (src.textContent || '').match(/(\d+)/);
      if (!m) return;
      var v = parseInt(m[1], 10);
      if (isNaN(v) || v <= 0) return;
      var fill = $(pair[1] + '-fill'), pct = $(pair[1] + '-pct');
      if (fill) fill.style.width = v + '%';
      if (pct) pct.textContent = v + '%';
      synced++;
    });
    if (synced > 0) {
      var pcts = ['meter-money-pct', 'meter-love-pct', 'meter-achieve-pct'].map(function (id) {
        var el = $(id); return el ? (el.textContent || '').replace('%', '') : '';
      });
      var head = $('daily-meter-title');
      if (head) head.textContent = '재물 ' + pcts[0] + '% · 인연 ' + pcts[1] + '%';
    }
    var ganji = $('daily-ganji-text');
    var target = $('lounge-ganji');
    if (ganji && target && ganji.textContent.trim()) target.textContent = ganji.textContent.trim();
  }

  /* ---------- 6. 모바일 메뉴 · 공유 ---------- */
  window.toggleMobileNav = function () {
    var nav = $('um-mobile-nav');
    if (!nav) return;
    var open = nav.classList.toggle('is-open');
    var burger = document.querySelector('.um-burger');
    if (burger) burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      var first = nav.querySelector('a, button');
      if (first) first.focus();
    }
  };
  window.copyShareLink = function () {
    var url = location.href.split('#')[0];
    var done = function () {
      var t = $('share-toast') || $('zodiac-toast');
      if (t) t.innerHTML = '<span style="color:var(--gold-lt);font-weight:700">🔗 링크가 복사되었습니다. 소중한 분께 오늘의 운을 나눠주세요.</span>';
      else alert('링크가 복사되었습니다: ' + url);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done).catch(function () { prompt('아래 주소를 복사해 주세요', url); });
    } else { prompt('아래 주소를 복사해 주세요', url); }
  };
  window.scrollTop_ = function () { window.scrollTo({ top: 0, behavior: 'smooth' }); };

  /* ---------- 6-1. 성전 이동 래퍼 ----------
     · 클릭 즉시 해당 성전의 첫 리포트를 샘플로 열어 주고(가치 우선 UX),
     · 리포트가 열리면 상단 성전 내비게이션 하이라이트까지 동기화합니다. */
  var HALL_FIRST = {
    'hall-destiny': 'oheng',
    'hall-life': 'naming',
    'hall-modern': 'health',
    'hall-mystic': 'tangsaju'
  };
  (function wrapSwitchTab() {
    if (typeof window.switchTab !== 'function') return;
    var inner = window.switchTab;
    window.switchTab = function (hallId) {
      inner(hallId);
      if (HALL_FIRST[hallId] && typeof window.selectSajuMenu === 'function') {
        window.selectSajuMenu(HALL_FIRST[hallId]);
      }
      $$('.hall-btn').forEach(function (b) {
        if (b.closest('.um-hall-nav')) return;   /* 새 내비게이션은 app.js가 직접 관리 */
        var m = (b.getAttribute('onclick') || '').match(/hall-(destiny|life|modern|mystic)/);
        if (m) b.classList.toggle('is-current', ('hall-' + m[1]) === hallId);
      });
    };
  })();

  /* ---------- 7. 초기화 ---------- */
  function init() {
    paintDailyMeters();
    window.filterFortuneItems('');
    $$('.um-faq-item').forEach(function (it) {
      var btn = it.querySelector('.um-faq-q');
      if (btn) btn.setAttribute('aria-expanded', it.classList.contains('is-open') ? 'true' : 'false');
    });

    var first = ZODIAC.filter(function (z) { return z.lucky; });
    var grid = $('zodiac-grid');
    if (grid) {
      ZODIAC.forEach(function (z) {
        var b = document.createElement('button');
        b.type = 'button';
        if (z.lucky) b.className = 'is-lucky';
        b.innerHTML = z.label + '<em>' + z.grade + '</em>';
        b.addEventListener('click', function () {
          var t = $('zodiac-toast');
          if (t) t.innerHTML = '<strong style="color:var(--gold-lt)">[' + z.sign + ']</strong> ' + z.text;
        });
        grid.appendChild(b);
      });
      var head = $('zodiac-title');
      if (head && first.length) head.textContent = '오늘의 대길띠: ' + first.map(function (z) { return z.sign; }).join(' · ');
    }

    /* 데일리 일진 간지 표기 (엔진 데이터가 있으면 이후 동기화) */
    var ganjiBox = $('lounge-ganji');
    if (ganjiBox && !ganjiBox.textContent.trim()) {
      var now = new Date();
      ganjiBox.textContent = now.getFullYear() + '년 ' + (now.getMonth() + 1) + '월 ' + now.getDate() + '일 · 오늘의 일진 해독 완료';
    }

    /* 30대 운세 카드 → 리포트 즉시 열기 (샘플 체험 지원) */
    $$('.fortune-card-cta').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-key');
        if (key && typeof window.selectSajuMenu === 'function') window.selectSajuMenu(key);
      });
    });

    /* 리포트가 열리면 라운지 지표와 동기화 */
    var res = $('result-section');
    if (res && window.MutationObserver) {
      new MutationObserver(function () {
        if (!res.classList.contains('hidden')) setTimeout(syncDailyFromEngine, 400);
      }).observe(res, { attributes: true, attributeFilter: ['class'] });
    }

    /* 스크롤 위치에 따라 상단 메뉴 활성 표시 */
    if ('IntersectionObserver' in window) {
      var map = { 'temple-panel-1': 1, 'temple-panel-2': 2, 'temple-panel-3': 3, 'temple-panel-4': 4 };
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var n = map[e.target.id];
          if (n) { for (var i = 1; i <= 4; i++) { var nb = $('nav-temple-' + i); if (nb) nb.classList[i === n ? 'add' : 'remove']('is-active'); } }
          if (e.target.id === 'daily-lounge-section') { var b = $('nav-lounge'); if (b) b.classList.add('is-active'); }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      ['temple-panel-1', 'temple-panel-2', 'temple-panel-3', 'temple-panel-4', 'daily-lounge-section'].forEach(function (id) {
        var el = $(id); if (el) io.observe(el);
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
