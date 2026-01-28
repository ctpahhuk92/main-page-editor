(function(){

    const PLUGIN_ID = 'main_page_editor';
    const PLUGIN_NAME = 'Main Page Editor';
    const PLUGIN_VERSION = '1.0';

    function pluginInit(){
        if(!window.Lampa || !window.Lampa.plugins) return setTimeout(pluginInit, 100);
        
        // Регистрируем плагин
        window.Lampa.plugins.register({
            id: PLUGIN_ID,
            name: PLUGIN_NAME,
            version: PLUGIN_VERSION,
            icon: 'fas fa-th-large',
            default: true,

            init() {
                console.log(`[${PLUGIN_NAME}] initialized`);
            },

            ready() {
                const main = window.Lampa.main;

                if(!main) return console.warn(`[${PLUGIN_NAME}] Lampa.main not found`);

                const sections = main.getSections();
                const storage = window.Lampa.storage;

                // храним порядок и скрытые
                let savedOrder = storage.get('mpe_order') || sections.map(s=>s.id);
                let savedHidden = storage.get('mpe_hidden') || {};

                function applySettings(){
                    sections.forEach(sec => {
                        try {
                            main.setSectionHidden(sec.id, Boolean(savedHidden[sec.id]));
                            main.setSectionOrder(sec.id, savedOrder.indexOf(sec.id));
                        } catch (e) {}
                    });
                }

                // Добавляем в меню плагинов
                window.Lampa.settings.add({
                    id: PLUGIN_ID,
                    title: PLUGIN_NAME,
                    html: `<div id="mpe_root" style="padding:10px;"></div>`
                });

                setTimeout(()=>{
                    const root = document.getElementById('mpe_root');
                    if(!root) return;

                    savedOrder.forEach(secId => {
                        const sec = sections.find(s=>s.id === secId);
                        if(!sec) return;

                        const row = document.createElement('div');
                        row.style.marginBottom = '8px';
                        row.style.display = 'flex';
                        row.style.alignItems = 'center';

                        const chk = document.createElement('input');
                        chk.type = 'checkbox';
                        chk.checked = savedHidden[sec.id] !== true;
                        chk.onchange = () => {
                            savedHidden[sec.id] = !chk.checked;
                            storage.set('mpe_hidden', savedHidden);
                            applySettings();
                        };
                        row.appendChild(chk);

                        const label = document.createElement('span');
                        label.textContent = sec.name;
                        label.style.flex = '1';
                        label.style.marginLeft = '6px';
                        row.appendChild(label);

                        const up = document.createElement('button');
                        up.textContent = '↑';
                        up.onclick = () => {
                            const idx = savedOrder.indexOf(sec.id);
                            if(idx > 0){
                                [savedOrder[idx], savedOrder[idx-1]] = [savedOrder[idx-1], savedOrder[idx]];
                                storage.set('mpe_order', savedOrder);
                                applySettings();
                                location.reload();
                            }
                        };
                        row.appendChild(up);

                        const down = document.createElement('button');
                        down.textContent = '↓';
                        down.onclick = () => {
                            const idx = savedOrder.indexOf(sec.id);
                            if(idx < savedOrder.length - 1){
                                [savedOrder[idx], savedOrder[idx+1]] = [savedOrder[idx+1], savedOrder[idx]];
                                storage.set('mpe_order', savedOrder);
                                applySettings();
                                location.reload();
                            }
                        };
                        row.appendChild(down);

                        root.appendChild(row);
                    });

                    applySettings();
                }, 50);

            }
        });
    }

    pluginInit();

})();
