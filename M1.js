const tablero = document.querySelector('#tablero');
const botonAgregar = document.querySelector('#botonAgregar');
const botonReiniciar = document.querySelector('#botonReiniciar');
const colores = ['#fff59d', '#d2fad4', '#b3e5fc', '#efc3f7', '#fdbfe2'];

tablero.addEventListener('click', borrar);
botonAgregar.addEventListener('click', agregar);
botonReiniciar.addEventListener('click', reiniciar);

function agregar(){
     // Creacion de Post-it
     let nota = document.createElement('div');
     nota.classList.add('postit');

     // Color aleatorio
     let colorAleatorio = colores[Math.floor(Math.random() * colores.length)];
     nota.style.backgroundColor = colorAleatorio;

     // Contenido del Post-it para escribir
     let contenido = document.createElement('div');
     contenido.classList.add('contenido');
     contenido.setAttribute('contenteditable', 'true');

     // Rotación aleatoria entre -5 y 5 porciento
     let angulo = Math.random() * 10 - 5;
     console.log('Ángulo generado:', angulo);
     nota.style.transform = 'rotate(' + angulo + 'deg)';

     // Botón para borrar
     let botonBorrar = document.createElement('button');
     botonBorrar.classList.add('botonBorrar');
     botonBorrar.textContent = 'x';
     botonBorrar.setAttribute('contenteditable', 'false');

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