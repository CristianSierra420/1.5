document.addEventListener("DOMContentLoaded", () => {
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    let usuarioActual = null;
  
    function guardarUsuarios() {
      localStorage.setItem("usuarios", JSON.stringify(usuarios));
    }
  
    function generarNumeroTarjeta() {
      let numero = "";
      for (let i = 0; i < 16; i++) {
        numero += Math.floor(Math.random() * 10);
      }
      return numero.replace(/(.{4})/g, "$1 ").trim();
    }
  
    const generarCVV = () => {
      return Math.floor(100 + Math.random() * 900);
    };
  
    function generarFechaExpiracion() {
      const ahora = new Date();
      return `${ahora.getMonth() + 1}/${(ahora.getFullYear() + 3).toString().slice(-2)}`;
    }
  
    const formularioRegistro = document.getElementById("formulario-registro");
    const mensajeRegistro = document.getElementById("mensaje-registro");
  
    formularioRegistro.addEventListener("submit", (evento) => {
      evento.preventDefault();
  
      let nombre = document.getElementById("entrada-usuario").value.trim();
      let contraseña = document.getElementById("entrada-clave").value.trim();
  
      if (!nombre || !contraseña) {
        mensajeRegistro.textContent = "Todos los campos son obligatorios.";
        mensajeRegistro.classList.add("error");
        return;
      }
  
      let existe = usuarios.some(usuario => usuario.nombre === nombre);
      if (existe) {
        mensajeRegistro.textContent = "Este usuario ya existe.";
        mensajeRegistro.classList.add("error");
        return;
      }
  
      let nuevoUsuario = {
        nombre,
        contraseña,
        saldo: 200000,
        movimientos: [],
        tarjeta: {
          numero: generarNumeroTarjeta(),
          cvv: generarCVV(),
          vencimiento: generarFechaExpiracion(),
        },
      };
  
      usuarios.push(nuevoUsuario);
      guardarUsuarios();
      mensajeRegistro.textContent = "Usuario registrado con éxito. Puedes iniciar sesión.";
      mensajeRegistro.classList.remove("error");
      formularioRegistro.reset();
    });
  
    const formularioIngreso = document.getElementById("formulario-ingreso");
    const mensajeIngreso = document.getElementById("mensaje-ingreso");
  
    formularioIngreso.addEventListener("submit", (evento) => {
      evento.preventDefault();
  
      let nombre = document.getElementById("usuario-ingreso").value.trim();
      let contraseña = document.getElementById("clave-ingreso").value.trim();
  
      if (!nombre || !contraseña) {
        mensajeIngreso.textContent = "Debes ingresar usuario y contraseña.";
        mensajeIngreso.classList.add("error");
        return;
      }
  
      for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].nombre === nombre && usuarios[i].contraseña === contraseña) {
          usuarioActual = usuarios[i];
          mostrarInterfazUsuario();
          return;
        }
      }
  
      mensajeIngreso.textContent = "Usuario o contraseña incorrectos.";
      mensajeIngreso.classList.add("error");
    });
  
    const botonIrIngreso = document.getElementById("ir-a-ingreso");
    const botonIrRegistro = document.getElementById("ir-a-registro");
  
    botonIrIngreso.addEventListener("click", () => {
      seccionRegistro.classList.add("hidden");
      seccionIngreso.classList.remove("hidden");
    });
  
    botonIrRegistro.addEventListener("click", () => {
      seccionIngreso.classList.add("hidden");
      seccionRegistro.classList.remove("hidden");
    });
  
    const seccionRegistro = document.getElementById("seccion-registro");
    const seccionIngreso = document.getElementById("seccion-ingreso");
    const seccionUsuario = document.getElementById("seccion-usuario");
    const textoNombreUsuario = document.getElementById("usuario-actual");
  
    function mostrarInterfazUsuario() {
      seccionRegistro.classList.add("hidden");
      seccionIngreso.classList.add("hidden");
      seccionUsuario.classList.remove("hidden");
  
      textoNombreUsuario.textContent = usuarioActual.nombre;
      actualizarTarjeta();
      mostrarMovimientos();
      actualizarSaldoVisible();
    }
  
    function actualizarSaldoVisible() {
      if (!saldoVisible.classList.contains("hidden")) {
        saldoVisible.textContent = `Tu saldo actual es: $${usuarioActual.saldo.toLocaleString("es-CO")}`;
      }
    }
  
    const botonSaldo = document.getElementById("boton-saldo");
    const saldoVisible = document.getElementById("saldo-visible");
  
    botonSaldo.addEventListener("click", () => {
      saldoVisible.textContent = `Tu saldo actual es: $${usuarioActual.saldo.toLocaleString("es-CO")}`;
      saldoVisible.classList.remove("hidden");
    });
  
    function mostrarMovimientos() {
      const lista = document.getElementById("lista-movimientos");
      lista.innerHTML = "";
  
      usuarioActual.movimientos.slice().reverse().forEach((movimiento) => {
        const item = document.createElement("p");
        item.textContent = `• ${movimiento}`;
        lista.appendChild(item);
      });
    }
  
    const botonMovimientos = document.getElementById("boton-movimientos");
  
    botonMovimientos.addEventListener("click", () => {
      const lista = document.getElementById("lista-movimientos");
      lista.classList.toggle("hidden");
    });
  
    const botonTarjeta = document.getElementById("boton-tarjeta");
    const tarjeta = document.getElementById("tarjeta-virtual");
    const botonOcultar = document.getElementById("boton-ocultar");
  
    botonTarjeta.addEventListener("click", () => {
      tarjeta.classList.remove("hidden");
    });
  
    botonOcultar.addEventListener("click", () => {
      tarjeta.classList.add("hidden");
    });
  
    const botonCerrarSesion = document.getElementById("boton-salir");
  
    botonCerrarSesion.addEventListener("click", () => {
      usuarioActual = null;
      seccionUsuario.classList.add("hidden");
      seccionIngreso.classList.remove("hidden");
    });
  
    function actualizarTarjeta() {
      document.getElementById("numero-tarjeta").textContent = usuarioActual.tarjeta.numero;
      document.getElementById("nombre-tarjeta").textContent = usuarioActual.nombre;
      document.getElementById("vencimiento-tarjeta").textContent = usuarioActual.tarjeta.vencimiento;
    }
  
    function agregarMovimiento(texto) {
      usuarioActual.movimientos.push(`${new Date().toLocaleString()}: ${texto}`);
      guardarUsuarios();
      mostrarMovimientos();
    }
  
    function realizarOperacion(titulo, callback) {
      const modal = document.getElementById("modal-fondo");
      const campo = document.getElementById("modal-campo");
      const formulario = document.getElementById("modal-formulario");
      const error = document.getElementById("modal-error");
      const tituloModal = document.getElementById("modal-titulo");
      const cancelar = document.getElementById("modal-cancelar");
  
      tituloModal.textContent = titulo;
      campo.value = "";
      error.textContent = "";
      modal.classList.add("activo");
      campo.focus();
  
      cancelar.onclick = () => modal.classList.remove("activo");
  
      formulario.onsubmit = (evento) => {
        evento.preventDefault();
        const valor = parseFloat(campo.value);
        if (isNaN(valor) || valor <= 0) {
          error.textContent = "Cantidad inválida.";
          return;
        }
        modal.classList.remove("activo");
        callback(valor);
      };
    }
  
    const botonConsignar = document.getElementById("boton-consignar");
  
    botonConsignar.addEventListener("click", () => {
      realizarOperacion("Consignar dinero", (cantidad) => {
        usuarioActual.saldo += cantidad;
        agregarMovimiento(`Consignaste $${cantidad}`);
        actualizarSaldoVisible();
      });
    });
  
    const botonRetirar = document.getElementById("boton-retirar");
    const modal = document.getElementById("modal-fondo");
    const campo = document.getElementById("modal-campo");
    const formulario = document.getElementById("modal-formulario");
    const error = document.getElementById("modal-error");
    const titulo = document.getElementById("modal-titulo");
    const cancelar = document.getElementById("modal-cancelar");
  
    botonRetirar.addEventListener("click", () => {
      titulo.textContent = "Retirar dinero";
      campo.type = "number";
      campo.value = "";
      campo.placeholder = "Ingrese la cantidad a retirar";
      error.textContent = "";
      modal.classList.add("activo");
      campo.focus();
  
      cancelar.onclick = () => modal.classList.remove("activo");
  
      formulario.onsubmit = (evento) => {
        evento.preventDefault();
        const cantidad = parseFloat(campo.value);
  
        if (isNaN(cantidad) || cantidad <= 0) {
          error.textContent = "Cantidad inválida.";
          return;
        }
  
        if (cantidad > usuarioActual.saldo) {
          error.textContent = "Saldo insuficiente.";
          return;
        }
  
        error.textContent = "";
        modal.classList.remove("activo");
        usuarioActual.saldo -= cantidad;
        agregarMovimiento(`Retiraste $${cantidad}`);
        actualizarSaldoVisible();
      };
    });
  
    const botonTransferir = document.getElementById("boton-transferir");
  
    botonTransferir.addEventListener("click", () => {
      actualizarSaldoVisible();
  
      titulo.textContent = "¿A qué usuario deseas transferir?";
      campo.type = "text";
      campo.value = "";
      campo.placeholder = "Nombre de usuario";
      error.textContent = "";
      modal.classList.add("activo");
      campo.focus();
  
      cancelar.onclick = () => modal.classList.remove("activo");
  
      formulario.onsubmit = (evento) => {
        evento.preventDefault();
        const destinatario = campo.value.trim();
  
        if (!destinatario || destinatario === usuarioActual.nombre) {
          error.textContent = "Destinatario inválido.";
          return;
        }
  
        const usuarioDestino = usuarios.find(u => u.nombre === destinatario);
        if (!usuarioDestino) {
          error.textContent = "Usuario no encontrado.";
          return;
        }
  
        titulo.textContent = "¿Cuánto deseas transferir?";
        campo.type = "number";
        campo.value = "";
        campo.placeholder = "Valor a transferir";
        error.textContent = "";
        campo.focus();
  
        formulario.onsubmit = (evento2) => {
          evento2.preventDefault();
          const cantidad = parseFloat(campo.value);
          if (isNaN(cantidad) || cantidad <= 0) {
            error.textContent = "Cantidad inválida.";
            return;
          }
          if (cantidad > usuarioActual.saldo) {
            error.textContent = "Saldo insuficiente.";
            return;
          }
  
          usuarioActual.saldo -= cantidad;
          usuarioDestino.saldo += cantidad;
          agregarMovimiento(`Transferiste $${cantidad} a ${destinatario}`);
          usuarioDestino.movimientos.push(`${new Date().toLocaleString()}: Recibiste $${cantidad} de ${usuarioActual.nombre}`);
          guardarUsuarios();
          modal.classList.remove("activo");
        };
      };
    });
  });