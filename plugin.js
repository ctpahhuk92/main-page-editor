class MainPageEditorPlugin {
    constructor() {
        this.id = 'main-page-editor';
        this.name = 'Main Page Editor';
        this.version = '1.0.0';
        this.icon = 'fas fa-th-large';
    }

    init() {
        console.log(`[${this.name}] Инициализация...`);
    }

    ready() {
        if (!window.Lampa || !window.Lampa.main || !window.Lampa.settings) return;

        const sections = window.Lampa.main.getSections();
        const storage = window.Lampa.storage;

        // Создаём раздел настроек, если его ещё нет
        window.Lampa.settings.add({
            id: 'main-page-editor',
            title: 'Main Page Editor',
            html: '<div id="mpe_container" style="padding:10px;color:#fff;"></div>'
        });

        const container = document.getElementById('mpe_container');
        if (!container) return;

        // Заголовок
        const panelTitle = document.createElement('h3');
        panelTitle.textContent = 'Main Page Editor';
        container.appendChild(panelTitle);

        // Контейнер для контролов
        const controls = document.createElement('div');
        controls.id = 'mpe_controls';
        container.appendChild(controls);

        // Загружаем сохранённые настройки
        let order = storage.get('mainSectionsOrder') || sections.map(s => s.id);
        let hidden = storage.get('mainSectionsHidden') || {};

        // Функция для применения настроек
        const applySettings = () => {
            sections.forEach(sec => {
                try {
                    window.Lampa.main.setSectionHidden(sec.id, Boolean(hidden[sec.id]));
                    window.Lampa.main.setSectionOrder(sec.id, order.indexOf(sec.id));
                } catch(e) {
                    console.warn('[MainPageEditor] Не удалось применить настройки для', sec.id);
                }
            });
        };

        // Функция для отрисовки UI
        const renderUI = () => {
            controls.innerHTML = '';
            order.forEach(id => {
                const sec = sections.find(s => s.id === id);
                if (!sec) return;

                const row = document.createElement('div');
                row.style.display = 'flex';
                row.style.alignItems = 'center';
                row.style.marginBottom = '8px';

                const chk = document.createElement('input');
                chk.type = 'checkbox';
                chk.checked = !hidden[id];
                chk.style.marginRight = '6px';
                chk.onchange = () => {
                    hidden[id] = !chk.checked;
                    storage.set('mainSectionsHidden', hidden);
                    applySettings();
                };

                const label = document.createElement('span');
                label.textContent = sec.name;
                label.style.flex = '1';

                const btnUp = document.createElement('button');
                btnUp.textContent = '↑';
                btnUp.style.marginRight = '4px';
                btnUp.onclick = () => {
                    const idx = order.indexOf(id);
                    if (idx > 0) {
                        [order[idx], order[idx-1]] = [order[idx-1], order[idx]];
                        storage.set('mainSectionsOrder', order);
                        renderUI();
                        applySettings();
                    }
                };

                const btnDown = document.createElement('button');
                btnDown.textContent = '↓';
                btnDown.onclick = () => {
                    const idx = order.indexOf(id);
                    if (idx < order.length - 1) {
                        [order[idx], order[idx+1]] = [order[idx+1], order[idx]];
                        storage.set('mainSectionsOrder', order);
                        renderUI();
                        applySettings();
                    }
                };

                row.appendChild(chk);
                row.appendChild(label);
                row.appendChild(btnUp);
                row.appendChild(btnDown);

                controls.appendChild(row);
            });
        };

        // Рисуем UI и применяем настройки
        renderUI();
        applySettings();
    }
}

// Регистрируем плагин только когда Lampa полностью загрузилась
(function waitLampa(){
    if(window.Lampa && window.Lampa.plugins){
        window.Lampa.plugins.register(new MainPageEditorPlugin());
    } else {
        setTimeout(waitLampa, 100); // проверка каждые 100мс
    }
})();
