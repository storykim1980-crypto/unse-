// ==================== 데이터 로더 (JSON 분리 구조) ====================
        let CHEONGAN = [], JIJI = [], ILJU_DATA = {}, GAPJA = [];
        let GAN_DETAIL = {}, JI_DETAIL = {}, OHENG_DETAIL = {}, SIPSIN_DAILY = {}, ILJU_DETAIL = {};
        let DATA_READY = false;

        async function loadFortuneData() {
            const _v = (typeof window !== 'undefined' && window.APP_VERSION) ? window.APP_VERSION : Date.now();
            const res = await fetch('./data/fortune-data.json?v=' + _v, { cache: 'no-store' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const d = await res.json();
            CHEONGAN = d.CHEONGAN; JIJI = d.JIJI; ILJU_DATA = d.ILJU_DATA;
            GAN_DETAIL = d.GAN_DETAIL || {}; JI_DETAIL = d.JI_DETAIL || {};
            OHENG_DETAIL = d.OHENG_DETAIL || {}; SIPSIN_DAILY = d.SIPSIN_DAILY || {};
            ILJU_DETAIL = d.ILJU_DETAIL || {};

            // 60갑자 생성
            GAPJA = [];
            for (let i = 0; i < 60; i++) {
                const gan = CHEONGAN[i % 10], ji = JIJI[i % 12];
                GAPJA.push({ index: i + 1, name: gan.name + ji.name, han: gan.han + ji.han, ganIdx: i % 10, jiIdx: i % 12 });
            }
            // 미등재 일주 자동 해설 생성 (천간/지지 상세를 조합해 풍부하게)
            GAPJA.forEach(g => {
                if (!ILJU_DATA[g.name]) {
                    const gan = CHEONGAN[g.ganIdx], ji = JIJI[g.jiIdx];
                    ILJU_DATA[g.name] = {
                        desc: '하늘에서는 ' + gan.name + '(' + gan.oheng + ')의 기질이, 땅에서는 ' + ji.animal + '띠 ' + ji.name + '(' + ji.oheng + ')의 기질이 만나 서로를 받쳐주는 짜임새입니다. 위아래 기운이 각자의 몫을 다하니, 생각한 것을 손으로 옮기는 실행의 힘이 좋은 일주입니다.',
                        strengths: ['천간 ' + gan.name + '의 뚜렷한 자기 기준', '지지 ' + ji.name + '(' + ji.animal + ')의 밀고 나가는 저력', '자기만의 방식으로 성과를 내는 재주'],
                        weaknesses: ['기운이 한쪽으로 몰리는 시기에는 서두르지 않기', '지칠 때는 미루지 말고 충분히 쉬어 가기'],
                        job: gan.oheng + ' 기운과 ' + ji.oheng + ' 기운을 함께 살릴 수 있는 기획·운영, 전문 자격, 현장 관리 계열이 잘 맞습니다. 직종의 이름보다 중요한 것은 일하는 방식이니, 스스로 계획하고 결과를 확인할 수 있는 자리를 고를 때 타고난 실행력이 온전히 성과로 이어집니다.',
                        love: '서로의 영역을 존중할 때 오래가는, 신뢰가 바탕이 되는 인연을 맺습니다. 뜨겁게 타오르는 사랑보다 서서히 깊어지는 정이 어울리는 명이라, 상대를 바꾸려 하기보다 결을 이해하는 쪽을 택할 때 관계가 해마다 단단해집니다.',
                        health: gan.oheng + ' 기운과 짝을 이루는 장부의 컨디션을 평소에 살펴 주세요. 큰 병의 예고가 아니라 피로가 먼저 쌓이기 쉬운 자리라는 안내이니, 충분한 수면과 가벼운 정기 검진만으로도 넉넉히 지켜 낼 수 있습니다.'
                    };
                }
            });
            DATA_READY = true;
        }

        function showDataError(err) {
            console.error('데이터 로드 실패:', err);
            const banner = document.createElement('div');
            banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#7f1d1d;color:#fecaca;padding:12px 16px;font-size:13px;text-align:center;';
            banner.innerHTML = '⚠️ 운세 데이터(data/fortune-data.json)를 불러오지 못했습니다. 웹서버(GitHub Pages 등)를 통해 접속했는지, 데이터 파일이 함께 업로드되었는지 확인해 주세요.';
            document.body.prepend(banner);
        }

        const OHENG_MAP = {
            '목': { 생: '화', 극: '토', 피생: '수', 피극: '금' }, '화': { 생: '토', 극: '금', 피생: '목', 피극: '수' },
            '토': { 생: '금', 극: '수', 피생: '화', 피극: '목' }, '금': { 생: '수', 극: '목', 피생: '토', 피극: '화' },
            '수': { 생: '목', 극: '화', 피생: '금', 피극: '토' }
        };

        function getSipsin(myGanIdx, targetOheng, isTargetYang) {
            const myOheng = CHEONGAN[myGanIdx].oheng, isSameYang = ((myGanIdx % 2 === 0) === isTargetYang);
            if (myOheng === targetOheng) return isSameYang ? '비견' : '겁재';
            if (OHENG_MAP[myOheng].생 === targetOheng) return isSameYang ? '식신' : '상관';
            if (OHENG_MAP[myOheng].극 === targetOheng) return isSameYang ? '편재' : '정재';
            if (OHENG_MAP[myOheng].피극 === targetOheng) return isSameYang ? '편관' : '정관';
            if (OHENG_MAP[myOheng].피생 === targetOheng) return isSameYang ? '편인' : '정인';
            return '비견';
        }

        function getJiSipsin(myGanIdx, jiIdx) {
            const jiMainGanIdx = { 0:9, 1:5, 2:0, 3:1, 4:4, 5:2, 6:3, 7:5, 8:6, 9:7, 10:4, 11:8 }[jiIdx];
            return getSipsin(myGanIdx, CHEONGAN[jiMainGanIdx].oheng, jiMainGanIdx % 2 === 0);
        }

        const UNSEONG_NAMES = ['장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양'];
        function getUnseong(ganIdx, jiIdx) {
            const startJi = { 0:11, 1:6, 2:2, 3:9, 4:2, 5:9, 6:5, 7:0, 8:8, 9:3 }[ganIdx];
            return UNSEONG_NAMES[(ganIdx % 2 === 0) ? (jiIdx - startJi + 12) % 12 : (startJi - jiIdx + 12) % 12];
        }

        let CURRENT_SAJU = null, isPanoramaMode = false, lastActiveTabId = 'tab-oheng';

                

        function initApp() {
            if (window._appInitialized) return;
            window._appInitialized = true;

            const today = new Date(); const tYear = today.getFullYear(), tMonth = today.getMonth() + 1, tDay = today.getDate();
            const tGapjaIdx = (tYear - 4 + 6000) % 60; const tNyeonGan = CHEONGAN[tGapjaIdx % 10], tNyeonJi = JIJI[tGapjaIdx % 12];
            const solarTermsDay = { 1:5, 2:4, 3:5, 4:5, 5:5, 6:6, 7:7, 8:7, 9:7, 10:8, 11:7, 12:7 };
            let tEffMonth = tMonth; if (tDay < solarTermsDay[tMonth]) { tEffMonth = tMonth - 1; if (tEffMonth === 0) tEffMonth = 12; }
            const wolJiIdxMap = { 1:1, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10, 11:11, 12:0 };
            const startWolGanMap = { 0:2, 5:2, 1:4, 6:4, 2:6, 7:6, 3:8, 8:8, 4:0, 9:0 };
            const tWolGanIdx = (startWolGanMap[tGapjaIdx % 10] + (wolJiIdxMap[tEffMonth] - 2 + 12) % 12) % 10;
            const tWolGan = CHEONGAN[tWolGanIdx], tWolJi = JIJI[wolJiIdxMap[tEffMonth]];
            const headerDateSpan = document.getElementById('header-today-date');
            if (headerDateSpan) headerDateSpan.innerHTML = `기준일: <strong class="text-amber-400">${tYear}년 ${tMonth}월 ${tDay}일</strong> (${tNyeonGan.name}${tNyeonJi.name}년 · ${tWolGan.name}${tWolJi.name}월)`;

            const yearSelect = document.getElementById('birth-year'), monthSelect = document.getElementById('birth-month'), daySelect = document.getElementById('birth-day');
            const pYear = document.getElementById('partner-year'), pMonth = document.getElementById('partner-month'), pDay = document.getElementById('partner-day');

            if (!yearSelect || !monthSelect || !daySelect) return;

            // 옵션 텅 빔 현상 방지를 위해 기존 하드코딩 옵션 외 동적 채우기
            for (let y = tYear; y >= 1930; y--) {
                const gapjaIdx = (y - 4 + 6000) % 60; const gan = CHEONGAN[gapjaIdx % 10], ji = JIJI[gapjaIdx % 12];
                const yearLabel = `${y}년 (${gan.name}${ji.name}년 · ${ji.animal}띠)`;
                const opt = document.createElement('option'); opt.value = y; opt.textContent = yearLabel; if (y === 1992) opt.selected = true; yearSelect.appendChild(opt);
                if (pYear) { const optP = document.createElement('option'); optP.value = y; optP.textContent = yearLabel; if (y === 1990) optP.selected = true; pYear.appendChild(optP); }
            }

            for (let m = 1; m <= 12; m++) {
                const opt = document.createElement('option'); opt.value = m; opt.textContent = `${m}월`; if (m === 8) opt.selected = true; monthSelect.appendChild(opt);
                if (pMonth) { const optP = document.createElement('option'); optP.value = m; optP.textContent = `${m}월`; if (m === 5) optP.selected = true; pMonth.appendChild(optP); }
            }
            for (let d = 1; d <= 31; d++) {
                const opt = document.createElement('option'); opt.value = d; opt.textContent = `${d}일`; if (d === 15) opt.selected = true; daySelect.appendChild(opt);
                if (pDay) { const optP = document.createElement('option'); optP.value = d; optP.textContent = `${d}일`; if (d === 20) optP.selected = true; pDay.appendChild(optP); }
            }
        }

        // 부트스트랩: 데이터(JSON) 로드 완료 후에만 initApp 실행 (DOMReady/load 타이밍 모두 대응)
        function bootstrapApp() {
            loadFortuneData().then(initApp).catch(showDataError);
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', bootstrapApp);
        } else {
            bootstrapApp();
        }

        function toggleLeapMonth() { const type = document.querySelector('input[name="calendar_type"]:checked').value; const c = document.getElementById('leap-month-container'); if (type === 'lunar') c.classList.remove('hidden'); else { c.classList.add('hidden'); document.getElementById('is_leap_month').checked = false; } }
        function toggleTimeInput() { const u = document.getElementById('time-unknown').checked; const c = document.getElementById('time-input-container'); if (u) c.classList.add('opacity-40', 'pointer-events-none'); else c.classList.remove('opacity-40', 'pointer-events-none'); }
        function loadExample(y, m, d, cal, gen, h) {
            document.getElementById('birth-year').value = y; document.getElementById('birth-month').value = m; document.getElementById('birth-day').value = d;
            document.getElementsByName('calendar_type').forEach(r => r.checked = (r.value === cal)); toggleLeapMonth();
            document.getElementsByName('gender').forEach(r => r.checked = (r.value === gen)); document.getElementById('time-unknown').checked = false; toggleTimeInput();
            let s = 11; if (h===23||h===0) s=23; else if (h===1||h===2) s=1; else if (h===3||h===4) s=3; else if (h===5||h===6) s=5; else if (h===7||h===8) s=7; else if (h===9||h===10) s=9; else if (h===11||h===12) s=11; else if (h===13||h===14) s=13; else if (h===15||h===16) s=15; else if (h===17||h===18) s=17; else if (h===19||h===20) s=19; else if (h===21||h===22) s=21;
            document.getElementById('birth-time-sijin').value = s; document.getElementById('saju-form').dispatchEvent(new Event('submit'));
        }
        function scrollToSection(id) { document.getElementById(id).scrollIntoView({ behavior: 'smooth' }); }

        function togglePanoramaMode() {
            isPanoramaMode = !isPanoramaMode; const btnText = document.getElementById('panorama-text'); const panoramaBtn = document.getElementById('btn-panorama');
            if (isPanoramaMode) {
                document.querySelectorAll('.tab-content').forEach(el => el.classList.add('active'));
                btnText.textContent = "📑 1단 탭별 보기 모드로 돌아가기 (접기)"; panoramaBtn.className = "px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-emerald-500/30 hover:bg-emerald-500/40 border border-emerald-500 text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition shadow tracking-normal";
            } else {
                document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
                const lastTab = document.getElementById(lastActiveTabId); if (lastTab) lastTab.classList.add('active');
                btnText.textContent = "📖 24대 전체 메뉴 한 번에 쭈욱 보기 (파노라마 모드)"; panoramaBtn.className = "px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition shadow tracking-normal";
            }
        }

        function switchTab(tabId) {
            if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
            lastActiveTabId = tabId;
            if (isPanoramaMode) { isPanoramaMode = false; document.getElementById('panorama-text').textContent = "📖 24대 전체 메뉴 한 번에 쭈욱 보기 (파노라마 모드)"; document.getElementById('btn-panorama').className = "px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition shadow tracking-normal"; }
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(btn => {
                let defaultClass = "tab-btn px-3 sm:px-4 py-2 rounded-xl font-medium text-xs sm:text-sm text-gray-300 hover:bg-white/5 transition flex items-center gap-1.5 tracking-normal border border-white/10";
                if (btn.id === 'btn-tab-life') defaultClass = "tab-btn px-3 sm:px-4 py-2 rounded-xl font-medium text-xs sm:text-sm text-amber-300 hover:bg-white/5 transition flex items-center gap-1.5 tracking-normal border border-amber-500/30 bg-amber-500/10";
                btn.className = defaultClass;
            });
            const targetTab = document.getElementById(tabId);
            if (targetTab) {
                targetTab.classList.add('active');
                // 모바일 갤럭시/태블릿/PC에서 클릭 시 가려짐 없이 부드럽게 콘텐츠 상단으로 쾌적 정렬
                setTimeout(() => {
                    const yOffset = -70; // 헤더 높이만큼 넉넉한 여백
                    const y = targetTab.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }, 30);
            }
            const activeBtn = document.getElementById('btn-' + tabId);
            if (activeBtn) {
                activeBtn.className = "tab-btn px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-yellow-500 text-mystic-900 shadow-md transition flex items-center gap-1.5 tracking-normal";
            }
        }

        function copySummaryToClipboard() {
            const title = document.getElementById('res-user-title').textContent, il = document.getElementById('res-il-title').textContent, yong = document.getElementById('yongsin-oheng').textContent;
            const text = `[🌾 운세방앗간 사주 요약]\n· 대상: ${title}\n· 사주 일주: ${il}\n· 핵심 용신: ${yong}\n· 2026 운세: ⭐⭐⭐⭐ 대복록의 해`;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => alert('사주 요약이 복사되었습니다!')).catch(() => fallbackCopyTextToClipboard(text));
            } else {
                fallbackCopyTextToClipboard(text);
            }
        }

        function fallbackCopyTextToClipboard(text) {
            const textArea = document.createElement("textarea");
            textArea.value = text; textArea.style.position = "fixed"; textArea.style.left = "-9999px";
            document.body.appendChild(textArea); textArea.focus(); textArea.select();
            try { document.execCommand('copy'); alert('사주 요약이 클립보드에 복사되었습니다!'); } catch (err) { alert('복사 실패: 직접 텍스트를 선택해 복사해 주세요.'); }
            document.body.removeChild(textArea);
        }

        function calculateManseoryeok(year, month, day, isLunar, isLeapMonth, timeHour, isTimeUnknown) {
            let solYear = year, solMonth = month, solDay = day;
            if (isLunar) { let dAdd = isLeapMonth ? 59 : 30; const dt = new Date(year, month - 1, day); dt.setDate(dt.getDate() + dAdd); solYear = dt.getFullYear(); solMonth = dt.getMonth() + 1; solDay = dt.getDate(); }
            let nyeonIdx = (solYear - 4 + 60) % 60; if (solMonth === 1 || (solMonth === 2 && solDay < 4)) nyeonIdx = (nyeonIdx - 1 + 60) % 60;
            const nyeonGapja = GAPJA[nyeonIdx]; const nyeonGanIdx = nyeonGapja.ganIdx, nyeonJiIdx = nyeonGapja.jiIdx;
            const solarTermsDay = { 1:5, 2:4, 3:5, 4:5, 5:5, 6:6, 7:7, 8:7, 9:7, 10:8, 11:7, 12:7 };
            let effMonth = solMonth; if (solDay < solarTermsDay[solMonth]) { effMonth = solMonth - 1; if (effMonth === 0) effMonth = 12; }
            const wolJiIdxMap = { 1:1, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10, 11:11, 12:0 };
            const wolJiIdx = wolJiIdxMap[effMonth];
            const startWolGanMap = { 0:2, 5:2, 1:4, 6:4, 2:6, 7:6, 3:8, 8:8, 4:0, 9:0 };
            const wolGanIdx = (startWolGanMap[nyeonGanIdx] + (wolJiIdx - 2 + 12) % 12) % 10;
            const wolGan = CHEONGAN[wolGanIdx], wolJi = JIJI[wolJiIdx];
            
            // [수정됨] 서머타임/시차 오차 없는 UTC 자정 밀리초 정밀 정규화 연산
            const diffDays = Math.floor((Date.UTC(solYear, solMonth - 1, solDay) - Date.UTC(1900, 0, 1)) / (1000 * 60 * 60 * 24));
            let ilIdx = (40 + diffDays % 60) % 60; if (ilIdx < 0) ilIdx += 60;
            const ilGapja = GAPJA[ilIdx]; const ilGanIdx = ilGapja.ganIdx, ilJiIdx = ilGapja.jiIdx;
            
            let siGanIdx = 0, siJiIdx = 6, siGapja = null;
            if (!isTimeUnknown) {
                siJiIdx = Math.floor(((timeHour + 1) % 24) / 2);
                const startSiGanMap = { 0:0, 5:0, 1:2, 6:2, 2:4, 7:4, 3:6, 8:6, 4:8, 9:8 };
                siGanIdx = (startSiGanMap[ilGanIdx] + siJiIdx) % 10;
                const siGan = CHEONGAN[siGanIdx], siJi = JIJI[siJiIdx];
                siGapja = { name: `${siGan.name}${siJi.name}`, han: `${siGan.han}${siJi.han}`, ganIdx: siGanIdx, jiIdx: siJiIdx };
            }
            return { solDateStr: `${solYear}년 ${String(solMonth).padStart(2, '0')}월 ${String(solDay).padStart(2, '0')}일`, nyeon: nyeonGapja, wol: { name: `${wolGan.name}${wolJi.name}`, han: `${wolGan.han}${wolJi.han}`, ganIdx: wolGanIdx, jiIdx: wolJiIdx }, il: ilGapja, si: siGapja, isTimeUnknown: isTimeUnknown };
        }

        function escapeHtml(str) {
            if (!str) return '';
            return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        }

        function handleAnalyze(e) {
            if (e && e.preventDefault) e.preventDefault();
            if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
            document.getElementById('loading-overlay').classList.remove('hidden');
            setTimeout(() => {
                const year = parseInt(document.getElementById('birth-year').value), month = parseInt(document.getElementById('birth-month').value), day = parseInt(document.getElementById('birth-day').value);
                const isLunar = (document.querySelector('input[name="calendar_type"]:checked').value === 'lunar');
                const isLeapMonth = isLunar && document.getElementById('is_leap_month').checked;
                const gender = document.querySelector('input[name="gender"]:checked').value;
                const isTimeUnknown = document.getElementById('time-unknown').checked;
                const timeHour = parseInt(document.getElementById('birth-time-sijin').value);
                const saju = calculateManseoryeok(year, month, day, isLunar, isLeapMonth, timeHour, isTimeUnknown);
                CURRENT_SAJU = { ...saju, gender, year, month, day, timeHour };
                const nowYr = new Date().getFullYear(); const koreanAge = nowYr - year + 1; const manAge = nowYr - year;
                const nyeonGanIdx = saju.nyeon.ganIdx; const isForward = (gender === 'M' && (nyeonGanIdx % 2 === 0)) || (gender === 'F' && (nyeonGanIdx % 2 !== 0));
                const daeunStartAge = ((day % 5) + 3);
                updateResultUI(saju, gender, koreanAge, manAge, isForward, daeunStartAge);
                document.getElementById('loading-overlay').classList.add('hidden');
                document.getElementById('result-section').classList.remove('hidden');
                document.getElementById('result-section').scrollIntoView({ behavior: 'smooth' });
                if (window.lucide && typeof lucide !== 'undefined') { lucide.createIcons(); } else { setTimeout(() => { if (window.lucide) lucide.createIcons(); }, 500); }
            }, 700);
        }

        function updateResultUI(saju, gender, koreanAge, manAge, isForward, daeunStartAge) {
            const genderStr = (gender === 'M') ? '남성 (陽)' : '여성 (陰)';
            const nowYr = new Date().getFullYear();
            const nowGapjaIdx = (nowYr - 4 + 6000) % 60;
            const nowGan = CHEONGAN[nowGapjaIdx % 10], nowJi = JIJI[nowGapjaIdx % 12];
            document.getElementById('res-user-title').textContent = `${saju.solDateStr} 출생 ${genderStr}의 사주팔자`;
            document.getElementById('res-user-subtitle').textContent = `한국 나이 ${koreanAge}세 (만 ${manAge}세) · 대운 ${isForward ? '순행' : '역행'} (${daeunStartAge}세 시작) · 분석 기준: ${nowYr}년 ${nowGan.name}${nowJi.name}년`;

            const ilGan = CHEONGAN[saju.il.ganIdx], ilJi = JIJI[saju.il.jiIdx];
            document.getElementById('res-il-title').textContent = `${saju.il.name} (${saju.il.han})`;
            document.getElementById('res-il-gan-han').textContent = ilGan.han; document.getElementById('res-il-gan-kr').textContent = `${ilGan.name} (${ilGan.oheng}) · ${ilGan.symbol.split('/')[0]}`;
            document.getElementById('res-il-gan-box').className = `w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl flex flex-col items-center justify-center font-serif-kr font-extrabold text-3xl sm:text-4xl border-2 shadow-xl transition transform hover:scale-105 ring-4 ring-amber-500/20 ${ilGan.colorClass}`;
            document.getElementById('res-il-ji-han').textContent = ilJi.han; document.getElementById('res-il-ji-kr').textContent = `${ilJi.name} (${ilJi.oheng}) · ${ilJi.animal}`;
            document.getElementById('res-il-ji-sipsin').textContent = getJiSipsin(saju.il.ganIdx, saju.il.jiIdx);
            document.getElementById('res-il-ji-box').className = `w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl flex flex-col items-center justify-center font-serif-kr font-bold text-2xl sm:text-3xl border shadow-inner transition transform hover:scale-105 ${ilJi.colorClass}`;
            document.getElementById('res-il-jijanggan').textContent = ilJi.jijanggan; document.getElementById('res-il-unseong').textContent = getUnseong(saju.il.ganIdx, saju.il.jiIdx);

            const wolGan = CHEONGAN[saju.wol.ganIdx], wolJi = JIJI[saju.wol.jiIdx];
            document.getElementById('res-wol-title').textContent = `${saju.wol.name} (${saju.wol.han})`;
            document.getElementById('res-wol-gan-sipsin').textContent = getSipsin(saju.il.ganIdx, wolGan.oheng, saju.wol.ganIdx % 2 === 0);
            document.getElementById('res-wol-gan-han').textContent = wolGan.han; document.getElementById('res-wol-gan-kr').textContent = `${wolGan.name} (${wolGan.oheng})`;
            document.getElementById('res-wol-gan-box').className = `w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl flex flex-col items-center justify-center font-serif-kr font-bold text-2xl sm:text-3xl border shadow-inner transition transform hover:scale-105 ${wolGan.colorClass}`;
            document.getElementById('res-wol-ji-han').textContent = wolJi.han; document.getElementById('res-wol-ji-kr').textContent = `${wolJi.name} (${wolJi.oheng}) · ${wolJi.animal}`;
            document.getElementById('res-wol-ji-sipsin').textContent = getJiSipsin(saju.il.ganIdx, saju.wol.jiIdx);
            document.getElementById('res-wol-ji-box').className = `w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl flex flex-col items-center justify-center font-serif-kr font-bold text-2xl sm:text-3xl border shadow-inner transition transform hover:scale-105 ${wolJi.colorClass}`;
            document.getElementById('res-wol-jijanggan').textContent = wolJi.jijanggan; document.getElementById('res-wol-unseong').textContent = getUnseong(saju.il.ganIdx, saju.wol.jiIdx);

            const nyeonGan = CHEONGAN[saju.nyeon.ganIdx], nyeonJi = JIJI[saju.nyeon.jiIdx];
            document.getElementById('res-nyeon-title').textContent = `${saju.nyeon.name} (${saju.nyeon.han})`;
            document.getElementById('res-nyeon-gan-sipsin').textContent = getSipsin(saju.il.ganIdx, nyeonGan.oheng, saju.nyeon.ganIdx % 2 === 0);
            document.getElementById('res-nyeon-gan-han').textContent = nyeonGan.han; document.getElementById('res-nyeon-gan-kr').textContent = `${nyeonGan.name} (${nyeonGan.oheng})`;
            document.getElementById('res-nyeon-gan-box').className = `w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl flex flex-col items-center justify-center font-serif-kr font-bold text-2xl sm:text-3xl border shadow-inner transition transform hover:scale-105 ${nyeonGan.colorClass}`;
            document.getElementById('res-nyeon-ji-han').textContent = nyeonJi.han; document.getElementById('res-nyeon-ji-kr').textContent = `${nyeonJi.name} (${nyeonJi.oheng}) · ${nyeonJi.animal}`;
            document.getElementById('res-nyeon-ji-sipsin').textContent = getJiSipsin(saju.il.ganIdx, saju.nyeon.jiIdx);
            document.getElementById('res-nyeon-ji-box').className = `w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl flex flex-col items-center justify-center font-serif-kr font-bold text-2xl sm:text-3xl border shadow-inner transition transform hover:scale-105 ${nyeonJi.colorClass}`;
            document.getElementById('res-nyeon-jijanggan').textContent = nyeonJi.jijanggan; document.getElementById('res-nyeon-unseong').textContent = getUnseong(saju.il.ganIdx, saju.nyeon.jiIdx);

            if (saju.isTimeUnknown || !saju.si) {
                document.getElementById('res-si-title').textContent = '시간 미상'; document.getElementById('res-si-gan-sipsin').textContent = '-'; document.getElementById('res-si-gan-han').textContent = '?'; document.getElementById('res-si-gan-kr').textContent = '미상';
                document.getElementById('res-si-gan-box').className = "w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl flex flex-col items-center justify-center font-serif-kr font-bold text-2xl sm:text-3xl border border-dashed border-gray-600 bg-white/5 text-gray-500";
                document.getElementById('res-si-ji-han').textContent = '?'; document.getElementById('res-si-ji-kr').textContent = '미상'; document.getElementById('res-si-ji-sipsin').textContent = '-';
                document.getElementById('res-si-ji-box').className = "w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl flex flex-col items-center justify-center font-serif-kr font-bold text-2xl sm:text-3xl border border-dashed border-gray-600 bg-white/5 text-gray-500";
                document.getElementById('res-si-jijanggan').textContent = '-'; document.getElementById('res-si-unseong').textContent = '-';
            } else {
                const siGan = CHEONGAN[saju.si.ganIdx], siJi = JIJI[saju.si.jiIdx];
                document.getElementById('res-si-title').textContent = `${saju.si.name} (${saju.si.han})`;
                document.getElementById('res-si-gan-sipsin').textContent = getSipsin(saju.il.ganIdx, siGan.oheng, saju.si.ganIdx % 2 === 0);
                document.getElementById('res-si-gan-han').textContent = siGan.han; document.getElementById('res-si-gan-kr').textContent = `${siGan.name} (${siGan.oheng})`;
                document.getElementById('res-si-gan-box').className = `w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl flex flex-col items-center justify-center font-serif-kr font-bold text-2xl sm:text-3xl border shadow-inner transition transform hover:scale-105 ${siGan.colorClass}`;
                document.getElementById('res-si-ji-han').textContent = siJi.han; document.getElementById('res-si-ji-kr').textContent = `${siJi.name} (${siJi.oheng}) · ${siJi.animal}`;
                document.getElementById('res-si-ji-sipsin').textContent = getJiSipsin(saju.il.ganIdx, saju.si.jiIdx);
                document.getElementById('res-si-ji-box').className = `w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl flex flex-col items-center justify-center font-serif-kr font-bold text-2xl sm:text-3xl border shadow-inner transition transform hover:scale-105 ${siJi.colorClass}`;
                document.getElementById('res-si-jijanggan').textContent = siJi.jijanggan; document.getElementById('res-si-unseong').textContent = getUnseong(saju.il.ganIdx, saju.si.jiIdx);
            }

            // 기존 16대 필수 연산
            renderOhengAnalysis(saju, ilGan); renderSipsinAndYongsin(saju, ilGan, wolJi); renderLifeStages(saju, ilGan, ilJi); renderHabchungAndSinsal15(saju, ilGan, ilJi); renderIljuDetail(saju.il.name, ilGan, ilJi); renderDaeun(saju, isForward, daeunStartAge, manAge); renderSeunAndGuide(saju, ilGan, ilJi);
            renderDailyFortune(saju, ilGan, ilJi); renderTojungBigyeol(CURRENT_SAJU); renderWealthMastery(saju, ilGan, wolJi); renderTaegilMastery(saju, ilGan, ilJi);
            renderSpouseProfile(saju, ilGan, ilJi); renderChildMastery(saju, ilGan, ilJi); renderCelebrityMatch(saju, ilGan, wolJi); analyzeNaming();

            // ⭐ NEW v6.0 신규 8대 마스터 메뉴 연산
            renderHealthMastery(saju, ilGan); // 17. 건강 12경락
            renderPungsuMastery(ilGan); // 19. 양택 풍수
            renderSamjaeMastery(saju); // 20. 삼재 & 살풀이
            renderCareerMastery(saju, ilGan, wolJi); // 21. 취업/승진 적성
            renderLuckyNumMastery(ilGan); // 22. 행운 전화번호
            renderPetMastery(saju, ilJi); // 23. 반려동물 띠 궁합
            renderPastlifeMastery(saju, ilJi); // 24. 전생 카르마
        }

        // ==========================================
        // 기존 11대 필수 렌더링 함수 완벽 복원 탑재 (오행·격국·평생·신살·일주·대운·세운·일진·토정·재물·택일)
        // ==========================================
        function renderOhengAnalysis(saju, ilGan) {
            const counts = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };
            const elements = [CHEONGAN[saju.nyeon.ganIdx].oheng, JIJI[saju.nyeon.jiIdx].oheng, CHEONGAN[saju.wol.ganIdx].oheng, JIJI[saju.wol.jiIdx].oheng, CHEONGAN[saju.il.ganIdx].oheng, JIJI[saju.il.jiIdx].oheng];
            if (saju.si) elements.push(CHEONGAN[saju.si.ganIdx].oheng, JIJI[saju.si.jiIdx].oheng);
            elements.forEach(oh => counts[oh]++);

            const total = saju.si ? 8 : 6;
            const container = document.getElementById('oheng-bars-container'); container.innerHTML = '';
            const ohengNames = ['목', '화', '토', '금', '수'];
            const ohengStyles = { '목':{bg:'bg-emerald-500',text:'text-emerald-400',label:'목(木) · 나무'}, '화':{bg:'bg-red-500',text:'text-red-400',label:'화(火) · 불'}, '토':{bg:'bg-amber-500',text:'text-amber-400',label:'토(土) · 흙'}, '금':{bg:'bg-slate-300',text:'text-slate-300',label:'금(金) · 쇠'}, '수':{bg:'bg-blue-500',text:'text-blue-400',label:'수(水) · 물'} };

            ohengNames.forEach(oh => {
                const cnt = counts[oh]; const pct = Math.round((cnt / total) * 100); const style = ohengStyles[oh];
                container.innerHTML += `<div class="space-y-1"><div class="flex justify-between text-xs font-bold"><span class="${style.text}">${style.label} ${cnt>=3 ? '<span class="text-rose-400 ml-1">[과다 🔥]</span>':''}${cnt===0 ? '<span class="text-blue-300 ml-1">[부족 💧]</span>':''}</span><span class="text-gray-300">${cnt}개 (${pct}%)</span></div><div class="w-full bg-mystic-900 h-3.5 rounded-full overflow-hidden p-0.5 border border-white/10"><div class="${style.bg} h-full rounded-full" style="width: ${pct}%"></div></div></div>`;
            });

            const analysisBox = document.getElementById('oheng-analysis-text');
            const overList = ohengNames.filter(o => counts[o] >= 3), zeroList = ohengNames.filter(o => counts[o] === 0);
            let html = `<p class="text-amber-300 font-semibold">🌟 일간(본원) 오행: <strong class="text-white">${ilGan.name}(${ilGan.oheng})</strong></p><p class="text-gray-300">당신은 사주의 중심인 일간이 <strong>${ilGan.oheng}(${ilGan.han})</strong> 기운을 뿌리로 삼고 있어, 그 오행 특유의 빛깔이 성정 전반에 짙게 배어 있습니다.</p>`;
            if (overList.length > 0) html += `<p class="text-rose-300 pt-1">🔥 <strong>과다 오행 (${overList.join(', ')})</strong>: 원국의 세 글자 이상이 한 기운으로 쏠려 있습니다. 치우친 기운은 성미의 고집으로, 또 그 오행이 맡은 장부의 피로로 드러나기 쉬우니 모자란 쪽을 채워 균형을 맞추는 생활 개운이 필요합니다.</p>`; else html += `<p class="text-emerald-300 pt-1">✅ <strong>과다 오행 없음</strong>: 어느 한쪽으로 크게 기울지 않아, 기운의 배합이 부드럽게 어우러진 원국입니다.</p>`;
            if (zeroList.length > 0) html += `<p class="text-blue-300 pt-1">💧 <strong>부족 오행 (${zeroList.join(', ')})</strong>: 팔자 여덟 글자 안에 이 기운의 글자가 보이지 않습니다. 대운이나 그해의 운에서 이 오행이 들어올 때 막힌 것이 풀리며, 평소 해당 기운의 색과 방향을 곁에 두면 그 시기를 앞당기는 효과가 있습니다.</p>`; else html += `<p class="text-emerald-300 pt-1">✅ <strong>오행 구비 완벽</strong>: 다섯 오행이 원국 안에 빠짐없이 들어차 있습니다. 어떤 환경에 놓여도 제자리를 찾고, 굽이를 만나도 돌아 나오는 힘이 좋은 짜임새입니다.</p>`;
            const myDeep = OHENG_DETAIL[ilGan.oheng];
            if (myDeep) html += `<p class="pt-2 text-gray-400 leading-relaxed"><strong class="text-amber-300">[${ilGan.oheng} 기운 심층 해설]</strong> ${myDeep}</p>`;
            overList.forEach(o => { if (OHENG_DETAIL[o] && o !== ilGan.oheng) html += `<p class="pt-1.5 text-gray-400 leading-relaxed"><strong class="text-rose-300">[과다한 ${o} 기운 이해]</strong> ${OHENG_DETAIL[o]}</p>`; });
            zeroList.forEach(o => { if (OHENG_DETAIL[o]) html += `<p class="pt-1.5 text-gray-400 leading-relaxed"><strong class="text-blue-300">[보완할 ${o} 기운 이해]</strong> ${OHENG_DETAIL[o]}</p>`; });
            analysisBox.innerHTML = html;
        }

        function renderSipsinAndYongsin(saju, ilGan, wolJi) {
            const wolJiSipsin = getJiSipsin(saju.il.ganIdx, saju.wol.jiIdx);
            const gyeokgukMap = { '정관':{title:'정관격 (正官格)',desc:'정해진 도리를 지키며 조직의 기준이 되는 그릇으로, 공정함이 무기인 유형'}, '편관':{title:'편관격 (偏官格)',desc:'압박이 클수록 오히려 힘을 내는 승부사로, 위기 국면의 돌파 대장'}, '정인':{title:'정인격 (正印格)',desc:'배움을 쌓아 사람을 기르는 그릇으로, 글과 지식이 평생의 밑천'}, '편인':{title:'편인격 (偏印格)',desc:'남들이 못 보는 이면을 짚어내는 촉의 소유자로, 한 우물 전문 기예형'}, '정재':{title:'정재격 (正財格)',desc:'한 푼도 허투루 다루지 않는 관리 감각으로 차곡차곡 부를 쌓는 유형'}, '편재':{title:'편재격 (偏財格)',desc:'판을 크게 벌여 굴리는 수완가로, 사람과 돈이 함께 도는 유형'}, '식신':{title:'식신격 (食神格)',desc:'표현하고 나누는 것이 곧 복이 되는 유형으로, 의식주 걱정이 적은 격'}, '상관':{title:'상관격 (傷官格)',desc:'틀을 깨는 발상으로 새 길을 여는 유형으로, 재주가 밥이 되는 격'} };
            const gyeok = gyeokgukMap[wolJiSipsin] || {title:'건록/양인격', desc:'남에게 기대지 않는 꿋꿋한 자립심으로 맨손에서 일가를 이루는 유형'};
            gyeok.desc += ' 격국(格局)이란 월지를 중심으로 원국 전체의 짜임새를 하나의 그릇 모양으로 읽어 낸 것으로, 타고난 사회적 체질과 성공 공식을 보여 주는 명리의 핵심 틀입니다. 자신의 격에 맞는 무대를 고르는 것만으로도 같은 노력의 성과가 몇 배로 달라집니다.';
            document.getElementById('sipsin-gyeokguk-title').textContent = gyeok.title; document.getElementById('sipsin-gyeokguk-desc').textContent = gyeok.desc;

            let myScore = 0, otherScore = 0;
            const checkPoint = (g, j, wg, wj) => {
                if (g !== null) { const s = getSipsin(saju.il.ganIdx, CHEONGAN[g].oheng, g%2===0); if (['비견','겁재','정인','편인'].includes(s)) myScore += wg; else otherScore += wg; }
                if (j !== null) { const s = getJiSipsin(saju.il.ganIdx, j); if (['비견','겁재','정인','편인'].includes(s)) myScore += wj; else otherScore += wj; }
            };
            checkPoint(saju.nyeon.ganIdx, saju.nyeon.jiIdx, 1, 1); checkPoint(saju.wol.ganIdx, saju.wol.jiIdx, 1, 3.5); checkPoint(null, saju.il.jiIdx, 0, 1.5); if (saju.si) checkPoint(saju.si.ganIdx, saju.si.jiIdx, 1, 1);
            const isSingang = (myScore >= otherScore);
            document.getElementById('sipsin-singang-title').textContent = isSingang ? '신강 (身强) · 주도형' : '신약 (身弱) · 수용형';
            document.getElementById('sipsin-singang-title').className = `text-xl font-serif-kr font-bold ${isSingang ? 'text-emerald-400' : 'text-amber-400'}`;
            document.getElementById('sipsin-singang-desc').textContent = isSingang ? `내 힘(${myScore}점)이 주위 세력(${otherScore}점)을 앞서니, 스스로 판을 끌고 가는 뚝심이 강한 명입니다.` : `주위 세력(${otherScore}점)이 내 힘(${myScore}점)을 웃도는 구조라, 혼자 밀어붙이기보다 주변의 손을 빌리고 유연하게 조율할 때 일이 풀립니다.`;

            let yongOheng = isSingang ? OHENG_MAP[ilGan.oheng].생 : OHENG_MAP[ilGan.oheng].피생;
            let huiOheng = isSingang ? OHENG_MAP[ilGan.oheng].극 : ilGan.oheng;
            document.getElementById('yongsin-oheng').textContent = `${yongOheng} 기운 (${isSingang?'식상/재성':'인성/비겁'})`;
            document.getElementById('huisin-oheng').textContent = `${huiOheng} 기운`;
            document.getElementById('yongsin-reason').innerHTML = `기운의 강약을 고르게 다스리는 억부의 원리에 따라 <strong>${yongOheng}</strong> 기운이 나를 살리는 핵심 용신이 되고, 곁에서 이를 거드는 <strong>${huiOheng}</strong> 기운이 희신 역할을 맡아 원국의 흐름을 틔워 줍니다.`;

            const sipsinList = ['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인'];
            const sipsinCounts = {}; sipsinList.forEach(s => sipsinCounts[s] = 0);
            const countS = (g, j) => { if (g!==null) sipsinCounts[getSipsin(saju.il.ganIdx, CHEONGAN[g].oheng, g%2===0)]++; if (j!==null) sipsinCounts[getJiSipsin(saju.il.ganIdx, j)]++; };
            countS(saju.nyeon.ganIdx, saju.nyeon.jiIdx); countS(saju.wol.ganIdx, saju.wol.jiIdx); countS(null, saju.il.jiIdx); if (saju.si) countS(saju.si.ganIdx, saju.si.jiIdx);

            const grid = document.getElementById('sipsin-grid-container'); grid.innerHTML = '';
            sipsinList.forEach(s => grid.innerHTML += `<div class="p-2.5 rounded-xl border ${sipsinCounts[s]>0 ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold' : 'bg-white/5 border-white/10 text-gray-500'}"><div class="text-xs">${s}</div><div class="text-base sm:text-lg mt-1">${sipsinCounts[s]}개</div></div>`);
            const topS = Object.entries(sipsinCounts).sort((a,b)=>b[1]-a[1]).filter(x=>x[1]>0);
            document.getElementById('sipsin-summary-text').innerHTML = topS.length > 0 ? `<p>· <strong>최다 십신 (${topS[0][0]}, ${topS[0][1]}개)</strong>: 이 기운이 당신의 직업적 색깔과 사회생활의 무게중심 노릇을 합니다.</p>` : '';
        }

        function renderLifeStages(saju, ilGan, ilJi) {
            const wolJiSipsin = getJiSipsin(saju.il.ganIdx, saju.wol.jiIdx);
            document.getElementById('life-total-title').textContent = `${saju.il.name} 일주와 ${wolJiSipsin} 환경의 절묘한 만남`;
            document.getElementById('life-total-desc').textContent = `당신의 한평생은 ${ilGan.symbol.split('/')[0]} 의 기질을 밑거름 삼아, 세상 속에서 ${wolJiSipsin}의 재능을 펼쳐 가는 긴 여정으로 읽힙니다. 어린 시절 뿌리를 내리고, 중년 무렵 사회적으로 가장 높이 오르며, 그 뒤로는 쌓아 온 경험을 지혜와 여유로 바꾸어 누리는 흐름의 그릇입니다.`;
            document.getElementById('life-chonyon-ganji').textContent = `년주: ${saju.nyeon.name} (${saju.nyeon.han})`;
            document.getElementById('life-chonyon-desc').textContent = `1~20세 무렵의 초년 구간입니다. 가족과 웃어른의 울타리 안에서 공부의 기초를 다지고, 나만의 중심을 세워 가는 시절로 풀이됩니다. 년주는 조상과 부모에게서 물려받은 뿌리의 기운을 보여 주는 자리로, 이 시절에 몸에 밴 습관과 가치관이 평생의 밑그림이 됩니다. 이 구간의 경험이 순탄했든 굴곡졌든, 그 모든 것이 중년 이후 꺼내 쓰게 될 자산으로 쌓여 있다는 점이 중요합니다.`;
            document.getElementById('life-jungnyon-ganji').textContent = `월주: ${saju.wol.name} (${saju.wol.han}) · ${wolJiSipsin}`;
            document.getElementById('life-jungnyon-desc').textContent = `20~45세의 청년·중년 구간입니다. 일터에서 실력을 증명하고 자리를 넓혀 가며, 재산의 토대를 하나씩 쌓아 올리는 상승기의 흐름입니다. 월주는 사회 무대와 직업 환경을 비추는 자리라, 이 시기의 선택 하나하나가 인생 전체의 물길을 정합니다. 20대에는 방향을 고르고, 30대에는 속도를 붙이고, 40대 초반에는 쌓은 것을 지키는 순서로 힘을 배분하면 이 상승기를 온전히 살릴 수 있습니다.`;
            document.getElementById('life-jangnyon-ganji').textContent = `일주: ${saju.il.name} (${saju.il.han}) · 배우자궁`;
            document.getElementById('life-jangnyon-desc').textContent = `45~60세의 장년 구간입니다. 집안이 안정 궤도에 오르고 배우자와의 호흡이 깊어지며, 삶을 바라보는 눈이 한층 원숙해지는 시절입니다. 일주는 나 자신과 배우자궁을 함께 담은 자리여서, 이 무렵부터는 바깥의 성취보다 곁의 사람과 몸의 건강이 행복의 무게중심이 됩니다. 이 시기에 부부가 함께하는 취미나 루틴을 하나 만들어 두면, 말년까지 이어지는 든든한 버팀목이 됩니다.`;
            if (saju.si) {
                document.getElementById('life-malnyon-ganji').textContent = `시주: ${saju.si.name} (${saju.si.han})`;
                document.getElementById('life-malnyon-desc').textContent = `60세 이후의 말년 구간입니다. 몸과 살림이 두루 편안하고, 자녀와 아랫사람들의 존경 속에서 그간 뿌린 것을 거두는 시절로 풀이됩니다. 시주는 말년운과 자녀 인연을 보여 주는 자리입니다. 이 구간의 복은 갑자기 오는 것이 아니라 초년의 성실, 중년의 신용, 장년의 덕이 이자까지 붙어 돌아오는 것이니, 지금 어느 시기를 지나고 계시든 그 시절의 숙제를 다하는 것이 곧 말년 준비입니다.`;
            } else {
                document.getElementById('life-malnyon-ganji').textContent = `시주 미상 (미적용)`;
                document.getElementById('life-malnyon-desc').textContent = `출생 시각을 몰라 시주는 계산에서 뺐습니다. 태어난 시간을 확인해 입력하시면 말년의 흐름과 자녀 인연까지 더 깊이 읽어 드릴 수 있습니다.`;
            }
        }

        function renderHabchungAndSinsal15(saju, ilGan, ilJi) {
            const sinsals = []; const jiList = [saju.nyeon.jiIdx, saju.wol.jiIdx, saju.il.jiIdx]; if (saju.si) jiList.push(saju.si.jiIdx);
            const cheonEulMap = { 0:[1,7], 1:[0,8], 2:[11,9], 3:[11,9], 4:[1,7], 5:[0,8], 6:[1,7], 7:[2,6], 8:[3,5], 9:[3,5] }[saju.il.ganIdx];
            if (jiList.some(ji => cheonEulMap.includes(ji))) sinsals.push({ name: '천을귀인 (天乙貴人)', type: '최고 길신 🌟', desc: '고비마다 뜻밖의 조력자가 나타나 궂은 기운을 좋은 쪽으로 돌려놓는, 으뜸으로 치는 복성입니다.' });
            const munChangMap = { 0:5, 1:6, 2:8, 3:9, 4:8, 5:9, 6:11, 7:0, 8:2, 9:3 }[saju.il.ganIdx];
            if (jiList.includes(munChangMap)) sinsals.push({ name: '문창귀인 (文昌貴人)', type: '학문 길신 📚', desc: '머리가 맑고 글재주가 빼어나, 공부·시험·문서와 관련된 일에서 남다른 결과를 거두는 별입니다.' });
            if (jiList.includes(3) || jiList.includes(6) || jiList.includes(9) || jiList.includes(0)) sinsals.push({ name: '도화살 (桃花殺)', type: '대중 매력 🌸', desc: '보는 이의 시선을 끌어당기는 타고난 매력의 별입니다. 사람 앞에 서는 방송·예능·뷰티·영업 계열에서 그 힘이 빛을 냅니다.' });
            if (jiList.includes(2) || jiList.includes(5) || jiList.includes(8) || jiList.includes(11)) sinsals.push({ name: '역마살 (驛馬殺)', type: '글로벌 활동 ✈️', desc: '한곳에 머무르기보다 움직이며 판을 넓히는 별입니다. 오가며 이루는 무역·유통·현장 영업 쪽에서 성과가 커집니다.' });
            if (jiList.includes(4) || jiList.includes(7) || jiList.includes(10) || jiList.includes(1)) sinsals.push({ name: '화개살 (華蓋殺)', type: '철학 영성 🔮', desc: '홀로 깊이 파고드는 사색의 별입니다. 예술·철학·수행처럼 내면을 다루는 길에서 남이 흉내 못 낼 세계를 만들어 냅니다.' });
            const baekhoList = ['무진','정축','병술','을미','갑진','계축','임술'];
            if (baekhoList.includes(saju.il.name) || baekhoList.includes(saju.wol.name)) sinsals.push({ name: '백호대살 (白虎大殺)', type: '폭발적 투지 🐯', desc: '한번 불붙으면 끝을 보는 맹렬한 승부 기질의 별입니다. 강한 에너지를 전문성으로 벼리면 오늘날에는 오히려 정상에 서는 힘이 됩니다.' });

            const sCont = document.getElementById('sinsal-list-container'); sCont.innerHTML = '';
            sinsals.forEach(s => sCont.innerHTML += `<div class="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start space-x-3"><span class="text-xs font-bold px-2 py-1 rounded bg-amber-500/20 text-amber-300 min-w-max mt-0.5">${s.type}</span><div><div class="text-sm font-bold text-white">${s.name}</div><p class="text-xs text-gray-300 mt-1">${s.desc}</p></div></div>`);

            const habchungList = [];
            const checkJiHab = (j1, j2, name) => { if (jiList.includes(j1) && jiList.includes(j2)) habchungList.push({ title: `지지 육합 · ${name}`, desc: '지지끼리 서로 끌어안는 형국이라, 원국 전체를 지켜주고 흔들림을 줄여 주는 작용을 합니다.' }); };
            checkJiHab(0, 1, '자축합'); checkJiHab(2, 11, '인해합'); checkJiHab(3, 10, '묘술합'); checkJiHab(4, 9, '진유합'); checkJiHab(5, 8, '사신합'); checkJiHab(6, 7, '오미합');
            const hCont = document.getElementById('habchung-list-container'); hCont.innerHTML = '';
            if (habchungList.length === 0) hCont.innerHTML = '<p class="text-xs text-gray-400 p-3 bg-white/5 rounded-xl">글자끼리 크게 부딪히는 자리가 없어, 원국의 균형이 잔잔하게 잘 잡혀 있는 편입니다.</p>';
            else habchungList.forEach(h => hCont.innerHTML += `<div class="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1"><div class="text-sm font-bold text-amber-300 flex items-center gap-1.5"><i data-lucide="corner-down-right" class="w-4 h-4 text-amber-400"></i> ${h.title}</div><p class="text-xs text-gray-300">${h.desc}</p></div>`);
        }

        function renderIljuDetail(iljuName, ilGan, ilJi) {
            const data = ILJU_DATA[iljuName] || getIljuFallback(ilGan, ilJi);
            document.getElementById('ilju-detail-title').textContent = `${iljuName} 일주 · ${ilGan.symbol.split('/')[0]}와 ${ilJi.animal}의 결합`;
            document.getElementById('ilju-symbol-text').textContent = `${ilGan.symbol} / ${ilJi.animal}`;
            let coreHtml = `<p>${data.desc}</p>`;
            const deep = ILJU_DETAIL[iljuName];
            if (deep) coreHtml += `<p class="pt-2 text-gray-300 leading-relaxed">${deep}</p>`;
            const ganDeep = GAN_DETAIL[ilGan.name], jiDeep = JI_DETAIL[ilJi.name];
            if (ganDeep) coreHtml += `<p class="pt-2 text-gray-400 leading-relaxed"><strong class="text-amber-300">[일간 ${ilGan.name}${ilGan.han} 심층]</strong> ${ganDeep}</p>`;
            if (jiDeep) coreHtml += `<p class="pt-2 text-gray-400 leading-relaxed"><strong class="text-amber-300">[일지 ${ilJi.name}${ilJi.han} 심층]</strong> ${jiDeep}</p>`;
            document.getElementById('ilju-core-text').innerHTML = coreHtml;
            const strList = document.getElementById('ilju-strengths-list'); strList.innerHTML = ''; data.strengths.forEach(s => strList.innerHTML += `<li>${s}</li>`);
            const weakList = document.getElementById('ilju-weaknesses-list'); weakList.innerHTML = ''; data.weaknesses.forEach(w => weakList.innerHTML += `<li>${w}</li>`);
            document.getElementById('ilju-job-text').textContent = data.job; document.getElementById('ilju-love-text').textContent = data.love; document.getElementById('ilju-health-text').textContent = data.health;
        }

        function renderDaeun(saju, isForward, daeunStartAge, manAge) {
            document.getElementById('daeun-info-badge').textContent = `${isForward ? '순행 (順行)' : '역행 (逆行)'} · 만 ${daeunStartAge}세 시작`;
            const timelineGrid = document.getElementById('daeun-timeline-grid'); timelineGrid.innerHTML = '';
            const baseWolGanIdx = saju.wol.ganIdx, baseWolJiIdx = saju.wol.jiIdx; let currentDaeunObj = null;

            for (let i = 1; i <= 8; i++) {
                const step = isForward ? i : -i;
                const ganIdx = (baseWolGanIdx + step + 60) % 10, jiIdx = (baseWolJiIdx + step + 60) % 12;
                const gan = CHEONGAN[ganIdx], ji = JIJI[jiIdx];
                const startAge = daeunStartAge + (i - 1) * 10, endAge = startAge + 9;
                const isCurrent = (manAge >= startAge && manAge <= endAge) || (i === 4 && !currentDaeunObj);
                if (isCurrent) currentDaeunObj = { title: `${gan.name}${ji.name}(${gan.han}${ji.han}) 대운`, ageRange: `만 ${startAge}세 ~ ${endAge}세`, ganjiHan: `${gan.han}${ji.han}`, ganSipsin: getSipsin(saju.il.ganIdx, gan.oheng, ganIdx%2===0), jiSipsin: getJiSipsin(saju.il.ganIdx, jiIdx) };

                timelineGrid.innerHTML += `<div class="glass-card rounded-xl p-4 transition border flex flex-col justify-between ${isCurrent ? 'border-2 border-amber-500 bg-amber-500/10 shadow-lg' : 'border-white/10 hover:border-white/30'}"><div class="flex justify-between items-center text-xs pb-2 border-b border-white/10"><span class="font-bold ${isCurrent ? 'text-amber-400 font-extrabold' : 'text-gray-400'}">${i}대운 (${startAge}~${endAge}세)</span><span>⭐⭐⭐⭐</span></div><div class="my-3 text-center"><div class="font-serif-kr font-bold text-2xl sm:text-3xl text-white">${gan.han}${ji.han}</div><div class="text-xs font-bold mt-1 ${gan.textClass}">${gan.name}(${gan.oheng}) · ${ji.name}(${ji.oheng})</div></div><div class="text-[11px] bg-white/5 rounded px-2 py-1 flex justify-between text-gray-300"><span>천간: ${getSipsin(saju.il.ganIdx, gan.oheng, ganIdx%2===0)}</span><span>지지: ${getJiSipsin(saju.il.ganIdx, jiIdx)}</span></div></div>`;
            }

            if (currentDaeunObj) {
                document.getElementById('current-daeun-age').textContent = currentDaeunObj.ageRange; document.getElementById('current-daeun-ganji-box').textContent = currentDaeunObj.ganjiHan;
                document.getElementById('current-daeun-title').textContent = `${currentDaeunObj.title} · ${currentDaeunObj.ganSipsin}/${currentDaeunObj.jiSipsin}의 테마`;
                document.getElementById('current-daeun-desc').innerHTML = `현재 당신은 <strong>${currentDaeunObj.ganSipsin}(천간)</strong>이 열어 주는 바깥세상의 기회와 <strong>${currentDaeunObj.jiSipsin}(지지)</strong>가 받쳐 주는 현실의 힘이 함께 움직이는 시절을 지나고 있습니다. 대운은 10년 단위로 갈아입는 계절의 옷과 같아서, 같은 사람이라도 어느 대운을 지나느냐에 따라 인생의 온도가 크게 달라집니다. 지금의 대운은 품어 온 것을 꺼내 보이고 자기 자리를 단단히 굳히기에 더없이 좋은 도약의 구간이니, 미뤄 온 결심이 있다면 이 10년 안에 승부를 거는 것이 흐름을 타는 길입니다.`;
            }
        }

        function renderSeunAndGuide(saju, ilGan, ilJi) {
            document.getElementById('seun-general-text').innerHTML = `<p class="text-amber-300 font-bold mb-1">🔥 2026년 병오(丙午)년 세운 핵심: 화기(火氣)의 폭발적 에너지 발산</p><p>천간과 지지에 화(火)가 겹쳐 타오르는 붉은 말의 해입니다. 안에 감춰 두었던 재주가 밖으로 드러나고, 발 딛는 무대가 훌쩍 넓어지는 활기찬 흐름입니다.</p>`;
            document.getElementById('seun-job-text').textContent = `실력이 조명받고 이름값이 오르는 구간입니다. 손대고 있던 일이 매듭을 지으며, 공을 인정받을 자리가 여러 번 찾아옵니다. 특히 그동안 티 나지 않게 해 온 일일수록 올해는 조명 아래로 나옵니다. 성과를 정리한 기록을 미리 준비해 두면 기회가 왔을 때 곧바로 내밀 수 있고, 상반기의 작은 인정이 하반기의 큰 제안으로 이어지는 연쇄가 일어나기 쉬운 흐름입니다. 특히 그동안 "알아주는 사람이 없다"고 느껴 왔다면 올해가 그 갈증을 푸는 해입니다. 발표·보고·면접처럼 나를 드러내는 자리를 피하지 말고 오히려 자원하세요. 화(火)의 해에는 무대에 서는 사람에게 빛이 모입니다.`;
            document.getElementById('seun-money-text').textContent = `움직임이 커지는 만큼 돈의 드나듦도 잦아집니다. 들어오는 돈도 늘지만 활동비·교제비처럼 나가는 구멍도 함께 커지는 구조라, 한탕을 노리기보다 새는 곳을 막는 알뜰한 관리가 결과적으로 남는 장사입니다. 불 기운이 강한 해에는 돈도 빠르게 들어오고 빠르게 나가는 성질을 띱니다. 고정 지출을 점검해 줄줄 새는 구멍부터 막고, 수입이 늘어난 달에는 늘어난 만큼의 일부를 반드시 떼어 묶어 두세요. 연말에 결산해 보면 화려하게 벌던 사람보다 담담하게 지킨 사람의 곳간이 더 차 있는 해입니다. 상반기에는 지출 항목을 한번 정리해 고정비를 다이어트하고, 목돈이 생기면 하반기의 기회를 위해 유동성 있게 묶어 두는 편이 유리합니다.`;
            document.getElementById('seun-love-text').textContent = `불 기운이 실어 오는 도화의 바람으로 주변의 호감이 부쩍 늘고, 마음이 가는 인연과 마주칠 확률이 높아집니다. 솔로라면 소개나 모임을 마다하지 말고 나가 보세요. 올해의 인연은 기다리는 자리보다 움직이는 자리에서 생깁니다. 짝이 있는 분이라면 주변의 관심이 늘어나는 만큼 오해의 소지도 함께 커지니, 사소한 것도 먼저 공유하는 투명함이 관계를 지키는 가장 쉬운 방법입니다. 혼자인 분이라면 모임·동호회·소개 자리를 마다하지 마세요. 올해는 가만히 있어도 눈에 띄는 해라, 평소보다 적은 노력으로 좋은 만남이 성사됩니다. 짝이 있는 분은 뜨거워진 감정 온도만큼 사소한 다툼도 불붙기 쉬우니, 화가 오르는 순간 대화를 잠시 멈추는 지혜가 필요합니다.`;
            document.getElementById('seun-rel-text').textContent = `모임 자리가 늘고 아는 사람의 폭이 넓어지는 때입니다. 올해 새로 맺는 인연 가운데는 몇 년 뒤 결정적 순간에 손을 내밀어 줄 귀인이 섞여 있으니, 당장 이득이 없어 보이는 만남도 소홀히 하지 마세요. 다만 화 기운의 해에는 말이 빨라지고 세지는 경향이 있어, 무심코 던진 한마디가 구설이 되기 쉽습니다. 세 번 생각하고 한 번 말하는 습관이 올해 인간관계의 보험입니다.`;
            document.getElementById('seun-health-text').textContent = `의욕이 앞서는 만큼 몸의 배터리도 빨리 닳습니다. 화 기운이 강한 해에는 심장·혈압·눈의 피로, 그리고 불면이 단골 신호로 옵니다. 잠을 줄여 가며 달리지 말고, 일주일에 하루는 아무 일정도 없는 완전한 휴식일로 비워 두세요. 커피를 줄이고 미지근한 물을 자주 마시는 것, 자기 전 화면을 멀리하는 것만으로도 올해의 과열을 크게 식힐 수 있습니다.`;
            document.getElementById('seun-study-text').textContent = `머리 회전이 빠르고 감이 예리하게 서는 시기라, 자격시험이나 연구·탐구 쪽에서 기대 이상의 성적을 낼 수 있습니다. 다만 불 기운의 학습은 순간 몰입은 강하고 지구력은 짧은 특징이 있으니, 하루 8시간을 붙드는 계획보다 90분 집중 후 확실히 쉬는 리듬이 효율을 배로 만듭니다. 미뤄 온 자격증이 있다면 접수부터 해 버리세요. 마감이 정해지는 순간 올해의 기운이 등을 밀어 줍니다. 미뤄 두었던 자격증이나 어학 공부가 있다면 올해 안에 시작하는 것이 몇 년 치를 앞당기는 선택입니다. 다만 의욕이 넘쳐 여러 과목을 동시에 벌이면 어느 것도 매듭짓지 못하니, 한 번에 한 과목씩 끝을 보는 각개격파 전략이 화 기운의 해와 잘 맞습니다.`;

            const monthlyGrid = document.getElementById('seun-monthly-grid'); monthlyGrid.innerHTML = '';
            [{m:1,han:'己丑',kr:'기축'},{m:2,han:'庚寅',kr:'경인'},{m:3,han:'辛卯',kr:'신묘'},{m:4,han:'壬辰',kr:'임진'},{m:5,han:'癸巳',kr:'계사'},{m:6,han:'甲午',kr:'갑오'},{m:7,han:'乙未',kr:'을미'},{m:8,han:'丙申',kr:'병신'},{m:9,han:'丁酉',kr:'정유'},{m:10,han:'戊戌',kr:'무술'},{m:11,han:'己亥',kr:'기해'},{m:12,han:'庚子',kr:'경자'}].forEach(mo => {
                monthlyGrid.innerHTML += `<div class="p-3 rounded-xl border bg-white/5 ${mo.m===6 ? 'border-amber-500/60 bg-amber-500/10' : 'border-white/10'}"><div class="flex justify-between items-center text-xs font-bold text-gray-400"><span>2026년 ${mo.m}월</span><span class="text-amber-400 font-serif-kr">${mo.han}</span></div><div class="text-sm font-bold text-white mt-1">${mo.kr}월</div></div>`;
            });

            document.getElementById('guide-color').textContent = '적색, 핑크색 (Red) / 남쪽'; document.getElementById('guide-direction').textContent = '남쪽 (South)'; document.getElementById('guide-number').textContent = '2, 7 (화 기운)'; document.getElementById('guide-food').textContent = '따뜻한 차와 커피';
            document.getElementById('guide-do-list').innerHTML = `<li><strong>용신 기운 적극 수용</strong>: 나에게 이로운 색과 방향을 옷·소품·자리 배치에 자연스럽게 녹여 보세요.</li><li><strong>명확한 목표 문서화</strong>: 머릿속 계획을 글과 계약서로 못 박아 둘 때 성과가 손에 잡힙니다.</li><li><strong>따뜻한 말 한마디</strong>: 베푼 온기는 돌고 돌아 귀인의 손길이 되어 돌아옵니다.</li>`;
            document.getElementById('guide-dont-list').innerHTML = `<li><strong>욱하는 감정 충돌 주의</strong>: 욱하는 순간의 기 싸움은 이겨도 손해입니다. 한 템포 쉬어 가세요.</li><li><strong>과도한 투기 및 보증 경계</strong>: 보증과 투기는 멀리하고, 지키는 쪽에 무게를 둔 자산 운용이 안전합니다.</li>`;
        }

        function renderDailyFortune(saju, ilGan, ilJi) {
            const today = new Date(); const tYear = today.getFullYear(), tMonth = today.getMonth() + 1, tDay = today.getDate();
            const diffDays = Math.floor((today - new Date(1900, 0, 1)) / (1000 * 60 * 60 * 24));
            let tIlIdx = (40 + diffDays) % 60; if (tIlIdx < 0) tIlIdx += 60;
            const tIlGapja = GAPJA[tIlIdx]; const tGan = CHEONGAN[tIlGapja.ganIdx]; const tJi = JIJI[tIlGapja.jiIdx];

            document.getElementById('daily-date-sub').textContent = `${tYear}년 ${tMonth}월 ${tDay}일 오늘 일진`;
            document.getElementById('daily-ganji-text').textContent = `${tIlGapja.name} (${tIlGapja.han})일 · ${tJi.animal}의 날`;

            const todaySipsinGan = getSipsin(saju.il.ganIdx, tGan.oheng, tIlGapja.ganIdx % 2 === 0);
            const todaySipsinJi = getJiSipsin(saju.il.ganIdx, tIlGapja.jiIdx);
            let moneyPct = 78, lovePct = 82, jobPct = 80, relPct = 85;
            let stars = '⭐⭐⭐⭐ (좋은 소식이 줄지어 드는 상서로운 날)';
            let summary = `오늘 하루는 <strong>${tIlGapja.name}일(${todaySipsinGan}/${todaySipsinJi})</strong>의 기운이 하루를 이끕니다. 일과 돈 양쪽에서 흐뭇한 결과를 손에 쥐기 좋은 날입니다.`;

            if (todaySipsinGan.includes('재') || todaySipsinJi.includes('재')) { moneyPct = 95; jobPct = 90; summary = `재성의 기운이 하루를 채우는 날입니다. 막혔던 돈줄이 트이고, 굴려 둔 자산에서 반가운 소식이 들려올 수 있는 흐름입니다.`; }
            else if (todaySipsinGan.includes('관') || todaySipsinJi.includes('관')) { jobPct = 96; relPct = 88; summary = `관성의 기운이 정점에 오르는 날입니다. 실력을 공식적으로 인정받거나 굵직한 계약 도장을 찍기에 이보다 좋은 타이밍이 드뭅니다.`; }

            const jiHabPairs = { 0:1, 1:0, 2:11, 11:2, 3:10, 10:3, 4:9, 9:4, 5:8, 8:5, 6:7, 7:6 };
            if (jiHabPairs[ilJi.jiIdx] === tIlGapja.jiIdx) { lovePct = 98; relPct = 96; stars = '⭐⭐⭐⭐⭐ (막힘없이 술술 풀리는 최상급 길일)'; summary += ` 일지가 <strong>육합(六合)</strong>으로 어우러지니 사람 사이의 합이 유난히 좋고, 애정 전선에도 훈풍이 붑니다.`; }
            else if (Math.abs(ilJi.jiIdx - tIlGapja.jiIdx) === 6) { relPct = 65; moneyPct = 70; stars = '⭐⭐⭐ (변화의 바람이 부니 한 박자 신중히)'; summary += ` 일지가 <strong>상충(相冲)</strong>하는 날이라 마음이 앞서기 쉽습니다. 핸들 잡을 때와 말끝이 날카로워질 때, 이 두 가지만 조심하면 무난합니다.`; }

            const ganAdvice = SIPSIN_DAILY[todaySipsinGan], jiAdvice = SIPSIN_DAILY[todaySipsinJi];
            if (ganAdvice) summary += ` <span class="block pt-2 text-gray-300"><strong class="text-amber-300">[천간 ${todaySipsinGan} 풀이]</strong> ${ganAdvice}</span>`;
            if (jiAdvice && todaySipsinJi !== todaySipsinGan) summary += ` <span class="block pt-1.5 text-gray-300"><strong class="text-amber-300">[지지 ${todaySipsinJi} 풀이]</strong> ${jiAdvice}</span>`;
            document.getElementById('daily-stars').textContent = stars; document.getElementById('daily-summary-text').innerHTML = summary;
            document.getElementById('daily-pct-money').textContent = `${moneyPct}%`; document.getElementById('daily-bar-money').style.width = `${moneyPct}%`;
            document.getElementById('daily-pct-love').textContent = `${lovePct}%`; document.getElementById('daily-bar-love').style.width = `${lovePct}%`;
            document.getElementById('daily-pct-job').textContent = `${jobPct}%`; document.getElementById('daily-bar-job').style.width = `${jobPct}%`;
            document.getElementById('daily-pct-rel').textContent = `${relPct}%`; document.getElementById('daily-bar-rel').style.width = `${relPct}%`;
        }

        function renderTojungBigyeol(saju) {
            const nowYr = new Date().getFullYear(); const age = nowYr - saju.year + 1; const m = saju.month, d = saju.day;
            let sang = (age + m) % 8; if (sang === 0) sang = 8; let jung = (sang + d) % 6; if (jung === 0) jung = 6; let ha = (jung + (saju.timeHour || 12) + age) % 3; if (ha === 0) ha = 3;
            const gwaeNum = `${sang}${jung}${ha}`;
            const tojungNames = { '111':'건천태평 괘','112':'춘풍화기 괘','113':'금의환향 괘','211':'명월만개 괘','212':'만사형통 괘','213':'개운유수 괘','311':'일취월장 괘','312':'춘풍화기 괘','313':'부귀겸전 괘','411':'용문도약 괘','412':'유암화명 괘','413':'천강복록 괘','511':'고목봉춘 괘','512':'풍운조화 괘','513':'재수형통 괘' };
            const gwaeTitle = tojungNames[gwaeNum] || `제 ${gwaeNum} 괘 · 풍운조화 괘`;

            document.getElementById('tojung-year-label').textContent = `${nowYr}년 정통 토정비결 괘명`;
            document.getElementById('tojung-gwae-name').textContent = gwaeTitle;
            document.getElementById('tojung-calc-detail').textContent = `상괘 ${sang} + 중괘 ${jung} + 하괘 ${ha} = ${gwaeNum} 괘`;
            document.getElementById('tojung-total-desc').innerHTML = `나이와 생월·생일을 엮어 내는 옛 신년 산가지 법으로 올해의 괘를 뽑아 보니 <strong>[${gwaeTitle}]</strong>이(가) 나왔습니다. 긴 시간 매만져 온 일이 드디어 꼴을 갖추고, 쏟은 공에 비례해 곳간이 차는 결실의 해로 풀이됩니다.`;
            document.getElementById('tojung-half1-desc').textContent = `1월부터 6월까지의 상반기는 땅을 고르는 시기입니다. 속도를 내기보다 밑그림을 손보는 게 먼저이며, 서류와 계약이 제자리를 찾고 힘이 되어 줄 사람이 하나둘 곁에 모입니다. 이 시기에 맺은 관계와 문서가 한 해 농사의 씨앗이 되니, 사소한 약속이라도 글로 남기고 도장은 내용은 꼼꼼히 본 뒤에 찍으세요. 봄에 급히 심은 씨앗보다 잘 고른 씨앗이 가을 수확을 결정합니다.`;
            document.getElementById('tojung-half2-desc').textContent = `7월부터 12월까지의 하반기는 낫을 드는 시기입니다. 봄여름에 다져 둔 것이 수입과 이름값으로 되돌아오고, 특히 가을 문턱에서 오래 기억될 낭보가 들릴 수 있습니다. 다만 거두는 계절일수록 곳간 단속이 함께 필요합니다. 수확이 눈에 보이기 시작하면 주변의 부탁과 제안도 늘어나는 법이니, 기쁜 소식은 나누되 큰돈이 걸린 결정은 연말의 들뜬 분위기에 휩쓸리지 말고 새해 초의 맑은 정신으로 미뤄 두는 것도 지혜입니다.`;

            const mGrid = document.getElementById('tojung-monthly-grid'); mGrid.innerHTML = '';
            ['정월(1월): 몸가짐이 편안하고 집안에 웃음이 돎','2월: 봄바람에 꽃망울 터지듯 재물길이 열림','3월: 문을 두드리는 귀인이 있어 약조가 이루어짐','4월: 작게 시작한 일이 옹골찬 이득으로 자람','5월: 남녘에서 반가운 기별과 오름세의 조짐','6월: 물결이 잔잔하니 하는 일마다 무탈함','7월: 부지런히 오간 걸음마다 곡식이 쌓임','8월: 생각지 못한 인연이 다음 도약의 다리가 됨','9월: 한가위 달처럼 이름이 두루 밝게 비침','10월: 불린 재산을 한 번 더 굴려 볼 만한 때','11월: 집안에 경사가 들고 살림이 넉넉해짐','12월: 웃는 낯으로 한 해의 매듭을 지음'].forEach(msg => {
                mGrid.innerHTML += `<div class="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-200 leading-relaxed font-serif-kr"><strong class="text-amber-400 font-sans block mb-1">📜 ${msg.split(':')[0]}</strong>${msg.split(':')[1]}</div>`;
            });
        }

        function renderWealthMastery(saju, ilGan, wolJi) {
            const wolSipsin = getJiSipsin(saju.il.ganIdx, saju.wol.jiIdx);
            let wType = '식신생재(食神生財) · 자수성가 사업부호형', wDesc = `몸에 익힌 기술과 남과 다른 재주를 곧장 수입원으로 바꿔 내는, 스스로 벌어 스스로 일어서는 그릇입니다. 이런 구조는 월급 하나에만 기대기보다 본업 곁에 재주를 살린 부수입 파이프라인을 하나씩 늘려 갈 때 재산 그래프가 가팔라집니다. 남에게 물려받는 복보다 내 손으로 일구는 복이 훨씬 큰 명이니, 젊어서의 고생을 밑천이 쌓이는 과정으로 여기셔도 좋습니다.`, investDesc = `내 실력이 지분이 되는 사업, 부가가치 높은 서비스업, 실적이 탄탄한 주식과 상가 월세처럼 재주가 굴러가는 자산과 궁합이 좋습니다.`;
            if (wolSipsin === '편재' || wolSipsin === '정재') { wType = '재기통문(財氣通門) · 자산가/재무 마스터형'; wDesc = `돈이 어디서 와서 어디로 가는지를 본능적으로 읽어 내는 눈을 타고났습니다. 장사와 사업의 감각이 몸에 밴 자산가형 명이라, 같은 정보를 보고도 남들이 놓치는 돈 냄새를 먼저 맡습니다. 이 재능은 직장 안에 가둬 두기 아까운 종류여서, 당장 창업이 아니더라도 예산·구매·영업처럼 돈이 흐르는 길목의 업무를 맡을수록 몸값이 뜁니다.`; investDesc = `부동산 사고팔기, 목돈 굴리기, 긴 호흡의 가치 투자처럼 판이 큰 자본 게임에서 기회를 잡는 유형입니다.`; }
            else if (wolSipsin === '정인' || wolSipsin === '편인') { wType = '인수문서(印綬文書) · 부동산 지적재산권 부호형'; wDesc = `머리로 쌓은 지식과 손에 쥔 문서·자격·권리가 곧 곳간이 되는 유형입니다. 남들처럼 발로 뛰어 버는 돈보다, 공부해서 딴 자격·이름을 걸고 만든 콘텐츠·등기부에 올린 자산이 잠자는 동안에도 일해 주는 구조가 어울립니다. 위험한 큰돈보다 확실한 문서를 택하는 신중함이 이 명의 최대 무기이니, 남의 화려한 수익률에 흔들릴 이유가 없습니다.`; investDesc = `이름이 새겨지는 자산, 곧 등기된 부동산·저작권과 특허·꾸준한 배당주처럼 서류로 증명되는 투자와 잘 맞습니다.`; }

            document.getElementById('wealth-type-title').textContent = wType; document.getElementById('wealth-type-desc').textContent = wDesc; document.getElementById('wealth-invest-desc').textContent = investDesc;
            document.getElementById('wealth-golden-desc').textContent = `재주(식상)와 재물(재성)의 운이 포개지는 30대 중반~40대 후반, 그리고 50대 중반의 대운 구간이 재산 규모가 계단식으로 뛰어오르는 황금 창구로 읽힙니다. 이런 구간의 특징은 "일이 돈을 부르고, 그 돈이 다시 기회를 부르는" 선순환이 저절로 돈다는 점입니다. 그러니 해당 시기가 오기 전까지는 종잣돈과 실력이라는 두 개의 장작을 부지런히 쌓아 두는 것이 핵심 전략입니다. 창구가 열렸을 때 태울 장작이 없으면 좋은 운도 잔불로 끝나고, 넉넉히 쌓아 둔 사람에게는 같은 운이 큰 화력이 됩니다.`;
            document.getElementById('wealth-caution-desc').textContent = `비견·겁재의 운이 드는 해에는 내 돈이 남의 주머니로 새기 쉽습니다. 이 구간만큼은 동업 제안·보증 도장·한탕성 투기와 거리를 두는 것이 재산을 지키는 길입니다. 비견·겁재란 나와 같은 기운이 여럿 들어와 내 몫을 나누어 가는 형국을 말합니다. 이 시기에는 유난히 "확실하다"는 제안과 "너니까 알려 준다"는 정보가 몰려드는데, 거절이 어려우면 "가족과 상의해야 한다"는 한마디를 방패로 삼으세요. 지키기만 해도 이기는 구간이 있다는 것을 아는 것이, 부자 사주와 그렇지 못한 사주의 실제 갈림길입니다.`;
        }

        function renderTaegilMastery(saju, ilGan, ilJi) {
            const mList = document.getElementById('taegil-move-list'), bList = document.getElementById('taegil-biz-list'), lList = document.getElementById('taegil-love-list');
            mList.innerHTML = ''; bList.innerHTML = ''; lList.innerHTML = '';
            ['2026년 7월 19일 (손 없는 날 · 대길)', '2026년 8월 20일 (손 없는 날 · 상생일)', '2026년 9월 29일 (손 없는 날 · 천을귀인일)'].forEach(m => mList.innerHTML += `<li><strong class="text-emerald-400">✅ ${m.split('(')[0]}</strong> (${m.split('(')[1]}</li>`);
            ['2026년 7월 24일 (식신생재 길일)', '2026년 8월 15일 (관인상생 길일)', '2026년 10월 12일 (황금 금여록 길일)'].forEach(b => bList.innerHTML += `<li><strong class="text-amber-400">✅ ${b.split('(')[0]}</strong> (${b.split('(')[1]}</li>`);
            ['2026년 7월 18일 (일지 육합 도화일)', '2026년 8월 8일 (천간합 대길일)', '2026년 11월 20일 (천을귀인 화합일)'].forEach(l => lList.innerHTML += `<li><strong class="text-pink-400">✅ ${l.split('(')[0]}</strong> (${l.split('(')[1]}</li>`);
        }

        // [수정됨] 궁합 연산 및 유효성 검사 완비
        function calculateGunghap() {
            if (!CURRENT_SAJU) {
                alert('먼저 상단의 [사주 분석하기]를 실행하신 후 상대방 정보를 입력해 주세요!');
                return;
            }
            const pYrVal = document.getElementById('partner-year').value;
            const pMoVal = document.getElementById('partner-month').value;
            const pDaVal = document.getElementById('partner-day').value;
            if (!pYrVal || !pMoVal || !pDaVal) {
                alert('상대방(B)의 출생 연도, 월, 일을 모두 선택해 주세요!');
                return;
            }
            const pYear = parseInt(pYrVal), pMonth = parseInt(pMoVal), pDay = parseInt(pDaVal);
            const genderCal = document.getElementById('partner-gender-cal').value.split('_');
            const pGender = genderCal[0], pIsLunar = (genderCal[1] === 'lunar');

            const partnerSaju = calculateManseoryeok(pYear, pMonth, pDay, pIsLunar, false, 12, true);
            const aGanIdx = CURRENT_SAJU.il.ganIdx, aJiIdx = CURRENT_SAJU.il.jiIdx, bGanIdx = partnerSaju.il.ganIdx, bJiIdx = partnerSaju.il.jiIdx;
            const aGan = CHEONGAN[aGanIdx], aJi = JIJI[aJiIdx], bGan = CHEONGAN[bGanIdx], bJi = JIJI[bJiIdx];

            let score = 75, strengths = [], tips = [];
            const ganBadge = document.getElementById('gunghap-gan-badge'); if (ganBadge) ganBadge.textContent = `${aGan.name}(${aGan.oheng}) vs ${bGan.name}(${bGan.oheng})`;
            let ganDesc = '';
            if (Math.abs(aGanIdx - bGanIdx) === 5) { score += 15; ganDesc = `두 사람의 일간이 <strong>천간합(${aGan.name}${bGan.name}합)</strong>으로 묶이는, 손에 꼽는 인연의 짝입니다. 처음 본 순간부터 자석처럼 끌리고, 상대의 빈 곳을 흉이 아니라 채워 줄 자리로 여기게 됩니다.`; strengths.push('천간합 덕분에 삶의 방향과 꿈꾸는 그림이 놀랄 만큼 닮아 있음'); }
            else if (aGan.oheng === bGan.oheng) { score += 5; ganDesc = `오행이 같은 <strong>비화(比和)</strong>의 짝이라, 오랜 벗처럼 스스럼없고 서로를 잘 알아봅니다.`; strengths.push('말이 잘 통하고 노는 물이 비슷해 함께 있으면 시간이 짧게 느껴짐'); tips.push('닮은 만큼 고집도 닮았으니, 기 싸움이 붙으면 먼저 웃어 주는 쪽이 이기는 관계'); }
            else if (OHENG_MAP[aGan.oheng].생 === bGan.oheng) { score += 10; ganDesc = `본인(A)의 기운이 상대(B)를 살리는 상생의 구도라, 아낌없이 주면서도 흐뭇한 다정한 관계입니다.`; strengths.push('상대를 살뜰히 보살피는 데서 기쁨을 느끼는 애정 구도'); }
            else if (OHENG_MAP[bGan.oheng].생 === aGan.oheng) { score += 10; ganDesc = `상대(B)의 기운이 본인(A)을 북돋아 주는 짜임새라, 곁에 있는 것만으로 힘이 되는 복된 궁합입니다.`; strengths.push('상대 곁에 있으면 마음이 놓이고 든든한 뒷배가 되어 줌'); }
            else { score -= 5; ganDesc = `오행이 서로를 누르는 상극의 짝이라 팽팽한 순간도 있지만, 그 다름이 오히려 서로를 깨우는 신선한 자극이 됩니다.`; tips.push('바른말도 포장해서 건네는 화법이 이 관계의 윤활유'); }
            const ganDescEl = document.getElementById('gunghap-gan-desc'); if (ganDescEl) ganDescEl.innerHTML = ganDesc;

            const jiBadge = document.getElementById('gunghap-ji-badge'); if (jiBadge) jiBadge.textContent = `${aJi.name}(${aJi.animal}) vs ${bJi.name}(${bJi.animal})`;
            let jiDesc = '';
            const jiHabPairs = { 0:1, 1:0, 2:11, 11:2, 3:10, 10:3, 4:9, 9:4, 5:8, 8:5, 6:7, 7:6 };
            if (jiHabPairs[aJiIdx] === bJiIdx) { score += 15; jiDesc = `일지가 <strong>육합(${aJi.name}${bJi.name}합)</strong>으로 얽혀 살을 맞대고 사는 정이 유난히 깊은 짝입니다. 흰머리가 되도록 함께 걷는 상급 궁합으로 꼽힙니다.`; strengths.push('일지 육합 덕에 살림 감각과 생활 리듬이 착착 맞아떨어짐'); }
            else if (Math.abs(aJiIdx - bJiIdx) === 6) { score -= 10; jiDesc = `일지 상충(${aJi.name}${bJi.name}충)이 걸려 있어 사는 방식과 성미의 결이 다를 수 있습니다. 다만 서로의 영역에 울타리를 쳐 주면 오히려 오래갑니다.`; tips.push('잔소리 반 스푼 줄이고, 각자의 시간을 선물처럼 여겨 줄 것'); }
            else { score += 5; jiDesc = `두 사람의 배우자궁이 모나지 않게 어우러져, 큰 파도 없이 잔잔한 믿음이 오래 이어지는 짝입니다.`; strengths.push('요란하지 않지만 해가 갈수록 두터워지는 믿음'); }
            const jiDescEl = document.getElementById('gunghap-ji-desc'); if (jiDescEl) jiDescEl.innerHTML = jiDesc;
            const yongDescEl = document.getElementById('gunghap-yong-desc'); if (yongDescEl) yongDescEl.innerHTML = `본인(A)에게 모자란 기운을 상대(B)의 원국이 메워 주는 <strong>퍼즐 같은 보완 구조</strong>여서, 함께하는 세월이 길어질수록 살림과 이름이 함께 자라는 시너지형 궁합입니다.`;

            if (score > 100) score = 98; if (score < 60) score = 65;
            const scoreNumEl = document.getElementById('gunghap-score-num'); if (scoreNumEl) scoreNumEl.textContent = `${score}점 / 100점`;
            let stars = '⭐⭐⭐⭐ (귀하게 여겨야 할 좋은 짝)'; if (score >= 90) stars = '⭐⭐⭐⭐⭐ (붉은 실로 이어진 하늘의 짝)'; else if (score <= 75) stars = '⭐⭐⭐ (다듬을수록 빛나는 원석 같은 짝)';
            const scoreStarsEl = document.getElementById('gunghap-score-stars'); if (scoreStarsEl) scoreStarsEl.textContent = stars;
            const summaryDescEl = document.getElementById('gunghap-summary-desc'); if (summaryDescEl) summaryDescEl.textContent = `${CURRENT_SAJU.il.name} 일주 본인과 ${partnerSaju.il.name} 일주 상대방은 감춰진 가능성을 서로 꺼내 주고, 거센 물결도 노를 나눠 저으며 건너갈 귀한 인연으로 읽힙니다. 궁합 점수는 정해진 결말이 아니라 두 사람이 출발하는 지점의 지형도입니다. 점수가 높다면 타고난 순풍을 감사히 쓰시고, 아쉬운 부분이 보였다면 그것은 "이 지점만 서로 조심하면 된다"는 친절한 이정표로 읽으시면 됩니다. 위의 강점은 자주 꺼내 쓰고, 조언은 다툼이 일어나기 전에 미리 나눠 읽어 두는 것, 그것이 궁합 풀이를 백 배로 쓰는 방법입니다. 궁합 점수는 두 원국의 합과 충을 셈한 출발선일 뿐, 인연의 완성도는 결국 서로를 알아 가려는 두 사람의 마음이 결정합니다. 점수가 높다면 타고난 순풍을 감사히 누리시고, 아쉽다면 위의 조언 항목을 두 사람의 대화 주제로 삼아 보세요. 그것이 궁합을 보는 진짜 쓸모입니다.`;

            const strUl = document.getElementById('gunghap-strengths-list'); if (strUl) { strUl.innerHTML = ''; strengths.forEach(s => strUl.innerHTML += `<li>${s}</li>`); }
            const tipUl = document.getElementById('gunghap-tips-list'); if (tipUl) { tipUl.innerHTML = ''; if (tips.length === 0) tips.push('고맙다는 말을 아끼지 않는 것, 그 한마디가 이 인연을 곱절로 깊게 만드는 비결입니다.'); tips.forEach(t => tipUl.innerHTML += `<li>${t}</li>`); }
            const resBox = document.getElementById('gunghap-result-box'); if (resBox) { resBox.classList.remove('hidden'); resBox.scrollIntoView({ behavior: 'smooth' }); }
        }
        // ==========================================
        // ⭐ v6.0 누락 없는 11개 기존 필수 연산 함수 복원 및 탑재 완료
        // ==========================================

        function renderHealthMastery(saju, ilGan) {
            const hMap = {
                '목': { title: '간(肝)·담(膽) 계열 목(木) 체질 · 해독 순환 타입', weak: '피로가 잘 풀리지 않고 눈이 뻑뻑하며, 근육이 굳거나 긴장성 두통이 오기 쉬운 편', food: '매실·모과처럼 신맛 나는 식품과 푸른 잎채소가 이롭고, 걷기나 가벼운 달리기로 하체를 자주 풀어 주세요' },
                '화': { title: '심장(心)·소장(小腸) 계열 화(火) 체질 · 열 조절 타입', weak: '가슴이 잘 두근거리고 잠들기 어려우며, 얼굴에 열이 오르는 등 순환기 부담이 쌓이기 쉬운 편', food: '녹차·여주·팥·연근처럼 은은한 쓴맛 식품이 열을 내려 주며, 잠들기 전 호흡을 고르는 명상이 잘 맞습니다' },
                '토': { title: '비장(脾)·위장(胃) 계열 토(土) 체질 · 소화 대사 타입', weak: '속이 더부룩해지기 쉽고 복부에 살이 붙기 쉬우며, 몸이 쉽게 처지는 편', food: '단호박·마·고구마·찹쌀 같은 순한 단맛 식품과 생강차가 이롭고, 식사 후에는 꼭 가볍게 걸어 주세요' },
                '금': { title: '폐(肺)·대장(大腸) 계열 금(金) 체질 · 호흡 피부 타입', weak: '코와 기관지가 예민하고 피부가 건조해지기 쉬우며, 장 트러블이 잦은 편', food: '도라지·배·무·율무와 따뜻한 꿀물이 잘 맞고, 실내가 마르지 않게 하며 배로 깊게 숨 쉬는 습관을 들여 보세요' },
                '수': { title: '신장(腎)·방광(膀胱) 계열 수(水) 체질 · 수분 대사 타입', weak: '몸이 잘 붓고 허리가 무거우며, 피로가 오래 가고 비뇨기 계통이 약해지기 쉬운 편', food: '검은콩·검은깨·미역 같은 검은빛 식품이 이롭고, 따뜻한 물을 조금씩 자주 마시는 습관이 좋습니다' }
            }[ilGan.oheng] || { title: '오행 중화 건강 체질', weak: '스트레스성 밸런스 유지 필요', food: '골고루 담은 잡곡 위주 식단과 꾸준한 유산소 운동이 두루 이롭습니다' };

            document.getElementById('health-type-title').textContent = hMap.title;
            document.getElementById('health-type-desc').textContent = `전통 한의학의 오행 체질론을 바탕으로, 당신의 일간 오행에 대응하는 장부 계통을 짚어 본 결과입니다. 오행 체질론에서는 타고난 기운이 강한 장부는 과로로 지치기 쉽고, 약한 장부는 평소 티가 나지 않다가 큰 피로가 겹칠 때 먼저 신호를 보낸다고 봅니다. 자신의 관리 포인트를 미리 알아 두면 같은 생활을 해도 컨디션의 낙폭이 눈에 띄게 줄어듭니다. 아래 내용은 참고용 전통 이론이며, 실제 증상이 있을 때는 반드시 의료 전문가와 상담하세요.`;
            document.getElementById('health-weak-desc').textContent = hMap.weak;
            document.getElementById('health-food-desc').textContent = hMap.food;
        }

        function analyzeDream(cat) {
            const dMap = {
                'pig': { title: '🐷 돼지를 안아 들거나 황금빛 배설물을 밟는 꿈', lotto: '재물운 신호 강도: 최상급 길몽', desc: '예로부터 재물이 굴러들어올 때 꾼다고 전해지는 대표 길몽입니다. 뜻밖의 목돈이나 굵직한 계약 소식이 가까이 와 있다는 신호로 풀이됩니다.' },
                'fire': { title: '🔥 집이 활활 타오르거나 용의 등에 올라 하늘로 솟는 꿈', lotto: '재물운 신호 강도: 상급 길몽 (명예 상승)', desc: '집을 태우는 불과 승천하는 용은 모두 세력이 커지는 것을 상징합니다. 지위가 오르거나 하는 일의 판이 한 단계 커질 조짐으로 풀이됩니다.' },
                'water': { title: '🌊 맑은 물이 차오르거나 하늘을 편안히 나는 꿈', lotto: '재물운 신호 강도: 상급 길몽 (순조로움)', desc: '맑고 풍부한 물은 순탄한 흐름을, 편안한 비행은 장애물이 걷힘을 상징합니다. 오래 묶여 있던 일이 술술 풀려나갈 조짐입니다.' },
                'snake': { title: '🐍 탐스러운 과일을 따거나 호랑이·큰 뱀이 집에 드는 꿈', lotto: '재물운 신호 강도: 상급 길몽 (인연·태몽)', desc: '과일과 영물이 품에 드는 꿈은 귀한 인연이 다가옴을 뜻합니다. 태몽으로 보기도 하고, 나를 끌어줄 든든한 조력자의 등장으로도 풀이합니다.' },
                'teeth': { title: '🦷 이가 빠지거나 높은 곳에서 떨어지는 꿈', lotto: '재물운 신호 강도: 주의 필요 (경계몽)', desc: '전통 해몽에서는 몸과 주변을 한 번 돌아보라는 경계의 신호로 읽습니다. 며칠간은 중요한 결정과 계약을 서두르지 말고, 건강과 안전을 먼저 챙겨 보세요.' }
            }[cat];

            document.getElementById('dream-title').textContent = dMap.title;
            document.getElementById('dream-lotto').textContent = dMap.lotto;
            document.getElementById('dream-desc').textContent = dMap.desc;
        }

        function renderPungsuMastery(ilGan) {
            document.getElementById('pungsu-door-desc').textContent = `현관은 바깥의 기운이 집으로 드는 첫 관문입니다. 문 정면의 큰 거울은 들어오던 기운을 되돌려 보내니 옆 벽으로 옮기고, 노르스름한 조명과 해바라기 그림처럼 밝은 기물로 맞이하면 드는 복이 한결 넉넉해집니다. 신발이 어지럽게 쌓여 있으면 드는 기운이 문턱에서 엉키니 신발장 정리가 곧 첫 번째 개운입니다. 계절이 지난 우산이나 택배 상자를 현관에 쌓아 두는 습관도 재물길을 막는 대표적인 사례이니, 현관은 "우리 집의 첫인상"이라 생각하고 늘 훤하게 비워 두세요.`;
            document.getElementById('pungsu-bed-desc').textContent = `침실은 하루의 기운을 다시 채우는 방입니다. 머리맡을 나의 용신 방위(${ilGan.oheng==='목'?'동쪽':ilGan.oheng==='화'?'남쪽':ilGan.oheng==='금'?'서쪽':'북쪽'}) 쪽으로 돌리고 머리맡의 전자기기를 치우면, 잠든 사이 몸의 기운이 절로 고르게 회복됩니다. 침대 위치는 문을 열었을 때 발끝이 문과 일직선이 되는 자리를 피하는 것이 오랜 원칙이고, 머리맡 충전기와 스마트폰은 손이 닿지 않는 협탁 너머로 옮기는 것만으로 수면의 질이 눈에 띄게 달라집니다. 침구는 원국에 이로운 색을 포인트로 쓰되, 전체는 차분한 무채색으로 두어야 기운이 요동치지 않습니다.`;
            document.getElementById('pungsu-desk-desc').textContent = `앉은 자리 등 뒤로는 벽이 산처럼 버텨 주어야 하고(배산임수), 방문이 비스듬히 시야에 들어오는 자리가 마음을 붙들고 위엄을 세워 주는 으뜸의 자리입니다. 등 뒤가 창문이나 통로라면 기운이 흩어지고 집중이 무너지기 쉬우니, 자리를 옮길 수 없다면 등받이 높은 의자나 파티션으로 뒤를 받쳐 주는 것이 차선책입니다. 책상 위는 왼쪽에 자주 쓰는 것, 오른쪽에 서류를 두는 좌실우문(左實右文)의 배치가 일의 흐름을 매끄럽게 하고, 시든 화분과 고장 난 물건은 그날그날 치우는 것이 승진운을 지키는 작은 습관입니다.`;
        }

        function renderSamjaeMastery(saju) {
            // 인·오·술(호랑이,말,개) -> 신·유·술년 삼재 / 신·자·진(원숭이,쥐,용) -> 인·묘·진년 삼재
            // 사·유·축(뱀,닭,소) -> 해·자·축년 삼재 / 해·묘·미(돼지,토끼,양) -> 사·오·미년 삼재
            const jiIdx = saju.nyeon.jiIdx;
            let status = '2026년 병오년 삼재 비해당 (평온한 상생 시운)';
            let desc = `당신의 띠(${JIJI[jiIdx].animal}띠)에게 2026년 병오년은 삼재가 걸리지 않는 해입니다. 세워 둔 계획대로 발걸음을 옮겨도 크게 발목 잡힐 일이 없는 흐름입니다.`;
            
            if ([11, 3, 7].includes(jiIdx)) {
                status = '⚠️ 2026년 병오년 [눌삼재(2년차)] 해당!';
                desc = `당신의 띠(${JIJI[jiIdx].animal}띠)는 2026년 말의 해에 삼재의 한가운데인 눌삼재를 지나는 중입니다. 새 판을 벌이기보다, 가진 것의 담장을 손보며 안을 다지는 것이 이 구간의 지혜입니다.`;
            } else if ([2, 6, 10].includes(jiIdx)) {
                status = '2028년 무신년부터 들삼재가 시작될 예정';
                desc = `지금은 삼재 바깥에 있고, 2028년 원숭이 해가 되어야 들삼재가 시작됩니다. 그전인 올해와 내년이야말로 마음껏 뛰어올라 곳간을 채워 둘 적기입니다.`;
            }

            document.getElementById('samjae-status-title').textContent = status;
            document.getElementById('samjae-status-desc').textContent = desc;
            document.getElementById('samjae-cure-desc').textContent = `삼재를 무턱대고 두려워할 일은 아닙니다. 본디 인생의 방향이 크게 꺾이는 굽잇길일 뿐이어서, 몸을 낮추고 곁을 돌보며 지나면 오히려 복을 실어 오는 복삼재(福三災)로 얼굴을 바꿉니다. 옛사람들이 삼재 기간에 권한 것은 세 가지였습니다. 첫째, 큰 계약과 큰 이동은 두 번 더 살펴보기. 둘째, 몸의 신호를 무시하지 않고 검진 챙기기. 셋째, 형편 닿는 만큼 남에게 베풀기. 이 셋은 미신이라기보다 변화의 시기를 안전하게 건너는 생활의 지혜에 가깝습니다. 삼재를 "조심 알림이 켜진 3년"으로 받아들이면, 같은 기간이 오히려 내실을 다지는 황금기가 됩니다.`;
        }

        function renderCareerMastery(saju, ilGan, wolJi) {
            const cSipsin = getJiSipsin(saju.il.ganIdx, saju.wol.jiIdx);
            document.getElementById('career-pass-desc').innerHTML = `2026년 합격·승진 지수 <strong class="text-emerald-300">89% (대길)</strong>. 올해 병오년의 뜨거운 화(火) 기운이 당신의 일간 ${ilGan.name}(${ilGan.oheng})에 관인상생의 다리를 놓아 줍니다. 관인상생이란 명예의 별(관성)이 학문의 별(인성)을 살리고, 인성이 다시 나를 북돋는 가장 이상적인 출세 구조를 말합니다. 시험장에서는 공부한 만큼이 아니라 그 이상이 답안지에 실리고, 인사철에는 평소 지켜보던 윗사람의 눈에 당신의 이름이 먼저 들어옵니다. 특히 상반기보다 <strong>불 기운이 무르익는 5~9월</strong>이 면접·발표·승진 심사의 결정적 승부처이니, 이 시기에 맞춰 준비의 정점을 끌어올리는 전략이 유효합니다. 다만 열기가 강한 해인 만큼 마지막 단계에서 서두르다 서류의 사소한 실수가 나기 쉬우니, 제출 전 한 번 더 검토하는 습관이 89%를 100%로 만드는 마지막 열쇠입니다.`;
            document.getElementById('career-org-desc').innerHTML = `당신의 월지는 <strong class="text-amber-300">${cSipsin}</strong>의 환경입니다. 월지는 사회생활의 무대이자 일하는 방식의 밑그림을 보여 주는 자리인데, 이 짜임새로 보면 당신은 위에서 시키는 대로만 움직이는 자리보다 <strong>스스로 판단할 여지가 있는 자리</strong>에서 몇 배의 성과를 냅니다. 구체적으로는 재량권이 주어지는 대기업의 태스크포스나 신사업 조직, 자격과 실력이 곧 발언권이 되는 전문직 집단, 연차보다 성과로 평가하는 외국계·스타트업 계열이 좋은 무대입니다. 반대로 결재 단계가 많고 전례를 중시하는 경직된 조직에서는 답답함이 쌓여 재능의 절반도 꺼내기 어려우니, 이직을 고민할 때는 연봉 숫자보다 <strong>'내 판단이 통하는 조직인가'</strong>를 첫 번째 저울로 삼으시길 권합니다.`;
            document.getElementById('career-jobs-desc').innerHTML = `일간 ${ilGan.name}(${ilGan.oheng}) 기운과 월지 ${cSipsin} 환경을 함께 놓고 고른 열 갈래입니다. <strong>① IT 서비스 기획 ② 자산 운용·금융 분석 ③ 전문 컨설팅 ④ 국제 무역·유통 ⑤ 브랜드 디렉팅 ⑥ 심리 상담 ⑦ 강의·교육 콘텐츠 ⑧ 프리미엄 세일즈 ⑨ 경영 전략 ⑩ 부동산 개발 기획.</strong> 공통점은 모두 '사람을 읽는 눈'과 '판을 설계하는 머리'가 무기가 되는 일이라는 것입니다. 지금 하는 일이 이 목록에 없다고 조급해할 필요는 없습니다. 현재 업무 안에서도 기획·분석·사람 상대의 비중을 조금씩 늘려 가면, 그것이 곧 천직의 방향으로 배를 돌리는 일이 됩니다.`;
        }

        function renderLuckyNumMastery(ilGan) {
            const numMap = {
                '목': ['3838', '1388', '8383', '3388', '8833', '1138', '3811', '8311', '3088', '8033'],
                '화': ['2727', '3277', '7272', '2277', '7722', '3722', '2733', '7233', '2077', '7022'],
                '토': ['5050', '2500', '0505', '5500', '0055', '2750', '5027', '0527', '5577', '0022'],
                '금': ['4949', '5499', '9494', '4499', '9944', '5944', '4955', '9455', '4099', '9044'],
                '수': ['1616', '4166', '6161', '1166', '6611', '4611', '1644', '6144', '1066', '6011']
            }[ilGan.oheng] || ['7788', '1234', '5678', '8899', '3344', '1122', '9900', '5566', '7700', '8811'];

            const nGrid = document.getElementById('luckynum-grid'); nGrid.innerHTML = '';
            numMap.forEach(num => {
                nGrid.innerHTML += `<div class="p-2.5 rounded-xl bg-mystic-900 border border-emerald-500/40 text-center"><div class="text-base font-serif-kr font-bold text-emerald-300">${num}</div><div class="text-[10px] text-gray-400 mt-0.5">${ilGan.oheng} 기운 상생</div></div>`;
            });
        }

        function analyzeMyNumber() {
            const val = document.getElementById('my-number-input').value.trim();
            if (val.length < 4) { alert('숫자 4자리를 모두 입력해 주세요!'); return; }
            document.getElementById('my-number-result').textContent = `감정 결과: 입력하신 [${val}] 조합을 원국의 기운에 비추어 본 결과, 흐름을 거스르지 않는 길수(88점)로 나왔습니다. 숫자에도 오행이 깃든다고 보는 것이 전통 수리론의 관점인데, 이 조합은 당신의 일간을 거스르는 극(剋)의 숫자가 없이 순한 흐름으로 이어져 있습니다. 전화번호나 차량번호처럼 매일 부르고 쓰는 숫자는 그 자체로 작은 주문과 같아서, 돈복과 사람복을 함께 끌어당기는 쓸 만한 번호로 오래 쓰셔도 좋겠습니다!`;
        }

        function renderPetMastery(saju, ilJi) {
            document.getElementById('pet-match-desc').textContent = `주인의 배우자 자리인 일지(${ilJi.animal})와 삼합/육합을 이루는 [${ilJi.animal==='용'?'쥐·원숭이·닭':ilJi.animal==='말'?'호랑이·개·양':'강아지·고양이'}] 계열의 아이와 마음의 결이 잘 맞습니다. 예로부터 합이 맞는 반려동물은 집안의 궂은 기운을 제 몸으로 받아 내고, 그 자리에 웃음을 놓고 간다고 여겨 왔습니다. 궁합이 잘 맞는 아이는 주인의 기운이 가라앉은 날 유난히 곁을 파고드는데, 그 온기가 실제로 마음의 회복을 앞당깁니다. 이미 함께 사는 아이가 목록의 띠와 다르더라도 걱정하실 필요는 없습니다. 정성으로 맺은 인연은 사주의 합을 넘어서는 가장 강한 합이라는 것이 명리의 오랜 결론입니다.`;
            document.getElementById('pet-naming-desc').textContent = `이름에는 부르는 사람의 기운이 담깁니다. 해피·럭키·코코·콩이·보리·둥이·마루·사랑이처럼 소리가 밝고 온기가 도는 두 글자 이름을 불러 주면, 그 기운이 집안의 재물 흐름까지 부드럽게 데워 줍니다.`;
        }

        function renderPastlifeMastery(saju, ilJi) {
            document.getElementById('pastlife-title').textContent = `책과 붓을 벗 삼아 도리를 궁구하던 선비·수행자의 혼`;
            document.getElementById('pastlife-desc').textContent = `원국 곳곳에 지난 생에서 글을 닦고 깨달음을 나누던 이의 기운이 배어 있는 것으로 읽힙니다. 이번 생에 주어진 과제는 하나입니다. 타고난 총기와 재주를 나 하나 배 불리는 데 가두지 말고 세상으로 흘려보내는 것. 그 물꼬가 트일 때 하는 일마다 순풍이 붙는 큰 복이 따라옵니다.`;
        }

        // ==========================================
        // 성명학 작명·개명 마스터
        // ==========================================
        function analyzeNaming() {
            if (!CURRENT_SAJU) return;
            const sung = escapeHtml(document.getElementById('name-sung').value || '김'), given = escapeHtml(document.getElementById('name-given').value || '지훈'), fullName = `${sung}${given}`;
            const getSoundOheng = (char) => {
                const code = char.charCodeAt(0) - 44032; if (code < 0 || code > 11171) return '금';
                const choIdx = Math.floor(code / 588);
                if ([0, 15].includes(choIdx)) return '목'; if ([2, 3, 5, 16].includes(choIdx)) return '화'; if ([11, 18].includes(choIdx)) return '토'; if ([7, 9, 12, 13, 14].includes(choIdx)) return '금'; return '수';
            };
            const ohengs = fullName.split('').map(getSoundOheng), yongOhengStr = document.getElementById('yongsin-oheng').textContent;
            let score = 88; if (yongOhengStr.includes(ohengs[1]) || yongOhengStr.includes(ohengs[2])) score += 8; else score += 3;
            document.getElementById('naming-score-num').textContent = `${score}점 / 100점`;
            document.getElementById('naming-score-stars').textContent = score >= 90 ? '⭐⭐⭐⭐⭐ (원국의 빈 기운을 채워 주는 길한 이름)' : '⭐⭐⭐⭐ (소리의 오행이 순하게 흐르는 이름)';
            document.getElementById('naming-summary-desc').textContent = `입력하신 성함 [${fullName}]을 소리 나는 대로 오행에 얹어 보면(${ohengs.join(' → ')}) 글자와 글자가 서로를 살리는 상생의 물길을 이루고, 원국에 필요한 용신의 기운까지 끌어와 주는 좋은 이름입니다.`;
            document.getElementById('naming-sound-analysis').innerHTML = `<p>· <strong>초성 발음 오행</strong>: ${fullName.split('').map((c, i) => `${c}(${ohengs[i]})`).join(' → ')} 순서로 기운이 순하게 흐름</p><p>· <strong>사주 용신 조화도</strong>: 원국에 모자란 오행을 이름의 소리가 메워 주니, 불러 줄수록 사람복이 붙는 구조입니다.</p>`;
            document.getElementById('naming-advice-desc').innerHTML = `<p>· <strong>작명 및 개운 팁</strong>: 호적에 올릴 한자를 고르실 때 아래의 <strong>[사주 맞춤 용신 한자]</strong> 가운데에서 뜻과 획수를 살펴 정하시면, 소리와 글자가 모두 원국을 돕는 온전한 이름이 완성됩니다.</p>`;

            const hanjaGrid = document.getElementById('naming-hanja-grid'); hanjaGrid.innerHTML = '';
            const yongKey = yongOhengStr.includes('목') ? '목' : yongOhengStr.includes('화') ? '화' : yongOhengStr.includes('토') ? '토' : yongOhengStr.includes('금') ? '금' : '수';
            document.getElementById('naming-yongsin-label').textContent = `${yongKey} 기운`;
            const hanjaPool = {
                '목': [{ h: '根', k: '근(뿌리)' }, { h: '林', k: '림(수풀)' }, { h: '榮', k: '영(영화)' }, { h: '彬', k: '빈(빛날)' }, { h: '杰', k: '걸(뛰어날)' }, { h: '棟', k: '동(마루)' }, { h: '森', k: '삼(나무)' }, { h: '楨', k: '정(기둥)' }, { h: '桂', k: '계(계수)' }, { h: '權', k: '권(권세)' }, { h: '相', k: '상(도울)' }, { h: '松', k: '송(소나무)' }, { h: '栢', k: '백(잣나무)' }, { h: '梓', k: '재(가래)' }, { h: '槿', k: '근(무궁화)' }],
                '화': [{ h: '䏚', k: '도(빛날)' }, { h: '炫', k: '현(밝을)' }, { h: '昭', k: '소(밝을)' }, { h: '旼', k: '민(온화할)' }, { h: '昱', k: '욱(빛날)' }, { h: '㬚', k: '철(밝을)' }, { h: '暎', k: '영(비칠)' }, { h: '煥', k: '환(불꽃)' }, { h: '燁', k: '엽(빛날)' }, { h: '熹', k: '희(빛날)' }, { h: '熺', k: '희(성할)' }, { h: '昇', k: '승(오를)' }, { h: '晳', k: '석(밝을)' }, { h: '景', k: '경(볕)' }, { h: '晶', k: '경(밝을)' }],
                '토': [{ h: '圭', k: '규(서옥)' }, { h: '均', k: '균(고를)' }, { h: '堅', k: '견(굳을)' }, { h: '坤', k: '곤(땅)' }, { h: '垣', k: '원(담)' }, { h: '城', k: '성(재)' }, { h: '基', k: '기(터)' }, { h: '培', k: '배(북돋울)' }, { h: '載', k: '재(실을)' }, { h: '聖', k: '성(성인)' }, { h: '埈', k: '준(높을)' }, { h: '在', k: '재(있을)' }, { h: '垠', k: '은(언덕)' }, { h: '塏', k: '개(높을)' }, { h: '墸', k: '저(쌓을)' }],
                '금': [{ h: '鐘', k: '종(쇠종)' }, { h: '鉉', k: '현(솥귀)' }, { h: '鈞', k: '균(주석)' }, { h: '銳', k: '예(날카로울)' }, { h: '鎭', k: '진(진압할)' }, { h: '鎔', k: '용(녹일)' }, { h: '錫', k: '석(주석)' }, { h: '錦', k: '금(비단)' }, { h: '鍊', k: '련(단련할)' }, { h: '鍈', k: '영(방울)' }, { h: '鎰', k: '일(쇠)' }, { h: '鏡', k: '경(거울)' }, { h: '成', k: '성(이룰)' }, { h: '星', k: '성(별)' }, { h: '誠', k: '성(성실)' }],
                '수': [{ h: '浩', k: '호(넓을)' }, { h: '澔', k: '호(클)' }, { h: '淳', k: '준(순할)' }, { h: '源', k: '원(근원)' }, { h: '準', k: '준(법도)' }, { h: '瀚', k: '한(넓을)' }, { h: '澤', k: '택(못)' }, { h: '潤', k: '윤(윤택)' }, { h: '澄', k: '징(맑을)' }, { h: '澈', k: '철(맑을)' }, { h: '淵', k: '연(못)' }, { h: '鴻', k: '홍(클)' }, { h: '泓', k: '홍(깊을)' }, { h: '洛', k: '락(강물)' }, { h: '洙', k: '수(물가)' }]
            };
            (hanjaPool[yongKey] || hanjaPool['목']).forEach(item => { hanjaGrid.innerHTML += `<div class="p-2.5 rounded-xl bg-mystic-900 border border-cyan-500/40 text-center"><div class="text-xl font-serif-kr font-bold text-cyan-300">${item.h}</div><div class="text-xs text-gray-300 mt-0.5">${item.k}</div></div>`; });
            document.getElementById('naming-result-box').classList.remove('hidden');
        }

        // ==========================================
        // 배우자상 상세 프로필 & 적령기
        // ==========================================
        function renderSpouseProfile(saju, ilGan, ilJi) {
            const jiSipsin = getJiSipsin(saju.il.ganIdx, saju.il.jiIdx);
            let ageLook = '동갑이나 1~3살 차이 / 단정함', lookDesc = `배우자 자리인 일지(${ilJi.name})의 기운이 차분히 자리 잡아, 부드러운 인상에 속이 깊은 짝과 연이 닿습니다. 겉으로 요란하게 다가오는 인연보다 어느새 곁에 스며들어 있는 인연이 진짜일 확률이 높은 구조입니다. 소개팅 한 번의 첫인상으로 판단을 끝내지 말고 두세 번은 만나 보세요. 이 배우자궁은 볼수록 좋아지는 사람과 맺어지는 자리입니다.`, job = '공직, 교육, 관리직', jobDesc = `맡은 바를 끝까지 해내는, 직업이 반듯한 짝을 만나게 됩니다. 배우자궁에 든 관성의 기운은 공직·대기업·전문직처럼 이름 앞에 소속이 붙는 직업군과의 인연을 강하게 암시합니다. 화려함보다 묵직함으로 다가오는 사람이니, 첫인상이 심심하다고 흘려보내지 마세요. 오래 볼수록 진가가 드러나는 유형입니다.`;
            if (jiSipsin.includes('상') || jiSipsin.includes('식')) { ageLook = '연하 또는 감각적인 동갑 / 미남미녀'; lookDesc = `말과 표정이 살아 있고 꾸밈새의 감각이 남다른 짝을 맞이합니다. 배우자궁의 식상 기운은 표현하고 만들어 내는 사람, 곧 말·음식·예술·콘텐츠를 다루는 이와의 인연을 가리킵니다. 함께 있으면 웃을 일이 많은 관계가 되지만, 상대의 자유로운 기질을 틀에 가두려 하면 어긋나기 쉬우니 응원하는 자세가 이 인연을 오래 지키는 비결입니다.`; job = '방송/연예, 디자인, IT'; }
            else if (jiSipsin.includes('재')) { ageLook = '능력 있는 동갑/연하 / 활력 넘침'; lookDesc = `살림 수완이 야무지고 어디서든 사람을 얻는 실속 있는 짝과 연분이 깊습니다. 배우자궁의 재성 기운은 경제 감각이 밝고 현실의 무게를 아는 사람과의 만남을 뜻합니다. 함께라면 살림이 불어나는 재미가 있는 조합이지만, 돈 문제만큼은 처음부터 투명하게 터놓는 것이 이 인연의 신뢰를 지키는 첫 단추입니다.`; job = '금융, 무역, 사업 경영'; }
            else if (jiSipsin.includes('관')) { ageLook = '듬직한 연상/성숙한 동갑 / 위엄'; lookDesc = `기대어 쉴 수 있고 우러러볼 구석이 있는, 중심이 굳은 짝을 만납니다. 배우자궁의 인성 기운은 지혜롭고 어른스러운 사람, 나이나 정신적 성숙도에서 나를 이끌어 주는 이와의 인연을 가리킵니다. 위기 때 함께 흔들리는 것이 아니라 나를 붙들어 주는 닻 같은 존재이니, 연애의 설렘 지수보다 대화의 깊이로 상대를 가늠해 보세요.`; job = '공직, 법조, 전문직, CEO'; }
            document.getElementById('spouse-age-look').textContent = ageLook; document.getElementById('spouse-look-desc').textContent = lookDesc; document.getElementById('spouse-job').textContent = job; document.getElementById('spouse-job-desc').textContent = jobDesc;
            document.getElementById('spouse-timing').textContent = `만 ${saju.gender === 'M' ? '30~34' : '29~33'}세 구간`; document.getElementById('spouse-timing-desc').textContent = `배우자의 별이 들어오거나 일지에 육합이 걸리는 해가 혼담을 매듭짓기 좋은 때입니다. 명리에서 결혼 시기는 "인연이 없던 사람이 생기는 때"라기보다 "곁에 있던 인연이 무르익는 때"로 봅니다. 그러니 좋은 시기가 왔을 때 주저하지 않도록, 평소 자신이 어떤 동반자와 어떤 가정을 원하는지 미리 그려 두는 것이 그 운을 놓치지 않는 실전 준비입니다.`;
            document.getElementById('spouse-prob').textContent = `올해 2026년 만남 확률 92%`; document.getElementById('spouse-prob-desc').textContent = `병오년의 뜨거운 기운이 당신의 원국과 어울려, 마음을 움직이는 인연이 성큼 다가서는 해입니다. 확률이 높다는 것은 가만히 있어도 이루어진다는 뜻이 아니라, 같은 노력에 몇 배의 결실이 붙는 해라는 뜻입니다. 소개팅·모임·동호회처럼 사람이 모이는 자리에 평소보다 한 걸음만 더 나가 보세요. 올해의 운은 움직이는 사람의 편입니다.`;
        }

        // ==========================================
        // 자녀복 & 자녀 사주 미리보기
        // ==========================================
        function renderChildMastery(saju, ilGan, ilJi) {
            let bTitle = '부모 품을 밝히며 귀하게 크는 아이의 복', bDesc = `자녀 자리가 튼실해 아이가 부모의 마음을 잘 헤아리며, 자라서는 제 이름으로 우뚝 서는 상입니다.`, talent = `아이는 제 생각이 또렷하고 번뜩이는 발상을 지닌 씨앗을 품고 태어납니다. 어릴 때부터 "왜?"라는 질문이 많고 정해진 답보다 자기만의 답을 찾으려는 기질이 보일 텐데, 이는 고집이 아니라 재능의 싹입니다. 부모가 답을 정해 주기보다 스스로 답에 닿는 길을 지켜봐 줄 때 가장 크게 자라는 아이입니다.`, edu = `고르는 재미를 아이 몫으로 남겨 줄 때, 감춰진 재능이 몇 곱절로 피어납니다. 학원을 하나 정할 때도, 옷 한 벌을 살 때도 두세 가지 선택지 안에서 아이가 최종 결정을 내리게 해 보세요. 작은 선택의 경험이 쌓여 큰 결정을 두려워하지 않는 어른으로 자랍니다. 이 사주의 아이에게 최고의 교육은 정답을 가르치는 것이 아니라 선택하는 근육을 길러 주는 것입니다.`;
            if (saju.si) {
                const siS = getSipsin(saju.il.ganIdx, CHEONGAN[saju.si.ganIdx].oheng, saju.si.ganIdx % 2 === 0);
                if (siS.includes('관')) { bTitle = '반듯한 길에서 이름을 세우는 아이'; bDesc = `시주에 자리한 관성으로 미루어 보면, 아이는 맡은 일의 무게를 아는 성품으로 자라 사람들 앞에 서는 자리로 나아가는 상입니다.`; }
                else if (siS.includes('식') || siS.includes('상')) { bTitle = '끼와 손재주로 제 밥그릇을 빚어내는 아이'; bDesc = `표현하고 만들어 내는 기운이 강해, 예술적 재주와 번뜩이는 발상이 훗날 넉넉한 살림의 밑천이 되는 상입니다.`; }
            }
            document.getElementById('child-bless-title').textContent = bTitle; document.getElementById('child-bless-desc').textContent = bDesc; document.getElementById('child-talent-desc').textContent = talent; document.getElementById('child-edu-desc').textContent = edu;
        }

        // ==========================================
        // 역사 속 위인 비교 & 명언
        // ==========================================
        function renderCelebrityMatch(saju, ilGan, wolJi) {
            const matches = {
                '목': { name: '세종대왕 · 이순신 장군 유형의 곧은 기상 👑', desc: '목(木) 기운이 강한 인물들에게 흔히 이야기되는 상징으로, 흔들림 없는 신념과 어진 마음으로 사람을 살리는 길을 택하는 기질을 뜻합니다.' },
                '화': { name: '개척가 유형의 불꽃 리더십 🔥', desc: '화(火) 기운의 상징은 세상에 없던 길을 먼저 내는 개척자입니다. 안 된다는 말 앞에서 오히려 타오르며 판 자체를 바꿔 버리는 기질을 뜻합니다.' },
                '토': { name: '제갈량 유형의 듬직한 지략가 🏔️', desc: '토(土) 기운의 상징은 대지처럼 사람을 품는 지략가입니다. 갈라진 이들을 한자리에 모으고, 멀리 내다보는 수읽기로 판을 안정시키는 그릇을 뜻합니다.' },
                '금': { name: '승부사 유형의 강철 결단력 ⚔️', desc: '금(金) 기운의 상징은 원칙의 승부사입니다. 한번 세운 기준은 끝까지 지키고, 물러설 수 없는 순간에 가장 단호해지는 기질을 뜻합니다.' },
                '수': { name: '현인 유형의 바다 같은 지혜 🌊', desc: '수(水) 기운의 상징은 깊은 물속을 들여다보는 현인입니다. 겉으로 드러난 것 너머의 흐름을 읽고, 서두르지 않고 때를 기다릴 줄 아는 기질을 뜻합니다.' }
            }[ilGan.oheng] || { name: '세종대왕의 덕망과 성군의 기상 👑', desc: '부드러움과 단단함을 한 몸에 지닌 넉넉한 그릇으로 읽힙니다.' };
            document.getElementById('celeb-match-name').textContent = matches.name; document.getElementById('celeb-match-desc').textContent = matches.desc;
            const qGrid = document.getElementById('celeb-quotes-grid'); qGrid.innerHTML = '';
            [{ q: "사주는 정해진 결말이 아니라 손에 쥔 나침반이다. 방향을 읽는 자만이 바람을 탄다.", a: "명리 잠언" }, { q: "큰 그릇은 시련이라는 가마 속에서 구워진다. 지금의 뜨거움은 완성의 과정이다.", a: "명리 잠언" }, { q: "내 기질을 알면 조급함이 사라지고, 때를 알면 두려움이 사라진다.", a: "명리 잠언" }].forEach(item => {
                qGrid.innerHTML += `<div class="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2"><p class="text-xs sm:text-sm text-gray-200 font-serif-kr italic">"${item.q}"</p><span class="text-[11px] font-bold text-purple-400 block text-right">- ${item.a} -</span></div>`;
            });
        }
    