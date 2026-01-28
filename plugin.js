var CONFIG = {
    main: main
};

var STORAGE_KEY = "lampa_section_manager";

function SectionManager() {
    var self = this;
    var storage = {};

    self.init = function() {
        storage = Lampa.Storage.get(STORAGE_KEY, {});
        self.init = function() {};
    };

    self.get = function(sectionId) {
        return storage[sectionId] !== undefined ? storage[sectionId] : true;
    };

    self.set = function(sectionId, value) {
        storage[sectionId] = value;
        Lampa.Storage.set(STORAGE_KEY, storage);
    };

    self.toggle = function(sectionId) {
        self.set(sectionId, !self.get(sectionId));
    };

    self.saveOrder = function(orderArray) {
        storage._order = orderArray;
        Lampa.Storage.set(STORAGE_KEY, storage);
    };

    self.getOrder = function() {
        return storage._order || [];
    };
}

function renderSettings() {
    var container = $(".settings__list");
    if (!container.length) return;

    var manager = new SectionManager();
    manager.init();

    var sections = Lampa.LampaData.mainSections || [];
    var order = manager.getOrder();

    if(order.length) {
        sections.sort(function(a,b){
            return order.indexOf(a.id) - order.indexOf(b.id);
        });
    }

    // Создаём панель кнопок как в Movie Enhancer
    var panel = $('<div class="section-manager-panel"></div>');
    sections.forEach(function(section){
        var btn = $('<div class="section-btn"></div>').text(section.name);
        if(!manager.get(section.id)) btn.addClass("disabled");

        btn.on("click", function(){
            manager.toggle(section.id);
            $(this).toggleClass("disabled");
            Lampa.Listener.send("main_section_change", {id: section.id, enabled: manager.get(section.id)});
        });

        panel.append(btn);
    });

    container.append(panel);

    // Drag&Drop как в Movie Enhancer
    if(typeof $.fn.sortable === "function") {
        panel.sortable({
            items: '.section-btn',
            update: function() {
                var newOrder = [];
                panel.children().each(function(){
                    var text = $(this).text();
                    var sec = sections.find(s => s.name === text);
                    if(sec) newOrder.push(sec.id);
                });
                manager.saveOrder(newOrder);
                Lampa.Listener.send("main_section_reorder", {order: newOrder});
            }
        });
    }

    // Стилизация как в Movie Enhancer
    var style = `
        .section-manager-panel { display:flex; flex-wrap:wrap; gap:10px; padding:10px; }
        .section-btn { padding:6px 12px; background:#2c2c2c; color:#fff; border-radius:4px; cursor:pointer; user-select:none; }
        .section-btn.disabled { opacity:0.4; }
        .section-btn.ui-sortable-helper { opacity:0.8; }
    `;
    if(!$("head #section-manager-style").length){
        $("head").append('<style id="section-manager-style">' + style + '</style>');
    }
}

function applySections() {
    var manager = new SectionManager();
    manager.init();
    var order = manager.getOrder();
    var sections = Lampa.LampaData.mainSections || [];

    if(order.length) {
        sections.sort(function(a,b){
            return order.indexOf(a.id) - order.indexOf(b.id);
        });
    }

    sections.forEach(function(section){
        var enabled = manager.get(section.id);
        if(enabled === false) {
            $(".main__section[data-id='" + section.id + "']").hide();
        } else {
            $(".main__section[data-id='" + section.id + "']").show();
        }
    });
}

function main() {
    Lampa.Settings.add({
        name: "Section Manager",
        id: "section_manager",
        html: '<div class="settings__list"></div>',
        onOpen: renderSettings
    });

    Lampa.Listener.follow("ready", function() {
        applySections();
    });

    Lampa.Listener.follow("main_section_change", function() {
        applySections();
    });

    Lampa.Listener.follow("main_section_reorder", function() {
        applySections();
    });
}
