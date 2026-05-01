// ===== MULTILINGUAL i18n SYSTEM =====

let currentLang = 'az';
let translations = {};

// ===== Inline fallback translations =====
const INLINE_TRANSLATIONS = {
    az: {
        nav: { home: "Ana Səhifə", daily: "Günün Sözü", speaking: "Danışıq Praktikası", test: "Səviyyə Testi", resources: "Resurslar", learningPath: "Öyrənmə Yolu", pricing: "Qiymətlər", contact: "Əlaqə", favorites: "❤️ Sevimlilər", dashboard: "📊 Dashboard", admin: "👑 Admin Panel", logout: "🚪 Çıxış", login: "Daxil Ol" },
        hero: { title: "İngilis Dilini <span class=\"gradient-text\">Peşəkar</span> Səviyyədə Öyrən", subtitle: "A1-dən C2-yə qədər strukturlu proqram, gündəlik canlı dərslər və 13,000+ aktiv tələbə ilə öyrənmə səyahətinə başlayın", btnStart: "Pulsuz Başla", btnPlans: "Premium Planlara Bax", statStudents: "Aktiv Tələbə", statLessons: "Dərs Materialu", statSatisfaction: "% Məmnuniyyət" },
        features: { title: "Niyə Alielenglish?", daily: "Gündəlik Dərslər", dailyDesc: "Hər gün yeni söz, ifadə və qrammatika qaydaları ilə davamlı təlim", program: "Strukturlu Proqram", programDesc: "A1-dən C2-yə qədər CEFR standartlarına uyğun mərhələli öyrənmə", support: "Canlı Dəstək", supportDesc: "Suallarınıza 24/7 cavab və mentor dəstəyi ilə heç vaxt tək deyilsiniz" },
        cta: { title: "Daha Gözləməyin - İndi Başlayın!", subtitle: "İlk 100 qeydiyyatçıya <strong>50% endirim</strong> və <strong>pulsuz</strong> bonus material paketimiz", btnRegister: "Qeydiyyatdan Keç" },
        footer: { about: "2023-dən bəri minlərlə tələbəyə keyfiyyətli ingilis dili təhsili təqdim edirik.", links: "Keçidlər", support: "Dəstək", newsletter: "Xəbər Bülleteni", newsletterDesc: "Gündəlik dərs və xüsusi təkliflərdən xəbərdar olun", btnSubscribe: "Abunə Ol", rights: "© 2026 Alielenglish. Bütün hüquqlar qorunur." },
        modal: { welcome: "🎉 Xoş gəlmisiniz!", subtitle: "Pulsuz e-kitab və bonus materiallar əldə etmək üçün qeydiyyatdan keçin", inputName: "Adınız", inputEmail: "Email ünvanınız", btnSend: "Göndər", privacy: "🔒 Məlumatlarınız təhlükəsizdir və paylaşılmır" },
        contact: { title: "📧 Bizimlə Əlaqə", subtitle: "Suallarınız varmı? Bizə yazın və ya sosial mediadan izləyin. 24 saat ərzində cavab veririk!", formTitle: "✍️ Mesaj Göndər", formDesc: "Formu doldurun və biz sizinlə ən qısa müddətdə əlaqə saxlayacağıq", labelName: "Ad və Soyad *", labelEmail: "Email *", labelPhone: "Telefon", labelSubject: "Mövzu *", labelMessage: "Mesajınız *", selectSubject: "Seçin...", subjectGeneral: "Ümumi sual", subjectTechnical: "Texniki dəstək", subjectPayment: "Ödəniş məsələsi", subjectCourse: "Kurs haqqında", subjectPartnership: "Əməkdaşlıq", subjectOther: "Digər", checkboxPrivacy: "Məxfilik Siyasətini oxudum və qəbul edirəm", btnSend: "Göndər", successMessage: "✅ Mesajınız uğurla göndərildi! Tezliklə sizinlə əlaqə saxlayacağıq.", socialMedia: "Sosial Media", emailTitle: "Email", workHours: "İş Saatları", address: "Ünvan" },
        daily: { title: "📅 Günün Sözü", subtitle: "Hər gün yeni söz öyrənin və lüğət ehtiyatınızı artırın", translation: "Tərcümə:", definition: "Təyinat:", examples: "Nümunə cümlələr:", synonyms: "Sinonimlər:", btnAudio: "🔊 Səsləndirmə", btnFavorite: "❤️ Sevimlilərə Əlavə Et", btnShare: "📤 Paylaş", wordsLearned: "Öyrənilmiş Söz", currentStreak: "Günlük Sıra", favoriteCount: "Sevimli Söz", archive: "📚 Arxiv", archiveSubtitle: "Əvvəlki günlərin sözlərinə baxın", filterAll: "Hamısı", filterFavorites: "❤️ Sevimlilər", btnLoadMore: "Daha Çox Yüklə" },
        speaking: { title: "🎙️ Danışıq Praktikası", subtitle: "Süni intellekt köməyi ilə tələffüzünüzü sıfır xəta və pulsuz olaraq inkişaf etdirin.", instructions: "Aşağıdakı cümləni oxumaq üçün mikrofon düyməsini basın. Alqoritm tələffüzünüzü yoxlayacaq.", btnStart: "Danışmağa Başla", listening: "Dinlənilir...", yourVoice: "Sizin səsiniz:", accuracy: "Uyğunluq:" },
        test: { title: "🎯 İngilis Dili Səviyyə Testi", subtitle: "CEFR standartlarına uyğun testlərimiz ilə öz səviyyənizi dəqiq təyin edin", selectLevel: "Səviyyənizi Seçin", btnStart: "Başla", btnPrevious: "← Əvvəlki", btnNext: "Növbəti →", btnRestart: "Yenidən Test Keç", congratulations: "Təbriklər!", yourLevel: "Sizin səviyyəniz:", aiTitle: "🤖 AI Köməkçi", aiWelcome: "Salam! Mən sizin ingilis dili köməkçinizəm. Necə kömək edə bilərəm?", aiPlaceholder: "Sualınızı yazın...", aiSend: "Göndər", aiDailyBadge: "AI GÜNÜN TESTİ 🤖", aiDailyTitle: "Günün Testi", aiDailyDesc: "Süni intellekt tərəfindən bugünün spesifik seçilmiş sualları", aiDailyF1: "✓ 5 fərqli sual", aiDailyF2: "✓ 5 dəqiqə", aiDailyF3: "✓ Hər gün yenilənir", beginner: "Başlanğıc", basic: "Əsas", intermediate: "Orta", upperIntermediate: "Yuxarı-Orta", advanced: "Təkmil", proficiency: "Peşəkar" },
        resources: { title: "📚 Öyrənmə Resursları", subtitle: "Pulsuz və premium resurslarımızla öz tempinizdə öyrənin.", filterAll: "Hamısı", filterFree: "Pulsuz", filterPremium: "Premium", filterPdf: "PDF", filterVideo: "Video", badgeFree: "PULSUZ", badgePremium: "PREMIUM", btnDownload: "Pulsuz Yüklə", btnGetPremium: "Premium Al", downloads: "yükləmə" },
        pricing: { title: "Sizə Uyğun Planı Seçin", subtitle: "Hər səviyyə və büdcə üçün ideal həll.", monthly: "Aylıq", yearly: "İllik", saveBadge: "20% QƏNAƏT", planFree: "Pulsuz", planPremium: "Premium", planProfessional: "Professional", perMonth: "/ ay", perYear: "/ il", feature1: "Günün sözü", feature2: "Səviyyə testi", feature3: "Əsas qrammatika", btnStart: "Başla", btnSelect: "Seç", faqTitle: "❓ Tez-tez Verilən Suallar", mostPopular: "ƏN POPULYAR" },
        testimonials: { badge: "⭐ Rəylər", title: "İstifadəçilərimiz Nə Deyir?", subtitle: "Platformamızı sınaqdan keçirənlərin fikirləri", quote1: '"Günün sözü funksiyası çox xoşuma gəldi! Hər gün yeni söz öyrənirəm, tələffüz dinləyirəm. Çox faydalı platformadır."', quote2: '"Səviyyə testi ilə öz səviyyəmi öyrəndim. AI müəllim suallarıma anında cavab verir. Pulsuz olması da əladır!"', quote3: '"Danışıq praktikası ilə tələffüzümü yoxladım, çox maraqlı texnologiyadır. Dostlarıma da tövsiyə etdim."', quote4: '"Resurslar bölməsindəki PDF materiallar çox keyfiyyətlidir. Platformanın dizaynı da göz oxşayır."', quote5: '"AI ilə cümlə yoxlama xüsusiyyəti çox yaradıcıdır. Yazdığım cümləyə anında qrammatika feedback-i alıram."', role1: "İstifadəçi", role2: "İstifadəçi", role3: "İstifadəçi", role4: "İstifadəçi", role5: "İstifadəçi" },
        aiPractice: { badge: "🤖 AI Pratik", title: "Cümlə Yaz, AI Yoxlasın!", subtitle: "Günün sözünü istifadə edərək cümlə yazın və AI-dən feedback alın", cardTitle: "AI Cümlə Yoxlama", cardDesc: "Günün sözünü istifadə edərək ingilis dilində cümlə yazın", hint: "Bu sözü istifadə edərək cümlə yazın", placeholder: "Məsələn: She accomplished her dream of becoming a doctor.", btnCheck: "🤖 AI ilə Yoxla", btnChecking: "⏳ Yoxlanılır...", feedbackTitle: "🤖 AI Müəllim Rəyi", grammar: "Qrammatika", usage: "Söz İstifadəsi", spelling: "Orfoqrafiya", overall: "Ümumi Bal", excellent: "Əla", good: "Yaxşı", needsWork: "Təkmilləşdirmə lazımdır", grammarOk: "Qrammatika baxımından düzgün görünür!", startCapital: "Cümlə böyük hərflə başlamalıdır.", endPunct: "Cümlə nöqtə, nida və ya sual işarəsi ilə bitməlidir.", longerSentence: "Daha uzun cümlə qurmağa çalışın.", wordUsedWell: "Əla! Sözü kontekstdə çox yaxşı istifadə etmisiniz.", wordUsedOk: "Sözü düzgün istifadə etmisiniz. Daha geniş kontekst əlavə edin.", wordNotUsed: "sözünü cümlənizdə istifadə etməmisiniz. Zəhmət olmasa yenidən cəhd edin.", noSpellingErrors: "Heç bir orfoqrafiya xətası tapılmadı!", corrections: "Düzəlişlər:", tipExcellent: "Əla iş! Cümləni dostunuzla paylaşın. 🎉", tipGood: "Yaxşı cəhd! Aşağıdakı tövsiyələrə baxın və yenidən yoxlayın.", tipTryAgain: "sözünü daxil edərək yeni bir cümlə yazın." }
    },
    en: {
        nav: { home: "Home", daily: "Word of the Day", speaking: "Speaking Practice", test: "Level Test", resources: "Resources", learningPath: "Learning Path", pricing: "Pricing", contact: "Contact", favorites: "\u2764\ufe0f Favorites", dashboard: "\ud83d\udcca Dashboard", admin: "\ud83d\udc51 Admin Panel", logout: "\ud83d\udeaa Logout", login: "Login" },
        hero: { title: "Learn English at a <span class=\"gradient-text\">Professional</span> Level", subtitle: "Start your learning journey with a structured program from A1 to C2, daily live lessons and 13,000+ active students", btnStart: "Start Free", btnPlans: "View Premium Plans", statStudents: "Active Students", statLessons: "Lesson Materials", statSatisfaction: "% Satisfaction" },
        features: { title: "Why Alielenglish?", daily: "Daily Lessons", dailyDesc: "Continuous training with new words, phrases and grammar rules every day", program: "Structured Program", programDesc: "Staged learning according to CEFR standards from A1 to C2", support: "Live Support", supportDesc: "You are never alone with 24/7 answers to your questions and mentor support" },
        cta: { title: "Don't Wait - Start Now!", subtitle: "For the first 100 registrants <strong>50% discount</strong> and <strong>free</strong> bonus material package", btnRegister: "Register" },
        footer: { about: "Since 2023, we have been providing quality English education to thousands of students.", links: "Links", support: "Support", newsletter: "Newsletter", newsletterDesc: "Stay informed about daily lessons and special offers", btnSubscribe: "Subscribe", rights: "© 2026 Alielenglish. All rights reserved." },
        modal: { welcome: "🎉 Welcome!", subtitle: "Register to get a free e-book and bonus materials", inputName: "Your Name", inputEmail: "Your Email", btnSend: "Send", privacy: "🔒 Your information is secure and not shared" },
        contact: { title: "📧 Contact Us", subtitle: "Have questions? Write to us or follow us on social media. We respond within 24 hours!", formTitle: "✍️ Send Message", formDesc: "Fill out the form and we will contact you as soon as possible", labelName: "Full Name *", labelEmail: "Email *", labelPhone: "Phone", labelSubject: "Subject *", labelMessage: "Your Message *", selectSubject: "Select...", subjectGeneral: "General question", subjectTechnical: "Technical support", subjectPayment: "Payment issue", subjectCourse: "About the course", subjectPartnership: "Partnership", subjectOther: "Other", checkboxPrivacy: "I have read and agree to the Privacy Policy", btnSend: "Send", successMessage: "✅ Your message has been sent successfully! We will contact you soon.", socialMedia: "Social Media", emailTitle: "Email", workHours: "Working Hours", address: "Address" },
        daily: { title: "📅 Word of the Day", subtitle: "Learn a new word every day and expand your vocabulary", translation: "Translation:", definition: "Definition:", examples: "Example sentences:", synonyms: "Synonyms:", btnAudio: "🔊 Listen", btnFavorite: "❤️ Add to Favorites", btnShare: "📤 Share", wordsLearned: "Words Learned", currentStreak: "Daily Streak", favoriteCount: "Favorite Words", archive: "📚 Archive", archiveSubtitle: "Browse previous words", filterAll: "All", filterFavorites: "❤️ Favorites", btnLoadMore: "Load More" },
        speaking: { title: "🎙️ Speaking Practice", subtitle: "Develop your pronunciation with AI assistance, error-free and free.", instructions: "Press the microphone button to read the sentence below. The algorithm will check your pronunciation.", btnStart: "Start Speaking", listening: "Listening...", yourVoice: "Your voice:", accuracy: "Accuracy:" },
        test: { title: "🎯 English Level Test", subtitle: "Determine your exact level with our CEFR standard tests", selectLevel: "Select Your Level", btnStart: "Start", btnPrevious: "← Previous", btnNext: "Next →", btnRestart: "Retake Test", congratulations: "Congratulations!", yourLevel: "Your level:", aiTitle: "🤖 AI Assistant", aiWelcome: "Hello! I'm your English learning assistant. How can I help you?", aiPlaceholder: "Type your question...", aiSend: "Send", aiDailyBadge: "AI DAILY TEST 🤖", aiDailyTitle: "Daily Test", aiDailyDesc: "Today's specifically selected questions by artificial intelligence", aiDailyF1: "✓ 5 different questions", aiDailyF2: "✓ 5 minutes", aiDailyF3: "✓ Updated daily", beginner: "Beginner", basic: "Basic", intermediate: "Intermediate", upperIntermediate: "Upper-Intermediate", advanced: "Advanced", proficiency: "Proficiency" },
        resources: { title: "📚 Learning Resources", subtitle: "Learn at your own pace with our free and premium resources.", filterAll: "All", filterFree: "Free", filterPremium: "Premium", filterPdf: "PDF", filterVideo: "Video", badgeFree: "FREE", badgePremium: "PREMIUM", btnDownload: "Download Free", btnGetPremium: "Get Premium", downloads: "downloads" },
        pricing: { title: "Choose Your Plan", subtitle: "The ideal solution for every level and budget.", monthly: "Monthly", yearly: "Yearly", saveBadge: "SAVE 20%", planFree: "Free", planPremium: "Premium", planProfessional: "Professional", perMonth: "/ month", perYear: "/ year", feature1: "Word of the day", feature2: "Level test", feature3: "Basic grammar", btnStart: "Start", btnSelect: "Select", faqTitle: "❓ Frequently Asked Questions", mostPopular: "MOST POPULAR" },
        testimonials: { badge: "⭐ Reviews", title: "What Our Users Say?", subtitle: "Feedback from people who tried our platform", quote1: '"I love the Word of the Day feature! I learn a new word every day, listen to pronunciation. Very useful platform."', quote2: '"I found out my level with the level test. The AI teacher answers my questions instantly. Being free is also great!"', quote3: '"I checked my pronunciation with speaking practice, very interesting technology. I recommended it to my friends too."', quote4: '"The PDF materials in the resources section are high quality. The platform design is also eye-catching."', quote5: '"The AI sentence checking feature is very creative. I get instant grammar feedback on my sentences."', role1: "User", role2: "User", role3: "User", role4: "User", role5: "User" },
        aiPractice: { badge: "🤖 AI Practice", title: "Write a Sentence, Let AI Check!", subtitle: "Write a sentence using the word of the day and get feedback from AI", cardTitle: "AI Sentence Checker", cardDesc: "Write a sentence in English using the word of the day", hint: "Write a sentence using this word", placeholder: "Example: She accomplished her dream of becoming a doctor.", btnCheck: "🤖 Check with AI", btnChecking: "⏳ Checking...", feedbackTitle: "🤖 AI Teacher Feedback", grammar: "Grammar", usage: "Word Usage", spelling: "Spelling", overall: "Overall Score", excellent: "Excellent", good: "Good", needsWork: "Needs improvement", grammarOk: "Grammar looks correct!", startCapital: "Sentence should start with a capital letter.", endPunct: "Sentence should end with a period, exclamation or question mark.", longerSentence: "Try to write a longer sentence.", wordUsedWell: "Excellent! You used the word in context very well.", wordUsedOk: "You used the word correctly. Try adding more context.", wordNotUsed: "word was not used in your sentence. Please try again.", noSpellingErrors: "No spelling errors found!", corrections: "Corrections:", tipExcellent: "Excellent work! Share the sentence with a friend. 🎉", tipGood: "Good attempt! Check the suggestions below and try again.", tipTryAgain: "word and write a new sentence." }
    }
};

// ===== Load Language =====
async function loadLanguage(lang) {
    // First try fetch (works on HTTP/HTTPS)
    try {
        const response = await fetch(`i18n/${lang}.json`);
        if (response.ok) {
            translations = await response.json();
            currentLang = lang;
            return true;
        }
    } catch (e) {
        // fetch failed (file:// protocol or network error) — use inline fallback
    }

    // Use inline fallback
    if (INLINE_TRANSLATIONS[lang]) {
        translations = INLINE_TRANSLATIONS[lang];
        currentLang = lang;
        return true;
    }

    return false;
}

// ===== Switch Language =====
async function switchLanguage(lang) {
    // Update HTML lang attribute
    document.documentElement.lang = lang;

    // Save to localStorage
    localStorage.setItem('selectedLanguage', lang);

    // Update current lang button text
    const currentLangBtn = document.getElementById('currentLangBtn');
    if (currentLangBtn) {
        currentLangBtn.textContent = lang.toUpperCase();
    }

    // Close dropdown
    const langMenu = document.getElementById('langMenu');
    if (langMenu) {
        langMenu.classList.remove('show');
    }

    // Load language file
    const loaded = await loadLanguage(lang);

    if (loaded) {
        translatePage();
    }
}

// ===== Translate Page =====
function translatePage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = getNestedTranslation(key);

        if (translation) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translation;
            } else {
                el.innerHTML = translation;
            }
        }
    });

    // Dil dəyişməsi hadisəsini dispatch et (digər skriptlər dinləyə bilsin)
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: currentLang } }));
}

// Qlobal olaraq əlçatan et
window.translatePage = translatePage;
window.getTranslation = getNestedTranslation;

// ===== Get Nested Translation (e.g., "nav.home") =====
function getNestedTranslation(key) {
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
        if (value && typeof value === 'object') {
            value = value[k];
        } else {
            return null;
        }
    }

    return value;
}

// ===== Get Translation (helper for JS) =====
function t(key, replacements = {}) {
    let translation = getNestedTranslation(key) || key;

    Object.keys(replacements).forEach(placeholder => {
        translation = translation.replace(`{${placeholder}}`, replacements[placeholder]);
    });

    return translation;
}

// ===== Initialize i18n on Page Load =====
async function initI18n() {
    const savedLang = localStorage.getItem('selectedLanguage') || 'az';

    await loadLanguage(savedLang);

    document.documentElement.lang = savedLang;

    // Update current lang button text
    const currentLangBtn = document.getElementById('currentLangBtn');
    if (currentLangBtn) {
        currentLangBtn.textContent = savedLang.toUpperCase();
    }

    translatePage();
}

// ===== Auto-init when DOM ready =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
} else {
    initI18n();
}