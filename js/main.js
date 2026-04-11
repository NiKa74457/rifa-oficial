const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbxV1s0vXVvMmOYSSRS_Ykivkm0xePD5Tkac7LG7mx41tw8ZNg5BzWbb6QCSw1iA7hY/exec"; 
let numeroSeleccionadoActualmente = null;

async function cargarBoletos() {
    const grid = document.getElementById('cuadricula-boletos');
    if(!grid) return;
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">Cargando...</p>';

    try {
        const response = await fetch(`${URL_SCRIPT}?t=${new Date().getTime()}`);
        const datosExcel = await response.json(); 
        grid.innerHTML = ''; 

        for (let i = 1; i <= 50; i++) { 
            const div = document.createElement('div');
            const numStr = i.toString();
            const registro = datosExcel.find(item => item.num.toString() === numStr);
            
            div.textContent = i.toString().padStart(2, '0');
            div.className = 'boleto';

            if (registro) {
                div.classList.add(registro.estado);
            } else {
                div.classList.add('disponible');
                div.onclick = () => abrirConfirmacion(i);
            }
            grid.appendChild(div);
        }
    } catch (error) {
        grid.innerHTML = '<p style="color:red;">Error de conexión.</p>';
    }
}

function abrirConfirmacion(numero) {
    numeroSeleccionadoActualmente = numero;
    const elNumero = document.getElementById('numero-elegido');
    if(elNumero) elNumero.textContent = numero;
    
    mostrarModal('modal-registro');
}

// Funciones genéricas para evitar errores de null
function mostrarModal(id) {
    const m = document.getElementById(id);
    if(m) {
        m.classList.remove('hidden');
        m.style.display = 'flex';
    }
}

function ocultarModal(id) {
    const m = document.getElementById(id);
    if(m) {
        m.style.display = 'none';
        m.classList.add('hidden');
    }
}

async function buscarBoletosPorTelefono() {
    const inputTelefono = document.getElementById('consulta-whatsapp');
    const contenedorResultados = document.getElementById('resultado-busqueda');
    const urlScript = 'https://script.google.com/macros/s/AKfycbxV1s0vXVvMmOYSSRS_Ykivkm0xePD5Tkac7LG7mx41tw8ZNg5BzWbb6QCSw1iA7hY/exec'; // <--- PEGA AQUÍ TU URL

    if (!inputTelefono || !contenedorResultados) return;

    const telefonoBusqueda = inputTelefono.value.trim();

    if (telefonoBusqueda.length < 10) {
        contenedorResultados.innerHTML = "<p style='color: #e11d48; margin-top:10px;'>Ingresa los 10 dígitos.</p>";
        return;
    }

    contenedorResultados.innerHTML = "<p style='margin-top:10px;'>Consultando base de datos...</p>";

    try {
        // Hacemos la petición al script de Google Sheets
        const response = await fetch(`${urlScript}?action=consultar&whatsapp=${telefonoBusqueda}`);
        const datos = await response.json();

        if (datos.length > 0) {
            // Si encontró boletos, los mostramos de forma estética
            let htmlBoletos = `<div style="margin-top: 15px; text-align: left;">`;
            datos.forEach(reg => {
               const colorEstado = reg.estado === 'vendido' ? '#fde047' : '#10b981';
                htmlBoletos += `
                    <div style="background: #f8fafc; border-left: 4px solid ${colorEstado}; padding: 10px; margin-bottom: 8px; border-radius: 4px;">
                        <p style="margin:0; font-size: 0.9rem;"><strong>Boleto #${reg.num}</strong></p>
                        <p style="margin:0; font-size: 0.8rem; color: #64748b;">Estado: ${reg.estado.toUpperCase()}</p>
                    </div>
                `;
            });
            htmlBoletos += `</div>`;
            contenedorResultados.innerHTML = htmlBoletos;
        } else {
            contenedorResultados.innerHTML = `
                <div style="background: #fff1f2; padding: 15px; border-radius: 10px; margin-top: 15px;">
                    <p style="font-size: 0.85rem; color: #be123c;">No hay boletos registrados para el número: <strong>${telefonoBusqueda}</strong></p>
                </div>`;
        }
    } catch (error) {
        console.error("Error al consultar:", error);
        contenedorResultados.innerHTML = "<p style='color:red;'>Error de conexión. Intenta más tarde.</p>";
    }
}
function abrirMetodos() { mostrarModal('modal-metodos'); }
function abrirConsulta() { mostrarModal('modal-consulta'); }
function cerrarModal() { ocultarModal('modal-registro'); document.getElementById('form-rifa').reset(); }
function cerrarMetodos() { ocultarModal('modal-metodos'); }
function cerrarConsulta() { ocultarModal('modal-consulta'); }

document.getElementById('form-rifa').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    
    const nombre = document.getElementById('nombre-usuario').value;
    const whatsapp = document.getElementById('whatsapp-usuario').value;

    try {
        await fetch(URL_SCRIPT, {
            method: 'POST',
            mode: 'no-cors', 
            body: JSON.stringify({ boleto: numeroSeleccionadoActualmente, nombre: nombre, whatsapp: whatsapp, estado: 'apartado' })
        });
        alert("¡Apartado solicitado! Envía tu comprobante.");
        cerrarModal();
        cargarBoletos();
    } catch (e) {
        alert("Error al enviar.");
    } finally {
        btn.disabled = false;
    }
});

document.addEventListener('DOMContentLoaded', cargarBoletos);