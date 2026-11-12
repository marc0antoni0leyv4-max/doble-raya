/* Voz en español latino con la Web Speech API.
   Prefiere voces es-MX / es-US / es-419 y evita las de España si hay otra. */
(function () {
  'use strict';
  var preferidas = ['es-MX', 'es-US', 'es-419', 'es-CO', 'es-AR', 'es-CL', 'es-PE'];
  var voz = null;

  function elegir() {
    if (!('speechSynthesis' in window)) return null;
    var voces = speechSynthesis.getVoices();
    var norm = function (l) { return String(l || '').replace('_', '-'); };
    for (var i = 0; i < preferidas.length; i++) {
      var exacta = voces.filter(function (v) { return norm(v.lang).toLowerCase() === preferidas[i].toLowerCase(); });
      if (exacta.length) {
        // Las voces "Google" o "Natural" suelen sonar mejor
        voz = exacta.filter(function (v) { return /google|natural|online/i.test(v.name); })[0] || exacta[0];
        return voz;
      }
    }
    voz = voces.filter(function (v) { return /^es/i.test(v.lang) && !/es-ES/i.test(norm(v.lang)); })[0]
       || voces.filter(function (v) { return /^es/i.test(v.lang); })[0] || null;
    return voz;
  }

  if ('speechSynthesis' in window) {
    elegir();
    speechSynthesis.addEventListener ? speechSynthesis.addEventListener('voiceschanged', elegir)
                                     : (speechSynthesis.onvoiceschanged = elegir);
  }

  window.Voz = {
    disponible: function () { return 'speechSynthesis' in window; },
    nombre: function () { return (voz || elegir() || {}).lang || ''; },
    decir: function (texto, alTerminar) {
      if (!('speechSynthesis' in window)) { if (alTerminar) alTerminar(); return; }
      var u = new SpeechSynthesisUtterance(texto);
      var v = voz || elegir();
      if (v) u.voice = v;
      u.lang = v ? v.lang : 'es-MX';
      u.rate = 0.75;   // despacio, para quien empieza a leer
      u.pitch = 1.05;
      if (alTerminar) { u.onend = alTerminar; u.onerror = alTerminar; }
      speechSynthesis.speak(u);
    },
    callar: function () { if ('speechSynthesis' in window) speechSynthesis.cancel(); }
  };
})();
