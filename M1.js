const tablero = document.querySelector('#tablero');
const botonAgregar = document.querySelector('#botonAgregar');

tablero.addEventListener('click', borrar);
botonAgregar.addEventListener('click', agregar);

function agregar(){
     // Creacion de Post-it
     let nota = document.createElement('div');
     nota.classList.add('postit');

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