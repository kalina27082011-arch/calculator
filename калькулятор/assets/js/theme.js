const THEME_STORAGE_KEY = 'family-budget-theme';

function applyTheme(theme) {
    const htmlElement = document.documentElement;
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    const isLight = theme === 'light';

    htmlElement.setAttribute('data-theme', theme);

    if (themeToggleBtn) {
        const themeIcon = themeToggleBtn.querySelector('.theme-toggle__icon');
        if (themeIcon) {
            themeIcon.textContent = isLight ? '🌙' : '☀️';
        }
        themeToggleBtn.setAttribute(
            'aria-label',
            isLight ? 'Переключить на тёмную тему' : 'Переключить на светлую тему'
        );
        themeToggleBtn.title = isLight ? 'Тёмная тема' : 'Светлая тема';
    }

    if (themeColorMeta) {
        themeColorMeta.content = isLight ? '#f0f9ff' : '#0f172a';
    }

    localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function initTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme === 'light' || savedTheme === 'dark') {
        applyTheme(savedTheme);
        return;
    }

    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    applyTheme(prefersLight ? 'light' : 'dark');
}

function setupThemeToggle() {
    const themeToggleBtn = document.getElementById('themeToggle');
    if (!themeToggleBtn) return;

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
}

initTheme();
setupThemeToggle();
