class MainPageEditorPlugin {
    constructor() {
        this.id = 'main_page_editor';
        this.name = 'Main Page Editor';
        this.version = '1.0';
        this.icon = 'fas fa-th-large';
    }

    init() {
        console.log('[MainPageEditor] Инициализация плагина...');
    }

    ready() {
        if (!window.Lampa || !window.Lampa.main) return;

        const sections = window.Lampa.main.getSections(); // Берём разделы через API Lampa

        const storage = window.Lampa.storage || {};
        let savedOrder = storage.get('mainSectionsOrder') || sections.map(s => s.id);
        let savedHidden = storage.get('mainSectionsHidden') || {};

        const editorContainer = window.Lampa.settings.getContainer('Main Page Editor');
        if (!editorContainer) return;

        const panel = document.createElement('div');
        panel.style.padding = '10px';
        panel.style.background = '#222';
        panel.style.color = '#fff';
        panel.style.borderRadius = '5px';
        panel.style.marginBottom = '15px';
        panel.innerHTML = '<h3>Main Page Editor</h3><div id="mpe_controls"></div>';
        editorContainer.prepend(panel);

        const controls = panel.querySelector('#mpe_controls');

        savedOrder.forEach(id => {
            const section = sections.find(s => s.id === id);
            if (!section) return;

            const div = document.createElement('div');
            div.style.marginBottom = '8px';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = !savedHidden[id];
            checkbox.addEventListener('change', () => {
                savedHidden[id] = !checkbox.checked;
                storage.set('mainSectionsHidden', savedHidden);
                this.applySettings(sections, savedOrder, savedHidden);
            });

            const up = document.createElement('button');
            up.textContent = '↑';
            up.onclick = () => {
                const index = savedOrder.indexOf(id);
                if (index > 0) {
                    [savedOrder[index], savedOrder[index - 1]] = [savedOrder[index - 1], savedOrder[index]];
                    storage.set('mainSectionsOrder', savedOrder);
                    this.applySettings(sections, savedOrder, savedHidden);
                }
            };

            const down = document.createElement('button');
            down.textContent = '↓';
            down.onclick = () => {
                const index = savedOrder.indexOf(id);
                if (index < savedOrder.length - 1) {
                    [savedOrder[index], savedOrder[index + 1]] = [savedOrder[index + 1], savedOrder[index]];
                    storage.set('mainSectionsOrder', savedOrder);
                    this.applySettings(sections, savedOrder, savedHidden);
                }
            };

            div.appendChild(checkbox);
            div.appendChild(document.createTextNode(' ' + section.name));
            div.appendChild(up);
            div.appendChild(down);

            controls.appendChild(div);
        });

        this.applySettings(sections, savedOrder, savedHidden);
    }

    applySettings(sections, order, hidden) {
        sections.forEach((sect) => {
            try {
                window.Lampa.main.setSectionHidden(sect.id, Boolean(hidden[sect.id]));
                window.Lampa.main.setSectionOrder(sect.id, order.indexOf(sect.id));
            } catch (e) {
                console.warn('[MainPageEditor] Невозможно применить настройки для', sect.id);
            }
        });
    }
}

window.Lampa.plugins.register(new MainPageEditorPlugin());