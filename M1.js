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

// Estado de la página
const estado = {
     notaArrastrando: null,
     offsetX: 0,
     offsetY: 0,
     zIndexActual: 0,
     modoOscuro: false
}

// Palabra secreta para modo oscuro
let teclasEscritas = '';
const palabraSecreta = 'dark';
document.addEventListener('keydown', (evento) => {
     if(evento.target.isContentEditable || evento.key.length !== 1){
          return;
     }

     teclasEscritas += evento.key.toLowerCase();
     teclasEscritas = teclasEscritas.slice(-palabraSecreta.length);

     if(teclasEscritas === palabraSecreta){
          alternarModoOscuro();
     }
});

// Escucha cuando clickas el tablero y los botones
tablero.addEventListener('click', borrar);
botonAgregar.addEventListener('click', () => {
     agregar();
     guardarEstado();
});
botonReiniciar.addEventListener('click', reiniciar);
botonOscuro.addEventListener('click', alternarModoOscuro);

// Escucha cuando mueves los post-its
tablero.addEventListener('mousedown', apretar);
document.addEventListener('mousemove', arrastrar);
document.addEventListener('mouseup', soltar);

// Escucha cuando escribes para guardar el estado de la página y mirar que no te pases del post-it
tablero.addEventListener('input', escritura);



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

     // Rotación aleatoria entre -5° y 5° porciento
     const angulo = generarAngulo();
     girarPostit(nota, angulo);

     // Botón para borrar
     const botonBorrar = document.createElement('button');
     botonBorrar.classList.add('botonBorrar');
     botonBorrar.textContent = 'x';

     // Si tiene una posicion el post-it, se coloca ahí
     if(posX !== null && posY !== null){
          posicionarPostit(nota, posX, posY);
     }
     
     // Si su zIndex ha sido cambiado en el pasado, se cambia aquí
     if(zIndex !== null){
          nota.style.zIndex = zIndex;
     }

     // Crea el post-it en el HTML
     nota.appendChild(agarre);
     nota.appendChild(contenido);
     nota.appendChild(botonBorrar);
     tablero.appendChild(nota);
}

// Borrar un post-it
function borrar(evento){
     const boton = evento.target.closest('.botonBorrar');
     if(boton){
          boton.closest('.postit').remove();
          guardarEstado();
     }
}

// Borra todos los post-its
function reiniciar(){
     const confirmar = confirm('¿Seguro que quieres borrar todos los post-its?');
     if(confirmar){
          tablero.replaceChildren();
          estado.zIndexActual = 0;
          guardarEstado();
     }
}



/* ======== MOVER POST-ITS ======== */
// Cuando apretes el agarre del post-it:
function apretar(evento){
     const agarre = evento.target.closest('.agarre');

     if(!agarre) return;
     evento.preventDefault();

     // Se pasa del agarre a su 'parent', el post-it
     estado.notaArrastrando = agarre.parentElement;

     // Se calcula la posicion
     const {left, top} = estado.notaArrastrando.getBoundingClientRect();
     estado.offsetX = evento.clientX - left;
     estado.offsetY = evento.clientY - top;

     // Se posiciona el post-it
     posicionarPostit(estado.notaArrastrando, left + window.scrollX, top + window.scrollY);
     
     // El post-it se superpone al resto
     estado.zIndexActual++;
     estado.notaArrastrando.style.zIndex = estado.zIndexActual;

     // Se hace más grande
     estado.notaArrastrando.style.transform = 'scale(1.1)';
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
     const angulo = generarAngulo();
     girarPostit(estado.notaArrastrando, angulo);
     
     guardarEstado();
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
     const contenido = evento.target.closest('.contenido');
     if(contenido){
          if(contenido.scrollHeight > contenido.clientHeight){
               mostrarAviso('Ya no tienes espacio para escribir en este post-it');
               
               // Esto elimina lo ultimo que has escrito que sale del post-it
               contenido.innerText = contenido.dataset.textoAnterior ?? '';
               moverCursorAlFinal(contenido);
          } else {
               contenido.dataset.textoAnterior = contenido.innerText;
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
          datos.push({
               texto: nota.querySelector('.contenido').innerText,
               colorIndice: Number(nota.dataset.colorIndice),
               posX: parseFloat(nota.style.left),
               posY: parseFloat(nota.style.top),
               zIndex: Number(nota.style.zIndex) || null
          });
     });
     localStorage.setItem('postits', JSON.stringify(datos));
}

// Agrega todos los post-its que estan guardados en memoria
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
          agregar(nota.texto, nota.colorIndice, nota.posX, nota.posY, nota.zIndex);
          if(nota.zIndex > estado.zIndexActual){
               estado.zIndexActual = nota.zIndex;
          }
     });
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

// Al cargar la página se llama a la funcion para cargar estado
cargarEstado();