
let ancho = window.innerWidth;
let alto = window.innerHeight;

let barra;
let pelota;
let bloques = [];
let columnas = 7;
let altoBloque = 25;

let nivel = 1;
let puntos = 0;
let vidas = 3;
let corazon;
let enJuego = false;
let esperandoInicio = true;
let mensaje = "";
let mostrarGameOver = false;

function preload() {
  corazon = createGraphics(20, 20);
  corazon.fill(255, 0, 0);
  corazon.noStroke();
  corazon.beginShape();
  corazon.vertex(10, 18);
  corazon.bezierVertex(2, 10, 0, 4, 5, 2);
  corazon.bezierVertex(10, 0, 10, 5, 10, 5);
  corazon.bezierVertex(10, 5, 10, 0, 15, 2);
  corazon.bezierVertex(20, 4, 18, 10, 10, 18);
  corazon.endShape(CLOSE);
}

function setup() {
  createCanvas(ancho, alto);
  iniciarJuego();
}

// Bucle principal de dibujo
function draw() {
  background(0);
  dibujarHUD();

  if (mostrarGameOver) {
    fill(255, 100, 100);
    textSize(28);
    textAlign(CENTER);
    text("¡Perdiste todas las vidas!\nPresiona ESPACIO para reiniciar.", width / 2, height / 2);
    return;
  }

  if (!enJuego && esperandoInicio) {
    fill(255);
    textSize(24);
    textAlign(CENTER);
    text(mensaje || "Usa ← → para mover.\nPresiona ESPACIO para lanzar la pelota.", width / 2, height / 2);
    return;
  }

  barra.mostrar();
  barra.mover();

  if (!esperandoInicio) pelota.mover();
  pelota.mostrar();

// Detectar impacto con un solo bloque
  for (let i = 0; i < bloques.length; i++) {
    let bloque = bloques[i];
    if (bloque.impactar(pelota)) {
      if (bloque.vida !== -1) puntos++;
      if (bloque.vida <= 0) bloques.splice(i, 1);
      break;
    }
  }

 // Dibujar todos los bloques
  for (let b of bloques) b.mostrar();
  pelota.reboteConBarra(barra);

// Verificar si la pelota cayó
  if (pelota.y > height) {
    vidas--;
    if (vidas <= 0) {
      mostrarGameOver = true;
      enJuego = false;
      esperandoInicio = true;
    } else {
      mensaje = "¡Perdiste una vida! Presiona ESPACIO para continuar.";
      enJuego = false;
      esperandoInicio = true;
      reiniciarPelotaYBarra();
    }
  }

// Verificar si se completó el nivel
  if (bloques.length === 0) {
    if (nivel < 3) {
      nivel++;
      vidas = 3; // restaurar vidas al subir de nivel
      mensaje = "¡Nivel " + nivel + "! Presiona ESPACIO para comenzar.";
      crearBloques();
      reiniciarPelotaYBarra();
      esperandoInicio = true;
      enJuego = false;
    } else {
      mensaje = "¡Ganaste el juego!\nPresiona ESPACIO para reiniciar.";
      iniciarJuego();
    }
  }
}

// Maneja las teclas presionadas
function keyPressed() {
  if (key === ' ') {
    if (mostrarGameOver) {
      iniciarJuego();
      mostrarGameOver = false;
    } else if (!enJuego && esperandoInicio) {
      enJuego = true;
      esperandoInicio = false;
      pelota.lanzar();
    }
  }
}
// Puntos, nivel y vidas
function dibujarHUD() {
  textAlign(CENTER);
  textSize(18);
  fill(255);
  text("Puntos: " + puntos, width / 2, 30);
  text("Nivel: " + nivel, width / 2, 55);
  for (let i = 0; i < vidas; i++) {
    image(corazon, width / 2 - 40 + i * 25, 65);
  }
}
// Bloques de acuerdo al nivel
function crearBloques() {
  bloques = [];
  let anchoBloque = width / columnas;
  let filasNivel = nivel === 1 ? 2 : nivel === 2 ? 3 : 4;

  for (let fila = 0; fila < filasNivel; fila++) {
    for (let col = 0; col < columnas; col++) {
      let x = col * anchoBloque;
      let y = fila * altoBloque + 100;
      let vida = 1;

      if (nivel === 2 && fila === 0 && col === 3) vida = 3;

      if (nivel === 3) {
        if ((fila === 0 && col === 3) || (fila === 1 && col === 5)) vida = 3;
        if (fila === 2 && col === 4) vida = -1; 
      }

      bloques.push(new Bloque(x, y, anchoBloque, altoBloque, vida));
    }
  }
}

// Reinicia la posición de la pelota y la barra
function reiniciarPelotaYBarra() {
  barra.centrar();
  pelota.reiniciar();
}

// Reinicia todo el juego
function iniciarJuego() {
  nivel = 1;
  puntos = 0;
  vidas = 3;
  crearBloques();
  barra = new Barra();
  pelota = new Pelota();
  mensaje = "¡Bienvenido! Usa las flechas ← → para moverte.\nPresiona ESPACIO para comenzar.";
  esperandoInicio = true;
  enJuego = false;
  mostrarGameOver = false;
}

// (paddle)
class Barra {
  constructor() {
    this.ancho = 120;
    this.alto = 15;
    this.vel = 10;
    this.centrar();
  }

  centrar() {
    this.x = width / 2 - this.ancho / 2;
    this.y = height - 40;
  }

  mostrar() {
    fill(0, 255, 255);
    rect(this.x, this.y, this.ancho, this.alto);
  }

  mover() {
    if (keyIsDown(LEFT_ARROW)) this.x -= this.vel;
    if (keyIsDown(RIGHT_ARROW)) this.x += this.vel;
    this.x = constrain(this.x, 0, width - this.ancho);
  }
}

// pelota
class Pelota {
  constructor() {
    this.radio = 12;
    this.reiniciar();
  }

  reiniciar() {
    this.x = width / 2;
    this.y = height / 2;
    this.dx = 0;
    this.dy = 0;
  }

  lanzar() {
    let angulo = random(PI / 5, (4 * PI) / 5);
    let velocidad = 7 + (nivel - 1) * 2.5;
    this.dx = velocidad * cos(angulo);
    this.dy = velocidad * sin(angulo);
    if (abs(this.dy) < 2) this.dy = velocidad * 0.9;
    if (random() > 0.5) this.dx *= -1;
  }

  mostrar() {
    fill(255, 255, 0);
    ellipse(this.x, this.y, this.radio * 2);
  }

  mover() {
    this.x += this.dx;
    this.y += this.dy;
    this.reboteConParedes();
  }

  reboteConParedes() {
    if (this.x < this.radio || this.x > width - this.radio) this.dx *= -1;
    if (this.y < this.radio) this.dy *= -1;
  }

  reboteConBarra(barra) {
    if (
      this.y + this.radio >= barra.y &&
      this.y + this.radio <= barra.y + barra.alto &&
      this.x > barra.x &&
      this.x < barra.x + barra.ancho
    ) {
      let velocidad = sqrt(this.dx * this.dx + this.dy * this.dy);
      let centro = barra.x + barra.ancho / 2;
      let diferencia = this.x - centro;
      let normalizado = constrain(diferencia / (barra.ancho / 2), -1, 1);
      let angulo = normalizado * PI / 3;
      this.dx = velocidad * sin(angulo);
      this.dy = -abs(velocidad * cos(angulo));
    }
  }
}
//  bloques especiales
class Bloque {
    constructor(x, y, w, h, vida) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.vida = vida;
    }
  
    mostrar() {
      if (this.vida === -1) fill(100);             
      else if (this.vida === 3) fill(255, 0, 255);  
      else if (this.vida === 2) fill(255, 165, 0);  
      else fill(0, 255, 0);                         
      rect(this.x, this.y, this.w, this.h);
    }
  
    impactar(pelota) {
      if (
        pelota.x + pelota.radio > this.x &&
        pelota.x - pelota.radio < this.x + this.w &&
        pelota.y + pelota.radio > this.y &&
        pelota.y - pelota.radio < this.y + this.h
      ) {
        pelota.dy *= -1;
  
        
        if (this.vida !== -1) this.vida--;
        return true;
      }
      return false;
    }
  }
  
  












