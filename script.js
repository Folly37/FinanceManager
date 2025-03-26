
const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', function() {
    const state = {
        user: null,
        transactions: [],
        goals: [],
        notifications: []
    };

    const elements = {
        loginBtn: document.getElementById('loginBtn'),
        registerBtn: document.getElementById('registerBtn'),
        logoutBtn: document.getElementById('logoutBtn'),
        profileBtn: document.getElementById('profileBtn'),
        generatePdfBtn: document.getElementById('generatePdfBtn'),
        generateExcelBtn: document.getElementById('generateExcelBtn'),
        generateCsvBtn: document.getElementById('generateCsvBtn'),
        addTransactionBtn: document.getElementById('addTransactionBtn'),
        addTransactionBtn2: document.getElementById('addTransactionBtn2'),
        addGoalBtn: document.getElementById('addGoalBtn'),
        addGoalBtn2: document.getElementById('addGoalBtn2'),
        importTransactionsBtn: document.getElementById('importTransactionsBtn'),
        clearDataBtn: document.getElementById('clearDataBtn'),
        
        loginModal: document.getElementById('loginModal'),
        registerModal: document.getElementById('registerModal'),
        transactionModal: document.getElementById('transactionModal'),
        goalModal: document.getElementById('goalModal'),
        importModal: document.getElementById('importModal'),
        profileModal: document.getElementById('profileModal'),
        
        loginForm: document.getElementById('loginForm'),
        registerForm: document.getElementById('registerForm'),
        transactionForm: document.getElementById('transactionForm'),
        goalForm: document.getElementById('goalForm'),
        importForm: document.getElementById('importForm'),
        profileForm: document.getElementById('profileForm'),
        
        authButtons: document.getElementById('authButtons'),
        userProfile: document.getElementById('userProfile'),
        userAvatar: document.getElementById('userAvatar'),
        userDropdown: document.getElementById('userDropdown'),
        mainContent: document.getElementById('mainContent'),
        tabs: document.querySelectorAll('.tab'),
        tabContents: document.querySelectorAll('.tab-content'),
        transactionFilter: document.getElementById('transactionFilter'),
        reportPeriod: document.getElementById('reportPeriod'),
        customDateRange: document.getElementById('customDateRange'),
        startDate: document.getElementById('startDate'),
        endDate: document.getElementById('endDate'),
        importFile: document.getElementById('importFile'),
        fileName: document.getElementById('fileName'),
        totalBalance: document.getElementById('totalBalance'),
        totalIncome: document.getElementById('totalIncome'),
        totalExpense: document.getElementById('totalExpense'),
        recentTransactions: document.getElementById('recentTransactions'),
        allTransactions: document.getElementById('allTransactions'),
        activeGoals: document.getElementById('activeGoals'),
        goalsList: document.getElementById('goalsList'),
        notificationsList: document.getElementById('notifications'),
        recommendations: document.getElementById('recommendations'),
        expensesChart: document.getElementById('expensesChart'),
        incomeExpenseChart: document.getElementById('incomeExpenseChart')
    };

    let expensesChartInstance = null;
    let incomeExpenseChartInstance = null;

    function saveAllData() {
        if (state.user) {
            localStorage.setItem(`financialManagerData_${state.user.email}`, JSON.stringify({
                transactions: state.transactions,
                goals: state.goals,
                notifications: state.notifications
            }));
        }
    }

    function loadData() {
        if (!state.user) return;
        
        const savedData = localStorage.getItem(`financialManagerData_${state.user.email}`);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                if (data.transactions) state.transactions = data.transactions;
                if (data.goals) state.goals = data.goals;
                if (data.notifications) state.notifications = data.notifications;
            } catch (e) {
                console.error('Ошибка загрузки данных:', e);
            }
        }
        
        if (state.notifications.length === 0) {
            state.notifications.push({
                id: 1,
                type: 'info',
                message: `Добро пожаловать ${state.user.name ? state.user.name : ''} в финансовый менеджер!`,
                read: false
            });
        }
    }

    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });

    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });

    if (elements.loginBtn) {
        elements.loginBtn.addEventListener('click', function() {
            elements.loginModal.classList.add('active');
        });
    }

    if (elements.registerBtn) {
        elements.registerBtn.addEventListener('click', function() {
            elements.registerModal.classList.add('active');
        });
    }

    [elements.addTransactionBtn, elements.addTransactionBtn2].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function() {
                elements.transactionModal.classList.add('active');
            });
        }
    });

    [elements.addGoalBtn, elements.addGoalBtn2].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function() {
                elements.goalModal.classList.add('active');
            });
        }
    });

    if (elements.importTransactionsBtn) {
        elements.importTransactionsBtn.addEventListener('click', function() {
            elements.importModal.classList.add('active');
        });
    }

    if (elements.profileBtn) {
        elements.profileBtn.addEventListener('click', function() {
            if (state.user) {
                document.getElementById('profileName').value = state.user.name;
                document.getElementById('profileEmail').value = state.user.email;
                elements.profileModal.classList.add('active');
            }
        });
    }

    elements.tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            elements.tabs.forEach(t => t.classList.remove('active'));
            elements.tabContents.forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            if (tabId === 'analytics') {
                updateCharts();
            }
        });
    });

    if (elements.reportPeriod) {
        elements.reportPeriod.addEventListener('change', function() {
            if (this.value === 'custom') {
                elements.customDateRange.classList.remove('hidden');
            } else {
                elements.customDateRange.classList.add('hidden');
            }
        });
    }

    if (elements.importFile) {
        elements.importFile.addEventListener('change', function() {
            if (this.files.length > 0) {
                elements.fileName.textContent = this.files[0].name;
            } else {
                elements.fileName.textContent = 'Файл не выбран';
            }
        });
    }

    if (elements.userAvatar) {
        elements.userAvatar.addEventListener('click', function() {
            elements.userDropdown.classList.toggle('active');
        });
    }

    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', function() {
            logout();
        });
    }

    if (elements.clearDataBtn) {
        elements.clearDataBtn.addEventListener('click', function() {
            clearAllData();
        });
    }

    if (elements.loginForm) {
        elements.loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (email && password) {
                const savedUser = localStorage.getItem('financialManagerUser');
                if (savedUser) {
                    try {
                        const user = JSON.parse(savedUser);
                        if (user.email === email) {
                            login(user);
                            return;
                        }
                    } catch (e) {
                        console.error('Ошибка парсинга данных пользователя:', e);
                    }
                }
                
                login({
                    id: Date.now(),
                    name: email.split('@')[0],
                    email: email,
                    avatar: null
                });
            }
        });
    }

    if (elements.registerForm) {
        elements.registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('regName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;
            
            if (password !== confirmPassword) {
                alert('Пароли не совпадают!');
                return;
            }
            
            if (name && email && password) {
                const newUser = {
                    id: Date.now(),
                    name: name,
                    email: email,
                    avatar: null
                };
                
                localStorage.setItem('financialManagerUser', JSON.stringify(newUser));
                state.transactions = [];
                state.goals = [];
                state.notifications = [{
                    id: 1,
                    type: 'info',
                    message: `Добро пожаловать, ${name}! Начните работу с добавления транзакций.`,
                    read: false
                }];
                
                saveAllData();
                
                login(newUser);
            }
        });
    }

    if (elements.transactionForm) {
        elements.transactionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const type = document.getElementById('transactionType').value;
            const amount = parseFloat(document.getElementById('transactionAmount').value);
            const category = document.getElementById('transactionCategory').value;
            const date = document.getElementById('transactionDate').value;
            const description = document.getElementById('transactionDescription').value;
            
            if (!amount || !date) return;
            
            const transaction = {
                id: Date.now(),
                type,
                amount,
                category,
                date,
                description: description || '',
                createdAt: new Date().toISOString()
            };
            
            addTransaction(transaction);
            elements.transactionModal.classList.remove('active');
            this.reset();
        });
    }

    if (elements.goalForm) {
        elements.goalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('goalName').value;
            const targetAmount = parseFloat(document.getElementById('goalAmount').value);
            const currentAmount = parseFloat(document.getElementById('goalCurrentAmount').value) || 0;
            const deadline = document.getElementById('goalDeadline').value;
            const description = document.getElementById('goalDescription').value;
            
            if (!name || !targetAmount || !deadline) return;
            
            const goal = {
                id: Date.now(),
                name,
                targetAmount,
                currentAmount,
                deadline,
                description: description || '',
                createdAt: new Date().toISOString()
            };
            
            addGoal(goal);
            elements.goalModal.classList.remove('active');
            this.reset();
        });
    }

    if (elements.importForm) {
        elements.importForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const file = elements.importFile.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const transactions = [
                        {
                            id: Date.now() + 1,
                            type: 'income',
                            amount: 5000,
                            category: 'salary',
                            date: new Date().toISOString().split('T')[0],
                            description: 'Зарплата (импорт)',
                            createdAt: new Date().toISOString()
                        },
                        {
                            id: Date.now() + 2,
                            type: 'expense',
                            amount: 1500,
                            category: 'food',
                            date: new Date().toISOString().split('T')[0],
                            description: 'Продукты (импорт)',
                            createdAt: new Date().toISOString()
                        }
                    ];
                    
                    transactions.forEach(t => addTransaction(t));
                    addNotification('success', 'Транзакции успешно импортированы!');
                    elements.importModal.classList.remove('active');
                } catch (error) {
                    addNotification('error', 'Ошибка при импорте файла: ' + error.message);
                }
            };
            reader.readAsBinaryString(file);
        });
    }

    if (elements.profileForm) {
        elements.profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('profileName').value;
            const email = document.getElementById('profileEmail').value;
            const password = document.getElementById('profilePassword').value;
            const confirmPassword = document.getElementById('profileConfirmPassword').value;
            const avatarFile = document.getElementById('profileAvatar').files[0];
            
            if (password && password !== confirmPassword) {
                alert('Пароли не совпадают!');
                return;
            }
            
            if (state.user) {
                state.user.name = name;
                state.user.email = email;
                
                if (avatarFile) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        state.user.avatar = e.target.result;
                        localStorage.setItem('financialManagerUser', JSON.stringify(state.user));
                        updateUserAvatar();
                    };
                    reader.readAsDataURL(avatarFile);
                } else {
                    localStorage.setItem('financialManagerUser', JSON.stringify(state.user));
                }
                
                addNotification('success', 'Профиль успешно обновлен!');
                elements.profileModal.classList.remove('active');
            }
        });
    }

    if (elements.generatePdfBtn) {
        elements.generatePdfBtn.addEventListener('click', function() {
            generatePdfReport();
        });
    }

    if (elements.generateExcelBtn) {
        elements.generateExcelBtn.addEventListener('click', function() {
            generateExcelReport();
        });
    }

    if (elements.generateCsvBtn) {
        elements.generateCsvBtn.addEventListener('click', function() {
            generateCsvReport();
        });
    }

    if (elements.transactionFilter) {
        elements.transactionFilter.addEventListener('change', function() {
            renderTransactions();
        });
    }

    function login(user) {
        state.user = user;
        localStorage.setItem('financialManagerUser', JSON.stringify(user));
        
        loadData();
        
        elements.authButtons.classList.add('hidden');
        elements.userProfile.classList.remove('hidden');
        elements.mainContent.classList.remove('hidden');
        
        updateUserAvatar();
        
        elements.loginModal.classList.remove('active');
        elements.registerModal.classList.remove('active');
        
        renderAllData();
        
        addNotification('success', `Добро пожаловать, ${user.name}!`);
    }

    function logout() {
        elements.authButtons.classList.remove('hidden');
        elements.userProfile.classList.add('hidden');
        elements.mainContent.classList.add('hidden');
        elements.userDropdown.classList.remove('active');
        
        document.getElementById('loginForm').reset();
        document.getElementById('registerForm').reset();
        
        addNotification('info', 'Вы вышли из системы. Ваши данные сохранены.');
    }

    function clearAllData() {
        if (confirm('Вы уверены, что хотите удалить ВСЕ данные? Это действие нельзя отменить.')) {
            state.transactions = [];
            state.goals = [];
            state.notifications = [
                { id: 1, type: 'info', message: 'Данные были очищены', read: false }
            ];
            
            saveAllData();
            
            renderAllData();
            addNotification('warning', 'Все данные были удалены');
        }
    }

    function addTransaction(transaction) {
        state.transactions.push(transaction);
        saveAllData();
        renderAllData();
        
        const typeText = transaction.type === 'income' ? 'доход' : 'расход';
        addNotification('info', `Добавлен ${typeText} в категории "${getCategoryName(transaction.category)}"`);
    }

    function addGoal(goal) {
        state.goals.push(goal);
        saveAllData();
        renderAllData();
        
        addNotification('info', `Добавлена новая цель: "${goal.name}"`);
    }

    function addNotification(type, message) {
        const notification = {
            id: Date.now(),
            type,
            message,
            read: false
        };
        
        state.notifications.unshift(notification);
        saveAllData();
        renderNotifications();
    }

    function renderAllData() {
        renderBalance();
        renderTransactions();
        renderGoals();
        updateCharts();
        generateRecommendations();
    }

    function renderBalance() {
        const totalIncome = state.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpense = state.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const balance = totalIncome - totalExpense;
        
        elements.totalBalance.textContent = `${balance.toLocaleString()} ₽`;
        elements.totalIncome.textContent = `${totalIncome.toLocaleString()} ₽`;
        elements.totalExpense.textContent = `${totalExpense.toLocaleString()} ₽`;
    }

    function renderTransactions() {
        const filter = elements.transactionFilter ? elements.transactionFilter.value : 'all';
        
        let filteredTransactions = [...state.transactions];
        
        if (filter === 'income') {
            filteredTransactions = filteredTransactions.filter(t => t.type === 'income');
        } else if (filter === 'expense') {
            filteredTransactions = filteredTransactions.filter(t => t.type === 'expense');
        } else if (filter !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.category === filter);
        }
        
        filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const recentTransactions = filteredTransactions.slice(0, 5);
        
        elements.recentTransactions.innerHTML = '';
        elements.allTransactions.innerHTML = '';
        
        if (recentTransactions.length === 0) {
            elements.recentTransactions.innerHTML = '<li>Нет транзакций</li>';
        } else {
            recentTransactions.forEach(t => {
                const li = createTransactionElement(t);
                elements.recentTransactions.appendChild(li);
            });
        }
        
        if (filteredTransactions.length === 0) {
            elements.allTransactions.innerHTML = '<li>Нет транзакций</li>';
        } else {
            filteredTransactions.forEach(t => {
                const li = createTransactionElement(t);
                elements.allTransactions.appendChild(li);
            });
        }
    }

    function createTransactionElement(transaction) {
        const li = document.createElement('li');
        li.className = 'transaction-item';
        
        const typeClass = transaction.type === 'income' ? 'transaction-income' : 'transaction-expense';
        const typeSign = transaction.type === 'income' ? '+' : '-';
        
        li.innerHTML = `
            <div>
                <strong>${getCategoryName(transaction.category)}</strong>
                <small>${transaction.date}</small>
                ${transaction.description ? `<p>${transaction.description}</p>` : ''}
            </div>
            <span class="${typeClass}">${typeSign}${transaction.amount.toLocaleString()} ₽</span>
        `;
        
        return li;
    }

    function renderGoals() {
        const sortedGoals = [...state.goals].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        
        elements.activeGoals.innerHTML = '';
        elements.goalsList.innerHTML = '';
        
        if (sortedGoals.length === 0) {
            elements.activeGoals.innerHTML = '<p>Нет активных целей</p>';
            elements.goalsList.innerHTML = '<p>Нет целей</p>';
        } else {
            const activeGoals = sortedGoals.filter(g => new Date(g.deadline) >= new Date());
            
            if (activeGoals.length === 0) {
                elements.activeGoals.innerHTML = '<p>Нет активных целей</p>';
            } else {
                activeGoals.slice(0, 3).forEach(g => {
                    const goalElement = createGoalElement(g);
                    elements.activeGoals.appendChild(goalElement);
                });
            }

            sortedGoals.forEach(g => {
                const goalElement = createGoalElement(g);
                elements.goalsList.appendChild(goalElement);
            });
        }
    }

    function createGoalElement(goal) {
        const currentAmount = goal.currentAmount || 0;
        const targetAmount = goal.targetAmount || 0;
        const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
        
        const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    
        const div = document.createElement('div');
        div.className = 'goal-item';
        div.style.marginBottom = '20px';
        
        div.innerHTML = `
            <h4>${goal.name}</h4>
            <p>${currentAmount.toLocaleString()} ₽ из ${targetAmount.toLocaleString()} ₽</p>
            <div class="goal-progress">
                <div class="progress-bar" style="width: ${Math.min(progress, 100)}%"></div>
            </div>
            <p>${progress.toFixed(1)}% выполнено</p>
            <p>Осталось ${daysLeft} дней (до ${goal.deadline})</p>
            ${goal.description ? `<p>${goal.description}</p>` : ''}
        `;
        
        return div;
    }

    function renderNotifications() {
        elements.notificationsList.innerHTML = '';
        
        state.notifications.slice(0, 5).forEach(notification => {
            const notificationElement = document.createElement('div');
            notificationElement.className = `notification notification-${notification.type}`;
            
            notificationElement.innerHTML = `
                <span>${notification.message}</span>
                <i class="fas fa-times" style="cursor: pointer;" data-id="${notification.id}"></i>
            `;
            
            elements.notificationsList.appendChild(notificationElement);
        });
        
        document.querySelectorAll('.notification .fa-times').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                state.notifications = state.notifications.filter(n => n.id !== id);
                saveAllData();
                renderNotifications();
            });
        });
    }

    function updateCharts() {
        const expensesByCategory = {};
        state.transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
            });
        
        const expenseCategories = Object.keys(expensesByCategory);
        const expenseAmounts = Object.values(expensesByCategory);
        
        if (expensesChartInstance) {
            expensesChartInstance.destroy();
        }
        
        if (elements.expensesChart && expenseCategories.length > 0) {
            expensesChartInstance = new Chart(elements.expensesChart, {
                type: 'doughnut',
                data: {
                    labels: expenseCategories.map(c => getCategoryName(c)),
                    datasets: [{
                        data: expenseAmounts,
                        backgroundColor: [
                            '#bb86fc',
                            '#03dac6',
                            '#cf6679',
                            '#ffb74d',
                            '#4fc3f7',
                            '#ba68c8',
                            '#4db6ac'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            });
        }
        
        const incomeByDate = {};
        const expenseByDate = {};
        
        state.transactions.forEach(t => {
            const dateKey = t.date;
            if (t.type === 'income') {
                incomeByDate[dateKey] = (incomeByDate[dateKey] || 0) + t.amount;
            } else {
                expenseByDate[dateKey] = (expenseByDate[dateKey] || 0) + t.amount;
            }
        });
        
        const allDates = [...new Set([
            ...Object.keys(incomeByDate),
            ...Object.keys(expenseByDate)
        ])].sort();
        
        const incomeData = allDates.map(date => incomeByDate[date] || 0);
        const expenseData = allDates.map(date => expenseByDate[date] || 0);
        
        if (incomeExpenseChartInstance) {
            incomeExpenseChartInstance.destroy();
        }
        
        if (elements.incomeExpenseChart && allDates.length > 0) {
            incomeExpenseChartInstance = new Chart(elements.incomeExpenseChart, {
                type: 'bar',
                data: {
                    labels: allDates,
                    datasets: [
                        {
                            label: 'Доходы',
                            data: incomeData,
                            backgroundColor: '#03dac6'
                        },
                        {
                            label: 'Расходы',
                            data: expenseData,
                            backgroundColor: '#cf6679'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            stacked: false
                        },
                        y: {
                            stacked: false,
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    function generateRecommendations() {
        if (state.transactions.length === 0) {
            elements.recommendations.innerHTML = '<p>Анализ ваших расходов появится здесь после добавления транзакций.</p>';
            return;
        }
        
        const totalIncome = state.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpense = state.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
        
        const expensesByCategory = {};
        state.transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
            });
        
        let maxExpenseCategory = '';
        let maxExpenseAmount = 0;
        
        for (const category in expensesByCategory) {
            if (expensesByCategory[category] > maxExpenseAmount) {
                maxExpenseAmount = expensesByCategory[category];
                maxExpenseCategory = category;
            }
        }
        
        let recommendationsHTML = '<ul style="list-style: none; padding-left: 0;">';
        
        if (savingsRate < 20) {
            recommendationsHTML += `<li>Ваша норма сбережений составляет ${savingsRate.toFixed(1)}%. Попробуйте увеличить ее до 20%.</li>`;
        } else {
            recommendationsHTML += `<li>Отличная работа! Ваша норма сбережений составляет ${savingsRate.toFixed(1)}%.</li>`;
        }
        
        if (maxExpenseCategory) {
            recommendationsHTML += `<li>Больше всего вы тратите на "${getCategoryName(maxExpenseCategory)}" - ${maxExpenseAmount.toLocaleString()} ₽. Возможно, стоит пересмотреть эти расходы.</li>`;
        }
        
        state.goals.forEach(goal => {
            const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
            const amountLeft = goal.targetAmount - goal.currentAmount;
            const dailyNeed = amountLeft / daysLeft;
            
            if (dailyNeed > 0) {
                recommendationsHTML += `<li>Для достижения цели "${goal.name}" вам нужно откладывать примерно ${dailyNeed.toFixed(0)} ₽ в день.</li>`;
            }
        });
        
        recommendationsHTML += '</ul>';
        
        elements.recommendations.innerHTML = recommendationsHTML;
    }

    function generatePdfReport() {
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.setTextColor(187, 134, 252);
        doc.text('Финансовый отчет', 10, 15);
        
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        
        let periodText = '';
        const period = elements.reportPeriod ? elements.reportPeriod.value : 'month';
        
        if (period === 'custom' && elements.startDate.value && elements.endDate.value) {
            periodText = `За период с ${elements.startDate.value} по ${elements.endDate.value}`;
        } else {
            const now = new Date();
            if (period === 'month') {
                const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
                periodText = `За ${monthNames[now.getMonth()]} ${now.getFullYear()} года`;
            } else if (period === 'quarter') {
                const quarter = Math.floor(now.getMonth() / 3) + 1;
                periodText = `За ${quarter} квартал ${now.getFullYear()} года`;
            } else if (period === 'year') {
                periodText = `За ${now.getFullYear()} год`;
            }
        }
        
        doc.text(periodText, 10, 25);
        
        const totalIncome = state.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpense = state.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const balance = totalIncome - totalExpense;
        
        doc.setFontSize(14);
        doc.text('Общая статистика:', 10, 40);
        
        doc.setFontSize(12);
        doc.setTextColor(3, 218, 198);
        doc.text(`Доходы: ${totalIncome.toLocaleString()} ₽`, 10, 50);
        
        doc.setTextColor(207, 102, 121);
        doc.text(`Расходы: ${totalExpense.toLocaleString()} ₽`, 10, 60);
        
        doc.setTextColor(255, 255, 255);
        doc.text(`Баланс: ${balance.toLocaleString()} ₽`, 10, 70);
        
        doc.setFontSize(14);
        doc.text('Расходы по категориям:', 10, 85);
        
        const expensesByCategory = {};
        state.transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
            });
        
        let yPos = 95;
        for (const category in expensesByCategory) {
            doc.setFontSize(12);
            doc.setTextColor(255, 255, 255);
            doc.text(`${getCategoryName(category)}:`, 10, yPos);
            
            doc.setTextColor(207, 102, 121);
            doc.text(`${expensesByCategory[category].toLocaleString()} ₽`, 80, yPos);
            
            yPos += 10;
        }
        
        if (state.goals.length > 0) {
            doc.addPage();
            doc.setFontSize(14);
            doc.setTextColor(187, 134, 252);
            doc.text('Финансовые цели:', 10, 15);
            
            yPos = 25;
            state.goals.forEach(goal => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                
                doc.setFontSize(12);
                doc.setTextColor(255, 255, 255);
                doc.text(`${goal.name}:`, 10, yPos);
                
                doc.text(`${goal.currentAmount.toLocaleString()} ₽ из ${goal.targetAmount.toLocaleString()} ₽ (${progress.toFixed(1)}%)`, 20, yPos + 10);
                
                yPos += 25;
            });
        }
        
        doc.save(`financial_report_${new Date().toISOString().split('T')[0]}.pdf`);
        
        addNotification('success', 'PDF отчет успешно сгенерирован!');
    }

    function generateExcelReport() {
        const wb = XLSX.utils.book_new();
        
        const transactionsData = state.transactions.map(t => ({
            Дата: t.date,
            Тип: t.type === 'income' ? 'Доход' : 'Расход',
            Категория: getCategoryName(t.category),
            Сумма: t.amount,
            Описание: t.description || ''
        }));
        
        const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData);
        XLSX.utils.book_append_sheet(wb, transactionsSheet, "Транзакции");
        
        const goalsData = state.goals.map(g => ({
            Название: g.name,
            'Целевая сумма': g.targetAmount,
            'Текущая сумма': g.currentAmount,
            'Прогресс (%)': (g.currentAmount / g.targetAmount) * 100,
            'Срок': g.deadline,
            Описание: g.description || ''
        }));
        
        const goalsSheet = XLSX.utils.json_to_sheet(goalsData);
        XLSX.utils.book_append_sheet(wb, goalsSheet, "Цели");
        
        const totalIncome = state.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpense = state.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const balance = totalIncome - totalExpense;
        
        const statsData = [
            { Показатель: 'Общий доход', Значение: totalIncome },
            { Показатель: 'Общий расход', Значение: totalExpense },
            { Показатель: 'Баланс', Значение: balance }
        ];
        
        const statsSheet = XLSX.utils.json_to_sheet(statsData);
        XLSX.utils.book_append_sheet(wb, statsSheet, "Статистика");

        XLSX.writeFile(wb, `financial_report_${new Date().toISOString().split('T')[0]}.xlsx`);
        
        addNotification('success', 'Excel отчет успешно сгенерирован!');
    }

    function generateCsvReport() {
        let csv = 'Дата,Тип,Категория,Сумма,Описание\n';
        
        state.transactions.forEach(t => {
            csv += `${t.date},${t.type === 'income' ? 'Доход' : 'Расход'},${getCategoryName(t.category)},${t.amount},"${t.description || ''}"\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `transactions_${new Date().toISOString().split('T')[0]}.csv`);
        
        addNotification('success', 'CSV отчет успешно сгенерирован!');
    }

    function getCategoryName(category) {
        const categoryNames = {
            salary: 'Зарплата',
            gift: 'Подарок',
            investment: 'Инвестиции',
            food: 'Еда',
            transport: 'Транспорт',
            entertainment: 'Развлечения',
            utilities: 'Коммунальные услуги',
            other: 'Другое'
        };
        
        return categoryNames[category] || category;
    }

    function updateUserAvatar() {
        if (state.user && state.user.avatar) {
            elements.userAvatar.innerHTML = '';
            const img = document.createElement('img');
            img.src = state.user.avatar;
            img.alt = 'Аватар пользователя';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.borderRadius = '50%';
            img.style.objectFit = 'cover';
            elements.userAvatar.appendChild(img);
        } else if (state.user) {
            elements.userAvatar.innerHTML = '';
            elements.userAvatar.textContent = state.user.name.charAt(0).toUpperCase();
            elements.userAvatar.style.display = 'flex';
            elements.userAvatar.style.alignItems = 'center';
            elements.userAvatar.style.justifyContent = 'center';
            elements.userAvatar.style.backgroundColor = '#bb86fc';
            elements.userAvatar.style.color = 'white';
            elements.userAvatar.style.fontWeight = 'bold';
            elements.userAvatar.style.fontSize = '18px';
        }
    }

    const savedUser = localStorage.getItem('financialManagerUser');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            
            if (user && typeof user === 'object' && user.email) {
                if (user.avatar && typeof user.avatar === 'string') {
                    const img = new Image();
                    img.onload = function() {
                        login(user);
                    };
                    img.onerror = function() {
                        user.avatar = null;
                        localStorage.setItem('financialManagerUser', JSON.stringify(user));
                        login(user);
                    };
                    img.src = user.avatar;
                } else {
                    login(user);
                }
            }
        } catch (e) {
            console.error('Ошибка парсинга данных пользователя:', e);
        }
    }
});