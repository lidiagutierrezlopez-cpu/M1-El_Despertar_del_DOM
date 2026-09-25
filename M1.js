/* ======== ELEMENTOS DEL DOM ======== */
const tablero = document.querySelector('#tablero');
const aviso = document.querySelector('#aviso');
const botonAgregar = document.querySelector('#botonAgregar');
const botonReiniciar = document.querySelector('#botonReiniciar');
const botonOscuro = document.querySelector('#botonOscuro');

/* ======== CONFIGURACIÓN ======== */
const NUM_COLORES = 5;
const PALABRA_SECRETA = 'dark';
const DURACION_AVISO = 2000;
const ANGULO_MAXIMO = 5;
const ESCALA_ARRASTRE = 1.1;

/* ======== ESTADO DE LA PÁGINA ======== */
const estado = {
     notaArrastrando: null,
     offsetX: 0,
     offsetY: 0,
     zIndexActual: 0,
     modoOscuro: false,
     teclasEscritas: '',
     timeoutAviso: null
};



/* ======== CREACIÓN Y ELIMINACIÓN DE POST-ITS ======== */
// Añadir un post-it
function agregar({texto = '', colorIndice = null, posX = null, posY = null, zIndex = null} = {}){
     const nota = crearElemento('div', 'postit');
     const agarre = crearElemento('div', 'agarre');
     const contenido = crearElemento('textarea', 'contenido');
     const botonBorrar = crearElemento('button', 'botonBorrar');

     // Color guardado, y si no hay, uno aleatorio
     nota.dataset.colorIndice = colorIndice ?? Math.floor(Math.random() * NUM_COLORES);

     // Rotación aleatoria entre -ANGULO_MAXIMO y ANGULO_MAXIMO
     girarPostit(nota, generarAngulo());

     // Si tiene una posición el post-it, se coloca ahí
     if(posX !== null && posY !== null){
          posicionarPostit(nota, posX, posY);
     }
     
     // Si su zIndex ha sido cambiado en el pasado, se cambia aquí
     if(zIndex !== null){
          nota.style.zIndex = zIndex;
     }

     // Zona de texto editable
     contenido.placeholder = 'Escribe aquí...';
     contenido.value = texto;
     contenido.dataset.textoAnterior = texto;

     // Botón para borrar
     botonBorrar.textContent = 'x';

     // Crea el post-it en el HTML
     nota.append(agarre, contenido, botonBorrar);
     tablero.appendChild(nota);
}

// Borrar un post-it
function borrar(evento){
     const boton = evento.target.closest('.botonBorrar');
     if(!boton) return;

     boton.closest('.postit').remove();
     guardarEstado();
}

// Borra todos los post-its
function reiniciar(){
     if(!confirm('¿Seguro que quieres borrar todos los post-its?')) return;
     
     tablero.replaceChildren();
     estado.zIndexActual = 0;
     guardarEstado();
}



/* ======== MOVER POST-ITS ======== */
// Cuando apretes el agarre del post-it:
function apretar(evento){
     const agarre = evento.target.closest('.agarre');
     if(!agarre) return;
     evento.preventDefault();

     // Se pasa del agarre al post-it
     estado.notaArrastrando = agarre.closest('.postit');

     // Se calcula la posición
     const {left, top} = estado.notaArrastrando.getBoundingClientRect();
     estado.offsetX = evento.clientX - left;
     estado.offsetY = evento.clientY - top;

     // Se posiciona el post-it
     posicionarPostit(estado.notaArrastrando, left + window.scrollX, top + window.scrollY);
     
     // El post-it se superpone al resto
     estado.zIndexActual++;
     estado.notaArrastrando.style.zIndex = estado.zIndexActual;

     // Se hace más grande
     estado.notaArrastrando.style.transform = `scale(${ESCALA_ARRASTRE})`;
}

// Cuando arrastras el agarre del post-it:
function arrastrar(evento){
     if(!estado.notaArrastrando) return;

     const {offsetWidth: anchoNota, offsetHeight: altoNota} = estado.notaArrastrando;

     let nuevoLeft = evento.clientX - estado.offsetX + window.scrollX;
     let nuevoTop = evento.clientY - estado.offsetY + window.scrollY;

     const maxLeft = window.scrollX + window.innerWidth - anchoNota;
     const maxTop = window.scrollY + window.innerHeight - altoNota;

     nuevoLeft = Math.max(window.scrollX, Math.min(nuevoLeft, maxLeft));
     nuevoTop = Math.max(window.scrollY, Math.min(nuevoTop, maxTop));

     posicionarPostit(estado.notaArrastrando, nuevoLeft, nuevoTop);
}

// Cuando sueltas el agarre del post-it:
function soltar(){
     if(!estado.notaArrastrando) return;
     
     // Se cambia el ángulo del post-it al soltarlo
     girarPostit(estado.notaArrastrando, generarAngulo());
     
     guardarEstado();
     estado.notaArrastrando = null;
}



/* ======== ESCRITURA EN LOS POST-ITS ======== */
// Cuando escribes, se guarda el contenido y se mira que no te pases del post-it
function escribir(evento){
     const contenido = evento.target.closest('.contenido');
     if(!contenido) return;

     if(contenido.scrollHeight > contenido.clientHeight){
          mostrarAviso('Ya no tienes espacio para escribir en este post-it');
          
          // Esto elimina lo último que has escrito que sale del post-it
          contenido.value = contenido.dataset.textoAnterior;
     } else {
          contenido.dataset.textoAnterior = contenido.value;
     }
     guardarEstado();
}

// Crea un aviso pasando un mensaje como parámetro
function mostrarAviso(mensaje){
     aviso.textContent = mensaje;
     aviso.classList.add('visible');

     clearTimeout(estado.timeoutAviso);
     estado.timeoutAviso = setTimeout(() => {
          aviso.classList.remove('visible');
     }, DURACION_AVISO);
}



/* ======== MODO OSCURO ======== */
// Comprueba si has escrito la palabra secreta
function comprobarPalabraSecreta(evento){
     // Ignora lo que se escribe dentro de un post-it y las teclas especiales
     if(evento.target.matches('.contenido') || evento.key.length !== 1) return;

     estado.teclasEscritas += evento.key.toLowerCase();
     // Solo guarda la cantidad de letras que tenga la palabra secreta
     estado.teclasEscritas = estado.teclasEscritas.slice(-PALABRA_SECRETA.length);

     if(estado.teclasEscritas === PALABRA_SECRETA){
          alternarModoOscuro();
     }
}

// Cambia de modo claro a oscuro y viceversa
function alternarModoOscuro(){
     estado.modoOscuro = !estado.modoOscuro;
     document.body.classList.toggle('oscuro', estado.modoOscuro);
     localStorage.setItem('modoOscuro', estado.modoOscuro);
}



/* ======== GUARDAR Y CARGAR POST-ITS ======== */
// Guarda el estado de la página en ese momento
function guardarEstado(){
     const notas = tablero.querySelectorAll('.postit');
     const datos = [];

     // Para cada nota se guardan todos sus atributos en datos
     notas.forEach((nota) => {
          const x = parseFloat(nota.style.left);
          const y = parseFloat(nota.style.top);
          datos.push({
               texto: nota.querySelector('.contenido').value,
               colorIndice: Number(nota.dataset.colorIndice),
               posX: Number.isNaN(x) ? null : x,
               posY: Number.isNaN(y) ? null : y,
               zIndex: Number(nota.style.zIndex) || null
          });
     });
     localStorage.setItem('postits', JSON.stringify(datos));
}

// Agrega todos los post-its que están guardados en memoria
function cargarEstado(){
     if(localStorage.getItem('modoOscuro') === 'true'){
          alternarModoOscuro();
     }
     
     let datos = [];
     try{
          datos = JSON.parse(localStorage.getItem('postits')) ?? [];
     } catch{
          datos = [];
     }

     datos.forEach((nota) => {
          agregar(nota);
          if(nota.zIndex > estado.zIndexActual){
               estado.zIndexActual = nota.zIndex;
          }
     });
}



/* ======== FUNCIONES AUXILIARES ======== */
// Crea un elemento con una clase
function crearElemento(etiqueta, clase){
     const elemento = document.createElement(etiqueta);
     elemento.classList.add(clase);
     return elemento;
}

// Genera un ángulo entre -ANGULO_MAXIMO y ANGULO_MAXIMO de manera aleatoria
function generarAngulo(){
     return Math.random() * ANGULO_MAXIMO * 2 - ANGULO_MAXIMO;
}

// Gira el post-it
function girarPostit(nota, angulo){
     nota.style.transform = `rotate(${angulo}deg)`;
}

// Posiciona el post-it
function posicionarPostit(nota, x, y){
     nota.style.position = 'absolute';
     nota.style.left = `${x}px`;
     nota.style.top = `${y}px`;
}



/* ======== INICIO ======== */
// Botones del panel de control
botonAgregar.addEventListener('click', () => {
     agregar();
     guardarEstado();
});
botonReiniciar.addEventListener('click', reiniciar);
botonOscuro.addEventListener('click', alternarModoOscuro);

// Tablero: borrar, apretar y escribir
tablero.addEventListener('click', borrar);
tablero.addEventListener('mousedown', apretar);
tablero.addEventListener('input', escribir);

// Documento: arrastre, palabra secreta
document.addEventListener('mousemove', arrastrar);
document.addEventListener('mouseup', soltar);
document.addEventListener('keydown', comprobarPalabraSecreta);

// Al cargar la página se llama a la función para cargar estado
cargarEstado();