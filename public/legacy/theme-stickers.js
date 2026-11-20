// ==========================================
// 스티치 칭찬나라 5종 감성 테마 & SVG 벡터 컬렉션 모듈
// ==========================================

(function(global) {
    'use strict';

    const PRAISE_STICKERS = [
        { id: 0, name: "초승달", emoji: "🌙", src: "stickers/moon.png", desc: "은은하고 고요한 달빛 초승달" },
        { id: 1, name: "태양", emoji: "☀️", src: "stickers/sun.png", desc: "세상을 환히 비추는 포근한 태양" },
        { id: 2, name: "가오리", emoji: "🌊", src: "stickers/ray.png", desc: "밤하늘 은하수를 유영하는 하늘가오리" },
        { id: 3, name: "파도", emoji: "🌊", src: "stickers/wave.png", desc: "별빛을 머금은 잔잔한 파도" },
        { id: 4, name: "고래", emoji: "🐋", src: "stickers/whale.png", desc: "꿈과 희망을 품은 밤하늘 고래" }
    ];

    const STICKER_THEMES = {
        moon: {
            id: "moon",
            name: "달빛 친구들 🌙",
            themeColor: "#4A5568",
            desc: "고요하고 은은한 달빛과 밤하늘 테마",
            items: PRAISE_STICKERS
        },
        ocean: {
            id: "ocean",
            name: "푸른 바다 친구들 🌊",
            themeColor: "#0284C7",
            desc: "시원하고 맑은 깊은 바닷속 친구들",
            items: [
                { id: 0, name: "대왕 고래", emoji: "🐋", desc: "시원하게 물뿜는 든든한 대왕고래" },
                { id: 1, name: "아기 돌고래", emoji: "🐬", desc: "경쾌하게 수면 위로 점프하는 돌고래" },
                { id: 2, name: "바다 거북", emoji: "🐢", desc: "느긋하고 행운 가득한 바다거북" },
                { id: 3, name: "반짝 불가사리", emoji: "⭐", desc: "따뜻한 산호빛 코랄 불가사리" },
                { id: 4, name: "영롱 해파리", emoji: "🪼", desc: "신비롭고 우아하게 춤추는 해파리" }
            ]
        },
        forest: {
            id: "forest",
            name: "초록 숲 친구들 🌿",
            themeColor: "#059669",
            desc: "싱그럽고 포근한 자연과 숲속 친구들",
            items: [
                { id: 0, name: "행운 클로버", emoji: "🍀", desc: "행운을 가득 전하는 네잎클로버" },
                { id: 1, name: "도토리 다람쥐", emoji: "🐿️", desc: "도토리를 든 볼빵빵 귀여운 다람쥐" },
                { id: 2, name: "요정 버섯", emoji: "🍄", desc: "동화 속 붉은 땡땡이 요정 버섯" },
                { id: 3, name: "봄빛 튤립", emoji: "🌷", desc: "화사하게 활짝 핀 코랄 핑크 튤립" },
                { id: 4, name: "아기 새싹", emoji: "🌱", desc: "희망차게 돋아난 싱그런 아기 새싹" }
            ]
        },
        star: {
            id: "star",
            name: "우주 별빛 친구들 ✨",
            themeColor: "#7C3AED",
            desc: "반짝이는 별과 신비로운 우주 탐험",
            items: [
                { id: 0, name: "신비 행성", emoji: "🪐", desc: "오로라 고리를 품은 신비로운 토성" },
                { id: 1, name: "황금 유성", emoji: "🌠", desc: "소원을 이루어주는 빛나는 별똥별" },
                { id: 2, name: "탐험 로켓", emoji: "🚀", desc: "꿈을 향해 힘차게 솟구치는 우주선" },
                { id: 3, name: "젤리 우주인", emoji: "👾", desc: "동글동글 귀여운 민트빛 우주 친구" },
                { id: 4, name: "은하수 별", emoji: "🌟", desc: "8방향으로 찬란하게 빛나는 크리스탈 별" }
            ]
        },
        pastel: {
            id: "pastel",
            name: "달콤 파스텔 친구들 🌸",
            themeColor: "#DB2777",
            desc: "달콤하고 사랑스러운 핑크 파스텔 테마",
            items: [
                { id: 0, name: "솜사탕 구름", emoji: "☁️", desc: "무지개 빗방울을 머금은 핑크 구름" },
                { id: 1, name: "포근 곰인형", emoji: "🧸", desc: "따뜻한 위로를 건네는 테디베어" },
                { id: 2, name: "하트 롤리팝", emoji: "🍭", desc: "달콤한 사랑 가득 하트 막대사탕" },
                { id: 3, name: "달콤 마카롱", emoji: "🧁", desc: "폭신폭신 부드러운 딸기 크림 마카롱" },
                { id: 4, name: "사랑의 리본", emoji: "🎀", desc: "선물처럼 예쁘게 묶인 핑크 실크 리본" }
            ]
        }
    };

    function normalizeStickerTheme(theme) {
        if (!theme) return "moon";
        const clean = String(theme).toLowerCase().trim();
        return Object.prototype.hasOwnProperty.call(STICKER_THEMES, clean) ? clean : "moon";
    }

    // 25종 고화질 SVG 벡터 그래픽 생성
    function getThemeVectorGraphic(theme, type) {
        const safeType = Math.abs(Number(type) || 0) % 5;
        const safeTheme = normalizeStickerTheme(theme);

        switch (safeTheme) {
            case "ocean":
                switch (safeType) {
                    case 0:
                        return `
                            <defs>
                                <linearGradient id="oc-whale-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#0284C7"/>
                                    <stop offset="60%" stop-color="#0369A1"/>
                                    <stop offset="100%" stop-color="#0C4A6E"/>
                                </linearGradient>
                                <linearGradient id="oc-water-grad" x1="0%" y1="100%" x2="0%" y2="0%">
                                    <stop offset="0%" stop-color="#38BDF8"/>
                                    <stop offset="100%" stop-color="#BAE6FD"/>
                                </linearGradient>
                            </defs>
                            <path d="M 48 30 C 46 16, 32 14, 30 20 C 34 22, 42 24, 46 32 Z" fill="url(#oc-water-grad)"/>
                            <path d="M 52 30 C 54 16, 68 14, 70 20 C 66 22, 58 24, 54 32 Z" fill="url(#oc-water-grad)"/>
                            <circle cx="50" cy="14" r="3" fill="#BAE6FD"/>
                            <path d="M 22 56 C 10 46, 6 36, 12 36 C 18 36, 20 48, 26 52 Z" fill="#0284C7"/>
                            <path d="M 22 58 C 10 68, 6 78, 12 78 C 18 78, 20 66, 26 62 Z" fill="#0284C7"/>
                            <path d="M 24 58 C 26 40, 50 32, 76 38 C 92 42, 94 58, 88 68 C 76 82, 44 80, 24 58 Z" fill="url(#oc-whale-grad)"/>
                            <path d="M 38 68 C 50 78, 72 76, 86 66 C 82 72, 70 78, 54 77 C 44 76, 38 72, 38 68 Z" fill="#E0F2FE" opacity="0.9"/>
                            <path d="M 56 62 C 50 72, 42 76, 40 70 C 42 64, 48 60, 56 62 Z" fill="#0369A1"/>
                            <circle cx="78" cy="48" r="3.2" fill="#0F172A"/>
                            <circle cx="79.5" cy="46.5" r="1.2" fill="#FFFFFF"/>
                            <circle cx="72" cy="56" r="3" fill="#F472B6" opacity="0.6"/>
                        `;
                    case 1:
                        return `
                            <defs>
                                <linearGradient id="oc-dol-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#38BDF8"/>
                                    <stop offset="100%" stop-color="#0284C7"/>
                                </linearGradient>
                            </defs>
                            <circle cx="20" cy="72" r="3.5" fill="#7DD3FC" opacity="0.8"/>
                            <circle cx="28" cy="80" r="2.5" fill="#BAE6FD" opacity="0.7"/>
                            <circle cx="82" cy="30" r="2.5" fill="#38BDF8" opacity="0.7"/>
                            <path d="M 26 70 C 14 74, 8 84, 16 86 C 22 84, 25 76, 29 72 Z" fill="#0284C7"/>
                            <path d="M 28 68 C 22 62, 14 56, 12 62 C 14 68, 22 70, 27 70 Z" fill="#0284C7"/>
                            <path d="M 54 36 C 58 24, 68 28, 64 38 Z" fill="#0284C7"/>
                            <path d="M 28 70 C 30 52, 46 34, 70 32 C 86 32, 94 42, 88 50 C 76 60, 48 64, 28 70 Z" fill="url(#oc-dol-grad)"/>
                            <path d="M 88 44 C 95 44, 98 48, 92 52 Z" fill="#38BDF8"/>
                            <path d="M 60 52 C 58 64, 50 66, 48 58 Z" fill="#0284C7"/>
                            <circle cx="76" cy="42" r="3" fill="#0F172A"/>
                            <circle cx="77.5" cy="40.5" r="1" fill="#FFFFFF"/>
                            <circle cx="70" cy="48" r="3" fill="#FB7185" opacity="0.6"/>
                        `;
                    case 2:
                        return `
                            <defs>
                                <linearGradient id="oc-turtle-shell" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#34D399"/>
                                    <stop offset="50%" stop-color="#059669"/>
                                    <stop offset="100%" stop-color="#065F46"/>
                                </linearGradient>
                            </defs>
                            <path d="M 28 32 C 18 24, 16 32, 24 38 Z" fill="#10B981"/>
                            <path d="M 28 68 C 18 76, 16 68, 24 62 Z" fill="#10B981"/>
                            <path d="M 20 50 L 12 50 L 18 53 Z" fill="#10B981"/>
                            <path d="M 62 26 C 68 10, 84 12, 74 30 Z" fill="#10B981"/>
                            <path d="M 62 74 C 68 90, 84 88, 74 70 Z" fill="#10B981"/>
                            <ellipse cx="80" cy="50" rx="12" ry="10" fill="#34D399"/>
                            <circle cx="84" cy="46" r="2.5" fill="#064E3B"/>
                            <circle cx="85" cy="45" r="0.8" fill="#FFFFFF"/>
                            <circle cx="84" cy="54" r="2.5" fill="#064E3B"/>
                            <circle cx="85" cy="53" r="0.8" fill="#FFFFFF"/>
                            <ellipse cx="48" cy="50" rx="26" ry="24" fill="url(#oc-turtle-shell)"/>
                            <path d="M 48 30 L 60 40 L 60 60 L 48 70 L 36 60 L 36 40 Z" fill="#6EE7B7" opacity="0.75"/>
                            <circle cx="48" cy="50" r="6" fill="#047857"/>
                        `;
                    case 3:
                        return `
                            <defs>
                                <radialGradient id="oc-star-grad" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stop-color="#FDE047"/>
                                    <stop offset="45%" stop-color="#FB923C"/>
                                    <stop offset="100%" stop-color="#EA580C"/>
                                </radialGradient>
                            </defs>
                            <path d="M 50 12 Q 54 36 76 34 Q 60 48 68 70 Q 50 58 32 70 Q 40 48 24 34 Q 46 36 50 12 Z" fill="url(#oc-star-grad)" stroke="#C2410C" stroke-width="2"/>
                            <circle cx="50" cy="26" r="2" fill="#FEF08A"/>
                            <circle cx="64" cy="38" r="2" fill="#FEF08A"/>
                            <circle cx="60" cy="58" r="2" fill="#FEF08A"/>
                            <circle cx="40" cy="58" r="2" fill="#FEF08A"/>
                            <circle cx="36" cy="38" r="2" fill="#FEF08A"/>
                            <circle cx="44" cy="46" r="3.2" fill="#431407"/>
                            <circle cx="45" cy="45" r="1" fill="#FFFFFF"/>
                            <circle cx="56" cy="46" r="3.2" fill="#431407"/>
                            <circle cx="57" cy="45" r="1" fill="#FFFFFF"/>
                            <path d="M 46 53 Q 50 57 54 53" stroke="#431407" stroke-width="2" stroke-linecap="round" fill="none"/>
                            <circle cx="40" cy="50" r="2.5" fill="#F43F5E" opacity="0.6"/>
                            <circle cx="60" cy="50" r="2.5" fill="#F43F5E" opacity="0.6"/>
                        `;
                    case 4:
                        return `
                            <defs>
                                <linearGradient id="oc-jelly-cap" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stop-color="#C084FC"/>
                                    <stop offset="60%" stop-color="#A855F7"/>
                                    <stop offset="100%" stop-color="#7E22CE"/>
                                </linearGradient>
                            </defs>
                            <path d="M 36 58 Q 30 74 38 90" stroke="#C084FC" stroke-width="3" fill="none" stroke-linecap="round"/>
                            <path d="M 44 60 Q 48 76 42 92" stroke="#E879F9" stroke-width="3.2" fill="none" stroke-linecap="round"/>
                            <path d="M 56 60 Q 52 76 58 92" stroke="#E879F9" stroke-width="3.2" fill="none" stroke-linecap="round"/>
                            <path d="M 64 58 Q 70 74 62 90" stroke="#C084FC" stroke-width="3" fill="none" stroke-linecap="round"/>
                            <path d="M 50 62 Q 50 78 50 94" stroke="#F472B6" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                            <path d="M 22 56 C 22 30, 78 30, 78 56 C 78 62, 68 58, 60 62 C 52 58, 48 58, 40 62 C 32 58, 22 62, 22 56 Z" fill="url(#oc-jelly-cap)" opacity="0.9"/>
                            <ellipse cx="50" cy="38" rx="20" ry="8" fill="#F3E8FF" opacity="0.4"/>
                            <circle cx="42" cy="48" r="2.8" fill="#1E1B4B"/>
                            <circle cx="43" cy="47" r="1" fill="#FFFFFF"/>
                            <circle cx="58" cy="48" r="2.8" fill="#1E1B4B"/>
                            <circle cx="59" cy="47" r="1" fill="#FFFFFF"/>
                            <circle cx="36" cy="52" r="2.5" fill="#F472B6" opacity="0.7"/>
                            <circle cx="64" cy="52" r="2.5" fill="#F472B6" opacity="0.7"/>
                        `;
                }
                break;

            case "forest":
                switch (safeType) {
                    case 0:
                        return `
                            <defs>
                                <linearGradient id="fr-clover" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#34D399"/>
                                    <stop offset="50%" stop-color="#10B981"/>
                                    <stop offset="100%" stop-color="#059669"/>
                                </linearGradient>
                            </defs>
                            <path d="M 50 50 Q 52 78 38 90" stroke="#047857" stroke-width="4.5" fill="none" stroke-linecap="round"/>
                            <g fill="url(#fr-clover)" stroke="#047857" stroke-width="1.8">
                                <path d="M 50 50 C 38 34, 38 18, 50 24 C 62 18, 62 34, 50 50 Z"/>
                                <path d="M 50 50 C 66 38, 82 38, 76 50 C 82 62, 66 62, 50 50 Z"/>
                                <path d="M 50 50 C 62 66, 62 82, 50 76 C 38 82, 38 66, 50 50 Z"/>
                                <path d="M 50 50 C 34 62, 18 62, 24 50 C 18 38, 34 38, 50 50 Z"/>
                            </g>
                            <circle cx="64" cy="34" r="3" fill="#ECFDF5" opacity="0.85"/>
                        `;
                    case 1:
                        return `
                            <defs>
                                <linearGradient id="fr-sq-body" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#D97706"/>
                                    <stop offset="100%" stop-color="#92400E"/>
                                </linearGradient>
                            </defs>
                            <path d="M 40 68 C 16 68, 6 40, 20 22 C 32 10, 48 18, 36 40 C 30 50, 36 62, 42 66 Z" fill="url(#fr-sq-body)"/>
                            <ellipse cx="64" cy="24" rx="4" ry="7" fill="#B45309" transform="rotate(-15 64 24)"/>
                            <ellipse cx="80" cy="28" rx="4" ry="7" fill="#B45309" transform="rotate(15 80 28)"/>
                            <ellipse cx="72" cy="44" rx="16" ry="15" fill="#D97706"/>
                            <path d="M 54 54 C 54 48, 86 48, 86 54 C 88 74, 52 74, 54 54 Z" fill="#FDE68A"/>
                            <circle cx="68" cy="42" r="2.8" fill="#1C1917"/>
                            <circle cx="69" cy="41" r="0.9" fill="#FFFFFF"/>
                            <circle cx="82" cy="44" r="2.8" fill="#1C1917"/>
                            <circle cx="83" cy="43" r="0.9" fill="#FFFFFF"/>
                            <polygon points="76,46 73,49 79,49" fill="#78350F"/>
                            <circle cx="62" cy="48" r="3" fill="#F43F5E" opacity="0.6"/>
                            <circle cx="86" cy="50" r="3" fill="#F43F5E" opacity="0.6"/>
                            <ellipse cx="74" cy="68" rx="7" ry="8" fill="#78350F"/>
                            <path d="M 67 64 C 67 60, 81 60, 81 64 Z" fill="#451A03"/>
                        `;
                    case 2:
                        return `
                            <defs>
                                <linearGradient id="fr-mush-cap" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stop-color="#EF4444"/>
                                    <stop offset="100%" stop-color="#DC2626"/>
                                </linearGradient>
                            </defs>
                            <path d="M 40 52 L 36 84 C 36 88, 64 88, 64 84 L 60 52 Z" fill="#FEF3C7"/>
                            <path d="M 16 54 C 16 22, 84 22, 84 54 C 84 60, 16 60, 16 54 Z" fill="url(#fr-mush-cap)"/>
                            <circle cx="50" cy="32" r="5.5" fill="#FFFFFF"/>
                            <circle cx="32" cy="42" r="4.5" fill="#FFFFFF"/>
                            <circle cx="68" cy="42" r="4.5" fill="#FFFFFF"/>
                            <circle cx="48" cy="48" r="3" fill="#FFFFFF"/>
                            <circle cx="44" cy="66" r="2.5" fill="#451A03"/>
                            <circle cx="56" cy="66" r="2.5" fill="#451A03"/>
                            <path d="M 47 72 Q 50 75 53 72" stroke="#451A03" stroke-width="1.8" fill="none"/>
                            <circle cx="38" cy="68" r="2.5" fill="#F87171" opacity="0.7"/>
                            <circle cx="62" cy="68" r="2.5" fill="#F87171" opacity="0.7"/>
                        `;
                    case 3:
                        return `
                            <defs>
                                <linearGradient id="fr-tulip" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#FB7185"/>
                                    <stop offset="50%" stop-color="#F43F5E"/>
                                    <stop offset="100%" stop-color="#E11D48"/>
                                </linearGradient>
                            </defs>
                            <path d="M 50 56 L 50 90" stroke="#059669" stroke-width="4.5" stroke-linecap="round"/>
                            <path d="M 50 74 Q 28 66 24 50 Q 38 68 50 74 Z" fill="#10B981"/>
                            <path d="M 50 78 Q 72 70 76 56 Q 62 72 50 78 Z" fill="#10B981"/>
                            <path d="M 28 50 C 24 30, 44 20, 50 36 C 40 44, 34 50, 28 50 Z" fill="url(#fr-tulip)"/>
                            <path d="M 72 50 C 76 30, 56 20, 50 36 C 60 44, 66 50, 72 50 Z" fill="url(#fr-tulip)"/>
                            <path d="M 34 54 C 34 32, 66 32, 66 54 C 66 62, 34 62, 34 54 Z" fill="#FDA4AF"/>
                        `;
                    case 4:
                        return `
                            <defs>
                                <linearGradient id="fr-sprout" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#86EFAC"/>
                                    <stop offset="100%" stop-color="#22C55E"/>
                                </linearGradient>
                            </defs>
                            <ellipse cx="50" cy="84" rx="26" ry="8" fill="#78350F"/>
                            <ellipse cx="50" cy="83" rx="24" ry="6" fill="#92400E"/>
                            <path d="M 50 82 Q 50 54 48 40" stroke="#16A34A" stroke-width="4.5" fill="none" stroke-linecap="round"/>
                            <path d="M 48 44 C 30 36, 22 48, 36 54 C 44 56, 48 48, 48 44 Z" fill="url(#fr-sprout)"/>
                            <path d="M 48 40 C 66 28, 76 42, 60 50 C 52 52, 48 44, 48 40 Z" fill="url(#fr-sprout)"/>
                            <circle cx="34" cy="46" r="2.2" fill="#FFFFFF" opacity="0.8"/>
                        `;
                }
                break;

            case "star":
                switch (safeType) {
                    case 0:
                        return `
                            <defs>
                                <linearGradient id="st-planet" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#A78BFA"/>
                                    <stop offset="60%" stop-color="#7C3AED"/>
                                    <stop offset="100%" stop-color="#4C1D95"/>
                                </linearGradient>
                                <linearGradient id="st-ring" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stop-color="#FDE047"/>
                                    <stop offset="100%" stop-color="#F59E0B"/>
                                </linearGradient>
                            </defs>
                            <path d="M 16 54 C 18 38, 72 26, 88 42" stroke="url(#st-ring)" stroke-width="5.5" fill="none" stroke-linecap="round" opacity="0.7"/>
                            <circle cx="50" cy="50" r="25" fill="url(#st-planet)"/>
                            <path d="M 28 45 Q 50 54 72 45" stroke="#DDD6FE" stroke-width="3" fill="none" opacity="0.6"/>
                            <path d="M 27 55 Q 50 64 73 55" stroke="#C4B5FD" stroke-width="2.5" fill="none" opacity="0.5"/>
                            <path d="M 12 50 C 12 66, 78 78, 88 50" stroke="url(#st-ring)" stroke-width="6.5" fill="none" stroke-linecap="round"/>
                            <polygon points="78,20 80,26 86,28 80,30 78,36 76,30 70,28 76,26" fill="#FDE047"/>
                        `;
                    case 1:
                        return `
                            <defs>
                                <linearGradient id="st-tail" x1="100%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stop-color="#FDE047"/>
                                    <stop offset="40%" stop-color="#F59E0B"/>
                                    <stop offset="100%" stop-color="#EF4444" stop-opacity="0"/>
                                </linearGradient>
                            </defs>
                            <polygon points="70,30 14,86 18,90 74,34" fill="url(#st-tail)"/>
                            <polygon points="66,24 24,76 28,80 70,28" fill="url(#st-tail)" opacity="0.6"/>
                            <polygon points="70,16 75,27 87,27 77,34 81,45 70,38 59,45 63,34 53,27 65,27" fill="#FDE047" stroke="#D97706" stroke-width="1.8"/>
                            <circle cx="67" cy="29" r="1.6" fill="#451A03"/>
                            <circle cx="73" cy="29" r="1.6" fill="#451A03"/>
                        `;
                    case 2:
                        return `
                            <defs>
                                <linearGradient id="st-rocket-flame" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stop-color="#FEF08A"/>
                                    <stop offset="50%" stop-color="#F97316"/>
                                    <stop offset="100%" stop-color="#EF4444"/>
                                </linearGradient>
                            </defs>
                            <polygon points="44,72 50,92 56,72" fill="url(#st-rocket-flame)"/>
                            <path d="M 38 58 L 22 74 L 38 70 Z" fill="#EF4444"/>
                            <path d="M 62 58 L 78 74 L 62 70 Z" fill="#EF4444"/>
                            <path d="M 50 14 C 36 28, 36 58, 38 72 L 62 72 C 64 58, 64 28, 50 14 Z" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
                            <path d="M 50 14 C 42 22, 39 30, 39 34 L 61 34 C 61 30, 58 22, 50 14 Z" fill="#EF4444"/>
                            <circle cx="50" cy="46" r="7" fill="#38BDF8" stroke="#0284C7" stroke-width="2"/>
                            <circle cx="48" cy="44" r="2.2" fill="#FFFFFF"/>
                        `;
                    case 3:
                        return `
                            <defs>
                                <linearGradient id="st-alien" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#67E8F9"/>
                                    <stop offset="100%" stop-color="#06B6D4"/>
                                </linearGradient>
                            </defs>
                            <path d="M 50 26 L 50 14" stroke="#0891B2" stroke-width="3" stroke-linecap="round"/>
                            <circle cx="50" cy="12" r="4.5" fill="#FDE047"/>
                            <ellipse cx="50" cy="54" rx="26" ry="24" fill="url(#st-alien)"/>
                            <circle cx="38" cy="46" r="4" fill="#FFFFFF"/>
                            <circle cx="38" cy="46" r="2" fill="#0F172A"/>
                            <circle cx="50" cy="42" r="5" fill="#FFFFFF"/>
                            <circle cx="50" cy="42" r="2.5" fill="#0F172A"/>
                            <circle cx="62" cy="46" r="4" fill="#FFFFFF"/>
                            <circle cx="62" cy="46" r="2" fill="#0F172A"/>
                            <path d="M 44 58 Q 50 63 56 58" stroke="#0E7490" stroke-width="2.2" stroke-linecap="round" fill="none"/>
                            <path d="M 36 74 Q 34 86 38 88" stroke="#0891B2" stroke-width="4" stroke-linecap="round"/>
                            <path d="M 50 76 Q 50 88 50 90" stroke="#0891B2" stroke-width="4" stroke-linecap="round"/>
                            <path d="M 64 74 Q 66 86 62 88" stroke="#0891B2" stroke-width="4" stroke-linecap="round"/>
                        `;
                    case 4:
                        return `
                            <defs>
                                <radialGradient id="st-crystal-star" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stop-color="#FFFFFF"/>
                                    <stop offset="35%" stop-color="#FDE047"/>
                                    <stop offset="75%" stop-color="#F59E0B"/>
                                    <stop offset="100%" stop-color="#D97706"/>
                                </radialGradient>
                            </defs>
                            <polygon points="50,6 56,36 86,22 64,44 94,50 64,56 86,78 56,64 50,94 44,64 14,78 36,56 6,50 36,44 14,22 44,36" fill="url(#st-crystal-star)" stroke="#B45309" stroke-width="1.5"/>
                            <circle cx="50" cy="50" r="7" fill="#FFFFFF" opacity="0.9"/>
                            <circle cx="47" cy="49" r="1.4" fill="#451A03"/>
                            <circle cx="53" cy="49" r="1.4" fill="#451A03"/>
                        `;
                }
                break;

            case "pastel":
                switch (safeType) {
                    case 0:
                        return `
                            <defs>
                                <linearGradient id="ps-cloud" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#FBCFE8"/>
                                    <stop offset="50%" stop-color="#F472B6"/>
                                    <stop offset="100%" stop-color="#BAE6FD"/>
                                </linearGradient>
                            </defs>
                            <path d="M 28 62 C 16 62, 14 46, 26 42 C 26 28, 46 22, 54 32 C 64 24, 82 32, 78 46 C 88 50, 86 62, 74 62 Z" fill="url(#ps-cloud)"/>
                            <circle cx="42" cy="46" r="2.6" fill="#831843"/>
                            <circle cx="58" cy="46" r="2.6" fill="#831843"/>
                            <path d="M 46 51 Q 50 54 54 51" stroke="#831843" stroke-width="1.8" stroke-linecap="round" fill="none"/>
                            <circle cx="36" cy="49" r="3" fill="#EC4899" opacity="0.6"/>
                            <circle cx="64" cy="49" r="3" fill="#EC4899" opacity="0.6"/>
                            <ellipse cx="36" cy="74" rx="2.5" ry="4" fill="#F472B6"/>
                            <ellipse cx="50" cy="78" rx="2.5" ry="4" fill="#FDE047"/>
                            <ellipse cx="64" cy="74" rx="2.5" ry="4" fill="#38BDF8"/>
                        `;
                    case 1:
                        return `
                            <defs>
                                <linearGradient id="ps-bear" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#FBCFE8"/>
                                    <stop offset="100%" stop-color="#F472B6"/>
                                </linearGradient>
                            </defs>
                            <circle cx="32" cy="30" r="9" fill="url(#ps-bear)"/>
                            <circle cx="32" cy="30" r="5" fill="#FDF2F8"/>
                            <circle cx="68" cy="30" r="9" fill="url(#ps-bear)"/>
                            <circle cx="68" cy="30" r="5" fill="#FDF2F8"/>
                            <circle cx="50" cy="48" r="22" fill="url(#ps-bear)"/>
                            <ellipse cx="50" cy="54" rx="9" ry="7" fill="#FFFFFF"/>
                            <circle cx="42" cy="44" r="2.5" fill="#4A044E"/>
                            <circle cx="58" cy="44" r="2.5" fill="#4A044E"/>
                            <ellipse cx="50" cy="52" rx="3.5" ry="2.5" fill="#831843"/>
                            <path d="M 50 54 L 50 58 M 47 58 Q 50 60 53 58" stroke="#831843" stroke-width="1.6" stroke-linecap="round"/>
                            <circle cx="36" cy="52" r="3" fill="#EC4899" opacity="0.6"/>
                            <circle cx="64" cy="52" r="3" fill="#EC4899" opacity="0.6"/>
                            <polygon points="50,68 40,64 40,74" fill="#FB7185"/>
                            <polygon points="50,68 60,64 60,74" fill="#FB7185"/>
                            <circle cx="50" cy="69" r="3" fill="#F43F5E"/>
                        `;
                    case 2:
                        return `
                            <defs>
                                <linearGradient id="ps-lollipop" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#F472B6"/>
                                    <stop offset="100%" stop-color="#DB2777"/>
                                </linearGradient>
                            </defs>
                            <path d="M 50 56 L 50 92" stroke="#FEF08A" stroke-width="5" stroke-linecap="round"/>
                            <path d="M 50 62 L 50 88" stroke="#FDE047" stroke-width="2" stroke-linecap="round"/>
                            <path d="M 50 30 C 50 14, 22 14, 22 36 C 22 50, 44 58, 50 64 C 56 58, 78 50, 78 36 C 78 14, 50 14, 50 30 Z" fill="url(#ps-lollipop)" stroke="#BE185D" stroke-width="2"/>
                            <path d="M 34 32 C 34 24, 46 22, 50 28 C 54 36, 42 42, 38 46" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.85"/>
                        `;
                    case 3:
                        return `
                            <defs>
                                <linearGradient id="ps-mac-top" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stop-color="#F472B6"/>
                                    <stop offset="100%" stop-color="#FB7185"/>
                                </linearGradient>
                                <linearGradient id="ps-mac-bot" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stop-color="#38BDF8"/>
                                    <stop offset="100%" stop-color="#818CF8"/>
                                </linearGradient>
                            </defs>
                            <path d="M 22 42 C 22 26, 78 26, 78 42 C 78 46, 22 46, 22 42 Z" fill="url(#ps-mac-top)"/>
                            <ellipse cx="50" cy="43" rx="28" ry="3" fill="#F43F5E"/>
                            <rect x="24" y="45" width="52" height="10" rx="5" fill="#FEF08A"/>
                            <circle cx="32" cy="50" r="3" fill="#FDE047"/>
                            <circle cx="50" cy="50" r="3" fill="#FDE047"/>
                            <circle cx="68" cy="50" r="3" fill="#FDE047"/>
                            <ellipse cx="50" cy="57" rx="28" ry="3" fill="#6366F1"/>
                            <path d="M 22 58 C 22 62, 78 62, 78 58 C 78 74, 22 74, 22 58 Z" fill="url(#ps-mac-bot)"/>
                        `;
                    case 4:
                        return `
                            <defs>
                                <linearGradient id="ps-ribbon" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#F472B6"/>
                                    <stop offset="50%" stop-color="#EC4899"/>
                                    <stop offset="100%" stop-color="#BE185D"/>
                                </linearGradient>
                            </defs>
                            <path d="M 44 54 L 28 86 L 40 82 L 48 60 Z" fill="#DB2777"/>
                            <path d="M 56 54 L 72 86 L 60 82 L 52 60 Z" fill="#DB2777"/>
                            <path d="M 50 50 C 32 30, 16 38, 20 54 C 24 66, 44 56, 50 50 Z" fill="url(#ps-ribbon)"/>
                            <path d="M 50 50 C 68 30, 84 38, 80 54 C 76 66, 56 56, 50 50 Z" fill="url(#ps-ribbon)"/>
                            <ellipse cx="50" cy="50" rx="6.5" ry="7" fill="#FDF2F8" stroke="#DB2777" stroke-width="2"/>
                            <circle cx="50" cy="50" r="3.5" fill="#F472B6"/>
                        `;
                }
                break;

            case "moon":
            default:
                switch (safeType) {
                    case 0:
                        return `
                            <defs>
                                <linearGradient id="mn-moon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#FEF08A"/>
                                    <stop offset="60%" stop-color="#FACC15"/>
                                    <stop offset="100%" stop-color="#EAB308"/>
                                </linearGradient>
                            </defs>
                            <path d="M 54 14 C 72 14, 86 28, 86 48 C 86 70, 68 86, 46 86 C 36 86, 26 82, 18 76 C 38 76, 56 62, 56 42 C 56 30, 50 20, 42 16 C 46 14, 50 14, 54 14 Z" fill="url(#mn-moon-grad)" stroke="#CA8A04" stroke-width="2"/>
                            <polygon points="28,26 30,32 36,34 30,36 28,42 26,36 20,34 26,32" fill="#FEF08A"/>
                            <polygon points="72,66 73,70 77,71 73,72 72,76 71,72 67,71 71,70" fill="#FEF08A"/>
                            <circle cx="50" cy="46" r="2.8" fill="#713F12"/>
                            <circle cx="51" cy="45" r="0.9" fill="#FFFFFF"/>
                            <circle cx="44" cy="52" r="3" fill="#F472B6" opacity="0.6"/>
                        `;
                    case 1:
                        return `
                            <defs>
                                <radialGradient id="mn-sun-grad" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stop-color="#FEF08A"/>
                                    <stop offset="65%" stop-color="#F59E0B"/>
                                    <stop offset="100%" stop-color="#EA580C"/>
                                </radialGradient>
                            </defs>
                            <g stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round">
                                <line x1="50" y1="12" x2="50" y2="20"/>
                                <line x1="50" y1="80" x2="50" y2="88"/>
                                <line x1="12" y1="50" x2="20" y2="50"/>
                                <line x1="80" y1="50" x2="88" y2="50"/>
                                <line x1="24" y1="24" x2="30" y2="30"/>
                                <line x1="70" y1="70" x2="76" y2="76"/>
                                <line x1="24" y1="76" x2="30" y2="70"/>
                                <line x1="70" y1="30" x2="76" y2="24"/>
                            </g>
                            <circle cx="50" cy="50" r="24" fill="url(#mn-sun-grad)" stroke="#D97706" stroke-width="2"/>
                            <circle cx="42" cy="46" r="2.8" fill="#451A03"/>
                            <circle cx="43" cy="45" r="0.9" fill="#FFFFFF"/>
                            <circle cx="58" cy="46" r="2.8" fill="#451A03"/>
                            <circle cx="59" cy="45" r="0.9" fill="#FFFFFF"/>
                            <path d="M 44 54 Q 50 60 56 54" stroke="#451A03" stroke-width="2.2" stroke-linecap="round" fill="none"/>
                            <circle cx="36" cy="52" r="3" fill="#EF4444" opacity="0.6"/>
                            <circle cx="64" cy="52" r="3" fill="#EF4444" opacity="0.6"/>
                        `;
                    case 2:
                        return `
                            <defs>
                                <linearGradient id="mn-ray" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#38BDF8"/>
                                    <stop offset="60%" stop-color="#0284C7"/>
                                    <stop offset="100%" stop-color="#0F172A"/>
                                </linearGradient>
                            </defs>
                            <path d="M 50 62 Q 50 84 44 94" stroke="#0284C7" stroke-width="3" fill="none" stroke-linecap="round"/>
                            <path d="M 50 18 C 70 30, 94 44, 88 56 C 82 64, 60 58, 50 64 C 40 58, 18 64, 12 56 C 6 44, 30 30, 50 18 Z" fill="url(#mn-ray)" stroke="#0F172A" stroke-width="1.8"/>
                            <circle cx="50" cy="32" r="2.5" fill="#BAE6FD" opacity="0.8"/>
                            <circle cx="42" cy="42" r="2" fill="#BAE6FD" opacity="0.8"/>
                            <circle cx="58" cy="42" r="2" fill="#BAE6FD" opacity="0.8"/>
                            <circle cx="44" cy="24" r="2.2" fill="#0F172A"/>
                            <circle cx="44.5" cy="23.5" r="0.8" fill="#FFFFFF"/>
                            <circle cx="56" cy="24" r="2.2" fill="#0F172A"/>
                            <circle cx="56.5" cy="23.5" r="0.8" fill="#FFFFFF"/>
                        `;
                    case 3:
                        return `
                            <defs>
                                <linearGradient id="mn-wave" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#67E8F9"/>
                                    <stop offset="50%" stop-color="#0284C7"/>
                                    <stop offset="100%" stop-color="#1E3A8A"/>
                                </linearGradient>
                            </defs>
                            <circle cx="50" cy="50" r="38" fill="url(#mn-wave)"/>
                            <path d="M 16 54 C 26 44, 38 42, 48 50 C 58 58, 68 44, 84 52 L 84 84 C 64 88, 36 88, 16 84 Z" fill="#E0F2FE" opacity="0.85"/>
                            <path d="M 18 64 C 30 56, 44 56, 56 64 C 66 72, 74 62, 82 66" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/>
                            <circle cx="74" cy="36" r="5" fill="#FDE047"/>
                        `;
                    case 4:
                        return `
                            <defs>
                                <linearGradient id="mn-whale" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#4F46E5"/>
                                    <stop offset="60%" stop-color="#312E81"/>
                                    <stop offset="100%" stop-color="#1E1B4B"/>
                                </linearGradient>
                            </defs>
                            <polygon points="52,18 54,23 59,24 55,27 56,32 52,29 48,32 49,27 45,24 50,23" fill="#FDE047"/>
                            <circle cx="62" cy="22" r="2" fill="#BAE6FD"/>
                            <path d="M 24 54 C 12 44, 8 36, 14 36 C 20 36, 22 46, 28 50 Z" fill="#4338CA"/>
                            <path d="M 24 56 C 12 66, 8 74, 14 74 C 20 74, 22 64, 28 60 Z" fill="#4338CA"/>
                            <path d="M 26 56 C 28 40, 52 32, 78 38 C 92 42, 94 58, 88 68 C 76 80, 46 78, 26 56 Z" fill="url(#mn-whale)"/>
                            <circle cx="48" cy="48" r="1.5" fill="#FDE047"/>
                            <circle cx="60" cy="44" r="2" fill="#FDE047"/>
                            <circle cx="68" cy="54" r="1.5" fill="#BAE6FD"/>
                            <circle cx="80" cy="48" r="3" fill="#FFFFFF"/>
                            <circle cx="81" cy="48" r="1.8" fill="#0F172A"/>
                            <circle cx="74" cy="56" r="3" fill="#F472B6" opacity="0.6"/>
                        `;
                }
                break;
        }
        return "";
    }

    function getThemeStickerMarkup(theme, type) {
        const id = Math.abs(Number(type) || 0) % 5;
        const safeTheme = normalizeStickerTheme(theme);
        const vectorSvg = getThemeVectorGraphic(safeTheme, id);

        if (safeTheme === "moon") {
            const item = PRAISE_STICKERS[id];
            return `
                <img src="${item.src}" alt="${item.name}" class="praise-sticker-img" draggable="false"
                     onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='block';" />
                <svg viewBox="0 0 100 100" class="sticker-svg-vector active" aria-hidden="true" style="display:none;">${vectorSvg}</svg>
            `;
        }

        return `<svg viewBox="0 0 100 100" class="sticker-svg-vector praise-sticker-img active" aria-hidden="true">${vectorSvg}</svg>`;
    }

    function renderThemePreviewBar(container, theme) {
        const target = typeof container === "string" ? document.getElementById(container) : container;
        if (!target) return;
        const safeTheme = normalizeStickerTheme(theme);
        const themeObj = STICKER_THEMES[safeTheme] || STICKER_THEMES.moon;

        target.innerHTML = "";
        themeObj.items.forEach((item, idx) => {
            const previewEl = document.createElement("div");
            previewEl.className = "theme-preview-item";
            previewEl.innerHTML = `
                <div class="theme-preview-icon">
                    ${getThemeStickerMarkup(safeTheme, idx)}
                </div>
                <span class="theme-preview-name">${item.name}</span>
            `;
            target.appendChild(previewEl);
        });
    }

    // 전역 네임스페이스 등록
    global.PRAISE_STICKERS = PRAISE_STICKERS;
    global.STICKER_THEMES = STICKER_THEMES;
    global.normalizeStickerTheme = normalizeStickerTheme;
    global.getThemeVectorGraphic = getThemeVectorGraphic;
    global.getThemeStickerMarkup = getThemeStickerMarkup;
    global.renderThemePreviewBar = renderThemePreviewBar;

})(typeof window !== 'undefined' ? window : this);
