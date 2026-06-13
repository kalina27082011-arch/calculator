const BUDGET_STORAGE_KEY = 'family-budget-data';

const EXPENSE_CATEGORIES = [
    { value: 'housing', label: 'Жильё' },
    { value: 'food', label: 'Еда' },
    { value: 'transport', label: 'Транспорт' },
    { value: 'entertainment', label: 'Развлечения' },
    { value: 'other', label: 'Прочее' }
];

function categoryOptions(selected = 'other') {
    return EXPENSE_CATEGORIES.map(
        (cat) =>
            `<option value="${cat.value}"${cat.value === selected ? ' selected' : ''}>${cat.label}</option>`
    ).join('');
}

function createIncomeRow(name = '', amount = '') {
    const row = document.createElement('div');
    row.className = 'item';
    row.innerHTML = `
        <input type="text" class="income-name" placeholder="Источник дохода" value="${escapeAttr(name)}">
        <input type="number" class="amount income" placeholder="Сумма" value="${escapeAttr(amount)}" min="0" step="any">
        <button type="button" class="remove-btn" aria-label="Удалить">✖</button>
    `;
    row.querySelector('.remove-btn').addEventListener('click', () => removeRow(row));
    return row;
}

function createExpenseRow(name = '', amount = '', type = 'fixed', category = 'other') {
    const row = document.createElement('div');
    row.className = 'item';
    row.innerHTML = `
        <input type="text" class="expense-name" placeholder="Статья расхода" value="${escapeAttr(name)}">
        <input type="number" class="amount expense" placeholder="Сумма" value="${escapeAttr(amount)}" min="0" step="any">
        <select class="expense-type">
            <option value="fixed"${type === 'fixed' ? ' selected' : ''}>Обязательный</option>
            <option value="variable"${type === 'variable' ? ' selected' : ''}>Переменный</option>
        </select>
        <select class="expense-category">${categoryOptions(category)}</select>
        <button type="button" class="remove-btn" aria-label="Удалить">✖</button>
    `;
    row.querySelector('.remove-btn').addEventListener('click', () => removeRow(row));
    return row;
}

function escapeAttr(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;');
}

function addIncome(data = {}) {
    document.getElementById('incomeContainer').appendChild(
        createIncomeRow(data.name, data.amount)
    );
    attachEvents();
}

function addExpense(data = {}) {
    document.getElementById('expenseContainer').appendChild(
        createExpenseRow(data.name, data.amount, data.type, data.category)
    );
    attachEvents();
}

function removeRow(row) {
    row.remove();
    calculate();
}

function attachEvents() {
    document.querySelectorAll('input, select').forEach((el) => {
        el.removeEventListener('input', onInputChange);
        el.removeEventListener('change', onInputChange);
        el.addEventListener('input', onInputChange);
        el.addEventListener('change', onInputChange);
    });
}

function onInputChange() {
    calculate();
}

function formatMoney(value) {
    return value.toLocaleString('ru-RU') + ' ₽';
}

function collectData() {
    const incomes = [];
    document.querySelectorAll('#incomeContainer .item').forEach((row) => {
        incomes.push({
            name: row.querySelector('.income-name').value,
            amount: row.querySelector('.income').value
        });
    });

    const expenses = [];
    document.querySelectorAll('#expenseContainer .item').forEach((row) => {
        expenses.push({
            name: row.querySelector('.expense-name').value,
            amount: row.querySelector('.expense').value,
            type: row.querySelector('.expense-type').value,
            category: row.querySelector('.expense-category').value
        });
    });

    const savingsGoal = Number(document.getElementById('savingsGoal').value) || 0;

    return { incomes, expenses, savingsGoal };
}

function saveBudget() {
    localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(collectData()));
}

function loadBudget() {
    const raw = localStorage.getItem(BUDGET_STORAGE_KEY);
    if (!raw) return false;

    try {
        const data = JSON.parse(raw);
        renderBudget(data);
        return true;
    } catch {
        return false;
    }
}

function renderBudget(data) {
    const incomeContainer = document.getElementById('incomeContainer');
    const expenseContainer = document.getElementById('expenseContainer');

    incomeContainer.innerHTML = '';
    expenseContainer.innerHTML = '';

    const incomes = data.incomes?.length ? data.incomes : [{}];
    const expenses = data.expenses?.length ? data.expenses : [{}];

    incomes.forEach((item) => addIncome(item));
    expenses.forEach((item) => addExpense(item));

    document.getElementById('savingsGoal').value = data.savingsGoal ?? 20;
}

function calculate() {
    let totalIncome = 0;
    let fixedExpenses = 0;
    let variableExpenses = 0;

    document.querySelectorAll('.income').forEach((item) => {
        totalIncome += Number(item.value) || 0;
    });

    document.querySelectorAll('#expenseContainer .item').forEach((row) => {
        const value = Number(row.querySelector('.expense').value) || 0;
        const type = row.querySelector('.expense-type').value;

        if (type === 'fixed') {
            fixedExpenses += value;
        } else {
            variableExpenses += value;
        }
    });

    const totalExpenses = fixedExpenses + variableExpenses;
    const savings = totalIncome - totalExpenses;
    const savingsPercent = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : 0;
    const savingsGoal = Number(document.getElementById('savingsGoal').value) || 0;

    document.getElementById('totalIncome').textContent = formatMoney(totalIncome);
    document.getElementById('fixedExpenses').textContent = formatMoney(fixedExpenses);
    document.getElementById('variableExpenses').textContent = formatMoney(variableExpenses);
    document.getElementById('totalExpenses').textContent = formatMoney(totalExpenses);
    document.getElementById('savings').textContent = formatMoney(savings);
    document.getElementById('savingsPercent').textContent = savingsPercent + '%';

    updateStatus(savings);
    updateGoalHint(Number(savingsPercent), savingsGoal);
    updateChart(totalIncome, fixedExpenses, variableExpenses, savings);
    saveBudget();
}

function updateStatus(savings) {
    const status = document.getElementById('status');

    if (savings > 0) {
        status.textContent = '✅ Бюджет профицитный. Вы откладываете деньги.';
        status.className = 'status positive';
    } else if (savings < 0) {
        status.textContent = '⚠️ Расходы превышают доходы.';
        status.className = 'status negative';
    } else {
        status.textContent = 'ℹ️ Доходы равны расходам.';
        status.className = 'status';
    }
}

function updateGoalHint(currentPercent, goal) {
    const hint = document.getElementById('goalHint');

    if (goal <= 0) {
        hint.textContent = 'Укажите цель накоплений в процентах от дохода.';
        hint.className = 'goal-hint';
        return;
    }

    const diff = (currentPercent - goal).toFixed(1);

    if (currentPercent >= goal) {
        hint.textContent = `🎯 Цель ${goal}% достигнута! Сейчас вы откладываете ${currentPercent}%.`;
        hint.className = 'goal-hint positive';
    } else {
        hint.textContent = `📉 До цели ${goal}% не хватает ${Math.abs(diff)} п.п. (сейчас ${currentPercent}%).`;
        hint.className = 'goal-hint negative';
    }
}

function updateChart(totalIncome, fixed, variable, savings) {
    const chart = document.getElementById('chartBars');

    if (totalIncome <= 0 && fixed <= 0 && variable <= 0) {
        chart.innerHTML = '<div class="chart-empty">Добавьте доходы и расходы, чтобы увидеть диаграмму</div>';
        return;
    }

    const base = totalIncome > 0 ? totalIncome : fixed + variable + Math.max(savings, 0);
    const rows = [
        { label: 'Обязательные', value: fixed, className: 'chart-fill--fixed' },
        { label: 'Переменные', value: variable, className: 'chart-fill--variable' },
        { label: 'Накопления', value: Math.max(savings, 0), className: 'chart-fill--savings' }
    ];

    chart.innerHTML = rows
        .map(
            (row) => `
        <div class="chart-row">
            <span class="chart-label">${row.label}</span>
            <div class="chart-track">
                <div class="chart-fill ${row.className}" style="width: ${base > 0 ? (row.value / base) * 100 : 0}%"></div>
            </div>
            <span class="chart-value">${formatMoney(row.value)}</span>
        </div>
    `
        )
        .join('');
}

function exportBudget() {
    const data = collectData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `budget-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

function importBudget(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            renderBudget(data);
            calculate();
        } catch {
            alert('Не удалось прочитать файл. Проверьте формат JSON.');
        }
    };
    reader.readAsText(file);
}

function clearBudget() {
    if (!confirm('Очистить все данные бюджета?')) return;

    localStorage.removeItem(BUDGET_STORAGE_KEY);
    renderBudget({ incomes: [{}], expenses: [{}], savingsGoal: 20 });
    calculate();
}

function initCalculator() {
    document.getElementById('addIncomeBtn').addEventListener('click', () => addIncome());
    document.getElementById('addExpenseBtn').addEventListener('click', () => addExpense());
    document.getElementById('exportBtn').addEventListener('click', exportBudget);
    document.getElementById('clearBtn').addEventListener('click', clearBudget);
    document.getElementById('printBtn').addEventListener('click', () => window.print());

    document.getElementById('importInput').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) importBudget(file);
        event.target.value = '';
    });

    if (!loadBudget()) {
        renderBudget({ incomes: [{}], expenses: [{}], savingsGoal: 20 });
    }

    attachEvents();
    calculate();
}

initCalculator();
