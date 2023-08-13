class UIController {
    constructor() {
        this.dialog = new Dialog();
        this.controller = $('.ui-controller');
        this.home = this.controller.find('.home');
        this.campaign = this.controller.find('.campaign');
        this.levelPicker = this.controller.find('.level-picker');
        this.skins = this.controller.find('.skins');
        this.levelManager = this.controller.find('.level-manager');
        this.levelEditor = this.controller.find('.level-editor');
        this.levelList = this.levelManager.find('.list');
        this.levelOptions = this.levelEditor.find('.options-level');
        this.objectType = this.levelEditor.find('.object-type');
        this.objectOptions = this.levelEditor.find('.object-options');
        this.updateCanvas();
        this.bindActions();
        this.updateUI('home');
    }

    bindActions() {
        // Bind button actions
        this.controller.on('click', '[action]', function(event) {
            event.preventDefault();
            var action = $(this).attr('action');
            
            // Home page actions
            if (action == 'level-picker') {
                app.ui.updateUI('level-picker');
            }
            else if (action == 'level-manager') {
                app.ui.updateUI('level-manager');
            }
            else if (action == 'shop') {
                app.ui.updateUI('shop');
            }
            else if (action == 'account') {
                app.ui.showAccountOptions();
            }
            else if (action == 'settings') {
                var settings = app.storage.getSettings(app);
                var inputs = [
                    { label: 'Master Volume', attributes: { name: 'volume', type: 'range', min: 0, max: 1, step: 0.1, value: settings.volume } },
                    { label: 'Graphic Quality', attributes: { name: 'quality', type: 'range', min: 2, max: 10, value: settings.quality } },
                    { label: 'Camera Rotation', attributes: { name: 'motion', type: 'range', min: 0, max: 1, value: settings.motion } }
                ];

                // Add more options for the level maker
                if (app.ui.state == 'level-manager' || app.ui.state == 'level-editor') {
                    inputs.push(
                        { label: 'Editor Theme', attributes: { name: 'theme', type: 'range', min: 0, max: 1, value: settings.theme } },
                        { label: 'Editor Snap', attributes: { name: 'snap', type: 'range', min: 1, max: 8, step: 7, value: settings.snap } },
                    );
                }
                else if (app.ui.state == 'play') {
                    app.timer.pause();
                    app.play = false;
                }

                // Append default buttons
                inputs.push(
                    { attributes: { value: 'Cancel', type: 'button' }, function: app.ui.resumeCampaign },
                    { attributes: { value: 'Save', type: 'button' }, function: app.ui.updateSettings }
                )
                app.ui.dialog.add({ text: '<img src="img/svg/gear.svg">', inputs: inputs });
            }

            // Campaign level picker UI
            if (action.includes('level_')) {
                app.ui.loadLevel($(this));
                app.ui.updateUI('play');
                app.resetScene(app);
            }
            else if (action == 'show-campaign') {
                $('[action*="show-"]').addClass('purple');
                $('[action="' + action + '"]').removeClass('purple');
                $('.levels .list').hide();
                $('.levels .list.levels-campaign').show();
            }
            else if (action == 'show-community') {
                $('[action*="show-"]').addClass('purple');
                $('[action="' + action + '"]').removeClass('purple');
                $('.levels .list').hide();
                $('.levels .list.levels-community').show();
            }
            else if (action == 'exit-to-home') {
                app.ui.updateUI('home');
            }

            // Main game UI
            if (action == 'pause-campaign') {
                app.ui.pause();
            }

            // Level manager actions
            if (action == 'add-level') {
                var levelData = {};
                var key = null;
                app.level.createNewLevel(app);
                levelData = app.level.exportToJSON(app); // Init default data
                key = app.storage.setLevelData(null, levelData); // Store data and generate new key
                app.ui.appendEditorLevel({ key: key, level: levelData });
            }
            else if (action == 'download') {
                app.level.clearLevel(app);
                app.level.key = null; // Reset key to generate new save key
                app.storage.loadLevelFromFile();
                app.ui.updateUI('level-editor');
                app.levelHistory.save('Downloaded level', app);
                app.levelHistory.save('Loaded level', app); // Force dialog check to save
                app.resetScene(app);
            }
            else if (action == 'share') {
                if ($(this).parent().hasClass('item')) app.ui.loadEditorLevel($(this));
                app.resetScene(app);
                app.storage.saveLevelToFile();
            }
            else if (action == 'edit-level') {
                app.ui.loadEditorLevel($(this));
                app.ui.updateUI('level-editor');
                app.levelHistory.save('Edited level', app);
                app.resetScene(app);
            }
            else if (action == 'delete-level') {
                app.ui.dialog.add({
                    text: 'Are you sure you want to <em>delete</em> this level?',
                    inputs: [
                        { attributes: { value: 'Yes', type: 'button' }, function: app.ui.removeEditorLevel, parameter: $(this) },
                        { attributes: { value: 'No', type: 'button' } }
                    ]
                });
            }

            // Level editor - level options
            if (action == 'draw') {
                app.mouse.setMode('draw');
                app.ui.updateLevelOptions();
            }
            else if (action == 'erase') {
                app.mouse.setMode('erase');
                app.ui.updateLevelOptions();
            }
            else if (action == 'exit-to-level-manager') {
                if (app.levelHistory.history.length > 2) {
                    app.ui.dialog.add({
                        text: 'Would you like to <em>save</em> your level?',
                        inputs: [
                            { attributes: { value: 'No', type: 'button' }, function: app.ui.saveAndExitLevelEditor, parameter: false },
                            { attributes: { value: 'Yes', type: 'button' }, function: app.ui.saveAndExitLevelEditor, parameter: true },
                        ]
                    });
                }
                else app.ui.saveAndExitLevelEditor(false);
            }
            else if (action == 'save') {
                app.resetScene(app);
                app.level.deselectLevel(app);
                app.level.saveLevelData(app);
            }
            else if (action == 'undo') {
                app.levelHistory.undo(app);
                app.ui.showObjectOptions(false);
            }
            else if (action == 'redo') {
                app.levelHistory.redo(app);
                app.ui.showObjectOptions(false);
            }
            else if (action == 'rewind') {
                app.level.retryLevel(app);
                app.level.deselectLevel(app);
                app.ui.pause();
                app.ui.updateLevelOptions();
                app.ui.showObjectOptions(false);
            }
            else if (action == 'pause') {
                app.ui.pause();
            }
            else if (action == 'play') {
                app.ui.play();
                app.ui.updateLevelOptions();
            }
            else if (action == 'toggle-theme') {
                app.ui.toggleTheme();
            }
            
            // Object type listener
            if (action == 'cube') { app.ui.selectObjectType(action); }
            else if (action == 'tip') { app.ui.selectObjectType(action); }
            else if (action == 'bounce') { app.ui.selectObjectType(action); }
            else if (action == 'checkpoint') { app.ui.selectObjectType(action); }
            else if (action == 'spike') { app.ui.selectObjectType(action); }
            else if (action == 'shrink') { app.ui.selectObjectType(action); }
            else if (action == 'grow') { app.ui.selectObjectType(action); }
            else if (action == 'resize') { app.ui.selectObjectType(action); }
            else if (action == 'direction') { app.ui.selectObjectType(action); }
            else if (action == 'gravity') { app.ui.selectObjectType(action); }
            else if (action == 'grapple') { app.ui.selectObjectType(action); }
            else if (action == 'finish') { app.ui.selectObjectType(action); }
            else if (action == 'reset') { app.ui.selectObjectType(action); }

            // Object options listener
            if (action == 'pin') {
                app.selectedObject.toggleStatic();
                app.selectedObject = app.level.refreshObject(app.selectedObject, app);
                app.selectedObject.select(true);
                app.levelHistory.save('Updated object state', app);
                app.ui.updateObjectOptions();
            }
            else if (action == 'rotate') {
                app.ui.objectOptions.find('[name="rotate"]').focus();
            }
            else if (action == 'scale-x') { app.ui.objectOptions.find('[name="scale-x"]').focus(); }
            else if (action == 'scale-y') { app.ui.objectOptions.find('[name="scale-y"]').focus(); }
            else if (action == 'scale-z') { app.ui.objectOptions.find('[name="scale-z"]').focus(); }
            else if (action == 'friction') {
                app.ui.objectOptions.find('[name="friction"]').focus();
            }
            else if (action == 'text') {
                app.ui.dialog.add({
                    text: 'Share a tip!',
                    inputs: [
                        { attributes: { value: app.selectedObject.text, type: 'text' } },
                        { attributes: { value: 'Cancel', type: 'button' } },
                        { attributes: { value: 'Accept', type: 'button' }, function: app.ui.updateTip },
                    ]
                });
            }
            else if (action == 'duplicate') {
                app.selectedObject = app.level.duplicateObject(app.selectedObject, app);
                app.selectedObject.select(true);
                app.levelHistory.save('Duplicated object', app);
            }
            else if (action == 'accept') {
                app.level.deselectLevel(app);
                app.ui.showObjectOptions(false);
            }
            else if (action == 'trash') {
                app.level.removeObject(app.selectedObject, app);
                app.levelHistory.save('Deleted object', app);
                app.ui.showObjectOptions(false);
            }
        });

        // Add object range input listeners
        this.controller.on('input', '.slider input', function(event){
            event.preventDefault();
            var name = $(this).attr('name');
            var val = $(this).val();
            if (name == 'rotate') { app.selectedObject.setRotation(-val * Math.PI / 180); }
            else if (name == 'scale-x') { app.selectedObject.setScale({ x: val, y: null, z: null }); }
            else if (name == 'scale-y') { app.selectedObject.setScale({ x: null, y: val, z: null }); }
            else if (name == 'scale-z') { app.selectedObject.setScale({ x: null, y: null, z: val }); }
            else if (name == 'friction') { app.selectedObject.setFriction(val); }
        });

        // Save level history when input slider is updated
        this.controller.on('mouseup', '.slider input', function(event){
            event.preventDefault();
            app.levelHistory.save('Updated object properties', app);
        });

        // Add level name change listener
        this.controller.on('focusout', '.list input', function(event) {
            event.preventDefault();
            app.ui.updateEditorLevelName($(this));
        })
    }

    selectObjectType(type, checkNull = true) {
        // Swap object by type
        if (app.selectedObject != null && checkNull == true) {
            app.selectedObject = app.level.changeObjectType(app.selectedObject, type, app);
            app.selectedObject.select(true);
            app.ui.updateObjectOptions();
            app.levelHistory.save('Changed object to ' + type, app);
        }

        app.ui.objectType.find('[action]').removeClass('selected');
        app.ui.objectType.find('[action=' + type + ']').addClass('selected');
    }

    getSelectedObjectType() {
        return app.ui.objectType.find('.selected').attr('action');
    }

    updateUI(state) {
        this.state = state;
        // Update theme
        if (app != null) {
            var settings = app.storage.getSettings(app);
            this.toggleTheme(settings.theme);
        }

        this.updateCanvas();
        this.canvas.addClass('hidden'); // Default hide canvas
        this.controller.find('> *').addClass('hidden'); // Default hide all children
        this.controller.find('[action]').removeClass('selected'); // Default remove all selected

        if (state == 'home') {
            if (window.location.href.includes('file://') == false) {
                // Update version
                $.getJSON("manifest.json", function(json) {
                    $('.version').text("v" + json.version);
                    $('.version').off();
                    $('.version').on('click', function() {
                        $.get("changelog.txt", function(data) {
                            app.ui.dialog.add({
                                attributes: { class: 'align-left' },
                                text: data,
                                inputs: [
                                    { attributes: { value: 'Close', type: 'button' }}
                                ]
                            });
                            setTimeout(function(){ $('.dialog .wrapper').animate({ scrollTop: 0 }, 500); }, 100);
                        });
                    });
                });

                // Update Status
                $.getJSON("json/status.json", function(json) {
                    // Generate random tip
                    var statusLength = json.status.length;
                    var statusIndex = Math.floor(Math.random() * statusLength);
                    //$('.status-text').html(json.status[statusIndex]);
                    $('.status-text').html('<span style="cursor: pointer;">Tiny Tycoon is now available on Google Chrome!</span>').on('click', function() { chrome.tabs.create({ url: 'https://chrome.google.com/webstore/detail/tiny-tycoon/bamdkjfjhhnjcgcjmmjdnncpglihepoi' }); });
                });
            }
            this.home.removeClass('hidden');
            this.home.find('[action="level-picker"]').focus();
            setTimeout(function() { app.ui.home.find('[action="level-picker"]').focus(); }, 100);
        }
        else if (state == 'level-picker') {
            app.ui.appendCampaignLevels();
            app.ui.updateCampaignScores();
            this.levelPicker.removeClass('hidden');
        }
        else if (state == 'shop') {
            this.skins.removeClass('hidden');
            app.skins.load(); // Gets skins
        }
        else if (state == 'play') {
            this.campaign.removeClass('hidden');
            this.canvas.removeClass('hidden');
        }
        else if (state == 'level-manager') {
            this.levelList.empty();
            this.appendEditorLevels(app)
            this.levelManager.removeClass('hidden');
            this.updateLevelOptions(); // Update top bar
            this.objectOptions.addClass('hidden'); // Disable bar on default
        }
        else if (state == 'level-editor') {
            this.updateLevelOptions();
            this.objectType.find('[action="cube"]').addClass('selected'); // Select by default
            this.canvas.removeClass('hidden');
            this.levelEditor.removeClass('hidden');
        }
    }

    showObjectOptions(state) {
        if (state == true) this.objectOptions.removeClass('hidden');
        else this.objectOptions.addClass('hidden');
    }

    toggleObjectOptions() {
        this.objectOptions.toggleClass('hidden');
    }

    updateLevelOptions() {
        var mode = 'draw';
        var play = 'pause';
        if (app != null) {
            mode = app.mouse.mode;
            play = app.play == true ? 'play' : 'pause';
            this.updateObjectType();
        }

        this.levelOptions.find('[action="pause"], [action="pause"]').removeClass('selected');
        this.levelOptions.find('[action="draw"], [action="erase"]').removeClass('selected');
        this.levelOptions.find('[action="' + mode + '"]').addClass('selected');
        this.levelOptions.find('[action="' + play + '"]').addClass('selected');
    }

    updateObjectType() {
        var mode = app.mouse.mode;
        var play = app.play == true ? 'play' : 'pause';
        this.objectType.removeClass('hidden');
        if (mode == 'erase' || play == 'play') this.objectType.addClass('hidden');
    }

    updateObjectOptions() {
        // Check if selected object exists
        if (app.selectedObject != null) {
            var isStatic = app.selectedObject.isStatic();
            var pinIcon = this.objectOptions.find('[action="pin"]');
            var frictionIcon = this.objectOptions.find('[action="friction"]');
            var textIcon = this.objectOptions.find('[action="text"]');
            var duplicateIcon = this.objectOptions.find('[action="duplicate"]');
            var trashIcon = this.objectOptions.find('[action="trash"]');
            var rotation = -app.selectedObject.getRotation('degrees');
            var scaleX = app.selectedObject.scale.x;
            var scaleY = app.selectedObject.scale.y;
            var scaleZ = app.selectedObject.scale.z;
            var isPlayer = (app.selectedObject.getClass() == 'player');
            var friction = app.selectedObject.getFriction();
            var isTip = (app.selectedObject.getClass() == 'tip');
            var isGravity = (app.selectedObject.getClass() == 'gravity');
            this.objectOptions.find('[action*="rotate"] ~ .slider input').val(rotation);
            this.objectOptions.find('[action*="scale-x"] ~ .slider input').val(scaleX);
            this.objectOptions.find('[action*="scale-y"] ~ .slider input').val(scaleY);
            this.objectOptions.find('[action*="scale-z"] ~ .slider input').val(scaleZ);
            this.objectOptions.find('[action*="friction"] ~ .slider input').val(friction);
            
            // Enable/Disable the icons for player
            if (isPlayer == true) {
                pinIcon.addClass('disabled');
                trashIcon.addClass('disabled');
                duplicateIcon.addClass('disabled');
            }
            else {
                pinIcon.removeClass('disabled');
                trashIcon.removeClass('disabled');
                duplicateIcon.removeClass('disabled');
            }
            
            // Enable/Disable the tip icon for tip block
            if (isTip == true) {
                pinIcon.addClass('disabled');
                textIcon.removeClass('disabled');
            }
            else {
                pinIcon.removeClass('disabled');
                textIcon.addClass('disabled');
            }

            // Enable/Disable the gravity icon for tip block
            if (isGravity == true) {
                pinIcon.addClass('disabled');
            }
            else {
                pinIcon.removeClass('disabled');
            }
            
            // Update selected pin status
            if (isStatic == true) {
                pinIcon.addClass('selected');
                frictionIcon.addClass('disabled');
            }
            else {
                pinIcon.removeClass('selected');
                frictionIcon.removeClass('disabled');
            }
        }
    }

    removeListOfLevels() {
        this.levelList.empty();
    }

    appendCampaignLevels() {
        // Restructure HTML level data
        var levels = $('.levels');
        var loaded = (levels.hasClass('loaded'));
        var settings = app.storage.getSettings(app);
        var progress = settings.progress;
        var currentLevel;

        // Predefine level focus
        app.ui.maxLevels = levels.find('[file]').length;

        // Append levels if data elements have not been loaded
        if (loaded == false) {

            // Loop through each level
            $.each(levels.find('[file]'), function(i) {
                var level = $(this);

                // Load all level data into html
                $.getJSON('json/' + level.attr('file'), function(json) {
                    level.addClass('level');
                    level.attr('tabindex', '0');
                    level.attr('action', 'level_' + (i + 1));
                    level.attr('name', json.name);
                    level.html(
                        '<span class="index">' + (i + 1) + '</span>' +
                        '<span class="score">--.---</span>' +
                        '<span class="title">' + json.description + '</span>' +
                        '<span class="data" style="display: none">' + JSON.stringify(json) + '</span>'
                    );

                    // Update scores if last level item
                    if (i == app.ui.maxLevels - 1) app.ui.updateCampaignScores();
                });
            });
            levels.addClass('loaded');
        }

        // Focus into level
        setTimeout(function() {
            currentLevel = levels.find('.level').eq(progress - 1);
            if (currentLevel.parent(':hidden')) {
                console.log($('.show-' + currentLevel.parent().attr('for')));
                $('[action="show-' + currentLevel.parent().attr('for') + '"]').click();
            }
            currentLevel.focus();
            app.ui.levelPicker.animate({ scrollTop: currentLevel.offset().top - levels.offset().top }, 500);
        }, 250);
    }

    updateCampaignScores() {
        var scores = app.storage.getScores();
        $.each(scores, function(key, value) {
            var level = $('.levels .level[name="' + key + '"]');
            if (level.length > 0) {
                level.addClass('completed');
                level.find('.score').html(value);
            }
        });
    }

    appendEditorLevels(a) {
        var list = a.storage.getListOfLevels(); // return format = [{ key: '', level: '' }, ...]
        var levelData = {};
        var key = null;

        // Add empty level if none exist
        if (list.length < 1) {
            a.level.createNewLevel(a);
            levelData = a.level.exportToJSON(a);
            key = a.storage.setLevelData(null, levelData);
            list.push({ key: key, level: levelData });
        }

        // Append each list item
        this.removeListOfLevels(); // Empty list HTML before populating
        for (var i = 0; i < list.length; i++) {
            a.ui.appendEditorLevel(list[i]);
        }
    }

    appendEditorLevel(listItem) { // listItem = [{ key: '', level: '' }, ...]
        this.levelList.append(
            '<div class="item">' +
                '<input type="text" key="' + listItem.key + '" value="' + listItem.level.name + '">' +
                '<a action="edit-level" title="Edit level"><img src="img/svg/pencil.svg"></a>' +
                '<a action="share" title="Share level"><img src="img/svg/upload.svg"></a>' +
                '<a action="delete-level" title="Delete level"><img src="img/svg/trash.svg"></a>' +
            '</div>'
        );
    }

    removeEditorLevel(button) {
        var item = button.parent();
        var key = item.find('input').attr('key');
        app.storage.removeLevelData(key);
        item.remove();
    }

    loadLevel(button) {
        var settings = app.storage.getSettings();
        var json = JSON.parse(button.find('.data').text());
        var credit = app.ui.campaign.find('#credit');
        app.updateGravity();
        app.play = true;
        app.timer.reset();
        credit.html((json.author) ? 'Level by ' + json.author : '');
        if (json.star) credit.prepend('<img src="/img/svg/star.svg" title="Event winner"> ');
        app.level.clearLevel(app);
        app.level.importFromJSON(json, app);
        settings.progress = parseInt(button.attr('action').split('_')[1]);
        app.updateSettings(settings, app);
    }

    loadEditorLevel(button) {
        // Select level details from HTML input attributes & values
        var item = button.parent();
        var key = item.find('input').attr('key');
        var name = item.find('input').val();
        var levelData = app.storage.getLevelData(key);
        var settings = app.storage.getSettings(app);

        // Update current level with selected attributes
        levelData.name = name;
        app.level.clearLevel(app);
        app.level.importFromJSON(levelData, app);
        app.level.key = key; // Update key value for saving the level
        app.updateSettings(settings, app);
    }
    
    updateEditorLevelName(input) {
        var key = input.attr('key');
        var name = input.val();
        app.storage.updateLevelDataName(key, name);
    }

    updateCanvas() {
        if (this.canvas == null || this.canvas.length <= 0) {
            this.canvas = $('canvas');
        }
    }

    saveAndExitLevelEditor(saveLevel = true) {
        app.play = false;
        app.resetScene(app);
        app.level.deselectLevel(app);
        if (saveLevel == true) app.level.saveLevelData(app);
        app.level.clearLevel(app);
        app.levelHistory.clear();
        app.player.removeCheckpoint();
        app.player.setPosition({ x: 0, y: 0, z: 0 });
        app.ui.updateUI('level-manager');
    }

    updateTip() {
        var dialog = app.ui.dialog.get();
        var input = dialog.find('input[type="text"]');
        app.selectedObject.text = input.val();
        app.levelHistory.save('Updated tip', app);
    }

    updateSettings() {
        var volume = parseFloat($('.dialog input[name="volume"]').val());
        var quality = parseInt($('.dialog input[name="quality"]').val());
        var theme = parseInt($('.dialog input[name="theme"]').val());
        var snap = parseInt($('.dialog input[name="snap"]').val());
        var motion = parseInt($('.dialog input[name="motion"]').val());
        app.updateSettings({ 'volume': volume, 'quality': quality, 'theme': theme, 'snap': snap, 'motion': motion }, app);

        // Resume campaign if settings was selected during gameplay
        if (app.ui.state == 'play') {
            app.ui.resumeCampaign();
        }
    }

    showTip(text) {
        app.play = false;
        app.timer.pause();
        app.ui.dialog.add({
            text: text,
            inputs: [
                { attributes: { value: 'Continue', type: 'button' }, function: app.ui.play }
            ]
        });
    }

    pause() {
        app.timer.pause();
        app.play = false;
        
        if (app.ui.state == 'level-editor') {
            app.ui.updateLevelOptions();
            app.level.deselectLevel(app);
            app.ui.showObjectOptions(false);
            app.ui.levelOptions.find('[action="play"]').removeClass('selected');
            app.ui.levelOptions.find('[action="pause"]').addClass('selected');
        }
        else if (app.ui.state == 'play') {
            app.ui.dialog.add({
                text: 'Paused',
                inputs: [
                    { attributes: { value: 'Exit (E)', type: 'button' }, function: app.ui.exitCampaign },
                    { attributes: { value: 'Retry (R)', type: 'button' }, function: app.level.retryLevel, parameter: app },
                    { attributes: { value: 'Play', type: 'button' }, function: app.ui.resumeCampaign },
                ]
            });
        }
    }

    play() {
        app.play = true;
        app.timer.start();
        app.level.deselectLevel(app);
        app.ui.showObjectOptions(false);
        app.ui.levelOptions.find('[action="pause"]').removeClass('selected');
        app.ui.levelOptions.find('[action="play"]').addClass('selected');
        if (app.player.jump == true) app.player.jump = false; // Prevent jump in the beginning
    }

    toggleTheme(themeID) {
        var themes = ['dark', 'light'];
        var newTheme = $('body').hasClass('dark') ? themes[1] : themes[0];
        if (themeID != null) newTheme = themes[themeID];
        $('body').removeClass(themes);
        $('body').addClass(newTheme);
    }

    resumeCampaign() {
        if (app.ui.state == 'play') {
            app.timer.start();
            app.play = true;
        }
    }

    exitCampaign() {
        app.play = false;
        app.resetScene(app);
        app.level.clearLevel(app);
        app.player.removeCheckpoint();
        app.player.setPosition({ x: 0, y: 0, z: 0 });
        app.ui.updateUI('level-picker');
    }

    showAccountOptions() {
        var inputs = [
            { attributes: { value: 'Backup to file', type: 'button', width: '100%' }, function: app.storage.backupToFile },
            { attributes: { value: 'Restore from file', type: 'button', width: '100%' }, function: app.storage.restoreFromFile },
            { attributes: { value: 'Close', type: 'button', width: '100%' } }
        ]
        if (app.extension.isChromeExtension()) {
            inputs.unshift(
                { attributes: { value: 'Backup to Google', type: 'button', width: '100%' }, function: app.storage.backupToChrome, parameter: true },
                { attributes: { value: 'Restore from Google', type: 'button', width: '100%' }, function: app.storage.restoreFromChrome, parameter: true }
            )
        }
        app.ui.dialog.add({ text: '<img src="img/svg/cloud-check.svg">', inputs: inputs });
    }
}