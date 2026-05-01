/**
 * ALIELENGLISH — AI Teacher Chat Widget v2.0
 * Full-featured AI English teacher with onboarding,
 * intent classification, personalization, and deep linking.
 * Uses Gemini API with Azerbaijani/English bilingual support.
 */

(function () {
    'use strict';

    // ===== CONFIG =====
    const CONFIG = {
        apiKey: '', // API key is handled securely by Cloudflare Worker
        apiUrl: 'https://ai-teacher.your-worker.workers.dev', // TODO: Update with actual Worker URL
        storageKey: 'ai_teacher_data',
        maxHistory: 20,
        maxApiHistory: 6,
        maxTokens: 1024,
        temperature: 0.7
    };

    // ===== INTENT CATEGORIES =====
    const INTENTS = {
        grammar: { keywords: ['qrammatika', 'grammar', 'present', 'past', 'future', 'tense', 'modal', 'condition', 'passive', 'reported', 'article', 'preposition', 'verb', 'noun', 'adjective', 'adverb', 'pronoun', 'conjunction'], icon: '📚', link: 'test.html' },
        vocabulary: { keywords: ['söz', 'vocabulary', 'word', 'meaning', 'translate', 'tərcümə', 'synonym', 'antonym', 'lüğət', 'dictionary', 'idiom', 'phrase'], icon: '📝', link: 'daily-word.html' },
        pronunciation: { keywords: ['tələffüz', 'pronunciation', 'accent', 'sound', 'phonetic', 'IPA', 'stress', 'intonation'], icon: '🔊', link: 'speaking.html' },
        exam: { keywords: ['imtahan', 'exam', 'test', 'quiz', 'səviyyə', 'level', 'ielts', 'toefl', 'cambridge', 'sınaq'], icon: '🎯', link: 'test.html' },
        writing: { keywords: ['inşa', 'essay', 'məktub', 'email', 'letter', 'writing', 'composition', 'paragraph'], icon: '✍️', link: 'resources.html' },
        speaking: { keywords: ['danışıq', 'speaking', 'interview', 'müzakirə', 'discussion', 'conversation', 'dialog'], icon: '🎤', link: 'speaking.html' },
        motivation: { keywords: ['motivasiya', 'motivation', 'yoruldum', 'çətin', 'vaz keç', 'discouraged', 'hard', 'difficult', 'bored'], icon: '💪', link: null },
        technical: { keywords: ['sayt', 'site', 'video', 'problem', 'error', 'işləmir', 'açılmır', 'bug', 'yüklənmir'], icon: '🔧', link: 'contact.html' },
        advice: { keywords: ['məsləhət', 'advice', 'nə edim', 'how', 'what should', 'tövsiyə', 'plan', 'strategiya'], icon: '💡', link: null },
        pricing: { keywords: ['qiymət', 'premium', 'ödəniş', 'pul', 'plan', 'price', 'subscription', 'abunə'], icon: '💳', link: 'pricing.html' }
    };

    // ===== STATE =====
    let state = {
        isOpen: false,
        isOnboarding: false,
        onboardStep: 0,
        chatHistory: [],
        apiHistory: [],
        userData: null,
        isTyping: false
    };

    // ===== STORAGE =====
    function loadData() {
        try {
            // Migrate old key 'ait_data' → new key 'ai_teacher_data'
            const OLD_KEY = 'ait_data';
            if (!localStorage.getItem(CONFIG.storageKey) && localStorage.getItem(OLD_KEY)) {
                try {
                    localStorage.setItem(CONFIG.storageKey, localStorage.getItem(OLD_KEY));
                    localStorage.removeItem(OLD_KEY);
                } catch (_) {}
            }

            const raw = localStorage.getItem(CONFIG.storageKey);
            if (raw) {
                const data = JSON.parse(raw);
                state.userData = data.user || null;
                state.chatHistory = data.chatHistory || [];
            }
        } catch (e) { console.warn('AIT: storage load error', e); }
    }

    function saveData() {
        try {
            const data = {
                user: state.userData,
                chatHistory: state.chatHistory.slice(-CONFIG.maxHistory)
            };
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
        } catch (e) { console.warn('AIT: storage save error', e); }
    }

    // ===== INTENT DETECTION =====
    function detectIntent(text) {
        const lower = text.toLowerCase();
        let bestIntent = null;
        let bestScore = 0;

        for (const [name, config] of Object.entries(INTENTS)) {
            let score = 0;
            for (const kw of config.keywords) {
                if (lower.includes(kw)) score++;
            }
            if (score > bestScore) {
                bestScore = score;
                bestIntent = name;
            }
        }
        return bestIntent;
    }

    // ===== LEVEL DETECTION (from user text) =====
    function detectLevelFromText(text) {
        const lower = text.toLowerCase();
        if (/subjunctive|nuance|rhetoric|literary|discourse/i.test(lower)) return 'C2';
        if (/paradox|albeit|notwithstanding|whereby/i.test(lower)) return 'C1';
        if (/having (finished|completed)|despite|furthermore|whereas/i.test(lower)) return 'B2';
        if (/if i were|would have|used to|might have/i.test(lower)) return 'B1';
        if (/my name is|i like|i have|can you/i.test(lower)) return 'A2';
        return 'A1';
    }

    // ===== TIME HELPERS =====
    function getTimeStr() {
        return new Date().toLocaleTimeString('az', { hour: '2-digit', minute: '2-digit' });
    }

    function getGreeting() {
        const h = new Date().getHours();
        if (h < 6) return 'Gecəniz xeyir';
        if (h < 12) return 'Sabahınız xeyir';
        if (h < 18) return 'Günortanız xeyir';
        return 'Axşamınız xeyir';
    }

    // ===== HTML HELPERS =====
    function esc(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function formatResponse(text) {
        return text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code style="background:rgba(99,102,241,0.15);padding:2px 6px;border-radius:4px;font-size:0.82em;">$1</code>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--ait-primary-light)">$1</a>');
    }

    // ===== PAGE CONTEXT =====
    function getPageContext() {
        const page = window.location.pathname.split('/').pop() || 'index.html';
        const map = {
            'index.html': 'Ana Səhifə',
            'daily-word.html': 'Günün Sözü',
            'test.html': 'Səviyyə Testi',
            'speaking.html': 'Danışıq Praktikası',
            'resources.html': 'Resurslar',
            'favorites.html': 'Sevimlilər',
            'dashboard.html': 'Dashboard',
            'pricing.html': 'Qiymətlər',
            'contact.html': 'Əlaqə',
            'login.html': 'Giriş',
            'register.html': 'Qeydiyyat'
        };
        return map[page] || page;
    }

    // ===== SYSTEM PROMPT =====
    function buildSystemPrompt() {
        const user = state.userData;
        const ctx = getPageContext();
        let prompt = `Sən "Alielenglish" platformasının AI İngilis Dili Müəllimisən. Adın "AI Müəllim"dir.\n`;
        prompt += `İstifadəçi hazırda "${ctx}" səhifəsindədir.\n\n`;

        if (user) {
            prompt += `İSTİFADƏÇİ PROFİLİ:\n`;
            prompt += `- Ad: ${user.name}\n`;
            prompt += `- Səviyyə: ${user.level}\n`;
            prompt += `- Hədəf: ${user.goal || 'Ümumi'}\n`;
            prompt += `- Streak: ${user.streak || 0} gün\n`;
            prompt += `- Ümumi mesaj: ${user.totalMessages || 0}\n\n`;
        }

        prompt += `QAYDALAR:\n`;
        prompt += `1. Azərbaycanca sualları Azərbaycanca cavabla\n`;
        prompt += `2. İngilis dili mövzularını həm İngilis, həm Azərbaycan dilində izah et\n`;
        prompt += `3. Səhvləri yumşaq şəkildə düzəlt — əvvəlcə təşviq, sonra düzəliş\n`;
        prompt += `4. Cavabları qısa və aydın saxla (max 4-5 cümlə)\n`;
        prompt += `5. Lazım olduqda sayt bölmələrinə yönləndir\n`;
        prompt += `6. Emoji istifadə et amma mülayim\n`;
        prompt += `7. Hər cavabda bir sual və ya məşq təklif et\n`;
        prompt += `8. Həvəsləndirici ol — tələbə motivasiyasını yüksəlt\n`;

        if (user && user.level) {
            prompt += `\nİstifadəçinin səviyyəsinə (${user.level}) uyğun izahlar ver.\n`;
        }

        return prompt;
    }

    // ===== GEMINI API CALL =====
    async function callAPI(userMessage) {
        state.apiHistory.push({ role: 'user', text: userMessage });

        try {
            const recent = state.apiHistory.slice(-CONFIG.maxApiHistory);
            const contents = recent.map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
            }));

            // Prepend system prompt to first message with separator
            if (contents.length > 0) {
                contents[0].parts[0].text = buildSystemPrompt() + '\n\n---USER_MSG---\n\n' + contents[0].parts[0].text;
            }

            const url = CONFIG.apiKey ? `${CONFIG.apiUrl}?key=${CONFIG.apiKey}` : CONFIG.apiUrl;
            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents,
                    generationConfig: {
                        temperature: CONFIG.temperature,
                        maxOutputTokens: CONFIG.maxTokens,
                        topP: 0.9
                    },
                    safetySettings: [
                        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
                    ]
                })
            });

            if (!resp.ok) throw new Error(`API ${resp.status}`);
            const data = await resp.json();
            const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!reply) throw new Error('Empty response');

            state.apiHistory.push({ role: 'model', text: reply });
            return reply;

        } catch (err) {
            console.warn('AIT API error:', err.message);
            state.apiHistory.pop();
            return getFallback(userMessage);
        }
    }

    // ===== FALLBACK RESPONSES =====
    function getFallback(q) {
        const ql = q.toLowerCase();
        if (/salam|hi\b|hello|xoş/.test(ql)) return '👋 Salam! İngilis dili ilə bağlı sualınızı soruşun. Sizə kömək etməyə hazıram!';
        if (/test|seviyy|səviyy|imtahan/.test(ql)) return '🎯 Səviyyə testini [buradan](test.html) edə bilərsiniz! Testdən əvvəl A1-C2 arasında səviyyənizi seçin.';
        if (/qiymət|pul|ödəni|premium/.test(ql)) return '💳 Qiymət planları üçün [Qiymətlər](pricing.html) səhifəsinə baxın. Pulsuz plan da mövcuddur!';
        if (/söz|word|lüğət|vocabulary/.test(ql)) return '📚 [Günün Sözü](daily-word.html) bölməmizə baxın! Hər gün yeni söz öyrənin.';
        if (/qrammatika|grammar/.test(ql)) return '📝 Qrammatika sualınızı ətraflı yazın, sizə izah edim! Hansı mövzu ilə maraqlanırsınız?';
        if (/danışıq|speaking|tələffüz/.test(ql)) return '🎤 [Danışıq Praktikası](speaking.html) bölməmizə daxil olun! AI ilə tələffüzünüzü yoxlayın.';
        if (/resurs|material|pdf|kitab/.test(ql)) return '📖 [Resurslar](resources.html) bölməsindən pulsuz materialları yükləyin.';
        if (/əlaqə|contact|problem|kömək|işləmir/.test(ql)) return '📬 Texniki kömək üçün [Əlaqə](contact.html) səhifəmizə müraciət edin.';
        if (/motivasiya|yoruldum|çətin|vaz keç/.test(ql)) return '💪 Narahat olmayın! Hər kəs öyrənmə prosesində çətinliklərlə üzləşir. 70% tələbə bunu hiss edir, amma davam edənlərin 90%-i uğur qazanır! Kiçik addımlarla başlayın — gündə 5 dəqiqə belə fərq yaradır.';
        return '🤖 Sualınızı aldım! Daha ətraflı izah etsəniz, daha yaxşı kömək edə bilərəm. İngilis dili ilə bağlı istənilən sualı soruşa bilərsiniz.';
    }

    // ===== INJECT WIDGET HTML =====
    function injectWidget() {
        const html = `
        <div class="ai-teacher-widget" id="aiTeacherWidget">
            <button class="ai-teacher-toggle" id="aiTeacherToggle" aria-label="AI Müəllimlə Danış">
                <span class="toggle-icon">🎓</span>
                <span class="toggle-close">✕</span>
                <span class="notification-dot" id="aitNotifDot"></span>
            </button>
            <div class="ai-teacher-window" id="aiTeacherWindow">
                <div class="ait-header">
                    <div class="ait-header-left">
                        <div class="ait-avatar">
                            🎓
                            <span class="status-dot"></span>
                        </div>
                        <div class="ait-header-info">
                            <h3>AI Müəllim</h3>
                            <span class="status-text">● Onlayn</span>
                        </div>
                    </div>
                    <div class="ait-header-actions">
                        <button class="ait-header-btn" id="aitClearBtn" title="Söhbəti sil" aria-label="Söhbəti sil">🗑</button>
                        <button class="ait-header-btn" id="aitMinBtn" title="Kiçilt" aria-label="Kiçilt">─</button>
                    </div>
                </div>
                <div class="ait-messages" id="aitMessages"></div>
                <div class="ait-quick-bar" id="aitQuickBar">
                    <button class="ait-quick-btn" data-q="Qrammatika mövzusu izah et">📚 Qrammatika</button>
                    <button class="ait-quick-btn" data-q="Yeni söz öyrət">📝 Sözlər</button>
                    <button class="ait-quick-btn" data-q="Səviyyəmi yoxla">🎯 Test</button>
                    <button class="ait-quick-btn" data-q="Məsləhət ver">💡 Məsləhət</button>
                    <button class="ait-quick-btn" data-q="Tələffüz qaydaları">🔊 Tələffüz</button>
                </div>
                <div class="ait-input-area">
                    <div class="ait-input-wrap">
                        <input type="text" id="aitInput" placeholder="Sualınızı yazın..." autocomplete="off" aria-label="Sualınız">
                        <button class="ait-send-btn" id="aitSendBtn" aria-label="Göndər">
                            <svg viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    // ===== RENDER MESSAGE =====
    function addMessage(role, content, actions) {
        const messagesEl = document.getElementById('aitMessages');
        if (!messagesEl) return;

        const time = getTimeStr();
        const avatar = role === 'ai' ? '🎓' : '👤';

        let actionsHTML = '';
        if (actions && actions.length > 0) {
            actionsHTML = '<div class="ait-actions">';
            for (const a of actions) {
                if (a.href) {
                    actionsHTML += `<a href="${esc(a.href)}" class="ait-action-btn">${a.icon || ''} ${esc(a.label)}</a>`;
                } else if (a.onclick) {
                    actionsHTML += `<button class="ait-action-btn" onclick="${esc(a.onclick)}">${a.icon || ''} ${esc(a.label)}</button>`;
                }
            }
            actionsHTML += '</div>';
        }

        const formattedContent = role === 'ai' ? formatResponse(content) : esc(content);

        const msgHTML = `
        <div class="ait-msg ${role}">
            <div class="ait-msg-avatar">${avatar}</div>
            <div class="ait-msg-content">
                <div class="ait-msg-bubble">${formattedContent}</div>
                ${actionsHTML}
                <span class="ait-msg-time">${time}</span>
            </div>
        </div>`;

        messagesEl.insertAdjacentHTML('beforeend', msgHTML);
        messagesEl.scrollTop = messagesEl.scrollHeight;

        // Save to history
        state.chatHistory.push({ role, content, time: new Date().toISOString() });
        saveData();
    }

    // ===== SHOW TYPING INDICATOR =====
    function showTyping() {
        const messagesEl = document.getElementById('aitMessages');
        if (!messagesEl) return;
        state.isTyping = true;

        const html = `
        <div class="ait-msg ai" id="aitTypingMsg">
            <div class="ait-msg-avatar">🎓</div>
            <div class="ait-msg-content">
                <div class="ait-msg-bubble">
                    <div class="ait-typing">
                        <span class="dot"></span>
                        <span class="dot"></span>
                        <span class="dot"></span>
                    </div>
                </div>
            </div>
        </div>`;

        messagesEl.insertAdjacentHTML('beforeend', html);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function hideTyping() {
        state.isTyping = false;
        const el = document.getElementById('aitTypingMsg');
        if (el) el.remove();
    }

    // ===== ONBOARDING FLOW =====
    function startOnboarding() {
        state.isOnboarding = true;
        state.onboardStep = 1;
        state.userData = { registered: new Date().toISOString(), streak: 0, totalMessages: 0, lastVisit: new Date().toISOString() };

        addMessage('ai', `${getGreeting()}! 👋\n\nMən sizin şəxsi ingilis dili müəlliminizəm. Sizi tanımaq istəyirəm ki, daha yaxşı kömək edə bilim.\n\n**Adınız nədir?**`);

        // Add name input
        const messagesEl = document.getElementById('aitMessages');
        if (messagesEl) {
            messagesEl.insertAdjacentHTML('beforeend', `
            <div class="ait-msg ai" id="aitOnboardName">
                <div class="ait-msg-avatar">🎓</div>
                <div class="ait-msg-content">
                    <div class="ait-onboard-input">
                        <input type="text" id="aitNameInput" placeholder="Adınızı yazın..." maxlength="30">
                        <button onclick="window._aitSubmitName()">Davam →</button>
                    </div>
                </div>
            </div>`);
            messagesEl.scrollTop = messagesEl.scrollHeight;

            const nameInput = document.getElementById('aitNameInput');
            if (nameInput) {
                nameInput.focus();
                nameInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') window._aitSubmitName();
                });
            }
        }
    }

    window._aitSubmitName = function () {
        const input = document.getElementById('aitNameInput');
        if (!input) return;
        const name = input.value.trim();
        if (!name || name.length < 2) return;

        // Remove onboard input
        const el = document.getElementById('aitOnboardName');
        if (el) el.remove();

        state.userData.name = name;
        addMessage('user', name);

        // Ask for level
        state.onboardStep = 2;
        setTimeout(() => {
            addMessage('ai', `Xoş tanışlıq, **${esc(name)}**! 🎉\n\nİndi ingilis dili səviyyənizi seçin:`);

            const messagesEl = document.getElementById('aitMessages');
            if (messagesEl) {
                messagesEl.insertAdjacentHTML('beforeend', `
                <div class="ait-msg ai" id="aitOnboardLevel">
                    <div class="ait-msg-avatar">🎓</div>
                    <div class="ait-msg-content">
                        <div class="ait-level-grid">
                            <button class="ait-level-btn" onclick="window._aitSelectLevel('A1')">A1<span class="level-label">Başlanğıc</span></button>
                            <button class="ait-level-btn" onclick="window._aitSelectLevel('A2')">A2<span class="level-label">Əsas</span></button>
                            <button class="ait-level-btn" onclick="window._aitSelectLevel('B1')">B1<span class="level-label">Orta</span></button>
                            <button class="ait-level-btn" onclick="window._aitSelectLevel('B2')">B2<span class="level-label">Yuxarı-Orta</span></button>
                            <button class="ait-level-btn" onclick="window._aitSelectLevel('C1')">C1<span class="level-label">Təkmil</span></button>
                            <button class="ait-level-btn" onclick="window._aitSelectLevel('C2')">C2<span class="level-label">Peşəkar</span></button>
                        </div>
                    </div>
                </div>`);
                messagesEl.scrollTop = messagesEl.scrollHeight;
            }
        }, 600);
    };

    window._aitSelectLevel = function (level) {
        const el = document.getElementById('aitOnboardLevel');
        if (el) el.remove();

        state.userData.level = level;
        addMessage('user', level);

        // Ask for goal
        state.onboardStep = 3;
        setTimeout(() => {
            addMessage('ai', `Əla seçim! **${level}** səviyyəsi 📊\n\nSon sual — hədəfiniz nədir?`);

            const messagesEl = document.getElementById('aitMessages');
            if (messagesEl) {
                messagesEl.insertAdjacentHTML('beforeend', `
                <div class="ait-msg ai" id="aitOnboardGoal">
                    <div class="ait-msg-avatar">🎓</div>
                    <div class="ait-msg-content">
                        <div class="ait-goal-grid">
                            <button class="ait-goal-btn" onclick="window._aitSelectGoal('İmtahan')">📝 İmtahan</button>
                            <button class="ait-goal-btn" onclick="window._aitSelectGoal('İş / Karyera')">💼 İş / Karyera</button>
                            <button class="ait-goal-btn" onclick="window._aitSelectGoal('Səyahət')">✈️ Səyahət</button>
                            <button class="ait-goal-btn" onclick="window._aitSelectGoal('Ümumi inkişaf')">🎯 Ümumi inkişaf</button>
                        </div>
                    </div>
                </div>`);
                messagesEl.scrollTop = messagesEl.scrollHeight;
            }
        }, 600);
    };

    window._aitSelectGoal = function (goal) {
        const el = document.getElementById('aitOnboardGoal');
        if (el) el.remove();

        state.userData.goal = goal;
        addMessage('user', goal);

        // Complete onboarding
        state.isOnboarding = false;
        state.onboardStep = 0;
        saveData();

        setTimeout(() => {
            const name = state.userData.name;
            addMessage('ai',
                `Mükəmməl, **${esc(name)}**! 🚀\n\nSizin profiliniz hazırdır:\n• Səviyyə: **${state.userData.level}**\n• Hədəf: **${state.userData.goal}**\n\nİndi mənə istənilən sualınızı verə bilərsiniz! Necə kömək edə bilərəm?`,
                [
                    { icon: '📚', label: 'Qrammatika', onclick: "window._aitQuick('Qrammatika mövzusu izah et')" },
                    { icon: '📝', label: 'Söz öyrən', onclick: "window._aitQuick('Yeni söz öyrət')" },
                    { icon: '🎯', label: 'Test keç', href: 'test.html' }
                ]
            );
        }, 800);
    };

    // ===== GENERATE CONTEXT-AWARE ACTIONS =====
    function getContextActions(intent) {
        const actions = [];
        if (!intent) return actions;

        const cfg = INTENTS[intent];
        if (cfg && cfg.link) {
            const labels = {
                grammar: 'Qrammatika Testləri',
                vocabulary: 'Günün Sözü',
                pronunciation: 'Danışıq Praktikası',
                exam: 'Səviyyə Testi',
                writing: 'Resurslar',
                speaking: 'Danışıq Praktikası',
                technical: 'Əlaqə',
                pricing: 'Qiymətlər'
            };
            actions.push({ icon: cfg.icon, label: labels[intent] || intent, href: cfg.link });
        }

        // Add practice action
        if (['grammar', 'vocabulary', 'exam'].includes(intent)) {
            actions.push({ icon: '📝', label: 'Məşq Et', onclick: `window._aitQuick('${intent} ilə bağlı məşq sualı ver')` });
        }

        return actions;
    }

    // ===== MAIN SEND HANDLER =====
    async function handleSend() {
        const input = document.getElementById('aitInput');
        const sendBtn = document.getElementById('aitSendBtn');
        if (!input || state.isTyping) return;

        const text = input.value.trim();
        if (!text) return;

        // Update user stats
        if (state.userData) {
            state.userData.totalMessages = (state.userData.totalMessages || 0) + 1;
            state.userData.lastVisit = new Date().toISOString();
        }

        // Add user message
        addMessage('user', text);
        input.value = '';
        input.disabled = true;
        if (sendBtn) sendBtn.disabled = true;

        // Show typing
        showTyping();

        // Detect intent for action buttons
        const intent = detectIntent(text);

        // Call API
        const reply = await callAPI(text);

        // Hide typing, show response
        hideTyping();
        const actions = getContextActions(intent);
        addMessage('ai', reply, actions);

        // Re-enable input
        input.disabled = false;
        if (sendBtn) sendBtn.disabled = false;
        input.focus();
    }

    // ===== QUICK MESSAGE =====
    window._aitQuick = function (msg) {
        const input = document.getElementById('aitInput');
        if (input) {
            input.value = msg;
            handleSend();
        }
    };

    // ===== RENDER WELCOME / RESTORE HISTORY =====
    function renderWelcome() {
        const messagesEl = document.getElementById('aitMessages');
        if (!messagesEl) return;

        messagesEl.innerHTML = '';

        if (state.userData && state.userData.name) {
            // Returning user
            const name = state.userData.name;
            const level = state.userData.level || '?';
            const streak = state.userData.streak || 0;

            // Restore last few messages
            if (state.chatHistory.length > 0) {
                const recent = state.chatHistory.slice(-8);
                for (const msg of recent) {
                    const formattedContent = msg.role === 'ai' ? formatResponse(msg.content) : esc(msg.content);
                    messagesEl.insertAdjacentHTML('beforeend', `
                    <div class="ait-msg ${msg.role}">
                        <div class="ait-msg-avatar">${msg.role === 'ai' ? '🎓' : '👤'}</div>
                        <div class="ait-msg-content">
                            <div class="ait-msg-bubble">${formattedContent}</div>
                        </div>
                    </div>`);
                }
            }

            // Welcome back message
            addMessage('ai',
                `${getGreeting()}, **${esc(name)}**! 👋\n\nSəviyyə: **${level}** ${streak > 0 ? `🔥 ${streak} günlük sıra!` : ''}\n\nBugün sizə necə kömək edə bilərəm?`,
                [
                    { icon: '📚', label: 'Qrammatika', onclick: "window._aitQuick('Qrammatika mövzusu izah et')" },
                    { icon: '📝', label: 'Söz öyrən', onclick: "window._aitQuick('Yeni söz öyrət')" },
                    { icon: '🎯', label: 'Test Keç', href: 'test.html' },
                    { icon: '💡', label: 'Məsləhət', onclick: "window._aitQuick('İngilis dili öyrənmək üçün məsləhət ver')" }
                ]
            );
        } else {
            // New user — show welcome screen then onboarding
            messagesEl.insertAdjacentHTML('beforeend', `
            <div class="ait-welcome">
                <div class="ait-welcome-icon">🎓</div>
                <h3>AI Müəlliminiz</h3>
                <p>İngilis dili ilə bağlı istənilən sualınızı soruşun — qrammatika, söz, tələffüz, test hazırlığı və daha çox!</p>
            </div>`);

            addMessage('ai', `Salam! 👋\n\nMən sizin şəxsi ingilis dili müəlliminizəm. Sizi tanıyaq?`);

            // Quick start options
            const qs = `
            <div class="ait-msg ai" id="aitQuickStartBlock">
                <div class="ait-msg-avatar">🎓</div>
                <div class="ait-msg-content">
                    <div class="ait-quick-start">
                        <button class="ait-quick-start-btn" onclick="window._aitStartOnboard()">✨ Başlayaq — Tanışlıq (30 san)</button>
                        <button class="ait-quick-start-btn" onclick="window._aitSkipOnboard()">⏭ Daha sonra — Birbaşa sual ver</button>
                    </div>
                </div>
            </div>`;
            messagesEl.insertAdjacentHTML('beforeend', qs);
            messagesEl.scrollTop = messagesEl.scrollHeight;
        }
    }

    window._aitStartOnboard = function () {
        const el = document.getElementById('aitQuickStartBlock');
        if (el) el.remove();
        startOnboarding();
    };

    window._aitSkipOnboard = function () {
        const el = document.getElementById('aitQuickStartBlock');
        if (el) el.remove();
        state.userData = { name: 'Qonaq', level: 'A2', goal: 'Ümumi', registered: new Date().toISOString(), streak: 0, totalMessages: 0 };
        saveData();
        addMessage('ai', 'Problem deyil! İstənilən vaxt tanışlığı tamamlaya bilərsiniz. 😊\n\nİndi mənə sualınızı verə bilərsiniz!');
    };

    // ===== CLEAR CHAT =====
    function clearChat() {
        if (!confirm('Söhbət tarixçəsi silinsin?')) return;
        state.chatHistory = [];
        state.apiHistory = [];
        saveData();
        renderWelcome();
    }

    // ===== TOGGLE WIDGET =====
    function toggleWidget() {
        const widget = document.getElementById('aiTeacherWidget');
        if (!widget) return;

        state.isOpen = !state.isOpen;
        widget.classList.toggle('open', state.isOpen);

        if (state.isOpen) {
            // Hide notification dot
            const dot = document.getElementById('aitNotifDot');
            if (dot) dot.style.display = 'none';

            // Focus input
            setTimeout(() => {
                const input = document.getElementById('aitInput');
                if (input) input.focus();
            }, 400);
        }
    }

    // ===== BIND EVENTS =====
    function bindEvents() {
        // Toggle button
        const toggleBtn = document.getElementById('aiTeacherToggle');
        if (toggleBtn) toggleBtn.addEventListener('click', toggleWidget);

        // Minimize button
        const minBtn = document.getElementById('aitMinBtn');
        if (minBtn) minBtn.addEventListener('click', toggleWidget);

        // Clear button
        const clearBtn = document.getElementById('aitClearBtn');
        if (clearBtn) clearBtn.addEventListener('click', clearChat);

        // Send button
        const sendBtn = document.getElementById('aitSendBtn');
        if (sendBtn) sendBtn.addEventListener('click', handleSend);

        // Input enter key
        const input = document.getElementById('aitInput');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                }
            });
        }

        // Quick action buttons
        const quickBar = document.getElementById('aitQuickBar');
        if (quickBar) {
            quickBar.addEventListener('click', (e) => {
                const btn = e.target.closest('.ait-quick-btn');
                if (btn && btn.dataset.q) {
                    window._aitQuick(btn.dataset.q);
                }
            });
        }

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && state.isOpen) {
                toggleWidget();
            }
        });
    }

    // ===== INIT =====
    function init() {
        loadData();
        injectWidget();
        bindEvents();
        renderWelcome();

        // Update streak on visit
        if (state.userData) {
            const today = new Date().toDateString();
            const lastVisit = state.userData.lastVisit ? new Date(state.userData.lastVisit).toDateString() : null;
            if (lastVisit && lastVisit !== today) {
                const yesterday = new Date(Date.now() - 86400000).toDateString();
                if (lastVisit === yesterday) {
                    state.userData.streak = (state.userData.streak || 0) + 1;
                } else {
                    state.userData.streak = 1;
                }
            }
            state.userData.lastVisit = new Date().toISOString();
            saveData();
        }
    }

    // ===== AUTO-INIT =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
