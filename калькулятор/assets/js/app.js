const VIEWS = {
    landing: {
        id: 'view-landing',
        title: 'Семейный бюджет — управляйте финансами просто'
    },
    calculator: {
        id: 'view-calculator',
        title: 'Калькулятор — Семейный бюджет'
    }
};

function showView(viewName) {
    if (!VIEWS[viewName]) return;

    Object.entries(VIEWS).forEach(([name, config]) => {
        const element = document.getElementById(config.id);
        if (!element) return;

        const isActive = name === viewName;
        element.classList.toggle('is-active', isActive);
        element.hidden = !isActive;
    });

    document.body.classList.toggle('landing-page', viewName === 'landing');

    document.querySelectorAll('[data-nav]').forEach((link) => {
        link.classList.toggle('is-active', link.dataset.nav === viewName);
    });

    document.title = VIEWS[viewName].title;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const url = viewName === 'calculator' ? '#calculator' : window.location.pathname;
    history.replaceState(null, '', url);
}

function initApp() {
    document.querySelectorAll('[data-show-view]').forEach((button) => {
        button.addEventListener('click', () => showView(button.dataset.showView));
    });

    document.querySelectorAll('[data-nav]').forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            showView(link.dataset.nav);
        });
    });

    if (window.location.hash === '#calculator') {
        showView('calculator');
    } else {
        showView('landing');
    }
}

initApp();
