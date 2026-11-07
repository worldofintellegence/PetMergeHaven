// Platform adapter — one interface for the three places the game runs:
//   'steam'   : Electron desktop build (desktop/preload.js exposes window.desktop)
//   'android' : native WebView wrapper (window.AndroidApp)
//   'web'     : any browser
// The game only talks to window.Platform, never to Electron/Android directly.
(function () {
  'use strict';
  const KEY = 'petMergeHaven.v2';
  const desk = window.desktop || null;
  const android = window.AndroidApp || null;

  const ls = {
    get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} },
    del() { try { localStorage.removeItem(KEY); } catch (e) {} },
  };

  const Platform = {
    kind: desk ? 'steam' : android ? 'android' : 'web',
    isDesktop: !!desk,

    // Saves: real files on desktop (so Steam Auto-Cloud can sync them), localStorage elsewhere.
    loadSave() {
      if (desk) {
        try {
          const s = desk.loadSave();
          if (s) return s;
        } catch (e) {}
        return ls.get(); // first desktop launch: pick up a save left in the WebView storage
      }
      return ls.get();
    },
    writeSave(json) {
      if (desk) { try { desk.writeSave(json); return; } catch (e) {} }
      ls.set(json);
    },
    clearSave() {
      if (desk) { try { desk.clearSave(); } catch (e) {} }
      ls.del();
    },

    // Steam achievements (no-op outside Steam; the game also shows its own toast).
    unlockAchievement(id) { if (desk) { try { desk.achievement(id); } catch (e) {} } },
    steamUser() { if (desk) { try { return desk.steamUser(); } catch (e) {} } return null; },

    // Returns true when the platform closed the app itself.
    exit() {
      if (desk) { desk.quit(); return true; }
      if (android && typeof android.exitApp === 'function') { android.exitApp(); return true; }
      return false;
    },

    // Desktop-only window features.
    canFullscreen: !!desk,
    toggleFullscreen() { if (desk) desk.toggleFullscreen(); },
    canCompanion: !!desk,
    setCompanion(on) { if (desk) desk.setCompanion(!!on); },
    canZoom: !!desk,
    setZoom(f) { if (desk) desk.setZoom(f); },
  };

  window.Platform = Platform;
  document.documentElement.dataset.platform = Platform.kind;
})();
