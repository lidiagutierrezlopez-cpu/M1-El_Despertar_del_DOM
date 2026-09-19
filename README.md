# README M1 - El Despertar del DOM
Tablero de notas tipo post-it, construido con HTML, CSS y JavaScript

## Descripción
Aplicación web interactiva que permite crear, editar y borrar post-its en un tablero. Cada nota se genera con un color y una rotación aleatoria, para dar un aspecto más natural. También puedes mover los post-its por toda la pantalla.

## Funcionalidades implementadas
- Añadir post-it: un botón en el panel de control que crea una nueva nota en el tablero.
- Editar contenido: cada post-it tiene una zona de texto editable.
- Mover post-it: puedes mover cada post-it a donde quieras del tablero, y automaticamente se solapa sobre el resto de post-its.
- Texto explicativo dinámico: mientras la nota está vacía, muestra "Escribe aquí..." en gris, y desaparece automáticamente al empezar a escribir.
- Borrar post-it individual: cada nota tiene un botón "X" que la elimina. 
- Color aleatorio: cada post-it al ser creado se le asigna un color pastel elegido al azar de una paleta predefinida.
- Rotación aleatoria: cada nota se coloca con una ligera inclinacion de entre -5° a 5°.
- Reiniciar tablero: botón que borra todos los post-its de golpe, incluye una confirmación previa, para evitar borrados accidentales.
- Panel de control: bloque fijo en la esquina superior izquierda con todos los controles y el título de la página.
- Modo oscuro: cambia el color de toda la página, incluido los post-its. Se puede activar con el boton o con la tecla 'o'.

## Uso de IA
Usé Claude como apoyo para las partes de JavaScript, sobre todo drag & drop, delegación de eventos y depuración de errores. Dos prompts que usé:
- "Cómo puedo hacer que un elemento se mueva por la pantalla siguiendo al ratón?"
- "Al editar el texto a veces se me borra el botón de la cruz, como lo puedo arreglar?"

Verifiqué cada cambio probándolo en el navegador usando la consola como hemos visto en clase. Usé tambien los apuntes de esta asignatura y de la asignatura que cursamos en 1º de carrera para recordar ciertos comandos y para escribir el código de forma más correcta y ordenada.

Yo escribí todo el HTML y la gran mayoría del CSS a mano, y me aseguré de mantener una nomenclatura de JavaScript clara y legible.

## Autopsia
**1. Delegación de eventos.**
Descarté poner addEventListener en cada botón porque con muchos post-its se acumulan listeners innecesarios. En vez de esto, puse un único addEventListener en el tablero que revisa, cuando se hace un click, si el elemento pulsado tiene clase botonBorrar. De esta manera una sola función controla el borrado de todas las notas.

**2. Separar el texto editable.**
Al principio tenía contenteditable="true" en todo el post-it, pero esto causaba que podía eliminar el boton de borrar sin querer. Para arreglar esto, dividí el post-it en dos, un div .contenido que es editable y el boton que no lo es. Esto arregló el problema del todo. Parecido a este problema, al hacer que los post-its se pudieran mover me di cuenta de que no era fácil saber dónde había que hacer click para arrastrarlos. Por eso añadí una sección .agarre en la parte superior, que es la única zona que activa el arrastre.
