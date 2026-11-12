(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var VOCALES = ['a', 'e', 'i', 'o', 'u'];

  /* ================= Constructor de sílabas ================= */
  var renglon = $('renglon');
  var anuncio = $('anuncio-silaba');
  var consonante = 'm';

  function pintarRenglon() {
    renglon.innerHTML = '';
    VOCALES.forEach(function (v) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      var silaba = consonante + v;
      b.type = 'button';
      b.className = 'silaba';
      b.dataset.v = v;
      b.dataset.silaba = silaba;
      b.setAttribute('aria-label', 'Escuchar ' + silaba);
      if (consonante) b.appendChild(document.createTextNode(consonante));
      var s = document.createElement('span');
      s.className = 'vocal';
      s.textContent = v;
      b.appendChild(s);
      b.addEventListener('click', function () { sonar(b); });
      li.appendChild(b);
      renglon.appendChild(li);
    });
  }

  function animar(b) {
    b.classList.remove('sonando');
    void b.offsetWidth; // reinicia la animación
    b.classList.add('sonando');
  }

  function sonar(b, alTerminar) {
    animar(b);
    Voz.callar();
    Voz.decir(b.dataset.silaba, alTerminar);
  }

  document.querySelectorAll('.consonantes button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.consonantes button').forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
      btn.setAttribute('aria-pressed', 'true');
      consonante = btn.dataset.c;
      pintarRenglon();
      anuncio.textContent = consonante
        ? 'Sílabas con ' + consonante + ': ' + VOCALES.map(function (v) { return consonante + v; }).join(', ')
        : 'Las cinco vocales: a, e, i, o, u';
    });
  });

  $('leer-todas').addEventListener('click', function () {
    var botones = renglon.querySelectorAll('.silaba');
    var i = 0;
    Voz.callar();
    (function siguiente() {
      if (i >= botones.length) return;
      var b = botones[i++];
      animar(b);
      Voz.decir(b.dataset.silaba, function () { setTimeout(siguiente, 250); });
    })();
  });

  if (!Voz.disponible()) {
    $('nota-voz').textContent = 'Este navegador no puede leer en voz alta. Prueba con Chrome o Edge.';
  }
  pintarRenglon();

  /* ================= Pestañas accesibles ================= */
  var pestanas = [$('tab-entrar'), $('tab-crear')];
  function activar(tab, enfocar) {
    pestanas.forEach(function (t) {
      var sel = t === tab;
      t.setAttribute('aria-selected', String(sel));
      t.tabIndex = sel ? 0 : -1;
      $(t.getAttribute('aria-controls')).hidden = !sel;
    });
    if (enfocar) tab.focus();
  }
  pestanas.forEach(function (t, i) {
    t.addEventListener('click', function () { activar(t); });
    t.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = pestanas[(i + 1) % pestanas.length];
      if (e.key === 'ArrowLeft') n = pestanas[(i - 1 + pestanas.length) % pestanas.length];
      if (e.key === 'Home') n = pestanas[0];
      if (e.key === 'End') n = pestanas[pestanas.length - 1];
      if (n) { e.preventDefault(); activar(n, true); }
    });
  });

  /* ================= Mostrar contraseña ================= */
  document.querySelectorAll('.ver-clave').forEach(function (b) {
    b.addEventListener('click', function () {
      var input = $(b.dataset.para);
      var visible = input.type === 'password';
      input.type = visible ? 'text' : 'password';
      b.setAttribute('aria-pressed', String(visible));
      b.textContent = visible ? 'Ocultar' : 'Mostrar';
      b.setAttribute('aria-label', visible ? 'Ocultar contraseña' : 'Mostrar contraseña');
    });
    b.setAttribute('aria-label', 'Mostrar contraseña');
  });

  /* Aviso de mayúsculas activadas */
  var clave = $('entrar-clave');
  ['keydown', 'keyup'].forEach(function (ev) {
    clave.addEventListener(ev, function (e) {
      if (!e.getModifierState) return;
      $('entrar-mayus').textContent = e.getModifierState('CapsLock') ? 'Las mayúsculas están activadas.' : '';
    });
  });

  /* ================= Validación ================= */
  var reCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function marcar(input, mensaje) {
    $(input.id + '-error').textContent = mensaje || '';
    if (mensaje) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    return !mensaje;
  }

  function validar(reglas) {
    var primero = null;
    reglas.forEach(function (r) {
      var ok = marcar(r[0], r[1]());
      if (!ok && !primero) primero = r[0];
    });
    if (primero) primero.focus();
    return !primero;
  }

  // Al corregir un campo, se limpia su error
  document.querySelectorAll('.entrada-texto').forEach(function (i) {
    i.addEventListener('input', function () { if (i.getAttribute('aria-invalid')) marcar(i, ''); });
  });

  function ocupado(form, si) {
    var b = form.querySelector('[type="submit"]');
    b.disabled = si;
    b.setAttribute('aria-busy', String(si));
  }

  $('form-entrar').addEventListener('submit', function (e) {
    e.preventDefault();
    var form = e.currentTarget;
    var correo = $('entrar-correo'), clave = $('entrar-clave');
    $('aviso-entrar').textContent = '';
    var ok = validar([
      [correo, function () {
        if (!correo.value.trim()) return 'Escribe tu correo.';
        if (!reCorreo.test(correo.value.trim())) return 'Revisa el correo: debe tener la forma nombre@dominio.com.';
      }],
      [clave, function () { if (!clave.value) return 'Escribe tu contraseña.'; }]
    ]);
    if (!ok) return;
    ocupado(form, true);
    Cuenta.entrar(correo.value, clave.value, $('entrar-recordar').checked)
      .then(mostrarJuegos)
      .catch(function () {
        var aviso = $('aviso-entrar');
        aviso.textContent = Cuenta.existe(correo.value)
          ? 'La contraseña no coincide. Revísala e inténtalo otra vez.'
          : 'No hay una cuenta con ese correo en este navegador. Crea una en la pestaña «Crear cuenta».';
        aviso.focus();
      })
      .then(function () { ocupado(form, false); });
  });

  $('form-crear').addEventListener('submit', function (e) {
    e.preventDefault();
    var form = e.currentTarget;
    var nombre = $('crear-nombre'), correo = $('crear-correo'), clave = $('crear-clave');
    $('aviso-crear').textContent = '';
    var ok = validar([
      [nombre, function () { if (!nombre.value.trim()) return 'Escribe tu nombre.'; }],
      [correo, function () {
        if (!correo.value.trim()) return 'Escribe tu correo.';
        if (!reCorreo.test(correo.value.trim())) return 'Revisa el correo: debe tener la forma nombre@dominio.com.';
        if (Cuenta.existe(correo.value)) return 'Ya hay una cuenta con este correo. Entra desde la pestaña «Entrar».';
      }],
      [clave, function () {
        if (!clave.value) return 'Escribe una contraseña.';
        if (clave.value.length < 8) return 'La contraseña necesita al menos 8 caracteres (llevas ' + clave.value.length + ').';
      }]
    ]);
    if (!ok) return;
    ocupado(form, true);
    Cuenta.crear(nombre.value, correo.value, clave.value)
      .then(mostrarJuegos)
      .catch(function () {
        var aviso = $('aviso-crear');
        aviso.textContent = 'No se pudo guardar la cuenta: el navegador bloquea el almacenamiento. Usa «Jugar sin cuenta» o desactiva el modo privado.';
        aviso.focus();
      })
      .then(function () { ocupado(form, false); });
  });

  $('invitado').addEventListener('click', function () {
    mostrarJuegos(Cuenta.entrarComoInvitado());
  });

  /* ================= Cambio de vista ================= */
  function mostrarJuegos(sesion) {
    if (!sesion) return;
    Voz.callar();
    $('vista-entrada').hidden = true;
    $('vista-juegos').hidden = false;
    $('usuario').hidden = false;
    $('usuario-nombre').textContent = sesion.invitado ? 'Sin cuenta' : sesion.nombre;
    $('titulo-saludo').textContent = sesion.invitado
      ? '¿A qué jugamos hoy?'
      : 'Hola, ' + sesion.nombre + '. ¿A qué jugamos hoy?';
    document.title = 'Juegos · Doble raya';
    $('principal').focus();
  }

  function mostrarEntrada() {
    $('vista-juegos').hidden = true;
    $('vista-entrada').hidden = false;
    $('usuario').hidden = true;
    document.title = 'Doble raya · Juegos para aprender a leer';
    $('form-entrar').reset();
    $('form-crear').reset();
    activar(pestanas[0]);
    $('entrar-correo').focus();
  }

  $('salir').addEventListener('click', function () {
    Cuenta.salir();
    mostrarEntrada();
  });

  var actual = Cuenta.sesion();
  if (actual) mostrarJuegos(actual);
})();
