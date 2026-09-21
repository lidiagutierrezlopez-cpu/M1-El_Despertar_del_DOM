const tablero = document.querySelector('#tablero');

// Todos los botones del panel de control
const botonAgregar = document.querySelector('#botonAgregar');
const botonReiniciar = document.querySelector('#botonReiniciar');
const botonOscuro = document.querySelector('#botonOscuro');

// Colores de los post-its
const colores = ['#fff59d', '#d2fad4', '#b3e5fc', '#efc3f7', '#fdbfe2'];
const coloresOscuros = ['#7d6f1f', '#2f5c3f', '#1f4e66', '#5c3966', '#6b3350'];

// Escucha cuando clickas el tablero y los botones
tablero.addEventListener('click', borrar);
botonAgregar.addEventListener('click', function(){agregar();});
botonReiniciar.addEventListener('click', reiniciar);
botonOscuro.addEventListener('click', alternarModoOscuro);

// Tecla secreta para modo oscuro
document.addEventListener('keydown', function(evento){
     if(evento.key === 'Tab'){
          alternarModoOscuro();
     }
});

// Escucha cuando mueves los post-its
tablero.addEventListener('mousedown', apretar);
document.addEventListener('mousemove', arrastrar);
document.addEventListener('mouseup', soltar);

// Escucha cuando escribes para guardar el estado de la página
tablero.addEventListener('input', function(evento){
     if(evento.target.classList.contains('contenido')){
          guardarEstado();
     }
});

let notaArrastrando = null;
let offsetX = 0;
let offsetY = 0;
let zIndexActual = 1000;
let modoOscuro = false;

// Añadir un post-it
function agregar(texto = '', indiceColor = null, posX = null, posY = null){
     // Creacion de Post-it
     let nota = document.createElement('div');
     nota.classList.add('postit');

     // Color aleatorio
     if(indiceColor === null){
          indiceColor = Math.floor(Math.random() * colores.length);
     }
     nota.dataset.colorIndice = indiceColor;
     nota.style.backgroundColor = modoOscuro ? coloresOscuros[indiceColor] : colores[indiceColor];

     // Agarre para poder mover el Post-it facilmente
     let agarre = document.createElement('div');
     agarre.classList.add('agarre');

     // Contenido del Post-it para escribir
     let contenido = document.createElement('div');
     contenido.classList.add('contenido');
     contenido.setAttribute('contenteditable', 'true');
     contenido.textContent = texto;

     // Rotación aleatoria entre -5 y 5 porciento
     let angulo = Math.random() * 10 - 5;
     nota.style.transform = `rotate(${angulo}deg)`;

     // Botón para borrar
     let botonBorrar = document.createElement('button');
     botonBorrar.classList.add('botonBorrar');
     botonBorrar.textContent = 'x';
     botonBorrar.setAttribute('contenteditable', 'false');

     if(posX !== null && posY !== null){
          nota.style.position = 'absolute';
          nota.style.left = posX;
          nota.style.top = posY;
          nota.dataset.posX = posX;
          nota.dataset.posY = posY;
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
          tablero.innerHTML = '';
          guardarEstado();
     }
}

// Cuando apretes el agarre del post-it:
function apretar (evento){
     if(evento.target.classList.contains('agarre')){
          notaArrastrando = evento.target.parentElement;

          // Se calcula la posicion
          let rect = notaArrastrando.getBoundingClientRect();
          offsetX = evento.clientX - rect.left;
          offsetY = evento.clientY - rect.top;

          notaArrastrando.style.position = 'absolute';
          notaArrastrando.style.left = `${rect.left + window.scrollX}px`;
          notaArrastrando.style.top = `${rect.top + window.scrollY}px`;
          
          zIndexActual++;
          notaArrastrando.style.zIndex = zIndexActual;

          // Se hace más grande
          notaArrastrando.style.transform = 'scale(1.1)';
     }
}

// Cuando arrastras el agarre del post-it:
function arrastrar(evento){
     if(notaArrastrando){
          notaArrastrando.style.left = `${evento.clientX - offsetX + window.scrollX}px`;
          notaArrastrando.style.top = `${evento.clientY - offsetY + window.scrollY}px`;
     }
}

// Cuando sueltas el agarre del post-it:
function soltar(){
     if(notaArrastrando){
          // Se cambia el ángulo del post-it al soltarlo
          let angulo = Math.random() * 10 - 5;
          notaArrastrando.style.transform = `rotate(${angulo}deg)`;
          
          // Guardamos la posicion del post-it al soltarlo
          notaArrastrando.dataset.posX = notaArrastrando.style.left;
          notaArrastrando.dataset.posY = notaArrastrando.style.top;

          guardarEstado();
     }
     notaArrastrando = null;
}

// Cambia de modo claro a oscuro y viceversa
function alternarModoOscuro(){
     modoOscuro = !modoOscuro;
     document.body.classList.toggle('oscuro', modoOscuro);
     actualizarColoresPostits();
     localStorage.setItem('modoOscuro', modoOscuro);
}

// Actualiza los colores de todos los Post-its
function actualizarColoresPostits(){
     let notas = document.querySelectorAll('.postit');
     notas.forEach(function(nota){
          let indice = nota.dataset.colorIndice;
          nota.style.backgroundColor = modoOscuro ? coloresOscuros[indice] : colores[indice];
     })
}

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
               posY: nota.dataset.posY || null
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
               agregar(nota.texto, Number(nota.colorIndice), nota.posX, nota.posY);
          });
     }

     let oscuroGuardado = localStorage.getItem('modoOscuro');
     if(oscuroGuardado === 'true'){
          alternarModoOscuro();
     }
}

// Al cargar la página se llama a la funcion para cargar estado
cargarEstado();