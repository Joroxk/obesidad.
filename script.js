// Estados Globales Interfaz
let generoSeleccionadoGlobal = "hombre";
let timerInterval = null;
let timerSegundosTotales = 600; 
let vozSecuenciaInterval = null;

// ================= NOTIFICACIONES INTERNAS (TOAST) =================
function showToast(mensaje) {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = "toast-banner";
    toast.innerHTML = `🔔 <span>${mensaje}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = "1"; }, 50);
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => { toast.remove(); }, 300);
    }, 4500);
}

setInterval(() => {
    let sesion = JSON.parse(localStorage.getItem("sesion"));
    if(sesion && !document.getElementById("pestaña-dashboard").classList.contains("hidden")) {
        showToast("Tu cuerpo necesita combustible celular, ¡bebe un vaso de agua! 💧");
    }
}, 45000);

// ================= INTERFAZ SPA Y PESTAÑAS =================
function cambiarPestaña(seccionId, botonActivo) {
    document.querySelectorAll('.seccion-pestaña').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(seccionId).classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('activo'));
    botonActivo.classList.add('activo');

    if (seccionId === 'pestaña-dashboard') {
        cargarGrafico();
        actualizarRetoSemanarInterfaz();
    }
    if (seccionId === 'pestaña-obesidad') {
        ejecutarSemaforoClinicoInmediato();
    }
}

function togglePassword(inputId, boton) {
    let input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text"; boton.innerText = "🔒";
    } else {
        input.type = "password"; boton.innerText = "👁️";
    }
}

function seleccionarGenero(genero) {
    generoSeleccionadoGlobal = genero;
    let opHombre = document.getElementById("opHombre");
    let opMujer = document.getElementById("opMujer");
    let avatar = document.getElementById("avatarDinamico");

    if (genero === "hombre") {
        opHombre.classList.add("activa"); opMujer.classList.remove("activa");
        avatar.innerText = "🧔";
    } else {
        opMujer.classList.add("activa"); opHombre.classList.remove("activa");
        avatar.innerText = "👩";
    }
}

function actualizarSliderTexto(valor) {
    document.getElementById("valorAlturaTexto").innerText = parseFloat(valor).toFixed(2) + " m";
}

// ================= COACH VOICE NATIVO =================
function coachHablar(texto) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        let utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = 'es-ES';
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
    }
}

// ================= AUTHENTICATION =================
function mostrarRegistro(){
    document.getElementById("registroBox").classList.remove("hidden");
    document.getElementById("loginBox").classList.add("hidden");
}
function mostrarLogin(){
    document.getElementById("registroBox").classList.add("hidden");
    document.getElementById("loginBox").classList.remove("hidden");
}
function registro(){
    let nombre = document.getElementById("regNombre").value.trim();
    let pass = document.getElementById("regPass").value;
    if(!nombre || !pass) { alert("Completa todos los campos"); return; }
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    if(usuarios.find(u => u.nombre.toLowerCase() === nombre.toLowerCase())){ alert("El usuario ya existe"); return; }
    usuarios.push({nombre, pass});
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    alert("Cuenta creada con éxito"); mostrarLogin();
}
function login(){
    let nombre = document.getElementById("loginNombre").value.trim();
    let pass = document.getElementById("loginPass").value;
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    let user = usuarios.find(u => u.nombre.toLowerCase() === nombre.toLowerCase() && u.pass === pass);
    if(!user){ alert("Usuario o contraseña incorrectos"); return; }
    localStorage.setItem("sesion", JSON.stringify(user));
    iniciarApp();
}
function logout(){ localStorage.removeItem("sesion"); location.reload(); }

function iniciarApp(){
    let sesion = JSON.parse(localStorage.getItem("sesion"));
    if(sesion){
        document.getElementById("auth").style.display = "none";
        document.getElementById("app").classList.remove("hidden");
        document.getElementById("bienvenida").innerText = "¡Hola, " + sesion.nombre + "!";
        
        cargarPerfil();
        actualizarTablaHistorial();
        actualizarListaEjercicios();
        cargarSplitSemanal();
        aplicarPreferenciaDarkMode();
        cargarAgua();
        cargarHabitos();
        actualizarRacha();
        cargarGaleriaLocal();
        inicializarDesafioSemanal();
        verificarLogros();
        ejecutarSemaforoClinicoInmediato();
    }
}

// ================= RACHAS Y TIMERS =================
function registrarActividadParaRacha() {
    let sesion = JSON.parse(localStorage.getItem("sesion")); if(!sesion) return;
    let hoyStr = new Date().toLocaleDateString();
    let rachaData = JSON.parse(localStorage.getItem("racha_" + sesion.nombre)) || { ultimaFecha: "", contador: 0 };
    if (rachaData.ultimaFecha !== hoyStr) {
        let ayer = new Date(); ayer.setDate(ayer.getDate() - 1);
        if (rachaData.ultimaFecha === ayer.toLocaleDateString()) rachaData.contador += 1;
        else if (rachaData.ultimaFecha === "") rachaData.contador = 1;
        else rachaData.contador = 1;
        rachaData.ultimaFecha = hoyStr;
        localStorage.setItem("racha_" + sesion.nombre, JSON.stringify(rachaData));
        document.getElementById("contadorRacha").innerText = rachaData.contador;
    }
}
function actualizarRacha() {
    let sesion = JSON.parse(localStorage.getItem("sesion")); if(!sesion) return;
    let hoyStr = new Date().toLocaleDateString();
    let rachaData = JSON.parse(localStorage.getItem("racha_" + sesion.nombre)) || { ultimaFecha: "", contador: 0 };
    if (rachaData.ultimaFecha !== "") {
        let ayer = new Date(); ayer.setDate(ayer.getDate() - 1);
        if (rachaData.ultimaFecha !== hoyStr && rachaData.ultimaFecha !== ayer.toLocaleDateString()) {
            rachaData.contador = 0;
            localStorage.setItem("racha_" + sesion.nombre, JSON.stringify(rachaData));
        }
    }
    document.getElementById("contadorRacha").innerText = rachaData.contador;
}

// ================= MODO OSCURO =================
function toggleDarkMode() {
    let sesion = JSON.parse(localStorage.getItem("sesion"));
    let isDark = document.body.classList.toggle("dark-mode");
    document.getElementById("btnDarkMode").innerText = isDark ? "☀️ Modo Claro" : "🌙 Modo Oscuro";
    if(sesion) localStorage.setItem("theme_" + sesion.nombre, isDark ? "dark" : "light");
    cargarGrafico();
}
function aplicarPreferenciaDarkMode() {
    let sesion = JSON.parse(localStorage.getItem("sesion")); if(!sesion) return;
    if (localStorage.getItem("theme_" + sesion.nombre) === "dark") {
        document.body.classList.add("dark-mode");
        document.getElementById("btnDarkMode").innerText = "☀️ Modo Claro";
    }
}

// ================= PERFIL Y COCH DE FOTOS =================
function guardarPerfil(){
    let sesion = JSON.parse(localStorage.getItem("sesion")); if(!sesion) return;
    let perfil = { edad: document.getElementById("edad").value, sexo: generoSeleccionadoGlobal, altura: document.getElementById("altura").value, actividad: document.getElementById("actividad").value };
    localStorage.setItem("perfil_" + sesion.nombre, JSON.stringify(perfil));
    registrarActividadParaRacha();
    ejecutarSemaforoClinicoInmediato();
    showToast("Parámetros biológicos y factor metabólico recalculados.");
}
function cargarPerfil(){
    let sesion = JSON.parse(localStorage.getItem("sesion")); if(!sesion) return;
    let perfil = JSON.parse(localStorage.getItem("perfil_" + sesion.nombre));
    if(perfil){
        document.getElementById("edad").value = perfil.edad;
        document.getElementById("altura").value = perfil.altura;
        document.getElementById("actividad").value = perfil.actividad || "1.2";
        actualizarSliderTexto(perfil.altura); seleccionarGenero(perfil.sexo || "hombre");
    }
}
function cargarImagenEvolucion(tipo) {
    let sesion = JSON.parse(localStorage.getItem("sesion"));
    let fileInput = document.getElementById(`foto${tipo}Input`);
    if (fileInput.files && fileInput.files[0]) {
        let reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById(`img${tipo}`).src = e.target.result;
            document.getElementById(`img${tipo}`).classList.remove("hidden");
            localStorage.setItem(`foto${tipo}_${sesion.nombre}`, e.target.result);
            showToast(`¡Foto de evolución '${tipo}' guardada localmente!`);
        };
        reader.readAsDataURL(fileInput.files[0]);
    }
}
function cargarGaleriaLocal() {
    let sesion = JSON.parse(localStorage.getItem("sesion")); if(!sesion) return;
    ['Antes', 'Despues'].forEach(tipo => {
        let data = localStorage.getItem(`foto${tipo}_${sesion.nombre}`);
        if(data) {
            let img = document.getElementById(`img${tipo}`);
            img.src = data; img.classList.remove("hidden");
        }
    });
}

// ================= MACRO SCANNER =================
function escanearAlimento() {
    let input = document.getElementById("scannerInput").value.trim().toLowerCase();
    if(!input) { alert("Escribe qué comiste para escanear."); return; }
    let proteinas = 10, carbs = 20, grasas = 5, kcal = 165;
    if (input.includes("pollo") || input.includes("pechuga")) { proteinas += 35; grasas += 4; kcal += 180; }
    if (input.includes("arroz") || input.includes("pasta")) { carbs += 45; kcal += 200; }
    if (input.includes("huevo") || input.includes("huevos")) { proteinas += 14; grasas += 11; kcal += 150; }
    if (input.includes("aguacate") || input.includes("nueces")) { grasas += 15; carbs += 6; kcal += 160; }
    if (input.includes("carne") || input.includes("ternera")) { proteinas += 28; grasas += 12; kcal += 220; }

    document.getElementById("resultadoScanner").classList.remove("hidden");
    document.getElementById("scCalorias").innerText = kcal + " kcal";
    document.getElementById("scProteina").innerText = proteinas + "g";
    document.getElementById("scCarbs").innerText = carbs + "g";
    document.getElementById("scGrasas").innerText = grasas + "g";
    registrarActividadParaRacha();
    showToast("Macros calculados para el plato actual.");
}

// ================= WORKOUT STRUC =================
function guardarSplitSemanal() {
    let sesion = JSON.parse(localStorage.getItem("sesion")); if(!sesion) return;
    let split = { lun: document.getElementById("split-lun").value, mar: document.getElementById("split-mar").value, mie: document.getElementById("split-mie").value, jue: document.getElementById("split-jue").value, vie: document.getElementById("split-vie").value, sab: document.getElementById("split-sab").value, dom: document.getElementById("split-dom").value };
    localStorage.setItem("split_" + sesion.nombre, JSON.stringify(split));
    showToast("Rutina e hipertrofia semanal planificada.");
}
function cargarSplitSemanal() {
    let sesion = JSON.parse(localStorage.getItem("sesion")); if(!sesion) return;
    let split = JSON.parse(localStorage.getItem("split_" + sesion.nombre));
    if(split) { for(let dia in split) { let el = document.getElementById("split-" + dia); if(el) el.value = split[dia]; } }
}

// ================= TEMPORIZADOR MENTE ZEN =================
function actualizarTimerInterfaz() {
    let mins = Math.floor(timerSegundosTotales / 60); let secs = timerSegundosTotales % 60;
    document.getElementById("timerDisplay").innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
function iniciarTimerZen() {
    if(timerInterval) return;
    let sesion = JSON.parse(localStorage.getItem("sesion"));
    document.getElementById("btnTimerStart").innerText = "Meditando...";
    coachHablar(`Hola ${sesion ? sesion.nombre : ''}. Iniciemos tu sesión de reducción de cortisol. Cierra los ojos. Inhala en cuatro tiempos.`);
    ejecutarCicloVozRespiracion();

    timerInterval = setInterval(() => {
        if(timerSegundosTotales > 0) { timerSegundosTotales--; actualizarTimerInterfaz(); } 
        else {
            clearInterval(timerInterval); timerInterval = null;
            clearInterval(vozSecuenciaInterval); vozSecuenciaInterval = null;
            document.getElementById("btnTimerStart").innerText = "Iniciar";
            document.getElementById("instruccionVozTexto").innerText = "Sesión finalizada";
            localStorage.setItem("menteZen_" + sesion.nombre, "completado");
            coachHablar(`Excelente trabajo. Has completado tu meditación. Tu sistema nervioso está equilibrado.`);
            registrarActividadParaRacha(); verificarLogros();
            showToast("🧘‍♂️ ¡Sesión zen completada! Cortisol reducido.");
        }
    }, 1000);
}
function ejecutarCicloVozRespiracion() {
    let estados = [
        { t: "Inhala profundamente... uno, dos, tres, cuatro.", s: "Inhala (4s)" },
        { t: "Retén el aire... uno, dos, tres, cuatro.", s: "Retén (4s)" },
        { t: "Exhala despacio... uno, dos, tres, cuatro.", s: "Exhala (4s)" },
        { t: "Descansa y mantén la mente en blanco.", s: "Vacío (4s)" }
    ];
    let index = 0;
    document.getElementById("instruccionVozTexto").innerText = estados[index].s;
    vozSecuenciaInterval = setInterval(() => {
        index = (index + 1) % estados.length;
        document.getElementById("instruccionVozTexto").innerText = estados[index].s;
        coachHablar(estados[index].t);
    }, 5000);
}
function pausarTimerZen() {
    clearInterval(timerInterval); timerInterval = null;
    clearInterval(vozSecuenciaInterval); vozSecuenciaInterval = null;
    document.getElementById("btnTimerStart").innerText = "Reanudar";
    document.getElementById("instruccionVozTexto").innerText = "Sesión en pausa";
    window.speechSynthesis.cancel();
}
function reiniciarTimerZen() {
    pausarTimerZen(); timerSegundosTotales = 600; actualizarTimerInterfaz();
    document.getElementById("btnTimerStart").innerText = "Iniciar";
    document.getElementById("instruccionVozTexto").innerText = "Listo para iniciar";
}

// ================= RETOS Y AGUA =================
function inicializarDesafioSemanal() {
    document.getElementById("retoTitulo").innerText = "Reto de Súper Hidratación";
    document.getElementById("retoDescripcion").innerText = "Registra un consumo total de al menos 2000ml de agua hoy para apoyar tu metabolismo celular.";
    actualizarRetoSemanarInterfaz();
}
function actualizarRetoSemanarInterfaz() {
    let sesion = JSON.parse(localStorage.getItem("sesion")); if(!sesion) return;
    let datosAgua = JSON.parse(localStorage.getItem("agua_" + sesion.nombre));
    let pct = (datosAgua && datosAgua.fecha === new Date().toLocaleDateString()) ? Math.min((datosAgua.ml / 2000) * 100, 100) : 0;
    document.getElementById("progresoReto").style.width = pct + "%";
    document.getElementById("retoEstadoTexto").innerText = Math.round(pct) + "% Completado";
}
function añadirAgua(cantidad) {
    let sesion = JSON.parse(localStorage.getItem("sesion")); if(!sesion) return;
    let hoy = new Date().toLocaleDateString();
    let datosAgua = JSON.parse(localStorage.getItem("agua_" + sesion.nombre)) || { fecha: hoy, ml: 0 };
    if (datosAgua.fecha !== hoy) { datosAgua.fecha = hoy; datosAgua.ml = 0; }
    datosAgua.ml += cantidad;
    localStorage.setItem("agua_" + sesion.nombre, JSON.stringify(datosAgua));
    document.getElementById("textoAgua").innerText = `Hoy has tomado: ${datosAgua.ml} / 2000 ml`;
    document.getElementById("progresoAgua").style.width = Math.min((datosAgua.ml / 2000) * 100, 100) + "%";
    actualizarRetoSemanarInterfaz(); registrarActividadParaRacha(); verificarLogros();
}
// (funciones reducidas de soporte de agua e hilos de checklist diarios heredados)
function reiniciarAgua() {
    let sesion = JSON.parse(localStorage.getItem("sesion")); if(!sesion) return;
    localStorage.setItem("agua_" + sesion.nombre, JSON.stringify({ fecha: new Date().toLocaleDateString(), ml: 0 }));
    document.getElementById("textoAgua").innerText = `Hoy has tomado: 0 / 2000 ml`;
    document.getElementById("progresoAgua").style.width = "0%";
    actualizarRetoSemanarInterfaz(); verificarLogros();
}
function cargarAgua() {
    let sesion = JSON.parse(localStorage.getItem("sesion")); if(!sesion) return;
    let d = JSON.parse(localStorage.getItem("agua_" + sesion.nombre));
    let ml = (d && d.fecha === new Date().toLocaleDateString()) ? d.ml : 0;
    document.getElementById("textoAgua").innerText = `Hoy has tomado: ${ml} / 2000 ml`;
    document.getElementById("progresoAgua").style.width = Math.min((ml / 2000) * 100, 100) + "%";
}
function verificarHabitos() {
    let sesion = JSON.parse(localStorage.getItem("sesion")); if(!sesion) return;
    let estado = { fecha: new Date().toLocaleDateString(), sueno: document.getElementById("habitoSueno").checked, comida: document.getElementById("habitoComida").checked, estirar: document.getElementById("habitoEstirar").checked };
    localStorage.setItem("habitos_" + sesion.nombre, JSON.stringify(estado));
    if (estado.sueno || estado.comida || estado.estirar) registrarActividadParaRacha();
    verificarLogros();
}
function cargarHabitos() {
    let sesion = JSON.parse(localStorage.getItem("sesion")); if(!sesion) return;
    let guardados = JSON.parse(localStorage.getItem("habitos_" + sesion.nombre));
    if (guardados && guardados.fecha === new Date().toLocaleDateString()) {
        document.getElementById("habitoSueno").checked = guardados.sueno;
        document.getElementById("habitoComida").checked = guardados.comida;
        document.getElementById("habitoEstirar").checked = guardados.estirar;
    }
}
function registrarEjercicio() {
    let sesion = JSON.parse(localStorage.getItem("sesion")); if(!sesion) return;
    let tipo = document.getElementById("tipoEjercicio").value;
    let duracion = parseInt(document.getElementById("duracionEjercicio").value);
    if(!duracion || duracion <= 0) return;
    let ejercicios = JSON.parse(localStorage.getItem("ejercicios_" + sesion.nombre)) || [];
    ejercicios.push({ fecha: new Date().toLocaleDateString(), tipo: tipo, duracion: duracion, calorias: duracion * 8 });
    localStorage.setItem("ejercicios_" + sesion.nombre, JSON.stringify(ejercicios));
    document.getElementById("duracionEjercicio").value = "";
    actualizarListaEjercicios(); registrarActividadParaRacha();
}
function actualizarListaEjercicios() {
    let sesion = JSON.parse(localStorage.getItem("sesion")); if(!sesion) return;
    let ejercicios = JSON.parse(localStorage.getItem("ejercicios_" + sesion.nombre)) || [];
    let lista = document.getElementById("listaEjercicios"); lista.innerHTML = "";
    let hoyEj = ejercicios.filter(e => e.fecha === new Date().toLocaleDateString());
    if(hoyEj.length === 0) { lista.innerHTML = `<li style="color:#777; font-style:italic; list-style:none;">Sin entrenamientos completados hoy.</li>`; return; }
    hoyEj.forEach(ej => {
        let li = document.createElement("li"); li.className = "ejercicio-item";
        li.innerHTML = `<div><strong>${ej.tipo}</strong> — ${ej.duracion} min <span class="calorias-tag">🔥 ${ej.calorias} kcal</span></div>`;
        lista.appendChild(li);
    });
}

// ================= ANALIZADOR MÉDICO IMC Y METABOLISMO CIENTÍFICO =================
function verificarÚltimoIMC() {
    let sesion = JSON.parse(localStorage.getItem("sesion")); if(!sesion) return null;
    let h = JSON.parse(localStorage.getItem("historial_" + sesion.nombre)) || [];
    return h.length > 0 ? parseFloat(h[h.length - 1].imc) : null;
}

function calcularIMC(){
    let sesion = JSON.parse(localStorage.getItem("sesion")); if(!sesion) return;
    let pesoInput = parseFloat(document.getElementById("peso").value);
    let metaPeso = parseFloat(document.getElementById("meta").value);
    let perfil = JSON.parse(localStorage.getItem("perfil_" + sesion.nombre));
    
    if(!pesoInput || !perfil || !perfil.altura || !perfil.edad) { 
        alert("Primero configura y guarda tu edad y altura en la pestaña 'Mi Perfil' para activar las ecuaciones."); 
        return; 
    }

    let alturaInput = parseFloat(perfil.altura);
    let edad = parseInt(perfil.edad);
    let factorActividad = parseFloat(perfil.actividad || 1.2);

    let imc = pesoInput / (alturaInput * alturaInput);
    let estado = imc < 18.5 ? "Bajo peso" : imc < 25 ? "Normal" : imc < 30 ? "Sobrepeso" : "Obesidad";
    
    document.getElementById("resultado").classList.remove("hidden");
    document.getElementById("imc").innerText = "IMC: " + imc.toFixed(2);
    document.getElementById("estado").innerText = "Estado: " + estado;
    document.getElementById("progreso").style.width = Math.min((imc / 40) * 100, 100) + "%";

    let tmb = (perfil.sexo === "hombre") ? ((10 * pesoInput) + (625 * (alturaInput * 100)) - (5 * edad) + 5) : ((10 * pesoInput) + (625 * (alturaInput * 100)) - (5 * edad) - 161);
    let getd = tmb * factorActividad;
    let obj = "mantener";

    if(metaPeso){
        let dif = (pesoInput - metaPeso).toFixed(1);
        document.getElementById("metaTexto").innerText = dif > 0 ? `Faltan ${dif} kg para bajar.` : dif < 0 ? `Faltan ${Math.abs(dif)} kg para subir.` : "¡En peso meta!";
        obj = dif > 0 ? "bajar" : dif < 0 ? "subir" : "mantener";
    }

    document.getElementById("metabolismoTexto").innerHTML = obj === "bajar" ? `Tu cuerpo quema <strong>${Math.round(getd)} kcal</strong> al día. Consume unas <strong>${Math.round(getd - 500)} kcal</strong> diarios (Déficit).` : obj === "subir" ? `Tu cuerpo quema <strong>${Math.round(getd)} kcal</strong> al día. Consume unas <strong>${Math.round(getd + 300)} kcal</strong> diarios (Superávit).` : `Tu cuerpo quema <strong>${Math.round(getd)} kcal</strong> al día para mantenerte.`;

    generarMenusDeComida(pesoInput, obj); guardarHistorial(pesoInput, imc); registrarActividadParaRacha();
    ejecutarSemaforoClinicoInmediato();
}

function generarMenusDeComida(peso, objetivo) {
    document.getElementById("seccionMenus").classList.remove("hidden");
    let des = document.getElementById("menuDesayuno"), alm = document.getElementById("menuAlmuerzo"), mer = document.getElementById("menuMerienda"), cen = document.getElementById("menuCena");
    if (objetivo === "bajar") {
        document.getElementById("infoNutricional").innerText = `Plan Hipocalórico basado en saciedad volumétrica.`;
        des.innerText = "Claras revueltas con espinacas y café verde."; alm.innerText = "Pechuga fileteada con brócoli al vapor y arroz integral."; mer.innerText = "Yogur griego 0% con semillas de chía."; cen.innerText = "Salmón con espárragos asados.";
    } else {
        document.getElementById("infoNutricional").innerText = `Plan hipercalórico para desarrollo muscular estructural.`;
        des.innerText = "2 huevos enteros, tostada integral con aguacate."; alm.innerText = "Bowl de quinoa con pavo magro picado."; mer.innerText = "Batido de proteína con plátano y avena."; cen.innerText = "Muslo de pollo con patata asada.";
    }
}

// ================= INTERACTIVO: SEMÁFORO CLÍNICO AUTOMÁTICO =================
function verificarEstadoImcParaNav(imc) {
    let btn = document.getElementById("nav-obesidad-btn");
    if (!btn) return;
    if (imc && imc >= 25) {
        btn.innerHTML = "🩺 Salud y Obesidad <span class='dot-alerta-nav'>⚠️</span>";
    } else {
        btn.innerHTML = "🩺 Salud y Obesidad";
    }
}

function ejecutarSemaforoClinicoInmediato() {
    let imc = verificarÚltimoIMC();
    let box = document.getElementById("semaforoClinicoBox");
    let luz = document.getElementById("semaforoLuzColor");
    let titulo = document.getElementById("semaforoTitulo");
    let desc = document.getElementById("semaforoDescripcion");

    verificarEstadoImcParaNav(imc);

    if (!imc) return;

    box.className = "alert-box-semaforo"; 
    if (imc < 18.5) {
        box.classList.add("status-bajo"); luz.style.background = "#38bdf8";
        titulo.innerText = `Protocolo Activado: Bajo Peso detectado (${imc.toFixed(2)})`;
        desc.innerText = "Tu IMC se encuentra por debajo de la zona homeostática saludable. Se sugiere enfocar el pilar nutricional en superávit calórico y suspender cardios extenuantes en ayunas.";
    } else if (imc < 25) {
        box.classList.add("status-normal"); luz.style.background = "#4CAF50";
        titulo.innerText = `Protocolo Activado: Peso Saludable (${imc.toFixed(2)})`;
        desc.innerText = "¡Excelente homeostasis celular! Tu cuerpo se encuentra en un rango de riesgo cardiovascular bajo. Continúa aplicando el pilar de fuerza y control de cortisol.";
    } else if (imc < 30) {
        box.classList.add("status-sobrepeso"); luz.style.background = "#f59e0b";
        titulo.innerText = `Protocolo Clínico: Sobrepeso Detectado (${imc.toFixed(2)})`;
        desc.innerText = "Alerta preventiva: Tu organismo ha comenzado a expandir adipocitos subcutáneos. Se activa el protocolo de restricción selectiva de ultraprocesados y 3 sesiones semanales de fuerza obligatorias.";
    } else {
        box.classList.add("status-obesidad"); luz.style.background = "#ef4444";
        titulo.innerText = `Protocolo Clínico de Intervención: Obesidad detectada (${imc.toFixed(2)})`;
        desc.innerText = "¡Atención metabólica prioritaria! El tejido adiposo está induciendo un estado inflamatorio sistémico. Aplica de inmediato el pilar de higiene del sueño (control de grelina) y prioriza proteínas para mitigar el comer emocional de forma segura.";
    }
}

// ================= INTERACTIVO: DIAGNÓSTICO CINTURA-ALTURA (ICA) =================
function calcularICA() {
    let sesion = JSON.parse(localStorage.getItem("sesion")); if(!sesion) return;
    let perfil = JSON.parse(localStorage.getItem("perfil_" + sesion.nombre));
    let cintura = parseFloat(document.getElementById("cinturaCm").value);

    if (!cintura || !perfil || !perfil.altura) {
        alert("Por favor ingresa los cm de tu cintura y asegúrate de haber configurado tu altura en la pestaña 'Mi Perfil'.");
        return;
    }

    let alturaCm = parseFloat(perfil.altura) * 100;
    let ica = cintura / alturaCm;
    let resBox = document.getElementById("resultadoICA");
    resBox.classList.remove("hidden");

    let evaluacion = "";
    if (ica <= 0.42) { evaluacion = "🟩 ICA Delgado/Bajo. Riesgo cardiovascular extremadamente bajo."; }
    else if (ica <= 0.52) { evaluacion = "🟩 ICA Saludable. Distribución de grasa visceral óptima."; }
    else if (ica <= 0.57) { evaluacion = "🟨 ICA Sobrepeso. Inicio de acumulación lipídica visceral. Riesgo arterial moderado."; }
    else { evaluacion = "🟥 ICA Obesidad Visceral Elevada. Alto riesgo cardiovascular y de resistencia a la insulina. ¡Atención prioritaria!"; }

    resBox.innerHTML = `<strong>Tu ICA es ${ica.toFixed(2)}:</strong> ${evaluacion}`;
    registrarActividadParaRacha();
}

// ================= HISTORIAL Y LOGROS =================
function guardarHistorial(peso, imc){
    let sesion = JSON.parse(localStorage.getItem("sesion")); if(!sesion) return;
    let historial = JSON.parse(localStorage.getItem("historial_" + sesion.nombre)) || [];
    historial.push({ fecha: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), peso: peso, imc: imc.toFixed(2) });
    localStorage.setItem("historial_" + sesion.nombre, JSON.stringify(historial));
    cargarGrafico(); actualizarTablaHistorial(); verificarLogros();
}
function actualizarTablaHistorial() {
    let sesion = JSON.parse(localStorage.getItem("sesion")); if(!sesion) return;
    let historial = JSON.parse(localStorage.getItem("historial_" + sesion.nombre)) || [];
    let tbody = document.getElementById("tablaHistorial").querySelector("tbody"); tbody.innerHTML = "";
    if(historial.length === 0) { tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Sin registros</td></tr>`; return; }
    historial.slice().reverse().forEach(r => {
        let f = document.createElement("tr"); f.innerHTML = `<td>${r.fecha}</td><td><strong>${r.peso} kg</strong></td><td>${r.imc}</td>`; tbody.appendChild(f);
    });
}
function borrarHistorial() {
    let sesion = JSON.parse(localStorage.getItem("sesion")); if(!sesion) return;
    if(confirm("¿Borrar todo el historial?")) { localStorage.removeItem("historial_" + sesion.nombre); cargarGrafico(); actualizarTablaHistorial(); verificarLogros(); ejecutarSemaforoClinicoInmediato(); }
}
function verificarLogros() {
    let sesion = JSON.parse(localStorage.getItem("sesion")); if(!sesion) return;
    let hoy = new Date().toLocaleDateString();
    let hist = JSON.parse(localStorage.getItem("historial_" + sesion.nombre)) || [];
    document.getElementById("logroPeso").className = hist.length > 0 ? "logro-card desbloqueado" : "logro-card bloqueado";
    let dagua = JSON.parse(localStorage.getItem("agua_" + sesion.nombre));
    let aguaCumplida = dagua && dagua.fecha === hoy && dagua.ml >= 2000;
    document.getElementById("logroAgua").className = aguaCumplida ? "logro-card desbloqueado" : "logro-card bloqueado";
    document.getElementById("logroRetoMedalla").className = aguaCumplida ? "logro-card desbloqueado" : "logro-card bloqueado";
    let c1 = document.getElementById("habitoSueno").checked, c2 = document.getElementById("habitoComida").checked, c3 = document.getElementById("habitoEstirar").checked;
    document.getElementById("logroHabitos").className = (c1 && c2 && c3) ? "logro-card desbloqueado" : "logro-card bloqueado";
    let zen = localStorage.getItem("menteZen_" + sesion.nombre);
    document.getElementById("logroMente").className = zen === "completado" ? "logro-card desbloqueado" : "logro-card bloqueado";
}

let chart;
function cargarGrafico(){
    let sesion = JSON.parse(localStorage.getItem("sesion"));
    if(!sesion || document.getElementById("pestaña-dashboard").classList.contains("hidden")) return;
    let historial = JSON.parse(localStorage.getItem("historial_" + sesion.nombre)) || [];
    let canvasEl = document.getElementById("grafico"); if(!canvasEl) return;
    let ctx = canvasEl.getContext("2d"); if(chart) chart.destroy();
    let isDark = document.body.classList.contains("dark-mode");
    chart = new Chart(ctx, {
        type: "line",
        data: { labels: historial.map(x=>x.fecha), datasets: [{ label: "Peso (kg)", data: historial.map(x=>x.peso), borderColor: "#4CAF50", backgroundColor: "rgba(76, 175, 80, 0.1)", tension: 0.2, fill: true }] },
        options: { responsive: true, plugins: { legend: { labels: { color: isDark?"#eee":"#333" } } }, scales: { x: { grid: { color: isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.05)" }, ticks: { color: isDark?"#eee":"#333" } }, y: { grid: { color: isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.05)" }, ticks: { color: isDark?"#eee":"#333" } } } }
    });
}

iniciarApp();

// ================= SISTEMA DE MENÚS CASEROS POR OCUPACIÓN =================
const datosOcupaciones = {
    estudiante: {
        titulo: "🎓 Estudiante (Enfoque y Memoria para Clases)",
        gasto: "🔥 **Gasto Estimado:** ~400 - 600 kcal adicionales. Tu cerebro consume mucha glucosa al estudiar. Necesitas carbohidratos estables para no darte sueño en plena clase.",
        desayuno: "🍳 **Desayuno:** Una taza de avena caliente con un plátano picado (energía sostenida) + 1 pan con huevo sancochado o revuelto.",
        almuerzo: "🍛 **Almuerzo:** Un buen plato de lentejas o frijoles con arroz blanco, acompañado de un huevo frito o una presa de pollo, y ensalada simple de tomate.",
        cena: "🥣 **Cena:** Tortilla casera de verduras (zanahoria rallada, cebolla y espinaca si hay) acompañada de una papa sancochada y una taza de manzanilla."
    },
    profesor: {
        titulo: "🧑‍🏫 Profesor (Resistencia de Pie y Cuidado Vocal)",
        gasto: "🔥 **Gasto Estimado:** ~600 - 800 kcal adicionales. Estar de pie explicando gasta bastante energía muscular. Necesitas líquidos protectores y potasio para evitar fatiga en las piernas.",
        desayuno: "🍳 **Desayuno:** Una taza de té tibio con limón (cuida la garganta) + 1 o 2 panes con queso fresco o palta + 1 huevo sancochado.",
        almuerzo: "🍛 **Almuerzo:** Estofado o seco de pollo con su porción de arroz y una papa o yuca sancochada. Ensalada de lechuga para refrescar.",
        cena: "🥣 **Cena:** Una taza de sopa casera templada con los fideos y verduras que quedaron del almuerzo, o arroz blanco con un huevo escalfado."
    },
    ama_casa: {
        titulo: "🏡 Ama de Casa (Cardio y Movimiento Continuo)",
        gasto: "🔥 **Gasto Estimado:** ~700 - 900 kcal adicionales. Limpiar, cocinar y organizar la casa equivale a un entrenamiento físico diario. Requieres proteínas para proteger tus músculos.",
        desayuno: "🍳 **Desayuno:** Una taza de café o infusión + 1 pan con tortilla de huevo y una fruta entera que haya en casa (manzana, mandarina o plátano).",
        almuerzo: "🍛 **Almuerzo:** Un plato de quinua guisada o arroz con pescado frito (bonito o jurel que son económicos) y una buena porción de ensalada de repollo o tomate.",
        cena: "🥣 **Cena:** Un pan con pollo deshilachado (puedes usar el del almuerzo) o una taza de avena ligera para dormir ligera y sin pesadez."
    },
    obrero: {
        titulo: "🏗️ Obrero / Trabajador Manual (Máxima Fuerza Física)",
        gasto: "🔥 **Gasto Estimado:** ~1200 - 1500 kcal adicionales. El trabajo pesado destruye fibras musculares y agota las reservas de energía rápido. ¡Necesitas comida contundente!",
        desayuno: "🍳 **Desayuno:** Un vaso grande de ponche de habas o avena bien espesa + 2 panes con huevo o queso + 1 plátano isla o de seda.",
        almuerzo: "🍛 **Almuerzo:** Un señor plato de arroz con frijoles o garbanzos, una porción generosa de carne de res, pollo o hígado frito, acompañado de un camote grande sancochado.",
        cena: "🥣 **Cena:** Una porción del guiso que quedó del almuerzo con arroz, para asegurar que tus músculos se recuperen por completo mientras duermes."
    },
    general: {
        titulo: "🌍 Modo General (Rutina Flexible Estándar)",
        gasto: "🔥 **Gasto Estimado:** ~300 - 500 kcal adicionales. Ideal si tienes un día mixto, estudias o trabajas sin horarios fijos y buscas mantenerte saludable sin complicarte.",
        desayuno: "🍳 **Desayuno:** Una taza de la infusión que prefieras + 1 pan con huevo o queso fresco + una fruta de la estación.",
        almuerzo: "🍛 **Almuerzo:** Pollo al horno o a la plancha con arroz blanco, una papa sancochada y ensalada de verduras variadas de la semana.",
        cena: "🥣 **Cena:** Una tortilla de huevo simple con un pan, o una porción ligera de lo que se preparó en el almuerzo."
    }
};

function actualizarGuiaOcupacion() {
    let seleccion = document.getElementById("selectOcupacion").value;
    let info = datosOcupaciones[seleccion];
    if (!info) return;

    // Actualizar títulos e información de calorías
    document.getElementById("ocupacionTitulo").innerText = info.titulo;
    document.getElementById("ocupacionGasto").innerHTML = info.gasto;

    // Construir los bloques visuales para Desayuno, Almuerzo y Cena
    let container = document.getElementById("menuComedasContainer");
    container.innerHTML = `
        <div class="menu-item" style="border-left: 3px solid #f59e0b; padding: 10px; background: var(--item-bg); border-radius: 6px; font-size: 13px;">
            ${info.desayuno}
        </div>
        <div class="menu-item" style="border-left: 3px solid #10b981; padding: 10px; background: var(--item-bg); border-radius: 6px; font-size: 13px;">
            ${info.almuerzo}
        </div>
        <div class="menu-item" style="border-left: 3px solid #3b82f6; padding: 10px; background: var(--item-bg); border-radius: 6px; font-size: 13px;">
            ${info.cena}
        </div>
    `;
}