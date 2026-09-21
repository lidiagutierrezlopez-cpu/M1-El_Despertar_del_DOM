const tablero = document.querySelector('#tablero');

// Todos los botones del panel de control
const botonAgregar = document.querySelector('#botonAgregar');
const botonReiniciar = document.querySelector('#botonReiniciar');
const botonOscuro = document.querySelector('#botonOscuro');

// Colores de los post-its
const colores = ['#fff59d', '#d2fad4', '#b3e5fc', '#efc3f7', '#fdbfe2'];
const coloresOscuros = ['#7d6f1f', '#2f5c3f', '#1f4e66', '#5c3966', '#6b3350'];

const aviso = document.querySelector('#aviso');
let timeoutAviso = null;

// Escucha cuando clickas el tablero y los botones
tablero.addEventListener('click', borrar);
botonAgregar.addEventListener('click', function(){agregar();});
botonReiniciar.addEventListener('click', reiniciar);
botonOscuro.addEventListener('click', alternarModoOscuro);

// Tecla secreta para modo oscuro
document.addEventListener('keydown', function(evento){
     if(evento.key === 'Tab'){
          evento.preventDefault();
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


/* CREACIÓN Y ELIMINACIÓN DE POST-ITS */
// Añadir un post-it
function agregar(texto = '', indiceColor = null, posX = null, posY = null, zIndex = null){
     // Creacion de Post-it
     let nota = document.createElement('div');
     nota.classList.add('postit');

     // Color aleatorio
     if(indiceColor === null){
          indiceColor = Math.floor(Math.random() * colores.length);
     }
     nota.dataset.colorIndice = indiceColor;
     nota.style.backgroundColor = obtenerColorPostit(indiceColor);

     // Agarre para poder mover el Post-it facilmente
     let agarre = document.createElement('div');
     agarre.classList.add('agarre');

     // Contenido del Post-it para escribir
     let contenido = document.createElement('div');
     contenido.classList.add('contenido');
     contenido.setAttribute('contenteditable', 'true');
     contenido.textContent = texto;
     contenido.dataset.textoAnterior = texto;

     // Rotación aleatoria entre -5 y 5 porciento
     let angulo = generarAngulo();
     nota.style.transform = `rotate(${angulo}deg)`;

     // Botón para borrar
     let botonBorrar = document.createElement('button');
     botonBorrar.classList.add('botonBorrar');
     botonBorrar.textContent = 'x';
     botonBorrar.setAttribute('contenteditable', 'false');

     // Si tiene una posicion el post-it, se coloca ahí
     if(posX !== null && posY !== null){
          nota.style.position = 'absolute';
          nota.style.left = posX;
          nota.style.top = posY;
          nota.dataset.posX = posX;
          nota.dataset.posY = posY;
     }
     
     // Si su zIndex ha sido cambiado en el pasado, se cambia aquí
     if(zIndex !== null){
          nota.style.zIndex = zIndex;
          nota.dataset.zIndex = zIndex;
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
     let confirmar = confirm('¿Seguro que quieres borrar todos los post-its?');
     if(confirmar){
          /*   innerHTML vacía todo el tablero, un bucle remove() sería
               innecesario porque no hay que conservar nada del contenido */
          tablero.innerHTML = '';
          guardarEstado();
     }
}



/* MOVER POST-ITS */
// Cuando apretes el agarre del post-it:
function apretar (evento){
     if(evento.target.classList.contains('agarre')){
          estado.notaArrastrando = evento.target.parentElement;

          // Se calcula la posicion
          let {left, top} = estado.notaArrastrando.getBoundingClientRect();
          estado.offsetX = evento.clientX - left;
          estado.offsetY = evento.clientY - top;

          estado.notaArrastrando.style.position = 'absolute';
          estado.notaArrastrando.style.left = `${left + window.scrollX}px`;
          estado.notaArrastrando.style.top = `${top + window.scrollY}px`;
          
          // El post-it se superpone al resto
          estado.zIndexActual++;
          estado.notaArrastrando.style.zIndex = estado.zIndexActual;
          estado.notaArrastrando.dataset.zIndex = estado.zIndexActual;

          // Se hace más grande
          estado.notaArrastrando.style.transform = 'scale(1.1)';
     }
}

// Cuando arrastras el agarre del post-it:
function arrastrar(evento){
     if(estado.notaArrastrando){
          estado.notaArrastrando.style.left = `${evento.clientX - estado.offsetX + window.scrollX}px`;
          estado.notaArrastrando.style.top = `${evento.clientY - estado.offsetY + window.scrollY}px`;
     }
}

// Cuando sueltas el agarre del post-it:
function soltar(){
     if(estado.notaArrastrando){
          // Se cambia el ángulo del post-it al soltarlo
          let angulo = generarAngulo();
          estado.notaArrastrando.style.transform = `rotate(${angulo}deg)`;
          
          // Guardamos la posicion del post-it al soltarlo
          estado.notaArrastrando.dataset.posX = estado.notaArrastrando.style.left;
          estado.notaArrastrando.dataset.posY = estado.notaArrastrando.style.top;

          guardarEstado();
     }
     estado.notaArrastrando = null;
}

/* ESCRITURA EN LOS POST-ITS */
// Crea un aviso pasando un mensaje como parámetro
function mostrarAviso(mensaje){
     aviso.textContent = mensaje;
     aviso.classList.add('visible');

     clearTimeout(timeoutAviso);
     timeoutAviso = setTimeout(function(){
          aviso.classList.remove('visible');
     }, 2000);
}

// Cuando escribes, se guarda el contenido y se mira que no te pases del post-it
function escritura(evento){
     if(evento.target.classList.contains('contenido')){
          let contenido = evento.target;

          if(contenido.scrollHeight > contenido.clientHeight){
               mostrarAviso('Ya no tienes espacio para escribir en este post-it');
               
               // Esto elimina lo ultimo que has escrito que sale del post-it
               contenido.textContent = contenido.dataset.textoAnterior || '';
               moverCursorAlFinal(contenido);
          } else {
               contenido.dataset.textoAnterior = contenido.textContent;
          }
          guardarEstado();
     }
}

// Esta función mueve el cursor al final del bloque de escritura
function moverCursorAlFinal(elemento){
     let rango = document.createRange();
     let seleccion = window.getSelection();

     rango.selectNodeContents(elemento);
     rango.collapse(false);

     seleccion.removeAllRanges();
     seleccion.addRange(rango);
}



/* GUARDAR Y CARGAR POST-ITS */
// Guarda el estado de la página en ese momento
function guardarEstado(){
     let notas = document.querySelectorAll('.postit');
     let datos = [];

     notas.forEach(function(nota){
          let contenido = nota.querySelector('.contenido');
          datos.push({
               texto: contenido.textContent,
               colorIndice: nota.dataset.colorIndice,
               posX: nota.dataset.posX || null,
               posY: nota.dataset.posY || null,
               zIndex: nota.dataset.zIndex
          });
     });
     localStorage.setItem('postits', JSON.stringify(datos));
}

// Agrega todos los post-its que estan guardados en memoria
function cargarEstado(){
     let datosGuardados = localStorage.getItem('postits');
     if(datosGuardados){
          let datos = JSON.parse(datosGuardados);

          datos.forEach(function(nota){
               agregar(nota.texto, Number(nota.colorIndice), nota.posX, nota.posY, nota.zIndex);
          });
     }

     let oscuroGuardado = localStorage.getItem('modoOscuro');
     if(oscuroGuardado === 'true'){
          alternarModoOscuro();
     }
}



/* FUNCIONES EXTRAS */
// Genera un ángulo entre -5° y 5° de manera aleatoria
function generarAngulo(){
     return Math.random() * 10 - 5;
}

// Devuelve un color dependiendo del indice y si esta seleccionado el modoOscuro
function obtenerColorPostit(indice){
     return estado.modoOscuro ? coloresOscuros[indice] : colores[indice];
}

// Actualiza los colores de todos los Post-its
function actualizarColoresPostits(){
     let notas = document.querySelectorAll('.postit');
     notas.forEach(function(nota){
          let indice = nota.dataset.colorIndice;
          nota.style.backgroundColor = obtenerColorPostit(indice);
     })
}

// Cambia de modo claro a oscuro y viceversa
function alternarModoOscuro(){
     estado.modoOscuro = !estado.modoOscuro;
     document.body.classList.toggle('oscuro', estado.modoOscuro);
     actualizarColoresPostits();
     localStorage.setItem('modoOscuro', estado.modoOscuro);
}


// Al cargar la página se llama a la funcion para cargar estado
cargarEstado();