// ============================
// MODO OSCURO
// ============================

const btnModo = document.getElementById("modoOscuro");

btnModo.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){
        localStorage.setItem("modo","oscuro");
    }else{
        localStorage.setItem("modo","claro");
    }
});

if(localStorage.getItem("modo") === "oscuro"){
    document.body.classList.add("dark");
}

// ============================
// GRÁFICO
// ============================

let chart;

function crearGrafico(){

    const ctx = document.getElementById("graficoPeso");

    let historial =
    JSON.parse(localStorage.getItem("historialPeso")) || [];

    const fechas =
    historial.map(item => item.fecha);

    const pesos =
    historial.map(item => item.peso);

    if(chart){
        chart.destroy();
    }

    chart = new Chart(ctx,{
        type:"line",

        data:{
            labels:fechas,

            datasets:[
            {
                label:"Peso (kg)",
                data:pesos,
                borderColor:"#4CAF50",
                backgroundColor:"rgba(76,175,80,0.2)",
                borderWidth:3,
                fill:true,
                tension:0.3
            }]
        },

        options:{
            responsive:true
        }
    });
}

// ============================
// HISTORIAL
// ============================

function cargarHistorial(){

    let historial =
    JSON.parse(localStorage.getItem("historialPeso")) || [];

    const tabla =
    document.getElementById("tablaHistorial");

    tabla.innerHTML = "";

    historial.forEach(item => {

        tabla.innerHTML += `
        <tr>
            <td>${item.fecha}</td>
            <td>${item.peso}</td>
            <td>${item.imc}</td>
        </tr>
        `;

    });

}

// ============================
// MENÚS SALUDABLES
// ============================

function generarMenu(imc){

    if(imc >= 30){

        return `
        <h4>🥗 Menú para Obesidad (1500 kcal)</h4>

        <ul>
        <li><b>Desayuno:</b> Avena + plátano + café sin azúcar.</li>

        <li><b>Media mañana:</b> Manzana.</li>

        <li><b>Almuerzo:</b> Pollo a la plancha +
        ensalada + arroz integral.</li>

        <li><b>Merienda:</b> Yogur natural.</li>

        <li><b>Cena:</b> Pescado al horno +
        verduras.</li>
        </ul>
        `;
    }

    else if(imc >= 25){

        return `
        <h4>🥙 Menú para Sobrepeso (1800 kcal)</h4>

        <ul>
        <li><b>Desayuno:</b> Pan integral + huevo.</li>

        <li><b>Media mañana:</b> Fruta.</li>

        <li><b>Almuerzo:</b> Carne magra +
        ensalada.</li>

        <li><b>Merienda:</b> Yogur.</li>

        <li><b>Cena:</b> Atún con ensalada.</li>
        </ul>
        `;
    }

    return `
    <h4>🍎 Menú de Mantenimiento</h4>

    <ul>
    <li>Frutas y verduras.</li>
    <li>Proteínas magras.</li>
    <li>Cereales integrales.</li>
    <li>Hidratación adecuada.</li>
    </ul>
    `;
}

// ============================
// CALCULADORA PRINCIPAL
// ============================

function calcular(){

    let nombre =
    document.getElementById("nombre").value;

    let edad =
    parseInt(document.getElementById("edad").value);

    let sexo =
    document.getElementById("sexo").value;

    let peso =
    parseFloat(document.getElementById("peso").value);

    let altura =
    parseFloat(document.getElementById("altura").value);

    let meta =
    parseFloat(document.getElementById("meta").value);

    if(
        !nombre ||
        !edad ||
        !peso ||
        !altura
    ){
        alert("Completa todos los campos.");
        return;
    }

    let imc =
    peso / (altura * altura);

    let estado = "";
    let clase = "";
    let recomendaciones = [];

    if(imc < 18.5){

        estado = "Bajo Peso";
        clase = "bajo";

        recomendaciones = [
            "Consumir más proteínas.",
            "Aumentar calorías saludables.",
            "Consultar a un nutricionista."
        ];
    }

    else if(imc < 25){

        estado = "Peso Saludable";
        clase = "normal";

        recomendaciones = [
            "Mantener actividad física.",
            "Dormir entre 7 y 9 horas.",
            "Consumir frutas y verduras."
        ];
    }

    else if(imc < 30){

        estado = "Sobrepeso";
        clase = "sobre";

        recomendaciones = [
            "Reducir azúcar.",
            "Caminar 30 minutos diarios.",
            "Controlar porciones."
        ];
    }

    else{

        estado = "Obesidad";
        clase = "obeso";

        recomendaciones = [
            "Consultar un médico.",
            "Crear un plan nutricional.",
            "Realizar ejercicio progresivo.",
            "Evitar ultraprocesados."
        ];
    }

    // ======================
    // PESO IDEAL
    // ======================

    let pesoMin =
    (18.5 * altura * altura).toFixed(1);

    let pesoMax =
    (24.9 * altura * altura).toFixed(1);

    // ======================
    // TMB
    // ======================

    let tmb;

    if(sexo === "hombre"){

        tmb =
        88.36 +
        (13.4 * peso) +
        (4.8 * (altura*100)) -
        (5.7 * edad);

    }else{

        tmb =
        447.6 +
        (9.2 * peso) +
        (3.1 * (altura*100)) -
        (4.3 * edad);
    }

    // ======================
    // MOSTRAR RESULTADOS
    // ======================

    document
    .getElementById("resultado")
    .style.display = "block";

    document
    .getElementById("saludo")
    .innerHTML =
    `Hola <strong>${nombre}</strong>`;

    document
    .getElementById("imc")
    .innerHTML =
    `IMC: <strong>${imc.toFixed(2)}</strong>`;

    document
    .getElementById("estado")
    .innerHTML =
    `Estado: <strong>${estado}</strong>`;

    document
    .getElementById("pesoIdeal")
    .innerHTML =
    `Peso saludable: <strong>${pesoMin} kg - ${pesoMax} kg</strong>`;

    document
    .getElementById("calorias")
    .innerHTML =
    `Calorías mínimas estimadas: <strong>${Math.round(tmb)} kcal/día</strong>`;

    // ======================
    // META
    // ======================

    if(meta){

        let diferencia =
        (peso - meta).toFixed(1);

        if(diferencia > 0){

            document
            .getElementById("metaTexto")
            .innerHTML =
            `🎯 Necesitas perder aproximadamente ${diferencia} kg para alcanzar tu meta.`;

        }else{

            document
            .getElementById("metaTexto")
            .innerHTML =
            `🎯 Meta alcanzada o superada.`;
        }
    }

    // ======================
    // BARRA IMC
    // ======================

    const barra =
    document.getElementById("barra");

    let porcentaje =
    Math.min((imc/40)*100,100);

    barra.style.width =
    porcentaje + "%";

    barra.className = clase;

    barra.textContent = estado;

    // ======================
    // RECOMENDACIONES
    // ======================

    let lista =
    document.getElementById("recomendaciones");

    lista.innerHTML = "";

    recomendaciones.forEach(item => {

        let li =
        document.createElement("li");

        li.textContent = item;

        lista.appendChild(li);
    });

    // ======================
    // MENÚ
    // ======================

    document
    .getElementById("menuSaludable")
    .innerHTML =
    generarMenu(imc);

    // ======================
    // GUARDAR HISTORIAL
    // ======================

    let historial =
    JSON.parse(
        localStorage.getItem("historialPeso")
    ) || [];

    historial.push({

        fecha:
        new Date().toLocaleDateString(),

        peso:peso,

        imc:
        imc.toFixed(2)
    });

    localStorage.setItem(
        "historialPeso",
        JSON.stringify(historial)
    );

    cargarHistorial();
    crearGrafico();
}

// ============================
// INICIO
// ============================

cargarHistorial();
crearGrafico();