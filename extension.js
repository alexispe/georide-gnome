#!/usr/bin/gjs

const St = imports.gi.St;
const Main = imports.ui.main;
const Soup = imports.gi.Soup;
const Lang = imports.lang;
const Util = imports.misc.util;
const Mainloop = imports.mainloop;
const Clutter = imports.gi.Clutter;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const GEORIDE_URL = 'https://api.georide.fr/';
const GEORIDE_EMAIL = 'YOUR_EMAIL';
const GEORIDE_PASSWORD = 'YOUR_PASSWORD';
let GEORIDE_TOKEN;

let _httpSession;
let _apiTrackers;

const GeoRideIndicator = new Lang.Class({
  Name: 'GeoRideIndicator',
  Extends: PanelMenu.Button,

  _init: function () {
    this.parent(0.0, "GeoRide", false);
    this.buttonText = new St.Label({
      text: _("Chargement..."),
      y_align: Clutter.ActorAlign.CENTER
    });
    this.actor.add_actor(this.buttonText);

    this.menuItem = new PopupMenu.PopupMenuItem('0km');
    this.menuItemLocaliser = new PopupMenu.PopupMenuItem('Localiser');
    this.switchmenuitem = new PopupMenu.PopupSwitchMenuItem('Vérrouillée',false);
    // this.menuItem.label = new St.Label({ text: 'la bize' });
    // this.menuItem.actor.add_child(this.menuItem.label);

    this.menu.addMenuItem(this.menuItem);
    this.menu.addMenuItem(this.menuItemLocaliser);
    this.menu.addMenuItem(this.switchmenuitem);

    this.menuItemLocaliser.actor.connect('button-press-event', Lang.bind(this, function() {
      Util.spawnCommandLine("sensible-browser https://www.google.com/maps/search/?api=1&query="+_apiTrackers[0].latitude+","+_apiTrackers[0].longitude);
    }));
    this.switchmenuitem.connect('toggled', Lang.bind(this, function(object, value){
      if(value) this._apiLockTracker();
      else this._apiUnlockTracker();
    }));

    this._apiLogin();
    this._refresh();
    this._apiRegenerateToken();

  },

  _refresh: function () {
    this._apiGetTrackers(this._refreshUI);
    this._removeTimeout();
    this._timeout = Mainloop.timeout_add_seconds(10, Lang.bind(this, this._refresh));
    return true;
  },

  _refreshUI: function (data) {
    // log('[GEORIDE_LOG]', JSON.stringify(data[0]));
    let trackerName = data[0].trackerName.toString();
    let status = data[0].status.toString();
    let isLocked = data[0].isLocked ? 'Vérrouillée' : 'Déverouillée';
    txt = trackerName + ' ' + isLocked;
    this.buttonText.set_text(txt);
    this.menuItem.actor.label_actor.set_text((data[0].odometer/1000)+'km');
    if(data[0].isLocked) { // si on est lock, on active le boutton
      this.switchmenuitem.setToggleState(true);
    } else { // Sinon, on le desactive
      this.switchmenuitem.setToggleState(false);
    }
  },

  _removeTimeout: function () {
    if (this._timeout) {
      Mainloop.source_remove(this._timeout);
      this._timeout = null;
    }
  },

  stop: function () {
    if (_httpSession !== undefined)
      _httpSession.abort();
    _httpSession = undefined;

    if (this._timeout)
      Mainloop.source_remove(this._timeout);
    this._timeout = undefined;

    this.menu.removeAll();
  },

  _apiRegenerateToken: function () {
    _httpSession = new Soup.Session();
    let message = Soup.form_request_new_from_hash('GET', GEORIDE_URL+'user/new-token', {});
    message.request_headers.append("Authorization", 'Bearer '+GEORIDE_TOKEN);
    _httpSession.queue_message(message, Lang.bind(this, function (_httpSession, message) {
      log('[GEORIDE_LOG]', message.response_body.data);
          if (message.status_code !== 200) return;
          let json = JSON.parse(message.response_body.data);
          GEORIDE_TOKEN = json.authToken;
        }
      )
    );
  },

  _apiLogin: function () {
    log('[GEORIDE_LOG]', '_apiLogin');
    _httpSession = new Soup.Session();
    let message = Soup.form_request_new_from_hash('POST', GEORIDE_URL+'user/login', {
      email: GEORIDE_EMAIL,
      password: GEORIDE_PASSWORD
    });
    _httpSession.queue_message(message, Lang.bind(this, function (_httpSession, message) {
      log('[GEORIDE_LOG]', message.response_body.data);
      if (message.status_code !== 200) return;
      let json = JSON.parse(message.response_body.data);
      GEORIDE_TOKEN = json.authToken;
    }));
  },

  _apiGetTrackers: function () {
    _httpSession = new Soup.Session();
    let message = Soup.form_request_new_from_hash('GET', GEORIDE_URL+'user/trackers', {});
    message.request_headers.append("Authorization", 'Bearer '+GEORIDE_TOKEN);
    _httpSession.queue_message(message, Lang.bind(this, function (_httpSession, message) {
          if (message.status_code !== 200) return;
          // log('[GEORIDE_LOG]', 'queue_message');
          // log('[GEORIDE_LOG]', message.response_body.data);
          let json = JSON.parse(message.response_body.data);
          _apiTrackers = json;
          this._refreshUI(json);
        }
      )
    );
  },

  _apiToggleTracker: function () {
    log('[GEORIDE_LOG]', '_apiToggleTracker');
    // log('[GEORIDE_LOG]', _apiTrackers);
    _httpSession = new Soup.Session();
    let message = Soup.form_request_new_from_hash('POST', GEORIDE_URL+'tracker/'+_apiTrackers[0].trackerId+'/toggleLock', {});
    message.request_headers.append("Authorization", 'Bearer '+GEORIDE_TOKEN);
    _httpSession.queue_message(message, Lang.bind(this, function (_httpSession, message) {
      log('[GEORIDE_LOG]', message.response_body.data);
      if (message.status_code !== 200) return;
      this._apiGetTrackers();
      let json = JSON.parse(message.response_body.data);
      if(json.locked) Main.notify(_apiTrackers[0].trackerName + ' Vérrouillée');
      else  Main.notify(_apiTrackers[0].trackerName + ' Déverouillée')
    }));
  },

  _apiLockTracker: function () {
    // log('[GEORIDE_LOG]', '_apiLockTracker');
    _httpSession = new Soup.Session();
    let message = Soup.form_request_new_from_hash('POST', GEORIDE_URL+'tracker/'+_apiTrackers[0].trackerId+'/lock', {});
    message.request_headers.append("Authorization", 'Bearer '+GEORIDE_TOKEN);
    _httpSession.queue_message(message, Lang.bind(this, function (_httpSession, message) {
      // log('[GEORIDE_LOG]', message.response_body.data);
      this._apiGetTrackers();
      Main.notify(_apiTrackers[0].trackerName + ' Vérrouillée');
    }));
  },

  _apiUnlockTracker: function () {
    // log('[GEORIDE_LOG]', '_apiLockTracker');
    _httpSession = new Soup.Session();
    let message = Soup.form_request_new_from_hash('POST', GEORIDE_URL+'tracker/'+_apiTrackers[0].trackerId+'/unlock', {});
    message.request_headers.append("Authorization", 'Bearer '+GEORIDE_TOKEN);
    _httpSession.queue_message(message, Lang.bind(this, function (_httpSession, message) {
      // log('[GEORIDE_LOG]', message.response_body.data);
      this._apiGetTrackers();
      Main.notify(_apiTrackers[0].trackerName + ' Déverouillée');
    }));
  },


});

let twMenu;

function init() {}

function enable() {
	twMenu = new GeoRideIndicator;
	Main.panel.addToStatusArea('tw-indicator', twMenu);
}

function disable() {
	twMenu.stop();
	twMenu.destroy();
}
