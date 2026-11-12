/* =====================================================================
   Cuentas locales de Doble raya.
   IMPORTANTE: este sitio es estático. Las cuentas se guardan SOLO en este
   navegador (localStorage) y la contraseña se guarda como hash SHA-256 con
   sal. Sirve para separar perfiles en casa o en el aula, NO es una
   autenticación segura. Para cuentas reales hace falta un servidor.
   ===================================================================== */
(function () {
  'use strict';

  var CLAVE_CUENTAS = 'dobleRaya.cuentas';
  var CLAVE_SESION = 'dobleRaya.sesion';

  function leer(almacen, clave) {
    try { return JSON.parse(almacen.getItem(clave)); } catch (e) { return null; }
  }
  function guardar(almacen, clave, valor) {
    try { almacen.setItem(clave, JSON.stringify(valor)); return true; } catch (e) { return false; }
  }
  function borrar(almacen, clave) {
    try { almacen.removeItem(clave); } catch (e) { /* sin almacenamiento */ }
  }

  function aHex(buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), function (b) {
      return ('0' + b.toString(16)).slice(-2);
    }).join('');
  }

  function sal() {
    var bytes = new Uint8Array(16);
    (window.crypto || {}).getRandomValues ? crypto.getRandomValues(bytes) : bytes.forEach(function (_, i) { bytes[i] = Math.random() * 256; });
    return aHex(bytes);
  }

  function hash(texto) {
    if (window.crypto && crypto.subtle) {
      return crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto)).then(aHex);
    }
    // Respaldo si el navegador no ofrece crypto.subtle (no criptográfico)
    var h = 5381;
    for (var i = 0; i < texto.length; i++) h = ((h << 5) + h + texto.charCodeAt(i)) >>> 0;
    return Promise.resolve('x' + h.toString(16));
  }

  function normalizar(correo) { return String(correo || '').trim().toLowerCase(); }

  function cuentas() { return leer(localStorage, CLAVE_CUENTAS) || {}; }

  function iniciarSesion(datos, recordar) {
    borrar(localStorage, CLAVE_SESION);
    borrar(sessionStorage, CLAVE_SESION);
    guardar(recordar ? localStorage : sessionStorage, CLAVE_SESION, datos);
    return datos;
  }

  window.Cuenta = {
    existe: function (correo) { return Object.prototype.hasOwnProperty.call(cuentas(), normalizar(correo)); },

    crear: function (nombre, correo, clave) {
      var c = normalizar(correo);
      var todas = cuentas();
      if (todas[c]) return Promise.reject(new Error('existe'));
      var s = sal();
      return hash(s + clave).then(function (h) {
        todas[c] = { nombre: nombre.trim(), sal: s, hash: h, creada: Date.now() };
        if (!guardar(localStorage, CLAVE_CUENTAS, todas)) throw new Error('almacen');
        return iniciarSesion({ nombre: nombre.trim(), correo: c, invitado: false }, true);
      });
    },

    entrar: function (correo, clave, recordar) {
      var c = normalizar(correo);
      var cuenta = cuentas()[c];
      if (!cuenta) return Promise.reject(new Error('credenciales'));
      return hash(cuenta.sal + clave).then(function (h) {
        if (h !== cuenta.hash) throw new Error('credenciales');
        return iniciarSesion({ nombre: cuenta.nombre, correo: c, invitado: false }, recordar);
      });
    },

    entrarComoInvitado: function () {
      return iniciarSesion({ nombre: 'Invitado', correo: '', invitado: true }, false);
    },

    sesion: function () {
      return leer(sessionStorage, CLAVE_SESION) || leer(localStorage, CLAVE_SESION);
    },

    salir: function () {
      borrar(localStorage, CLAVE_SESION);
      borrar(sessionStorage, CLAVE_SESION);
    }
  };
})();
