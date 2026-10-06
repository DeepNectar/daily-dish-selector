(function() {
    "use strict";

    // ============================================================
    // SUPABASE CONFIG
    // ============================================================
    const SUPABASE_URL = 'https://ybjxgwvopxbpbkjsjnou.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlianhnd3ZvcHhicGJranNqbm91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NTEyNTAsImV4cCI6MjEwNTEyNzI1MH0.3fsj27S41hQmZcp55G1-HyeLYGlo1laR4lz6UqK42D4';

    let supabaseClient = null;
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {
        console.error('Supabase init failed:', e);
    }

    const PASSWORD = "DeepH@2805";
    let deleteMode = false;

    let ALL_DISHES = [];
    let categories = new Set();
    let history = [];
    let picked = [];
    let selectedForDelete = new Set();
    let currentlyDisplayedDish = null;

    const LS_SAVED_RECIPIENTS = 'dishPicker_savedRecipients';
    const LS_LAST_USED_NUMBER = 'dishPicker_lastUsedNumber';
    let savedRecipients = [];
    let selectedRecipient = null;
    let lastUsedNumber = '';

    // DOM
    const itemGrid = document.getElementById('itemList');
    const popupDisplay = document.getElementById('popupDisplay');
    const refreshBtn = document.getElementById('refreshBtn');
    const resetBtn = document.getElementById('resetBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const emailBtn = document.getElementById('emailBtn');
    const whatsappBtn = document.getElementById('whatsappBtn');
    const deleteModeBtn = document.getElementById('deleteModeBtn');
    const statusBadge = document.getElementById('statusBadge');
    const syncBadge = document.getElementById('syncBadge');
    const remainingCount = document.getElementById('remainingCount');
    const historyCount = document.getElementById('historyCount');
    const lastSyncInfo = document.getElementById('lastSyncInfo');
    const resetNotice = document.getElementById('resetNotice');
    const newDishInput = document.getElementById('newDishInput');
    const newCategoryInput = document.getElementById('newCategoryInput');
    const addDishBtn = document.getElementById('addDishBtn');
    const historyList = document.getElementById('historyList');
    const toast = document.getElementById('toast');
    const categorySelect = document.getElementById('categorySelect');
    const categoryCount = document.getElementById('categoryCount');
    const selectAllContainer = document.getElementById('selectAllContainer');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const selectedCount = document.getElementById('selectedCount');
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    const syncBtn = document.getElementById('syncBtn');
    const deleteIndicator = document.getElementById('deleteIndicator');

    const manualAddBtn = document.getElementById('manualAddBtn');
    const manualAddModal = document.getElementById('manualAddModal');
    const manualDishName = document.getElementById('manualDishName');
    const manualCategory = document.getElementById('manualCategory');
    const manualCook = document.getElementById('manualCook');
    const manualAddConfirm = document.getElementById('manualAddConfirm');
    const manualAddCancel = document.getElementById('manualAddCancel');
    const manualAddError = document.getElementById('manualAddError');
    const manualDateSelect = document.getElementById('manualDateSelect');
    const manualCustomDateRow = document.getElementById('manualCustomDateRow');
    const manualCustomDateInput = document.getElementById('manualCustomDateInput');
    const manualCustomDatePreview = document.getElementById('manualCustomDatePreview');

    const categoryModal = document.getElementById('categoryModal');
    const categoryModalSelect = document.getElementById('categoryModalSelect');
    const categoryModalCount = document.getElementById('categoryModalCount');
    const categoryModalConfirm = document.getElementById('categoryModalConfirm');
    const categoryModalCancel = document.getElementById('categoryModalCancel');

    const customDateRow = document.getElementById('customDateRow');
    const customDateInput = document.getElementById('customDateInput');
    const customDatePreview = document.getElementById('customDatePreview');

    const historyDeleteModal = document.getElementById('historyDeleteModal');
    const historyDeletePassword = document.getElementById('historyDeletePassword');
    const historyDeleteError = document.getElementById('historyDeleteError');
    const historyDeleteConfirm = document.getElementById('historyDeleteConfirm');
    const historyDeleteCancel = document.getElementById('historyDeleteCancel');
    const historyDeleteDish = document.getElementById('historyDeleteDish');

    const modal = document.getElementById('passwordModal');
    const passwordInput = document.getElementById('passwordInput');
    const passwordError = document.getElementById('passwordError');
    const modalConfirm = document.getElementById('modalConfirm');
    const modalCancel = document.getElementById('modalCancel');

    const clearHistoryModal = document.getElementById('clearHistoryModal');
    const clearHistoryConfirm = document.getElementById('clearHistoryConfirm');
    const clearHistoryCancel = document.getElementById('clearHistoryCancel');
    const clearHistoryPassword = document.getElementById('clearHistoryPassword');
    const clearHistoryError = document.getElementById('clearHistoryError');

    const bulkDeleteModal = document.getElementById('bulkDeleteModal');
    const bulkDeleteConfirm = document.getElementById('bulkDeleteConfirm');
    const bulkDeleteCancel = document.getElementById('bulkDeleteCancel');
    const bulkDeletePassword = document.getElementById('bulkDeletePassword');
    const bulkDeleteError = document.getElementById('bulkDeleteError');
    const bulkDeleteCount = document.getElementById('bulkDeleteCount');
    const bulkDeleteList = document.getElementById('bulkDeleteList');

    const emailOptionsModal = document.getElementById('emailOptionsModal');
    const emailOptionsClose = document.getElementById('emailOptionsClose');
    const htmlOptionBtn = document.getElementById('htmlOptionBtn');
    const openOptionBtn = document.getElementById('openOptionBtn');
    const emailSubjectPreview = document.getElementById('emailSubjectPreview');

    const waModal = document.getElementById('waModal');
    const waRecipients = document.getElementById('waRecipients');
    const waAddNewToggle = document.getElementById('waAddNewToggle');
    const waAddForm = document.getElementById('waAddForm');
    const waNewName = document.getElementById('waNewName');
    const waNewNumber = document.getElementById('waNewNumber');
    const waAddSaveBtn = document.getElementById('waAddSaveBtn');
    const waAddCancelBtn = document.getElementById('waAddCancelBtn');
    const waPreview = document.getElementById('waPreview');
    const waCancelBtn = document.getElementById('waCancelBtn');
    const waSendBtn = document.getElementById('waSendBtn');

    const bulkFileInput = document.getElementById('bulkFileInput');
    const exportExcelBtn = document.getElementById('exportExcelBtn');

    let toastTimeout = null;
    let historyEntryToDelete = null;
    let lastSyncTime = null;
    let isSyncing = false;

    function setSyncStatus(status, message) {
        if (!syncBadge) return;
        syncBadge.className = 'sync-badge ' + status;
        syncBadge.textContent = message;
    }

    function updateLastSyncInfo() {
        if (!lastSyncInfo) return;
        if (!lastSyncTime) {
            lastSyncInfo.textContent = '🔄 never synced';
        } else {
            const secs = Math.floor((Date.now() - lastSyncTime) / 1000);
            if (secs < 5) lastSyncInfo.textContent = '✅ synced just now';
            else if (secs < 60) lastSyncInfo.textContent = `✅ synced ${secs}s ago`;
            else lastSyncInfo.textContent = `✅ synced ${Math.floor(secs/60)}m ago`;
        }
    }
    setInterval(updateLastSyncInfo, 5000);

    async function pushAllToCloud() {
        if (!supabaseClient) return false;
        if (isSyncing) return false;
        isSyncing = true;
        setSyncStatus('syncing', '🔄 saving...');
        try {
            await supabaseClient.from('dish_master').delete().neq('id', 0);
            if (ALL_DISHES.length > 0) {
                const dishRows = ALL_DISHES.map(d => ({
                    name: d.name,
                    category: d.category || 'Uncategorized'
                }));
                const { error: dErr } = await supabaseClient.from('dish_master').insert(dishRows);
                if (dErr) console.warn('dish_master insert warn:', dErr);
            }

            await supabaseClient.from('dish_history').delete().neq('id', 0);
            if (history.length > 0) {
                const histRows = history.map(h => ({
                    dish_name: h.dish,
                    category: h.category || 'Uncategorized',
                    display_date: h.displayDate || '',
                    date_tag: h.dateTag || '',
                    cook: h.cook || ''
                }));
                const { error: hErr } = await supabaseClient.from('dish_history').insert(histRows);
                if (hErr) console.warn('dish_history insert warn:', hErr);
            }

            await supabaseClient.from('dish_picked').delete().neq('id', 0);
            if (picked.length > 0) {
                const pickedRows = picked.map(name => ({ dish_name: name }));
                const { error: pErr } = await supabaseClient.from('dish_picked').insert(pickedRows);
                if (pErr) console.warn('dish_picked insert warn:', pErr);
            }

            lastSyncTime = Date.now();
            setSyncStatus('online', '☁️ synced');
            updateLastSyncInfo();
            isSyncing = false;
            return true;
        } catch (e) {
            console.error('pushAllToCloud failed:', e);
            setSyncStatus('offline', '⚠️ save failed');
            isSyncing = false;
            return false;
        }
    }

    async function pullAllFromCloud() {
        if (!supabaseClient) return null;
        try {
            const [dishesRes, historyRes, pickedRes] = await Promise.all([
                supabaseClient.from('dish_master').select('*').order('id', { ascending: true }),
                supabaseClient.from('dish_history').select('*').order('id', { ascending: true }),
                supabaseClient.from('dish_picked').select('*').order('id', { ascending: true })
            ]);

            if (dishesRes.error || historyRes.error || pickedRes.error) {
                console.warn('pull errors:', dishesRes.error, historyRes.error, pickedRes.error);
                return null;
            }

            const cloudDishes = (dishesRes.data || []).map(r => ({
                name: r.name,
                category: r.category || 'Uncategorized'
            }));

            const cloudHistory = (historyRes.data || []).map(r => ({
                dish: r.dish_name,
                category: r.category || 'Uncategorized',
                displayDate: r.display_date || '',
                dateTag: r.date_tag || '',
                cook: r.cook || ''
            }));

            const cloudPicked = (pickedRes.data || []).map(r => r.dish_name);

            return { dishes: cloudDishes, history: cloudHistory, picked: cloudPicked };
        } catch (e) {
            console.error('pullAllFromCloud failed:', e);
            return null;
        }
    }

    async function syncNow(silent) {
        if (!supabaseClient) {
            if (!silent) showToast('⚠️ Cloud not available.', 2500);
            setSyncStatus('offline', '⚠️ no cloud');
            return;
        }
        setSyncStatus('syncing', '🔄 syncing...');
        const pulled = await pullAllFromCloud();
        if (!pulled) {
            setSyncStatus('offline', '⚠️ offline');
            if (!silent) showToast('⚠️ Sync failed — check connection', 2500);
            return;
        }
        ALL_DISHES = pulled.dishes;
        history = pulled.history;
        picked = pulled.picked;
        if (history.length > 0) {
            const latest = history[history.length - 1];
            currentlyDisplayedDish = {
                dish: latest.dish,
                category: latest.category,
                dateTag: latest.dateTag
            };
            updatePopup(latest.dish, latest.category, latest.dateTag);
        }
        lastSyncTime = Date.now();
        setSyncStatus('online', '☁️ synced');
        updateLastSyncInfo();
        updateUI();
        if (!silent) showToast('🔄 Synced from cloud!', 2000);
    }

    let autoSyncInterval = null;
    function startAutoSync() {
        if (autoSyncInterval) clearInterval(autoSyncInterval);
        autoSyncInterval = setInterval(async () => {
            if (isSyncing || !supabaseClient) return;
            if (document.hidden) return;
            const before = JSON.stringify({ h: history, d: ALL_DISHES, p: picked });
            const pulled = await pullAllFromCloud();
            if (pulled) {
                const after = JSON.stringify({ h: pulled.history, d: pulled.dishes, p: pulled.picked });
                if (before !== after) {
                    ALL_DISHES = pulled.dishes;
                    history = pulled.history;
                    picked = pulled.picked;
                    if (history.length > 0) {
                        const latest = history[history.length - 1];
                        currentlyDisplayedDish = {
                            dish: latest.dish,
                            category: latest.category,
                            dateTag: latest.dateTag
                        };
                        updatePopup(latest.dish, latest.category, latest.dateTag);
                    }
                    lastSyncTime = Date.now();
                    setSyncStatus('online', '☁️ synced');
                    updateLastSyncInfo();
                    updateUI();
                    showToast('🔄 Updated from other device', 2000);
                }
            }
        }, 10000);
    }

    function showToast(message, duration = 2500) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => toast.classList.remove('show'), duration);
    }

    function getDateForOption(option, customDateValue) {
        const now = new Date();
        if (option === 'today') return now;
        if (option === 'tomorrow') {
            const t = new Date(now);
            t.setDate(t.getDate() + 1);
            return t;
        }
        if (option === 'yesterday') {
            const y = new Date(now);
            y.setDate(y.getDate() - 1);
            return y;
        }
        if (option === 'custom' && customDateValue) {
            const parts = customDateValue.split('-');
            if (parts.length === 3) {
                return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            }
            return new Date(customDateValue);
        }
        return now;
    }

    function getFormattedDate(date) {
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    function getFullDateTime(date) {
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    function getCurrentDateTime() { return getFullDateTime(new Date()); }

    function getSubjectLine() {
        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        return `🍽️ My Cooking Log - ${dateStr}`;
    }

    function getAvailableDishes() {
        const pickedSet = new Set(picked);
        return ALL_DISHES.filter(d => !pickedSet.has(d.name));
    }
    function getAvailableByCategory(category) {
        const available = getAvailableDishes();
        if (category === '__all__') return available;
        return available.filter(d => d.category === category);
    }

    function updateDeleteIndicator() {
        if (deleteIndicator) {
            deleteIndicator.className = deleteMode ? 'delete-mode-indicator active' : 'delete-mode-indicator inactive';
            deleteIndicator.textContent = deleteMode ? '🔓 unlocked' : '🔒 locked';
        }
        if (deleteModeBtn) {
            deleteModeBtn.innerHTML = deleteMode ? '<i>🔓</i> delete mode (active)' : '<i>🔒</i> delete mode';
            deleteModeBtn.style.background = deleteMode ? '#27ae60' : '#c0392b';
        }
        if (selectAllContainer) selectAllContainer.style.display = deleteMode ? 'flex' : 'none';
        if (!deleteMode) selectedForDelete.clear();
    }

    function updateCategoryDropdown() {
        categories = new Set(ALL_DISHES.map(d => d.category));
        const currentVal = categorySelect.value;
        categorySelect.innerHTML = '';
        const allOpt = document.createElement('option');
        allOpt.value = '__all__';
        allOpt.textContent = '📋 All Categories';
        categorySelect.appendChild(allOpt);
        Array.from(categories).sort().forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            categorySelect.appendChild(opt);
        });
        if (currentVal && (currentVal === '__all__' || categories.has(currentVal))) {
            categorySelect.value = currentVal;
        } else {
            categorySelect.value = '__all__';
        }
        updateCategoryCount();
    }

    function updateCategoryCount() {
        const selected = categorySelect.value;
        const available = getAvailableByCategory(selected);
        const total = ALL_DISHES.length;
        if (selected === '__all__') {
            categoryCount.textContent = `${available.length} / ${total} dishes available`;
        } else {
            const totalInCat = ALL_DISHES.filter(d => d.category === selected).length;
            categoryCount.textContent = `${available.length} / ${totalInCat} in "${selected}"`;
        }
    }

    function updateSelectedCount() {
        const count = selectedForDelete.size;
        if (selectedCount) selectedCount.textContent = `(${count} selected)`;
        if (bulkDeleteBtn) {
            bulkDeleteBtn.classList.toggle('visible', deleteMode && count > 0);
            bulkDeleteBtn.textContent = count > 0 ? `🗑️ Delete Selected (${count})` : '🗑️ Delete Selected';
        }
        if (selectAllCheckbox) {
            const filtered = getFilteredDishes();
            const availItems = filtered.filter(d => !picked.includes(d.name));
            selectAllCheckbox.checked = count > 0 && count === availItems.length;
            selectAllCheckbox.indeterminate = count > 0 && count < availItems.length;
        }
    }

    function getFilteredDishes() {
        const selected = categorySelect.value;
        return selected === '__all__' ? ALL_DISHES : ALL_DISHES.filter(d => d.category === selected);
    }

    function toggleSelectDish(dishName) {
        if (!deleteMode) return;
        if (picked.includes(dishName)) return;
        if (selectedForDelete.has(dishName)) selectedForDelete.delete(dishName);
        else selectedForDelete.add(dishName);
        updateSelectedCount();
        renderItemList();
    }

    function selectAllDishes() {
        if (!deleteMode) return;
        const filtered = getFilteredDishes();
        const availItems = filtered.filter(d => !picked.includes(d.name));
        if (selectAllCheckbox.checked) availItems.forEach(d => selectedForDelete.add(d.name));
        else availItems.forEach(d => selectedForDelete.delete(d.name));
        updateSelectedCount();
        renderItemList();
    }

    function showBulkDeleteModal() {
        if (selectedForDelete.size === 0) { showToast('No dishes selected.', 2000); return; }
        const names = Array.from(selectedForDelete);
        bulkDeleteCount.textContent = `${names.length} dish(es)`;
        bulkDeleteList.textContent = names.slice(0, 10).join(', ') + (names.length > 10 ? ` and ${names.length - 10} more...` : '');
        if (bulkDeletePassword) bulkDeletePassword.value = '';
        if (bulkDeleteError) bulkDeleteError.classList.remove('show');
        bulkDeleteModal.classList.add('active');
        if (bulkDeletePassword) bulkDeletePassword.focus();
    }

    function closeBulkDeleteModal() {
        bulkDeleteModal.classList.remove('active');
        if (bulkDeletePassword) bulkDeletePassword.value = '';
        if (bulkDeleteError) bulkDeleteError.classList.remove('show');
    }

    async function confirmBulkDelete() {
        const toDelete = Array.from(selectedForDelete);
        if (toDelete.length === 0) { closeBulkDeleteModal(); return; }
        if (bulkDeletePassword && bulkDeletePassword.value !== PASSWORD) {
            if (bulkDeleteError) bulkDeleteError.classList.add('show');
            bulkDeletePassword.value = '';
            bulkDeletePassword.focus();
            setTimeout(() => bulkDeleteError && bulkDeleteError.classList.remove('show'), 3000);
            return;
        }
        toDelete.forEach(name => {
            const i = ALL_DISHES.findIndex(d => d.name === name);
            if (i !== -1) ALL_DISHES.splice(i, 1);
            const p = picked.indexOf(name);
            if (p !== -1) picked.splice(p, 1);
        });
        selectedForDelete.clear();
        closeBulkDeleteModal();
        updateUI();
        showToast(`🗑️ Deleted ${toDelete.length} dish(es)!`, 2500);
        await pushAllToCloud();
    }

    // ============================================================
    // RECIPIENTS (WHATSAPP)
    // ============================================================
    function loadRecipients() {
        try {
            const raw = localStorage.getItem(LS_SAVED_RECIPIENTS);
            savedRecipients = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(savedRecipients)) savedRecipients = [];
        } catch (e) { savedRecipients = []; }
        try {
            lastUsedNumber = localStorage.getItem(LS_LAST_USED_NUMBER) || '';
        } catch (e) { lastUsedNumber = ''; }
    }
    function saveRecipients() {
        try { localStorage.setItem(LS_SAVED_RECIPIENTS, JSON.stringify(savedRecipients)); } catch (e) {}
    }
    function saveLastUsed(n) {
        try { lastUsedNumber = n; localStorage.setItem(LS_LAST_USED_NUMBER, n); } catch (e) {}
    }
    function addRecipient(name, number) {
        number = (number || '').replace(/\D/g, '');
        name = (name || '').trim();
        if (!name) { showToast('⚠️ Enter a name.', 2000); return false; }
        if (!number || number.length < 8) { showToast('⚠️ Enter a valid number.', 2500); return false; }
        if (savedRecipients.some(r => r.number === number)) {
            showToast('⚠️ This number is already saved.', 2500);
            return false;
        }
        savedRecipients.push({ name, number });
        saveRecipients();
        renderRecipients();
        showToast(`💾 Saved: ${name}`, 2000);
        return true;
    }
    function removeRecipient(number) {
        savedRecipients = savedRecipients.filter(r => r.number !== number);
        saveRecipients();
        if (selectedRecipient && selectedRecipient.number === number) selectedRecipient = null;
        renderRecipients();
        updateSendButtonState();
        showToast('🗑️ Removed', 1500);
    }
    function renderRecipients() {
        if (!waRecipients) return;
        waRecipients.innerHTML = '';
        if (savedRecipients.length === 0 && !lastUsedNumber) {
            const empty = document.createElement('div');
            empty.className = 'wa-empty-recipients';
            empty.textContent = '💭 No saved recipients yet. Tap "➕ Add new" to save one.';
            waRecipients.appendChild(empty);
            return;
        }
        if (lastUsedNumber && !savedRecipients.some(r => r.number === lastUsedNumber)) {
            const lastRow = document.createElement('div');
            lastRow.className = 'wa-recipient';
            lastRow.innerHTML = `
                <div class="wa-avatar">🕐</div>
                <div class="wa-info">
                    <div class="wa-name">Last used</div>
                    <div class="wa-number">+${lastUsedNumber}</div>
                </div>
            `;
            lastRow.addEventListener('click', () => {
                selectedRecipient = { name: 'Last used', number: lastUsedNumber };
                renderRecipients();
                updateSendButtonState();
            });
            if (selectedRecipient && selectedRecipient.number === lastUsedNumber) lastRow.classList.add('selected');
            waRecipients.appendChild(lastRow);
        }
        savedRecipients.forEach(r => {
            const row = document.createElement('div');
            row.className = 'wa-recipient';
            const avatar = document.createElement('div');
            avatar.className = 'wa-avatar';
            avatar.textContent = r.name.charAt(0).toUpperCase() || '?';
            const info = document.createElement('div');
            info.className = 'wa-info';
            const nameEl = document.createElement('div');
            nameEl.className = 'wa-name';
            nameEl.textContent = r.name;
            const numEl = document.createElement('div');
            numEl.className = 'wa-number';
            numEl.textContent = '+' + r.number;
            info.appendChild(nameEl);
            info.appendChild(numEl);
            const removeBtn = document.createElement('button');
            removeBtn.className = 'wa-remove';
            removeBtn.textContent = '×';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Remove "${r.name}" from saved recipients?`)) removeRecipient(r.number);
            });
            row.appendChild(avatar);
            row.appendChild(info);
            row.appendChild(removeBtn);
            row.addEventListener('click', () => {
                selectedRecipient = { name: r.name, number: r.number };
                renderRecipients();
                updateSendButtonState();
            });
            if (selectedRecipient && selectedRecipient.number === r.number) row.classList.add('selected');
            waRecipients.appendChild(row);
        });
    }
    function updateSendButtonState() {
        if (!waSendBtn) return;
        waSendBtn.disabled = !selectedRecipient;
    }

    // ============================================================
    // MANUAL ADD
    // ============================================================
    function openManualAddModal() {
        manualDishName.value = '';
        manualCategory.value = '';
        manualCook.value = '';
        manualAddError.classList.remove('show');
        if (manualDateSelect) manualDateSelect.value = 'today';
        if (manualCustomDateRow) manualCustomDateRow.classList.remove('visible');
        if (manualCustomDateInput) manualCustomDateInput.value = '';
        if (manualCustomDatePreview) manualCustomDatePreview.textContent = '';
        manualAddModal.classList.add('active');
        setTimeout(() => manualDishName.focus(), 100);
    }

    function closeManualAddModal() {
        manualAddModal.classList.remove('active');
        manualAddError.classList.remove('show');
        if (manualCustomDateRow) manualCustomDateRow.classList.remove('visible');
    }

    async function confirmManualAdd() {
        const dishName = (manualDishName.value || '').trim();
        if (!dishName) {
            manualAddError.classList.add('show');
            manualDishName.focus();
            setTimeout(() => manualAddError.classList.remove('show'), 3000);
            return;
        }
        const category = (manualCategory.value || '').trim() || 'Uncategorized';
        const cook = manualCook.value;
        const dateOpt = manualDateSelect ? manualDateSelect.value : 'today';

        if (dateOpt === 'custom') {
            if (!manualCustomDateInput || !manualCustomDateInput.value) {
                showToast('⚠️ Please select a custom date.', 2500);
                if (manualCustomDateInput) manualCustomDateInput.focus();
                return;
            }
        }

        let dateObj;
        let dateTag;
        if (dateOpt === 'none') {
            dateObj = new Date();
            dateTag = '';
        } else {
            dateObj = getDateForOption(dateOpt, manualCustomDateInput ? manualCustomDateInput.value : '');
            if (dateOpt === 'today') dateTag = '📅 Today';
            else if (dateOpt === 'tomorrow') dateTag = '📅 Tomorrow';
            else if (dateOpt === 'yesterday') dateTag = '📅 Yesterday';
            else if (dateOpt === 'custom') dateTag = '📅 ' + getFormattedDate(dateObj);
            else dateTag = '📅 Today';
        }

        const newEntry = {
            dish: dishName,
            category: category,
            date: getFullDateTime(dateObj),
            displayDate: getFormattedDate(dateObj),
            dateTag: dateTag,
            cook: cook
        };
        history.push(newEntry);
        currentlyDisplayedDish = {
            dish: dishName,
            category: category,
            dateTag: dateTag
        };
        updatePopup(dishName, category, dateTag);
        if (!picked.includes(dishName)) picked.push(dishName);
        if (!ALL_DISHES.some(d => d.name.toLowerCase() === dishName.toLowerCase())) {
            ALL_DISHES.push({ name: dishName, category: category });
        }

        updateUI();
        closeManualAddModal();
        showToast('✍️ Added: ' + dishName, 2500);
        await pushAllToCloud();
    }

    function setupManualDateDropdown() {
        if (!manualDateSelect) return;
        manualDateSelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                if (manualCustomDateRow) manualCustomDateRow.classList.add('visible');
                if (manualCustomDateInput) {
                    if (!manualCustomDateInput.value) {
                        const today = new Date();
                        const yyyy = today.getFullYear();
                        const mm = String(today.getMonth() + 1).padStart(2, '0');
                        const dd = String(today.getDate()).padStart(2, '0');
                        manualCustomDateInput.value = `${yyyy}-${mm}-${dd}`;
                        updateManualCustomDatePreview();
                    }
                    setTimeout(() => manualCustomDateInput.focus(), 100);
                }
            } else {
                if (manualCustomDateRow) manualCustomDateRow.classList.remove('visible');
            }
        });

        if (manualCustomDateInput) {
            manualCustomDateInput.addEventListener('change', updateManualCustomDatePreview);
            manualCustomDateInput.addEventListener('input', updateManualCustomDatePreview);
        }
    }

    function updateManualCustomDatePreview() {
        if (!manualCustomDateInput || !manualCustomDatePreview) return;
        if (!manualCustomDateInput.value) { manualCustomDatePreview.textContent = ''; return; }
        const parts = manualCustomDateInput.value.split('-');
        if (parts.length === 3) {
            const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            manualCustomDatePreview.textContent = '→ ' + getFormattedDate(d);
        }
    }

    function openHistoryDeleteModal(index) {
        if (index < 0 || index >= history.length) return;
        historyEntryToDelete = index;
        historyDeleteDish.textContent = `🍽️ ${history[index].dish}`;
        historyDeletePassword.value = '';
        historyDeleteError.classList.remove('show');
        historyDeleteModal.classList.add('active');
        historyDeletePassword.focus();
    }

    function closeHistoryDeleteModal() {
        historyDeleteModal.classList.remove('active');
        historyEntryToDelete = null;
        historyDeletePassword.value = '';
        historyDeleteError.classList.remove('show');
    }

    async function confirmHistoryDelete() {
        if (historyDeletePassword.value === PASSWORD) {
            if (historyEntryToDelete !== null && historyEntryToDelete >= 0 && historyEntryToDelete < history.length) {
                const dishName = history[historyEntryToDelete].dish;
                history.splice(historyEntryToDelete, 1);
                const p = picked.indexOf(dishName);
                if (p !== -1) picked.splice(p, 1);
                if (currentlyDisplayedDish && currentlyDisplayedDish.dish === dishName) {
                    currentlyDisplayedDish = null;
                    updatePopup(null, null, null);
                }
                closeHistoryDeleteModal();
                updateUI();
                showToast(`🗑️ Deleted: ${dishName}`, 2500);
                await pushAllToCloud();
            }
        } else {
            historyDeleteError.classList.add('show');
            historyDeletePassword.value = '';
            historyDeletePassword.focus();
            setTimeout(() => historyDeleteError.classList.remove('show'), 3000);
        }
    }

    function updateUI() {
        renderItemList();
        renderHistory();
        updateCategoryDropdown();
        updateCategoryModalDropdown();

        const total = ALL_DISHES.length;
        const pCount = picked.length;
        const remaining = total - pCount;

        // BUG FIXED: previously this rebuilt statusBadge.innerHTML on every render,
        // creating DUPLICATE id="syncBadge"/"deleteIndicator" elements and detaching
        // the DOM references held by setSyncStatus()/updateDeleteIndicator() — so the
        // sync & lock badges froze after the first update. Now we patch the existing
        // nodes in place instead of replacing them.
        let badgeCounter = document.getElementById('dishPickCount');
        if (!badgeCounter) {
            badgeCounter = document.createElement('span');
            badgeCounter.id = 'dishPickCount';
            statusBadge.insertBefore(badgeCounter, statusBadge.firstChild);
        }
        badgeCounter.textContent = `🔁 ${pCount} / ${total} picked`;

        remainingCount.textContent = `📋 ${remaining} remaining`;
        historyCount.textContent = `📚 ${history.length} total made`;
        if (refreshBtn) refreshBtn.disabled = (total === 0);

        if (total === 0) {
            resetNotice.textContent = '📭 Add dishes using "Add Dish" or "Import CSV"';
        } else if (remaining === 0) {
            resetNotice.textContent = '🎉 All dishes picked! click "reset all"';
        } else {
            resetNotice.textContent = 'click refresh to pick a dish';
        }

        if (total === 0) {
            currentlyDisplayedDish = null;
            updatePopup(null, null, null);
        }
        updateDeleteIndicator();
        updateSelectedCount();
    }

    function updateCategoryModalDropdown() {
        const currentVal = categoryModalSelect.value;
        categoryModalSelect.innerHTML = '';
        const allOpt = document.createElement('option');
        allOpt.value = '__all__';
        allOpt.textContent = '📋 All Categories';
        categoryModalSelect.appendChild(allOpt);
        Array.from(categories).sort().forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = `${cat} (${getAvailableByCategory(cat).length} available)`;
            categoryModalSelect.appendChild(opt);
        });
        const rndOpt = document.createElement('option');
        rndOpt.value = '__random__';
        rndOpt.textContent = '🎲 Random Category';
        categoryModalSelect.appendChild(rndOpt);
        if (currentVal && (currentVal === '__all__' || currentVal === '__random__' || categories.has(currentVal))) {
            categoryModalSelect.value = currentVal;
        } else {
            categoryModalSelect.value = '__all__';
        }
        updateCategoryModalCount();
    }

    function updateCategoryModalCount() {
        const selected = categoryModalSelect.value;
        if (selected === '__random__') {
            categoryModalCount.textContent = `🎲 ${getAvailableDishes().length} dishes across all categories`;
            return;
        }
        const available = getAvailableByCategory(selected);
        if (selected === '__all__') {
            categoryModalCount.textContent = `${available.length} / ${ALL_DISHES.length} dishes available`;
        } else {
            const total = ALL_DISHES.filter(d => d.category === selected).length;
            categoryModalCount.textContent = `${available.length} / ${total} in "${selected}"`;
        }
    }

    function renderItemList() {
        if (!itemGrid) return;
        itemGrid.innerHTML = '';
        if (ALL_DISHES.length === 0) {
            const e = document.createElement('span');
            e.style.cssText = 'color:#b09880;font-style:italic;padding:0.5rem;';
            e.textContent = 'no dishes yet — add some!';
            itemGrid.appendChild(e);
            return;
        }
        const selected = categorySelect.value;
        const filtered = selected === '__all__' ? ALL_DISHES : ALL_DISHES.filter(d => d.category === selected);
        if (filtered.length === 0) {
            const e = document.createElement('span');
            e.style.cssText = 'color:#b09880;font-style:italic;padding:0.5rem;';
            e.textContent = `no dishes in "${selected}"`;
            itemGrid.appendChild(e);
            return;
        }
        filtered.forEach(dish => {
            const badge = document.createElement('span');
            badge.className = 'item-badge';
            if (picked.includes(dish.name)) badge.classList.add('consumed');
            if (deleteMode && !picked.includes(dish.name)) badge.classList.add('delete-mode-active');
            if (deleteMode && !picked.includes(dish.name)) {
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.className = 'select-checkbox';
                cb.checked = selectedForDelete.has(dish.name);
                cb.addEventListener('change', (e) => { e.stopPropagation(); toggleSelectDish(dish.name); });
                badge.appendChild(cb);
            }
            const txt = document.createElement('span');
            txt.textContent = dish.name;
            badge.appendChild(txt);
            const catTag = document.createElement('span');
            catTag.className = 'category-tag';
            catTag.textContent = dish.category;
            badge.appendChild(catTag);
            if (deleteMode && !picked.includes(dish.name)) {
                const delBtn = document.createElement('button');
                delBtn.className = 'delete-btn';
                delBtn.textContent = '×';
                delBtn.addEventListener('click', (e) => { e.stopPropagation(); deleteDish(dish.name); });
                badge.appendChild(delBtn);
            }
            if (selectedForDelete.has(dish.name) && !picked.includes(dish.name)) {
                badge.classList.add('selected-for-delete');
            }
            badge.addEventListener('click', (e) => {
                if (deleteMode && !picked.includes(dish.name) && !e.target.closest('.delete-btn') && !e.target.closest('.select-checkbox')) {
                    toggleSelectDish(dish.name);
                }
            });
            itemGrid.appendChild(badge);
        });
    }

    function renderHistory() {
        if (!historyList) return;
        historyList.innerHTML = '';
        if (history.length === 0) {
            const e = document.createElement('div');
            e.className = 'history-empty';
            e.textContent = 'no dishes made yet';
            historyList.appendChild(e);
            return;
        }
        const reversed = [...history].reverse();
        reversed.forEach((entry, index) => {
            const originalIndex = history.length - 1 - index;
            const item = document.createElement('div');
            item.className = 'history-item';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'dish-name';
            nameSpan.textContent = entry.dish;

            const catSpan = document.createElement('span');
            catSpan.className = 'dish-category';
            catSpan.textContent = entry.category || 'Uncategorized';

            const dateWrap = document.createElement('span');
            dateWrap.style.cssText = 'display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;';
            const dateSpan = document.createElement('span');
            dateSpan.className = 'dish-date';
            dateSpan.textContent = entry.displayDate || entry.date || getCurrentDateTime();
            dateWrap.appendChild(dateSpan);
            if (entry.dateTag) {
                const dt = document.createElement('span');
                dt.className = 'dish-date-tag';
                dt.textContent = entry.dateTag;
                dateWrap.appendChild(dt);
            }

            const cookTags = document.createElement('div');
            cookTags.className = 'cook-tags';
            const deepTag = document.createElement('span');
            deepTag.className = `cook-tag ${entry.cook === 'deep' || entry.cook === 'both' ? 'active-deep' : 'inactive'}`;
            deepTag.textContent = '👨‍🍳 Deep';
            deepTag.addEventListener('click', () => toggleCook(originalIndex, 'deep'));
            const honeyTag = document.createElement('span');
            honeyTag.className = `cook-tag ${entry.cook === 'honey' || entry.cook === 'both' ? 'active-honey' : 'inactive'}`;
            honeyTag.textContent = '👩‍🍳 Honey';
            honeyTag.addEventListener('click', () => toggleCook(originalIndex, 'honey'));
            cookTags.appendChild(deepTag);
            cookTags.appendChild(honeyTag);

            const nameCatWrap = document.createElement('div');
            nameCatWrap.style.cssText = 'display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;';
            nameCatWrap.appendChild(nameSpan);
            nameCatWrap.appendChild(catSpan);

            const delBtn = document.createElement('button');
            delBtn.className = 'history-delete-btn';
            delBtn.textContent = '🗑️';
            delBtn.addEventListener('click', (e) => { e.stopPropagation(); openHistoryDeleteModal(originalIndex); });

            item.appendChild(nameCatWrap);
            item.appendChild(dateWrap);
            item.appendChild(cookTags);
            item.appendChild(delBtn);
            historyList.appendChild(item);
        });
    }

    async function toggleCook(historyIndex, cook) {
        if (historyIndex < 0 || historyIndex >= history.length) return;
        const entry = history[historyIndex];
        if (!entry) return;
        if (entry.cook === cook) {
            if (entry.cook === 'both') entry.cook = (cook === 'deep') ? 'honey' : 'deep';
            else entry.cook = '';
        } else if (entry.cook === '') entry.cook = cook;
        else if (entry.cook === 'deep' && cook === 'honey') entry.cook = 'both';
        else if (entry.cook === 'honey' && cook === 'deep') entry.cook = 'both';
        else if (entry.cook === 'both') entry.cook = (cook === 'deep') ? 'honey' : 'deep';
        renderHistory();
        await pushAllToCloud();
    }

    async function deleteDish(dishName) {
        if (!deleteMode) { showToast('🔒 Locked.', 2000); return; }
        if (picked.includes(dishName)) { showToast('⚠️ Already picked.', 2000); return; }
        const i = ALL_DISHES.findIndex(d => d.name === dishName);
        if (i !== -1) {
            ALL_DISHES.splice(i, 1);
            selectedForDelete.delete(dishName);
            updateUI();
            showToast(`🗑️ Deleted: ${dishName}`, 2500);
            await pushAllToCloud();
        }
    }

    function pickNextDishFromCategory(category, dateOption, customDateValue) {
        let available;
        if (category === '__random__') {
            const availCats = Array.from(categories).filter(cat => getAvailableByCategory(cat).length > 0);
            if (availCats.length === 0) return null;
            available = getAvailableByCategory(availCats[Math.floor(Math.random() * availCats.length)]);
        } else {
            available = getAvailableByCategory(category);
        }
        if (available.length === 0) return null;
        const dish = available[Math.floor(Math.random() * available.length)];
        const dateObj = getDateForOption(dateOption, customDateValue);
        let dateTag;
        if (dateOption === 'today') dateTag = '📅 Today';
        else if (dateOption === 'tomorrow') dateTag = '📅 Tomorrow';
        else if (dateOption === 'yesterday') dateTag = '📅 Yesterday';
        else if (dateOption === 'custom') dateTag = '📅 ' + getFormattedDate(dateObj);
        else dateTag = '📅 Today';

        picked.push(dish.name);
        history.push({
            dish: dish.name,
            category: dish.category,
            date: getFullDateTime(dateObj),
            displayDate: getFormattedDate(dateObj),
            dateTag: dateTag,
            cook: ''
        });
        return { dish, dateTag, dateObj };
    }

    function updatePopup(dish, category, dateInfo) {
        if (!popupDisplay) return;
        if (!dish) {
            popupDisplay.innerHTML = `<span class="popup-empty">✨ click refresh to pick a dish</span>`;
            return;
        }
        popupDisplay.innerHTML = '';
        const wrap = document.createElement('span');
        wrap.style.cssText = 'display:inline-flex;align-items:center;gap:0.8rem;flex-wrap:wrap;justify-content:center;';
        const icon = document.createElement('span');
        icon.className = 'popup-icon';
        icon.textContent = '🍽️';
        const text = document.createElement('span');
        text.className = 'popup-text';
        text.textContent = dish;
        const catTag = document.createElement('span');
        catTag.className = 'popup-category';
        catTag.textContent = category || 'Uncategorized';
        const dateTag = document.createElement('span');
        dateTag.className = 'popup-date';
        dateTag.textContent = dateInfo || '📅 Today';
        const tag = document.createElement('span');
        tag.className = 'popup-tag';
        tag.textContent = `#${picked.length}`;
        wrap.appendChild(icon);
        wrap.appendChild(text);
        wrap.appendChild(catTag);
        wrap.appendChild(dateTag);
        wrap.appendChild(tag);
        popupDisplay.appendChild(wrap);
    }

    function openCategoryModal() {
        if (ALL_DISHES.length === 0) { showToast('📭 No dishes yet.', 2500); return; }
        if (getAvailableDishes().length === 0) { showToast('🎉 All picked! Reset first.', 2500); return; }
        const todayRadio = document.querySelector('input[name="dishDate"][value="today"]');
        if (todayRadio) todayRadio.checked = true;
        document.querySelectorAll('.date-option label').forEach(l => l.classList.remove('selected'));
        const tl = document.getElementById('todayLabel');
        if (tl) tl.classList.add('selected');
        if (customDateRow) customDateRow.classList.remove('visible');
        if (customDateInput) customDateInput.value = '';
        if (customDatePreview) customDatePreview.textContent = '';
        updateCategoryModalDropdown();
        categoryModal.classList.add('active');
    }

    function closeCategoryModal() {
        categoryModal.classList.remove('active');
        if (customDateRow) customDateRow.classList.remove('visible');
    }

    async function confirmCategoryPick() {
        const selected = categoryModalSelect.value;
        let dateOpt = 'today';
        document.querySelectorAll('input[name="dishDate"]').forEach(r => { if (r.checked) dateOpt = r.value; });

        if (dateOpt === 'custom') {
            if (!customDateInput || !customDateInput.value) {
                showToast('⚠️ Please select a custom date.', 2500);
                if (customDateInput) customDateInput.focus();
                return;
            }
        }

        if (selected === '__all__' || selected === '__random__' || categories.has(selected)) {
            const result = pickNextDishFromCategory(selected, dateOpt, customDateInput ? customDateInput.value : '');
            if (result) {
                currentlyDisplayedDish = {
                    dish: result.dish.name,
                    category: result.dish.category,
                    dateTag: result.dateTag
                };
                updatePopup(result.dish.name, result.dish.category, result.dateTag);
                updateUI();
                if (navigator.vibrate) navigator.vibrate(10);
                showToast(`🍽️ ${result.dish.name} · ${result.dateTag}`, 2500);
                closeCategoryModal();
                await pushAllToCloud();
            } else {
                showToast('No dishes available.', 2000);
            }
        } else {
            showToast('Invalid category.', 2000);
        }
    }

    function setupDateOptions() {
        document.querySelectorAll('.date-option label').forEach(label => {
            label.addEventListener('click', function() {
                const radio = this.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                    document.querySelectorAll('.date-option label').forEach(l => l.classList.remove('selected'));
                    this.classList.add('selected');
                    if (radio.value === 'custom') {
                        if (customDateRow) customDateRow.classList.add('visible');
                        if (customDateInput) {
                            if (!customDateInput.value) {
                                const today = new Date();
                                const yyyy = today.getFullYear();
                                const mm = String(today.getMonth() + 1).padStart(2, '0');
                                const dd = String(today.getDate()).padStart(2, '0');
                                customDateInput.value = `${yyyy}-${mm}-${dd}`;
                                updateCustomDatePreview();
                            }
                            setTimeout(() => customDateInput.focus(), 100);
                        }
                    } else {
                        if (customDateRow) customDateRow.classList.remove('visible');
                    }
                }
            });
        });

        if (customDateInput) {
            customDateInput.addEventListener('change', updateCustomDatePreview);
            customDateInput.addEventListener('input', updateCustomDatePreview);
        }
    }

    function updateCustomDatePreview() {
        if (!customDateInput || !customDatePreview) return;
        if (!customDateInput.value) { customDatePreview.textContent = ''; return; }
        const parts = customDateInput.value.split('-');
        if (parts.length === 3) {
            const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            customDatePreview.textContent = '→ ' + getFormattedDate(d);
        }
    }

    async function handleReset() {
        if (ALL_DISHES.length === 0) { showToast('📭 No dishes to reset.', 2000); return; }
        picked = [];
        selectedForDelete.clear();
        currentlyDisplayedDish = null;
        updatePopup(null, null, null);
        updateUI();
        showToast('🔄 All dishes available again! (history preserved)', 2000);
        await pushAllToCloud();
    }

    function handleClearHistory() {
        if (history.length === 0) { showToast('📭 No history to clear!', 2000); return; }
        if (clearHistoryPassword) clearHistoryPassword.value = '';
        if (clearHistoryError) clearHistoryError.classList.remove('show');
        clearHistoryModal.classList.add('active');
        if (clearHistoryPassword) clearHistoryPassword.focus();
    }

    function closeClearHistoryModal() {
        clearHistoryModal.classList.remove('active');
        if (clearHistoryPassword) clearHistoryPassword.value = '';
        if (clearHistoryError) clearHistoryError.classList.remove('show');
    }

    async function confirmClearHistory() {
        if (clearHistoryPassword && clearHistoryPassword.value !== PASSWORD) {
            if (clearHistoryError) clearHistoryError.classList.add('show');
            clearHistoryPassword.value = '';
            clearHistoryPassword.focus();
            setTimeout(() => clearHistoryError && clearHistoryError.classList.remove('show'), 3000);
            return;
        }
        history = [];
        picked = [];
        selectedForDelete.clear();
        currentlyDisplayedDish = null;
        updatePopup(null, null, null);
        updateUI();
        closeClearHistoryModal();
        showToast('🗑️ All history cleared! (also from cloud)', 2500);
        await pushAllToCloud();
    }

    async function addNewDish() {
        const raw = newDishInput.value.trim();
        if (!raw) { showToast('⚠️ Enter a dish name.', 2000); return; }
        const category = newCategoryInput.value.trim() || 'Uncategorized';
        if (ALL_DISHES.some(d => d.name.toLowerCase() === raw.toLowerCase())) {
            showToast(`⚠️ "${raw}" already exists.`, 2500);
            newDishInput.value = '';
            return;
        }
        ALL_DISHES.push({ name: raw, category: category });
        updateUI();
        newDishInput.value = '';
        newCategoryInput.value = '';
        newDishInput.focus();
        showToast(`✅ Added: ${raw}`, 2000);
        await pushAllToCloud();
    }

    // Parse one CSV row, honoring quoted fields like "Sev Tamatar, Nu Shak",Side
    function parseCsvLine(line) {
        const out = [];
        let cur = '', inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (inQuotes) {
                if (ch === '"') {
                    if (line[i + 1] === '"') { cur += '"'; i++; }
                    else inQuotes = false;
                } else cur += ch;
            } else if (ch === '"') inQuotes = true;
            else if (ch === ',') { out.push(cur); cur = ''; }
            else cur += ch;
        }
        out.push(cur);
        return out;
    }

    async function handleBulkImport(file) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            const content = e.target.result;
            if (/\.(xlsx|xls)$/i.test(file.name || '')) {
                showToast('⚠️ Binary Excel detected — please export as CSV first.', 3500);
                bulkFileInput.value = '';
                return;
            }
            const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
            let addedCount = 0;
            const duplicates = [];
            lines.forEach((line, idx) => {
                if (idx === 0 && (line.toLowerCase().includes('dish') || line.toLowerCase().includes('category'))) return;
                let parts = parseCsvLine(line).map(s => s.trim());
                let dishName, category;
                if (parts.length >= 2 && parts[1].length > 0) {
                    dishName = parts[0];
                    category = parts[1];
                } else {
                    dishName = parts[0];
                    category = 'Uncategorized';
                }
                if (dishName) {
                    if (!ALL_DISHES.some(d => d.name.toLowerCase() === dishName.toLowerCase())) {
                        ALL_DISHES.push({ name: dishName, category: category });
                        addedCount++;
                    } else duplicates.push(dishName);
                }
            });
            if (addedCount > 0) {
                updateUI();
                showToast(`✅ Imported ${addedCount} dish(es)! Saving to cloud...`, 2500);
                if (duplicates.length > 0) {
                    showToast(`⚠️ Skipped ${duplicates.length} duplicates.`, 3000);
                }
                await pushAllToCloud();
            } else {
                showToast('ℹ️ No new dishes found.', 2500);
            }
            bulkFileInput.value = '';
        };
        reader.onerror = function() { showToast('❌ Error reading file.', 2000); bulkFileInput.value = ''; };
        reader.readAsText(file);
    }

    function handleExportExcel() {
        if (ALL_DISHES.length === 0) { showToast('📭 No dishes to export.', 2000); return; }
        let content = 'Dish Name,Category\n';
        content += ALL_DISHES.map(d => `"${d.name}","${d.category}"`).join('\n');
        const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dishes_export_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('📤 Exported!', 2000);
    }

    function escapeHtml(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function generateFullHTMLEmail() {
        const deepCount = history.filter(e => e.cook === 'deep' || e.cook === 'both').length;
        const honeyCount = history.filter(e => e.cook === 'honey' || e.cook === 'both').length;
        const bothCount = history.filter(e => e.cook === 'both').length;
        const noneCount = history.filter(e => !e.cook).length;
        const byCat = {};
        history.forEach(e => {
            const c = e.category || 'Uncategorized';
            if (!byCat[c]) byCat[c] = [];
            byCat[c].push(e);
        });
        let html = `<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:800px;margin:0 auto;background:#fffbf8;padding:40px;border-radius:24px;">
            <h1 style="color:#4d3422;border-bottom:3px solid #a8846a;padding-bottom:15px;text-align:center;">🍽️ My Cooking Log</h1>
            <p style="text-align:center;color:#7a5f47;"><strong>📅 Generated:</strong> ${getCurrentDateTime()}</p>
            <div style="font-size:20px;font-weight:bold;color:#4d3422;text-align:center;margin:20px 0;">
                📊 <span style="font-size:28px;">${history.length}</span> Total Dishes Made
            </div>
            <div style="background:#f5f0eb;padding:20px;border-radius:12px;margin:20px 0;">
                <strong>📈 Summary</strong>
                <div style="display:flex;justify-content:space-around;flex-wrap:wrap;gap:15px;margin:15px 0;">
                    <div style="background:white;padding:10px 20px;border-radius:8px;text-align:center;min-width:120px;">
                        <div style="font-size:24px;font-weight:bold;color:#2c3e50;">${deepCount}</div>
                        <div style="font-size:12px;color:#7a5f47;">👨‍🍳 Deep</div>
                    </div>
                    <div style="background:white;padding:10px 20px;border-radius:8px;text-align:center;min-width:120px;">
                        <div style="font-size:24px;font-weight:bold;color:#d4a373;">${honeyCount}</div>
                        <div style="font-size:12px;color:#7a5f47;">👩‍🍳 Honey</div>
                    </div>
                    <div style="background:white;padding:10px 20px;border-radius:8px;text-align:center;min-width:120px;">
                        <div style="font-size:24px;font-weight:bold;color:#8a6e4b;">${bothCount}</div>
                        <div style="font-size:12px;color:#7a5f47;">👨‍🍳👩‍🍳 Both</div>
                    </div>
                    <div style="background:white;padding:10px 20px;border-radius:8px;text-align:center;min-width:120px;">
                        <div style="font-size:24px;font-weight:bold;color:#b09880;">${noneCount}</div>
                        <div style="font-size:12px;color:#7a5f47;">⚠️ Not Assigned</div>
                    </div>
                </div>
            </div>`;
        if (history.length === 0) {
            html += `<p style="text-align:center;color:#b09880;font-style:italic;">No dishes yet.</p>`;
        } else {
            Object.keys(byCat).sort().forEach(cat => {
                html += `<h3 style="color:white;background:#2d6a4f;padding:8px 16px;border-radius:8px;display:inline-block;">📂 ${escapeHtml(cat)}</h3>
                <table style="width:100%;border-collapse:collapse;margin:15px 0;">
                    <thead><tr>
                        <th style="background:#4d3422;color:white;padding:10px;text-align:left;">#</th>
                        <th style="background:#4d3422;color:white;padding:10px;text-align:left;">🍽️ Dish</th>
                        <th style="background:#4d3422;color:white;padding:10px;text-align:left;">📅 Date</th>
                        <th style="background:#4d3422;color:white;padding:10px;text-align:left;">Cook</th>
                    </tr></thead><tbody>`;
                byCat[cat].forEach((entry, idx) => {
                    let cook = '⚠️ Not Assigned';
                    if (entry.cook === 'deep') cook = '👨‍🍳 Deep';
                    else if (entry.cook === 'honey') cook = '👩‍🍳 Honey';
                    else if (entry.cook === 'both') cook = '👨‍🍳👩‍🍳 Both';
                    html += `<tr style="border-bottom:1px solid #e8ddd0;">
                        <td style="padding:10px;">${idx + 1}</td>
                        <td style="padding:10px;font-weight:bold;">${escapeHtml(entry.dish)}</td>
                        <td style="padding:10px;color:#7a5f47;">${entry.displayDate || 'N/A'}${entry.dateTag ? ' ' + entry.dateTag : ''}</td>
                        <td style="padding:10px;">${cook}</td>
                    </tr>`;
                });
                html += `</tbody></table>`;
            });
        }
        html += `<div style="background:#f5f0eb;padding:15px;border-radius:8px;margin:20px 0;">
            <p><strong>📋 Total dishes:</strong> ${ALL_DISHES.length}</p>
            <p><strong>📋 Remaining:</strong> ${ALL_DISHES.length - picked.length}</p>
            <p><strong>📋 Total cooked:</strong> ${history.length}</p>
        </div>
        <p style="text-align:center;color:#7a5f47;font-size:12px;">✨ Auto-generated by Dish Picker</p></div>`;
        return html;
    }

    function generatePlainTextEmail() {
        let b = '🍽️ MY COOKING LOG\n' + '═'.repeat(50) + '\n\n';
        b += '📅 Generated: ' + getCurrentDateTime() + '\n' + '━'.repeat(50) + '\n\n';
        b += '📊 TOTAL DISHES MADE: ' + history.length + '\n' + '━'.repeat(50) + '\n\n';
        if (history.length === 0) b += 'No dishes yet.\n';
        else {
            const byCat = {};
            history.forEach(e => {
                const c = e.category || 'Uncategorized';
                if (!byCat[c]) byCat[c] = [];
                byCat[c].push(e);
            });
            Object.keys(byCat).sort().forEach(cat => {
                b += `📂 ${cat.toUpperCase()}\n` + '─'.repeat(40) + '\n';
                byCat[cat].forEach((entry, idx) => {
                    b += `  ${idx + 1}. ${entry.dish} — ${entry.displayDate || 'N/A'}`;
                    if (entry.dateTag) b += ` ${entry.dateTag}`;
                    if (entry.cook === 'both') b += ' [DEEP & HONEY]';
                    else if (entry.cook === 'deep') b += ' [DEEP]';
                    else if (entry.cook === 'honey') b += ' [HONEY]';
                    b += '\n';
                });
                b += '\n';
            });
        }
        b += '\n' + '═'.repeat(50) + '\n✨ Auto-generated';
        return b;
    }

    // ⬇️⬇️ EMAIL HANDLERS — WITH AUTO-CLEAR AFTER 3 SECONDS ⬇️⬇️
    async function clearHistoryAfterEmail() {
        if (history.length === 0 && picked.length === 0) return;
        history = [];
        picked = [];
        selectedForDelete.clear();
        currentlyDisplayedDish = null;
        updatePopup(null, null, null);
        updateUI();
        showToast('🗑️ History cleared after email', 2500);
        await pushAllToCloud();
    }

    function scheduleHistoryClear() {
        setTimeout(async () => {
            await clearHistoryAfterEmail();
        }, 3000);
    }

    function optionHTML() {
        if (history.length === 0) { showToast('📭 No history!', 2500); return; }
        const full = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${generateFullHTMLEmail()}</body></html>`;
        copyToClipboard(full, '💕 HTML copied! History will clear in 3 seconds...');
        scheduleHistoryClear();
    }

    function optionOpen() {
        if (history.length === 0) { showToast('📭 No history!', 2500); return; }
        const sub = encodeURIComponent(getSubjectLine());
        const body = encodeURIComponent(generatePlainTextEmail());
        window.location.href = `mailto:?subject=${sub}&body=${body}`;
        showToast('📧 Email opening! History will clear in 3 seconds...', 2500);
        closeEmailOptions();
        scheduleHistoryClear();
    }

    function copyToClipboard(text, successMsg) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showToast(successMsg, 3000);
                closeEmailOptions();
            }).catch(() => fallbackCopy(text, successMsg));
        } else fallbackCopy(text, successMsg);
    }

    function fallbackCopy(text, successMsg) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            showToast(successMsg, 2000);
            closeEmailOptions();
        } catch (e) { showToast('❌ Copy failed.', 2000); }
        document.body.removeChild(ta);
    }

    function openEmailOptions() {
        if (history.length === 0) { showToast('📭 No history!', 2500); return; }
        if (emailSubjectPreview) emailSubjectPreview.textContent = getSubjectLine();
        emailOptionsModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeEmailOptions() {
        emailOptionsModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function openModal() {
        if (deleteMode) {
            deleteMode = false;
            selectedForDelete.clear();
            updateUI();
            showToast('🔒 Locked', 2000);
            return;
        }
        modal.classList.add('active');
        passwordInput.value = '';
        passwordError.classList.remove('show');
        passwordInput.focus();
    }

    function closeModal() {
        modal.classList.remove('active');
        passwordError.classList.remove('show');
    }

    function verifyPassword() {
        if (passwordInput.value === PASSWORD) {
            deleteMode = true;
            closeModal();
            showToast('🔓 Delete mode ON', 3000);
            updateUI();
        } else {
            passwordError.classList.add('show');
            passwordInput.value = '';
            passwordInput.focus();
            setTimeout(() => passwordError.classList.remove('show'), 3000);
        }
    }

    function saveLocalBackup() {
        try {
            localStorage.setItem('dishPickerData', JSON.stringify({
                history: history,
                allDishes: ALL_DISHES,
                picked: picked,
                savedAt: Date.now()
            }));
        } catch (e) {}
    }

    function loadLocalBackup() {
        try {
            const saved = localStorage.getItem('dishPickerData');
            if (!saved) return false;
            const parsed = JSON.parse(saved);
            if (parsed.history && Array.isArray(parsed.history)) history = parsed.history;
            if (parsed.allDishes && Array.isArray(parsed.allDishes)) {
                ALL_DISHES = parsed.allDishes.map(d => typeof d === 'string' ? { name: d, category: 'Uncategorized' } : d);
            }
            if (parsed.picked && Array.isArray(parsed.picked)) picked = parsed.picked;
            return true;
        } catch (e) { return false; }
    }

    // ============================================================
    // WHATSAPP
    // ============================================================
    function buildWhatsAppMessage() {
        let dishName = currentlyDisplayedDish ? currentlyDisplayedDish.dish : null;
        let category = currentlyDisplayedDish ? currentlyDisplayedDish.category : null;
        let dateTag = currentlyDisplayedDish ? currentlyDisplayedDish.dateTag : null;
        let cook = '';

        if (!dishName && history.length > 0) {
            const latest = history[history.length - 1];
            dishName = latest.dish;
            category = latest.category;
            dateTag = latest.dateTag;
            cook = latest.cook || '';
        } else if (currentlyDisplayedDish) {
            for (let i = history.length - 1; i >= 0; i--) {
                if (history[i].dish === dishName) {
                    cook = history[i].cook || '';
                    break;
                }
            }
        }

        if (!dishName) {
            return `🍽️ *Dish Log Selected by Me {Shinu}* 🍽️\n\n💭 No dish currently selected.`;
        }

        const todayStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        let msg = `🍽️ *Dish Log Selected by Me {Shinu}* 🍽️\n`;
        msg += `📅 *${todayStr}*\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        msg += `🍽️ *DISH*\n`;
        msg += `Name: *${dishName}*\n`;
        if (category) msg += `Category: *${category}*\n`;

        msg += `\n`;

        if (dateTag) msg += `${dateTag}\n`;
        if (cook) {
            const cookLabel = cook === 'both' ? '*👨‍🍳👩‍🍳 Both*' :
                              cook === 'deep' ? '*👨‍🍳 Deep*' :
                              cook === 'honey' ? '*👩‍🍳 Honey*' : cook;
            msg += `Cook: ${cookLabel}\n`;
        }

        msg += `\n━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `💕 *Chosen with love by DeepNectar. * 💕`;
        return msg;
    }

    function openWhatsAppModal() {
        if (!currentlyDisplayedDish && history.length === 0) {
            showToast('📭 No dish picked yet!', 2500);
            return;
        }
        selectedRecipient = null;
        updateSendButtonState();
        waAddForm.classList.remove('visible');
        waNewName.value = '';
        waNewNumber.value = '';
        renderRecipients();
        if (waPreview) waPreview.textContent = buildWhatsAppMessage();
        waModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeWhatsAppModal() {
        waModal.classList.remove('active');
        document.body.style.overflow = '';
        selectedRecipient = null;
        updateSendButtonState();
        waAddForm.classList.remove('visible');
    }

    function sendWhatsApp() {
        if (!selectedRecipient || !selectedRecipient.number) {
            showToast('⚠️ Please select a recipient first.', 2500);
            return;
        }
        const phone = selectedRecipient.number.replace(/\D/g, '');
        const message = buildWhatsAppMessage();
        const encoded = encodeURIComponent(message);
        const url = `https://wa.me/${phone}?text=${encoded}`;

        const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
        saveLastUsed(phone);
        if (isMobile) {
            window.location.href = url;
        } else {
            window.open(url, '_blank');
        }
        showToast(`💬 WhatsApp opening for ${selectedRecipient.name}! History preserved 💕`, 2800);
        closeWhatsAppModal();
    }

    function toggleAddForm() {
        waAddForm.classList.toggle('visible');
        if (waAddForm.classList.contains('visible')) {
            setTimeout(() => waNewName.focus(), 100);
        }
    }

    function saveNewRecipient() {
        const name = (waNewName.value || '').trim();
        const number = (waNewNumber.value || '').replace(/\D/g, '');
        if (!name) { showToast('⚠️ Enter a name.', 2000); waNewName.focus(); return; }
        if (!number || number.length < 8) { showToast('⚠️ Enter a valid number.', 2500); waNewNumber.focus(); return; }
        if (addRecipient(name, number)) {
            waNewName.value = '';
            waNewNumber.value = '';
            waAddForm.classList.remove('visible');
            selectedRecipient = { name, number };
            renderRecipients();
            updateSendButtonState();
        }
    }

    // ============================================================
    // INIT
    // ============================================================
    async function init() {
        loadLocalBackup();
        loadRecipients();
        ALL_DISHES = ALL_DISHES.map(d => typeof d === 'string' ? { name: d, category: 'Uncategorized' } : d);

        if (history.length > 0) {
            const latest = history[history.length - 1];
            currentlyDisplayedDish = {
                dish: latest.dish,
                category: latest.category,
                dateTag: latest.dateTag
            };
            updatePopup(latest.dish, latest.category, latest.dateTag);
        } else {
            updatePopup(null, null, null);
        }

        updateUI();
        setupDateOptions();
        setupManualDateDropdown();

        if (supabaseClient) {
            setSyncStatus('syncing', '🔄 connecting...');
            const ok = await pullAllFromCloud();
            if (ok) {
                ALL_DISHES = ok.dishes;
                history = ok.history;
                picked = ok.picked;
                if (history.length > 0) {
                    const latest = history[history.length - 1];
                    currentlyDisplayedDish = {
                        dish: latest.dish,
                        category: latest.category,
                        dateTag: latest.dateTag
                    };
                    updatePopup(latest.dish, latest.category, latest.dateTag);
                }
                lastSyncTime = Date.now();
                setSyncStatus('online', '☁️ synced');
                updateLastSyncInfo();
                updateUI();
                showToast('☁️ Loaded from cloud!', 2000);
            } else {
                setSyncStatus('offline', '⚠️ offline');
            }
            startAutoSync();
        } else {
            setSyncStatus('offline', '⚠️ no cloud');
        }

        if (refreshBtn) refreshBtn.addEventListener('click', openCategoryModal);
        if (categoryModalConfirm) categoryModalConfirm.addEventListener('click', confirmCategoryPick);
        if (categoryModalCancel) categoryModalCancel.addEventListener('click', closeCategoryModal);
        if (categoryModal) categoryModal.addEventListener('click', (e) => { if (e.target === categoryModal) closeCategoryModal(); });
        if (categoryModalSelect) categoryModalSelect.addEventListener('change', updateCategoryModalCount);

        if (historyDeleteConfirm) historyDeleteConfirm.addEventListener('click', confirmHistoryDelete);
        if (historyDeleteCancel) historyDeleteCancel.addEventListener('click', closeHistoryDeleteModal);
        if (historyDeleteModal) historyDeleteModal.addEventListener('click', (e) => { if (e.target === historyDeleteModal) closeHistoryDeleteModal(); });
        if (historyDeletePassword) historyDeletePassword.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); confirmHistoryDelete(); }
            if (e.key === 'Escape') closeHistoryDeleteModal();
        });

        if (resetBtn) resetBtn.addEventListener('click', handleReset);
        if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', handleClearHistory);
        if (emailBtn) emailBtn.addEventListener('click', openEmailOptions);
        if (whatsappBtn) whatsappBtn.addEventListener('click', openWhatsAppModal);
        if (addDishBtn) addDishBtn.addEventListener('click', addNewDish);
        if (deleteModeBtn) deleteModeBtn.addEventListener('click', openModal);
        if (syncBtn) syncBtn.addEventListener('click', () => syncNow(false));

        if (manualAddBtn) manualAddBtn.addEventListener('click', openManualAddModal);
        if (manualAddConfirm) manualAddConfirm.addEventListener('click', confirmManualAdd);
        if (manualAddCancel) manualAddCancel.addEventListener('click', closeManualAddModal);
        if (manualAddModal) manualAddModal.addEventListener('click', (e) => { if (e.target === manualAddModal) closeManualAddModal(); });
        if (manualDishName) manualDishName.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); confirmManualAdd(); }
            if (e.key === 'Escape') closeManualAddModal();
        });
        if (manualCategory) manualCategory.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); confirmManualAdd(); }
        });

        if (bulkDeleteBtn) bulkDeleteBtn.addEventListener('click', showBulkDeleteModal);
        if (bulkDeleteConfirm) bulkDeleteConfirm.addEventListener('click', confirmBulkDelete);
        if (bulkDeleteCancel) bulkDeleteCancel.addEventListener('click', closeBulkDeleteModal);
        if (bulkDeleteModal) bulkDeleteModal.addEventListener('click', (e) => { if (e.target === bulkDeleteModal) closeBulkDeleteModal(); });
        if (bulkDeletePassword) bulkDeletePassword.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); confirmBulkDelete(); }
            if (e.key === 'Escape') closeBulkDeleteModal();
        });

        if (selectAllCheckbox) selectAllCheckbox.addEventListener('change', selectAllDishes);
        if (categorySelect) categorySelect.addEventListener('change', () => {
            selectedForDelete.clear();
            updateCategoryCount();
            renderItemList();
            updateSelectedCount();
        });

        if (bulkFileInput) bulkFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) handleBulkImport(e.target.files[0]);
        });
        if (exportExcelBtn) exportExcelBtn.addEventListener('click', handleExportExcel);

        if (clearHistoryConfirm) clearHistoryConfirm.addEventListener('click', confirmClearHistory);
        if (clearHistoryCancel) clearHistoryCancel.addEventListener('click', closeClearHistoryModal);
        if (clearHistoryModal) clearHistoryModal.addEventListener('click', (e) => { if (e.target === clearHistoryModal) closeClearHistoryModal(); });
        if (clearHistoryPassword) clearHistoryPassword.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); confirmClearHistory(); }
            if (e.key === 'Escape') closeClearHistoryModal();
        });

        if (emailOptionsClose) emailOptionsClose.addEventListener('click', closeEmailOptions);
        if (htmlOptionBtn) htmlOptionBtn.addEventListener('click', optionHTML);
        if (openOptionBtn) openOptionBtn.addEventListener('click', optionOpen);
        if (emailOptionsModal) emailOptionsModal.addEventListener('click', (e) => { if (e.target === emailOptionsModal) closeEmailOptions(); });

        if (waCancelBtn) waCancelBtn.addEventListener('click', closeWhatsAppModal);
        if (waSendBtn) waSendBtn.addEventListener('click', sendWhatsApp);
        if (waModal) waModal.addEventListener('click', (e) => { if (e.target === waModal) closeWhatsAppModal(); });
        if (waAddNewToggle) waAddNewToggle.addEventListener('click', (e) => { e.preventDefault(); toggleAddForm(); });
        if (waAddSaveBtn) waAddSaveBtn.addEventListener('click', saveNewRecipient);
        if (waAddCancelBtn) waAddCancelBtn.addEventListener('click', () => { waAddForm.classList.remove('visible'); waNewName.value = ''; waNewNumber.value = ''; });
        if (waNewName) waNewName.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); waNewNumber.focus(); } });
        if (waNewNumber) waNewNumber.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); saveNewRecipient(); } });

        if (newDishInput) newDishInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); addNewDish(); }
        });
        if (newCategoryInput) newCategoryInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); addNewDish(); }
        });

        if (modalConfirm) modalConfirm.addEventListener('click', verifyPassword);
        if (modalCancel) modalCancel.addEventListener('click', closeModal);
        if (passwordInput) passwordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); verifyPassword(); }
            if (e.key === 'Escape') closeModal();
        });
        if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
            if ((e.key === 'r' || e.key === 'R') && !refreshBtn?.disabled) {
                e.preventDefault();
                openCategoryModal();
            }
            if (e.key === 'Escape') {
                if (categoryModal.classList.contains('active')) closeCategoryModal();
                else if (historyDeleteModal.classList.contains('active')) closeHistoryDeleteModal();
                else if (manualAddModal.classList.contains('active')) closeManualAddModal();
                else if (modal.classList.contains('active')) closeModal();
                else if (emailOptionsModal.classList.contains('active')) closeEmailOptions();
                else if (waModal.classList.contains('active')) closeWhatsAppModal();
                else if (clearHistoryModal.classList.contains('active')) closeClearHistoryModal();
                else if (bulkDeleteModal.classList.contains('active')) closeBulkDeleteModal();
            }
        });

        document.addEventListener('visibilitychange', async () => {
            if (!document.hidden && supabaseClient) {
                const before = JSON.stringify({ h: history, d: ALL_DISHES, p: picked });
                const ok = await pullAllFromCloud();
                if (ok) {
                    const after = JSON.stringify({ h: ok.history, d: ok.dishes, p: ok.picked });
                    if (before !== after) {
                        ALL_DISHES = ok.dishes;
                        history = ok.history;
                        picked = ok.picked;
                        if (history.length > 0) {
                            const latest = history[history.length - 1];
                            currentlyDisplayedDish = {
                                dish: latest.dish,
                                category: latest.category,
                                dateTag: latest.dateTag
                            };
                            updatePopup(latest.dish, latest.category, latest.dateTag);
                        }
                        updateUI();
                        showToast('🔄 Refreshed from cloud', 2000);
                    }
                }
            }
        });

        setInterval(saveLocalBackup, 5000);

        console.log('🍽️ Dish Picker cloud-synced ready!');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
