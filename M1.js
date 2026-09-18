const tablero = document.querySelector('#tablero');

const botonAgregar = document.querySelector('#botonAgregar');
const botonReiniciar = document.querySelector('#botonReiniciar');
const botonOscuro = document.querySelector('#botonOscuro');

const colores = ['#fff59d', '#d2fad4', '#b3e5fc', '#efc3f7', '#fdbfe2'];
const coloresOscuros = ['#7d6f1f', '#2f5c3f', '#1f4e66', '#5c3966', '#6b3350'];

tablero.addEventListener('click', borrar);
botonAgregar.addEventListener('click', agregar);
botonReiniciar.addEventListener('click', reiniciar);
botonOscuro.addEventListener('click', alternarModoOscuro);

tablero.addEventListener('mousedown', apretar);
document.addEventListener('mousemove', arrastrar);
document.addEventListener('mouseup', soltar);

let notaArrastrando = null;
let offsetX = 0;
let offsetY = 0;
let zIndexActual = 1000;
let modoOscuro = false;

function agregar(){
     // Creacion de Post-it
     let nota = document.createElement('div');
     nota.classList.add('postit');

     // Color aleatorio
     let indiceColor = Math.floor(Math.random() * colores.length);
     nota.dataset.colorIndice = indiceColor;
     nota.style.backgroundColor = modoOscuro ? coloresOscuros[indiceColor] : colores[indiceColor];

     // Agarre para poder mover el Post-it facilmente
     let agarre = document.createElement('div');
     agarre.classList.add('agarre');

     // Contenido del Post-it para escribir
     let contenido = document.createElement('div');
     contenido.classList.add('contenido');
     contenido.setAttribute('contenteditable', 'true');

     // Rotación aleatoria entre -5 y 5 porciento
     let angulo = Math.random() * 10 - 5;
     nota.style.transform = 'rotate(' + angulo + 'deg)';

     // Botón para borrar
     let botonBorrar = document.createElement('button');
     botonBorrar.classList.add('botonBorrar');
     botonBorrar.textContent = 'x';
     botonBorrar.setAttribute('contenteditable', 'false');

     nota.appendChild(agarre);
     nota.appendChild(contenido);
     nota.appendChild(botonBorrar);
     tablero.appendChild(nota);
}

function borrar(evento){
     if(evento.target.classList.contains('botonBorrar')){
          evento.target.parentElement.remove();
     }
}

function reiniciar(){
     let confirmar = confirm('¿Seguro que quieres borrar todos los post-its?');
     if(confirmar){
          tablero.innerHTML = '';
     }
}

function apretar (evento){
     if(evento.target.classList.contains('agarre')){
          notaArrastrando = evento.target.parentElement;

          let rect = notaArrastrando.getBoundingClientRect();
          offsetX = evento.clientX - rect.left;
          offsetY = evento.clientY - rect.top;

          notaArrastrando.style.position = 'absolute';
          notaArrastrando.style.left = (rect.left + window.scrollX) + 'px';
          notaArrastrando.style.top = (rect.top + window.scrollY) + 'px';
          
          zIndexActual++;
          notaArrastrando.style.zIndex = zIndexActual;

          notaArrastrando.style.transform = 'scale(1.1)';
     }
}

function arrastrar(evento){
     if(notaArrastrando){
          notaArrastrando.style.left = (evento.clientX - offsetX + window.scrollX) + 'px';
          notaArrastrando.style.top = (evento.clientY - offsetY + window.scrollY) + 'px';
     }
}

function soltar(){
     if(notaArrastrando){
          let angulo = Math.random() * 10 - 5;
          notaArrastrando.style.transform = 'rotate(' + angulo + 'deg)';
     }
     notaArrastrando = null;
}

function alternarModoOscuro(){
     modoOscuro = !modoOscuro;
     document.body.classList.toggle('oscuro', modoOscuro);
     actualizarColoresPostits();
}

function actualizarColoresPostits(){
     let notas = document.querySelectorAll('.postit');
     notas.forEach(function(nota){
          let indice = nota.dataset.colorIndice;
          nota.style.backgroundColor = modoOscuro ? coloresOscuros[indice] : colores[indice];
     })
}