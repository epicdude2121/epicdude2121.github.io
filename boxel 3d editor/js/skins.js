class Skins {
    constructor() {
        this.default = { id: 1, url: 'img/png/skins/pink.png' }
        this.state = 'loading'; // Default unloaded
        this.getSkins();
    }
    
    getSkins() {
        var url  = 'json/skins.json';
        $.ajax({
            url: url,
            method: 'GET',
            success: function(response) {
                app.skins.addSkins(response);
            }
        });
    }
    
    addSkins(skins) {
        this.skins = skins; // Local JSON to global object
        var settings = app.storage.getSettings();
        for (var i = 0; i < skins.length; i++) {
            var skin = skins[i];
            if (skin.id == settings['skin']['id']) skin.url = settings['skin']['url'];
            app.skins.addSkin(skin);
            app.skins.enableSkin(skin);
        }
        // Selected active skin
        app.skins.selectSkin(settings['skin']);
        app.skins.state = 'loaded';
        app.skins.load();
    }

    addSkin(skin) {
        // Add skin to parent
        $('.skin-group').append(
            '<div class="skin" id="' + skin.id + '">' +
                '<div class="image" style="background-image: url(\'' + skin.url + '\')"></div>' +
                '<div class="title">' + skin.title + '</div>' +
            '</div>'
        );
    }

    enableSkin(skin) {
        var skinHTML = $('#' + skin.id);

        // Add click listener
        skinHTML.on('click', function(e) {
            var settings = app.storage.getSettings();
            settings.skin = skin;
            app.player.setSkin({ id: skin.id, url: skin.url });
            app.skins.selectSkin(skin);
            app.updateSettings(settings);
        });
    }

    selectSkin(skin) {
        $('.skins .skin').removeClass('selected') // Reset selected
        var skin = $('#' + skin.id);
        skin.addClass('selected');
    }

    addCustomSkinListener() {
        var skinId = 680; // Predefined in WordPress
        app.ui.controller.off('click', '.skin#' + skinId);
        app.ui.controller.on('click', '.skin#' + skinId, function(event) {
            var skinURL = app.skins.getSkinURL(skinId);
            app.storage.loadSkinFromFile(function(e) { $('#custom-skin').val(e); });
            app.ui.dialog.add({
                text: 'Custom Skin',
                inputs: [
                    { attributes: { value: skinURL, type: 'text', id: 'custom-skin' } },
                    { attributes: { value: 'Cancel', type: 'button' } },
                    { attributes: { value: 'Accept', type: 'button' }, function: app.skins.updateCustomSkin },
                ]
            });
        });
    }

    updateCustomSkin() {
        var skinId = 680; // Predefined in WordPress
        var dialog = app.ui.dialog.get();
        var input = dialog.find('input[type="text"]');
        var settings = app.storage.getSettings();
        var skin = { id: skinId, url: input.val() };
        $('.skin#' + skin.id + ' .image').attr('style', 'background-image: url(\'' + skin.url  + '\');')
        settings.skin = skin;
        app.player.setSkin(skin, app);
        app.updateSettings(settings);
    }

    getSkinURL(skinId, a = app) {
        var url = a.skins.default.url; // Default
        var skins = a.skins.skins;
        var settings = app.storage.getSettings(app);
        if (skins != null) {
            for (var i = 0; i < skins.length; i++) {
                var skin = skins[i];
                if (skinId == skin.id) {
                    if (skin.title == 'Custom Skin') { url = settings['skin']['url']; }
                    else { url = skin.url; }
                    break;
                }
            }
        }
        return url;
    }

    load() {
        if (this.state == 'loading') {
            $('.skin-group').addClass('loading');
        }
        else {
            $('.skin-group').removeClass('loading');
            this.addCustomSkinListener();
        }
    }
}