const tablero = document.querySelector('#tablero');

// Todos los botones del panel de control
const botonAgregar = document.querySelector('#botonAgregar');
const botonReiniciar = document.querySelector('#botonReiniciar');
const botonOscuro = document.querySelector('#botonOscuro');

// Colores de los post-its
const colores = ['#fff59d', '#d2fad4', '#b3e5fc', '#efc3f7', '#fdbfe2'];
const coloresOscuros = ['#7d6f1f', '#2f5c3f', '#1f4e66', '#5c3966', '#6b3350'];

// Variables que controlan el aviso de pasarse de espacio escribiendo en los post-its
const aviso = document.querySelector('#aviso');
let timeoutAviso = null;

// Escucha cuando clickas el tablero y los botones
tablero.addEventListener('click', borrar);
botonAgregar.addEventListener('click', () => agregar());
botonReiniciar.addEventListener('click', reiniciar);
botonOscuro.addEventListener('click', alternarModoOscuro);

// Tecla secreta para modo oscuro
let teclasEscritas = '';
const palabraSecreta = 'dark';
document.addEventListener('keydown', function(evento){
     teclasEscritas += evento.key.toLowerCase();
     teclasEscritas = teclasEscritas.slice(-palabraSecreta.length);

     if(teclasEscritas === palabraSecreta){
          alternarModoOscuro();
     }
});

// Escucha cuando mueves los post-its
tablero.addEventListener('mousedown', apretar);
document.addEventListener('mousemove', arrastrar);
document.addEventListener('mouseup', soltar);

// Escucha cuando escribes para guardar el estado de la página y mirar que no te pases del post-it
tablero.addEventListener('input', escritura);

// Variables globales que controlan el estado de la página
const estado = {
     notaArrastrando: null,
     offsetX: 0,
     offsetY: 0,
     zIndexActual: 1000,
     modoOscuro: false
}



/* ======== CREACIÓN Y ELIMINACIÓN DE POST-ITS ======== */
// Añadir un post-it
function agregar(texto = '', indiceColor = null, posX = null, posY = null, zIndex = null){
     // Creacion de Post-it
     const nota = document.createElement('div');
     nota.classList.add('postit');

     // Color aleatorio
     if(indiceColor === null){
          indiceColor = Math.floor(Math.random() * colores.length);
     }
     nota.dataset.colorIndice = indiceColor;
     nota.style.backgroundColor = obtenerColorPostit(indiceColor);

     // Agarre para poder mover el Post-it facilmente
     const agarre = document.createElement('div');
     agarre.classList.add('agarre');

     // Contenido del Post-it para escribir
     const contenido = document.createElement('div');
     contenido.classList.add('contenido');
     contenido.setAttribute('contenteditable', 'true');
     contenido.textContent = texto;
     contenido.dataset.textoAnterior = texto;

     // Rotación aleatoria entre -5 y 5 porciento
     const angulo = generarAngulo();
     girarPostit(nota, angulo);

     // Botón para borrar
     const botonBorrar = document.createElement('button');
     botonBorrar.classList.add('botonBorrar');
     botonBorrar.textContent = 'x';
     botonBorrar.setAttribute('contenteditable', 'false');

     // Si tiene una posicion el post-it, se coloca ahí
     if(posX !== null && posY !== null){
          // Como posX y posY tambien incluye 'px', al parsearlo se elimina, y solo se queda con los números
          posicionarPostit(nota, parseFloat(posX), parseFloat(posY));
          nota.dataset.posX = posX;
          nota.dataset.posY = posY;
     }
     
     // Si su zIndex ha sido cambiado en el pasado, se cambia aquí
     if(zIndex !== null){
          aplicarZIndex(nota, zIndex);
     }

     // Crea el post-it en el HTML
     nota.appendChild(agarre);
     nota.appendChild(contenido);
     nota.appendChild(botonBorrar);
     tablero.appendChild(nota);

     guardarEstado();
}

// Borrar un post-it
function borrar(evento){
     if(evento.target.classList.contains('botonBorrar')){
          evento.target.parentElement.remove();
          guardarEstado();
     }
}

// Borra todos los post-its
function reiniciar(){
     const confirmar = confirm('¿Seguro que quieres borrar todos los post-its?');
     if(confirmar){
          /*   innerHTML vacía todo el tablero, un bucle remove() sería
               innecesario porque no hay que conservar nada del contenido */
          tablero.innerHTML = '';
          guardarEstado();
     }
}



/* ======== MOVER POST-ITS ======== */
// Cuando apretes el agarre del post-it:
function apretar (evento){
     if(evento.target.classList.contains('agarre')){
          // Se pasa del agarre a su 'parent', el post-it
          estado.notaArrastrando = evento.target.parentElement;

          // Se calcula la posicion
          const {left, top} = estado.notaArrastrando.getBoundingClientRect();
          estado.offsetX = evento.clientX - left;
          estado.offsetY = evento.clientY - top;

          // Se posiciona el post-it
          posicionarPostit(estado.notaArrastrando, left + window.scrollX, top + window.scrollY);
          
          // El post-it se superpone al resto
          estado.zIndexActual++;
          aplicarZIndex(estado.notaArrastrando, estado.zIndexActual);

          // Se hace más grande
          estado.notaArrastrando.style.transform = 'scale(1.1)';
     }
}

// Cuando arrastras el agarre del post-it:
function arrastrar(evento){
     if(estado.notaArrastrando){
          const {offsetWidth: anchoNota, offsetHeight: altoNota} = estado.notaArrastrando;

          let nuevoLeft = evento.clientX - estado.offsetX + window.scrollX;
          let nuevoTop = evento.clientY - estado.offsetY + window.scrollY;

          const maxLeft = window.scrollX + window.innerWidth - anchoNota;
          const maxTop = window.scrollY + window.innerHeight - altoNota;

          nuevoLeft = Math.max(window.scrollX, Math.min(nuevoLeft, maxLeft));
          nuevoTop = Math.max(window.scrollY, Math.min(nuevoTop, maxTop));

          posicionarPostit(estado.notaArrastrando, nuevoLeft, nuevoTop);
     }
}

// Cuando sueltas el agarre del post-it:
function soltar(){
     if(estado.notaArrastrando){
          // Se cambia el ángulo del post-it al soltarlo
          const angulo = generarAngulo();
          girarPostit(estado.notaArrastrando, angulo);
          
          // Guardamos la posicion del post-it al soltarlo
          estado.notaArrastrando.dataset.posX = estado.notaArrastrando.style.left;
          estado.notaArrastrando.dataset.posY = estado.notaArrastrando.style.top;

          guardarEstado();
     }
     estado.notaArrastrando = null;
}



/* ======== ESCRITURA EN LOS POST-ITS ======== */
// Crea un aviso pasando un mensaje como parámetro
function mostrarAviso(mensaje){
     aviso.textContent = mensaje;
     aviso.classList.add('visible');

     clearTimeout(timeoutAviso);
     timeoutAviso = setTimeout(() => {
          aviso.classList.remove('visible');
     }, 2000);
}

// Cuando escribes, se guarda el contenido y se mira que no te pases del post-it
function escritura(evento){
     if(evento.target.classList.contains('contenido')){
          const contenido = evento.target;

          if(contenido.scrollHeight > contenido.clientHeight){
               mostrarAviso('Ya no tienes espacio para escribir en este post-it');
               
               // Esto elimina lo ultimo que has escrito que sale del post-it
               contenido.textContent = contenido.dataset.textoAnterior ?? '';
               moverCursorAlFinal(contenido);
          } else {
               contenido.dataset.textoAnterior = contenido.textContent;
          }
          guardarEstado();
     }
}

// Esta función mueve el cursor al final del bloque de escritura
function moverCursorAlFinal(elemento){
     const rango = document.createRange();
     const seleccion = window.getSelection();

     rango.selectNodeContents(elemento);
     rango.collapse(false);

     seleccion.removeAllRanges();
     seleccion.addRange(rango);
}



/* ======== MODO OSCURO ======== */
// Cambia de modo claro a oscuro y viceversa
function alternarModoOscuro(){
     estado.modoOscuro = !estado.modoOscuro;
     document.body.classList.toggle('oscuro', estado.modoOscuro);
     actualizarColoresPostits();
     localStorage.setItem('modoOscuro', estado.modoOscuro);
}

// Devuelve un color dependiendo del indice y si esta seleccionado el modoOscuro
function obtenerColorPostit(indice){
     return estado.modoOscuro ? coloresOscuros[indice] : colores[indice];
}

// Actualiza los colores de todos los Post-its
function actualizarColoresPostits(){
     const notas = document.querySelectorAll('.postit');
     notas.forEach((nota) => {
          const indiceColor = nota.dataset.colorIndice;
          nota.style.backgroundColor = obtenerColorPostit(indiceColor);
     });
}



/* ======== GUARDAR Y CARGAR POST-ITS ======== */
// Guarda el estado de la página en ese momento
function guardarEstado(){
     const notas = document.querySelectorAll('.postit');
     const datos = [];

     // Para cada nota se guarda todos sus atributos en datos
     notas.forEach((nota) => {
          const contenido = nota.querySelector('.contenido');
          datos.push({
               texto: contenido.textContent,
               colorIndice: nota.dataset.colorIndice,
               posX: nota.dataset.posX || null,
               posY: nota.dataset.posY || null,
               zIndex: nota.dataset.zIndex || null
          });
     });
     localStorage.setItem('postits', JSON.stringify(datos));
}

// Agrega todos los post-its que estan guardados en memoria
function cargarEstado(){
     const datosGuardados = localStorage.getItem('postits');
     if(datosGuardados){
          const datos = JSON.parse(datosGuardados);

          datos.forEach(function(nota){
               agregar(nota.texto, Number(nota.colorIndice), nota.posX, nota.posY, nota.zIndex);
          });
     }

     const oscuroGuardado = localStorage.getItem('modoOscuro');
     if(oscuroGuardado === 'true'){
          alternarModoOscuro();
     }
}



/* ======== FUNCIONES AUXILIARES ======== */
// Genera un ángulo entre -5° y 5° de manera aleatoria
function generarAngulo(){
     return Math.random() * 10 - 5;
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

// Aplica el z-index, en el estilo y el dataset
function aplicarZIndex(nota, valor){
     nota.style.zIndex = valor;
     nota.dataset.zIndex = valor;
}

// Al cargar la página se llama a la funcion para cargar estado
cargarEstado();