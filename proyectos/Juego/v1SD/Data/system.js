// system.js - Sistema de colisiones COMPLETAMENTE REVISADO

class SistemaColisiones {
    constructor() {
        this.enemigos = [];
        this.balasJugador = [];
        this.eventosDaño = [];
        console.log("Sistema de colisiones inicializado");
    }

    registrarEnemigo(enemigo) {
        this.enemigos.push(enemigo);
        console.log(`Enemigo registrado: ${enemigo.nombre} en (${enemigo.x}, ${enemigo.y})`);
    }

    registrarBalaJugador(balaElement, daño, x, y, width, height) {
        // Guardar la bala con toda su información
        const balaData = {
            element: balaElement,
            daño: daño,
            x: x,
            y: y,
            width: width,
            height: height,
            id: Date.now() + Math.random()
        };
        
        this.balasJugador.push(balaData);
        
        // Actualizar posición periódicamente
        const actualizarPosicion = () => {
            if (balaData.element && document.body.contains(balaData.element)) {
                const rect = balaData.element.getBoundingClientRect();
                balaData.x = rect.left + rect.width / 2;
                balaData.y = rect.top + rect.height / 2;
                balaData.width = rect.width;
                balaData.height = rect.height;
                
                // Continuar actualizando
                if (this.balasJugador.includes(balaData)) {
                    requestAnimationFrame(actualizarPosicion);
                }
            }
        };
        
        requestAnimationFrame(actualizarPosicion);
    }

    eliminarBalaJugador(balaId) {
        const index = this.balasJugador.findIndex(b => b.id === balaId);
        if (index > -1) {
            this.balasJugador.splice(index, 1);
        }
    }

    // Colisión simple círculo-círculo
    colisionCirculos(circ1, circ2, radio1, radio2) {
        const dx = circ1.x - circ2.x;
        const dy = circ1.y - circ2.y;
        const distancia = Math.sqrt(dx * dx + dy * dy);
        return distancia < (radio1 + radio2);
    }

    // Colisión rectángulo-rectángulo
    colisionRectangular(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    actualizar(player) {
        this.verificarColisionesBalasJugador();
        this.verificarColisionesEnemigosJugador(player);
        this.procesarDaños();
    }

    verificarColisionesBalasJugador() {
        for (let i = this.balasJugador.length - 1; i >= 0; i--) {
            const bala = this.balasJugador[i];
            
            // Si la bala ya no existe en el DOM
            if (!bala.element || !document.body.contains(bala.element)) {
                this.balasJugador.splice(i, 1);
                continue;
            }
            
            // Verificar colisión con cada enemigo
            for (let j = this.enemigos.length - 1; j >= 0; j--) {
                const enemigo = this.enemigos[j];
                
                if (!enemigo || !enemigo.element || !document.body.contains(enemigo.element)) {
                    continue;
                }
                
                // Usar colisión circular para más precisión
                const radioBala = Math.max(bala.width, bala.height) / 2;
                const radioEnemigo = Math.max(enemigo.hitbox_x_y[0], enemigo.hitbox_x_y[1]) / 2;
                
                if (this.colisionCirculos(
                    {x: bala.x, y: bala.y},
                    {x: enemigo.x, y: enemigo.y},
                    radioBala,
                    radioEnemigo
                )) {
                    console.log(`¡COLISIÓN! Bala ${i} con Enemigo ${j}`);
                    
                    this.eventosDaño.push({
                        tipo: 'bala_jugador_a_enemigo',
                        balaId: bala.id,
                        enemigo: enemigo,
                        daño: bala.daño
                    });
                    
                    // Eliminar bala
                    bala.element.remove();
                    this.eliminarBalaJugador(bala.id);
                    break;
                }
            }
        }
    }

    verificarColisionesEnemigosJugador(player) {
        if (!player) return;
        
        const radioJugador = Math.max(player.width, player.height) / 2;
        const centroJugador = {x: player.x, y: player.y};
        
        for (let i = this.enemigos.length - 1; i >= 0; i--) {
            const enemigo = this.enemigos[i];
            
            if (!enemigo) continue;
            
            const radioEnemigo = Math.max(enemigo.hitbox_x_y[0], enemigo.hitbox_x_y[1]) / 2;
            const centroEnemigo = {x: enemigo.x, y: enemigo.y};
            
            if (this.colisionCirculos(centroJugador, centroEnemigo, radioJugador, radioEnemigo)) {
                console.log(`¡COLISIÓN! Jugador con Enemigo ${i}`);
                
                this.eventosDaño.push({
                    tipo: 'enemigo_a_jugador',
                    enemigo: enemigo,
                    daño: enemigo.daño
                });
                
                // Empujar al enemigo
                const dx = enemigo.x - player.x;
                const dy = enemigo.y - player.y;
                const distancia = Math.sqrt(dx * dx + dy * dy);
                
                if (distancia > 0) {
                    enemigo.x += (dx / distancia) * 30;
                    enemigo.y += (dy / distancia) * 30;
                    enemigo.actualizarPosicion(enemigo.x, enemigo.y);
                }
            }
        }
    }

    procesarDaños() {
        for (const evento of this.eventosDaño) {
            switch (evento.tipo) {
                case 'bala_jugador_a_enemigo':
                    console.log(`Aplicando ${evento.daño} de daño a enemigo`);
                    const murio = evento.enemigo.recibirDaño(evento.daño);
                    if (murio) {
                        this.eliminarEnemigo(evento.enemigo);
                    }
                    break;
                    
                case 'enemigo_a_jugador':
                    console.log(`Aplicando ${evento.daño} de daño a jugador`);
                    // El daño al jugador se maneja en el sistema de juego
                    break;
            }
        }
        this.eventosDaño = [];
    }

    eliminarEnemigo(enemigo) {
        const index = this.enemigos.indexOf(enemigo);
        if (index > -1) {
            this.enemigos.splice(index, 1);
            if (enemigo.element && document.body.contains(enemigo.element)) {
                enemigo.element.remove();
            }
            console.log("¡Enemigo eliminado!");
        }
    }

    limpiar() {
        this.enemigos.forEach(enemigo => {
            if (enemigo.element && document.body.contains(enemigo.element)) {
                enemigo.element.remove();
            }
        });
        this.enemigos = [];
        this.balasJugador = [];
        this.eventosDaño = [];
    }
}

// Clase Enemigo mejorada
class Enemigo {
    constructor(config) {
        this.nombre = config.nombre || "Drone";
        this.vida = config.vida || 50;
        this.vidaMaxima = config.vida || 50;
        this.daño = config.daño || 10;
        this.velocidad = config.velocidad || 1.5;
        this.recompensa = config.recompensa || 20;
        this.imagen = config.imagen || "Imagenes/Enemigos/dron-E.png";
        this.hitbox_x_y = config.hitbox_x_y || [40, 40];
        this.tipo = config.tipo || "aereo";
        
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.element = null;
        this.barraVidaElement = null;
        
        this.crearElemento();
    }

    crearElemento() {
        // Contenedor principal
        this.element = document.createElement("div");
        this.element.className = "enemigo-container";
        this.element.style.cssText = `
            position: absolute;
            left: ${this.x}px;
            top: ${this.y}px;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 10;
        `;
        
        // Barra de vida (PRIMERO, para que esté detrás pero visible)
        this.barraVidaElement = document.createElement("div");
        this.barraVidaElement.className = "barra-vida-enemigo";
        this.barraVidaElement.style.cssText = `
            position: absolute;
            top: -20px;
            left: 50%;
            transform: translateX(-50%);
            width: ${this.hitbox_x_y[0]}px;
            height: 6px;
            background: rgba(0, 0, 0, 0.7);
            border: 1px solid #333;
            border-radius: 3px;
            overflow: hidden;
            z-index: 11;
        `;
        
        const barraVidaFill = document.createElement("div");
        barraVidaFill.className = "barra-vida-enemigo-fill";
        barraVidaFill.style.cssText = `
            width: 100%;
            height: 100%;
            background: #4CAF50;
            transition: width 0.3s ease, background-color 0.3s ease;
        `;
        
        this.barraVidaElement.appendChild(barraVidaFill);
        this.element.appendChild(this.barraVidaElement);
        
        // Imagen del enemigo
        const imagenElement = document.createElement("div");
        imagenElement.className = "enemigo-imagen";
        imagenElement.style.cssText = `
            position: relative;
            background-image: url("${this.imagen}");
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            width: ${this.hitbox_x_y[0]}px;
            height: ${this.hitbox_x_y[1]}px;
            transform-origin: center;
        `;
        
        this.element.appendChild(imagenElement);
        document.getElementById("arena").appendChild(this.element);
        
        this.actualizarBarraVida();
    }

    actualizarPosicion(x, y) {
        this.x = x;
        this.y = y;
        
        // Mantener dentro de límites (sin wrap)
        const margin = 50;
        if (this.x < -margin) this.x = -margin;
        if (this.x > innerWidth + margin) this.x = innerWidth + margin;
        if (this.y < -margin) this.y = -margin;
        if (this.y > innerHeight + margin) this.y = innerHeight + margin;
        
        if (this.element) {
            this.element.style.left = `${this.x}px`;
            this.element.style.top = `${this.y}px`;
        }
    }

    moverHaciaJugador(jugadorX, jugadorY) {
        let dx = jugadorX - this.x;
        let dy = jugadorY - this.y;
        
        const distancia = Math.sqrt(dx * dx + dy * dy);
        
        if (distancia > 10) {
            this.x += (dx / distancia) * this.velocidad;
            this.y += (dy / distancia) * this.velocidad;
            
            // Rotar solo la imagen
            const imagenElement = this.element.querySelector('.enemigo-imagen');
            if (imagenElement) {
                const angulo = Math.atan2(dy, dx);
                imagenElement.style.transform = `rotate(${angulo}rad)`;
            }
        }
        
        this.actualizarPosicion(this.x, this.y);
    }

    actualizarBarraVida() {
        if (!this.barraVidaElement) return;
        
        const barraFill = this.barraVidaElement.querySelector('.barra-vida-enemigo-fill');
        if (barraFill) {
            const porcentaje = (this.vida / this.vidaMaxima) * 100;
            barraFill.style.width = `${porcentaje}%`;
            
            if (porcentaje > 60) {
                barraFill.style.background = '#4CAF50';
            } else if (porcentaje > 30) {
                barraFill.style.background = '#FF9800';
            } else {
                barraFill.style.background = '#F44336';
            }
        }
    }

    recibirDaño(cantidad) {
        this.vida -= cantidad;
        console.log(`${this.nombre} dañado: -${cantidad}, Vida: ${this.vida}/${this.vidaMaxima}`);
        
        // Efecto visual
        const imagenElement = this.element.querySelector('.enemigo-imagen');
        if (imagenElement) {
            imagenElement.style.filter = 'brightness(1.5)';
            setTimeout(() => {
                if (imagenElement) {
                    imagenElement.style.filter = 'brightness(1)';
                }
            }, 100);
        }
        
        this.actualizarBarraVida();
        
        if (this.vida <= 0) {
            console.log(`${this.nombre} ELIMINADO!`);
            return true;
        }
        return false;
    }
}

// Sistema global
const sistemaColisiones = new SistemaColisiones();

// MODIFICACIÓN CRÍTICA DEL PLAYER
// Guardamos referencia al método original
const crearBalaOriginal = Player.prototype.crearBala;

// Sobrescribimos completamente para mejor control
Player.prototype.crearBala = function() {
    // Crear elemento de bala
    const bala = document.createElement("div");
    bala.className = "bala";
    
    // Configurar estilo
    bala.style.cssText = `
        position: absolute;
        background-image: url("${this.arma.imagen_proyectil}");
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        width: ${this.arma.hitbox_bala[0]}px;
        height: ${this.arma.hitbox_bala[1]}px;
        transform-origin: center;
        pointer-events: none;
        z-index: 5;
    `;
    
    // Posición inicial en la punta de la nave
    const offsetX = Math.cos(this.rot) * (this.width / 2);
    const offsetY = Math.sin(this.rot) * (this.height / 2);
    
    const startX = this.x + offsetX;
    const startY = this.y + offsetY;
    
    bala.style.left = `${startX}px`;
    bala.style.top = `${startY}px`;
    bala.style.transform = `translate(-50%, -50%) rotate(${this.rot}rad)`;
    
    // Almacenar datos de movimiento
    const vx = Math.cos(this.rot) * this.velBala;
    const vy = Math.sin(this.rot) * this.velBala;
    
    // Crear un ID único para esta bala
    const balaId = Date.now() + Math.random();
    bala.dataset.id = balaId;
    bala.dataset.vx = vx;
    bala.dataset.vy = vy;
    bala.dataset.alcance = this.arma.alcance || 500;
    bala.dataset.distancia = 0;
    
    document.body.appendChild(bala);
    
    // REGISTRAR BALA EN EL SISTEMA DE COLISIONES INMEDIATAMENTE
    sistemaColisiones.registrarBalaJugador(
        bala,
        this.arma.daño || 15,
        startX,
        startY,
        this.arma.hitbox_bala[0],
        this.arma.hitbox_bala[1]
    );
    
    // Modificar el método remove para limpiar del sistema
    const originalRemove = bala.remove;
    bala.remove = function() {
        sistemaColisiones.eliminarBalaJugador(balaId);
        return originalRemove.call(this);
    };
    
    return bala;
};

// Añadimos método para mover balas (reemplaza el actualizarBalas del Player)
Player.prototype.actualizarBalas = function() {
    const balas = document.querySelectorAll(".bala");
    
    balas.forEach(b => {
        const vx = parseFloat(b.dataset.vx);
        const vy = parseFloat(b.dataset.vy);
        let distancia = parseFloat(b.dataset.distancia);
        const alcance = parseFloat(b.dataset.alcance);
        
        let x = parseFloat(b.style.left);
        let y = parseFloat(b.style.top);
        
        x += vx;
        y += vy;
        distancia += Math.sqrt(vx * vx + vy * vy);
        
        b.style.left = `${x}px`;
        b.style.top = `${y}px`;
        b.dataset.distancia = distancia;
        
        // Eliminar si supera alcance o sale de pantalla
        const margin = 100;
        if (distancia > alcance ||
            x < -margin || x > innerWidth + margin ||
            y < -margin || y > innerHeight + margin) {
            b.remove();
        }
    });
};

// Sistema de juego principal
class SistemaJuego {
    constructor(player) {
        this.player = player;
        this.enemigos = [];
        this.oleadaActual = 0;
        this.puntuacion = 0;
        this.enJuego = true;
        
        console.log("Sistema de juego creado para:", player);
    }
    
    iniciar() {
        console.log("Iniciando juego...");
        this.generarOleada(1);
        this.bucleJuego();
    }
    
    generarOleada(numeroOleada) {
        this.oleadaActual = numeroOleada;
        const cantidadEnemigos = Math.min(3 + (numeroOleada - 1), 8);
        
        console.log(`Generando oleada ${numeroOleada} con ${cantidadEnemigos} enemigos`);
        
        for (let i = 0; i < cantidadEnemigos; i++) {
            setTimeout(() => {
                const lado = Math.floor(Math.random() * 4);
                let x, y;
                
                switch(lado) {
                    case 0: x = Math.random() * innerWidth; y = -50; break;
                    case 1: x = innerWidth + 50; y = Math.random() * innerHeight; break;
                    case 2: x = Math.random() * innerWidth; y = innerHeight + 50; break;
                    case 3: x = -50; y = Math.random() * innerHeight; break;
                }
                
                const enemigo = new Enemigo({
                    nombre: `Drone ${i+1}`,
                    vida: 30 + (numeroOleada * 5),
                    daño: 10,
                    velocidad: 1 + (numeroOleada * 0.2),
                    recompensa: 20 + (numeroOleada * 5),
                    imagen: "Imagenes/Enemigos/dron-E.png",
                    hitbox_x_y: [40, 40],
                    tipo: "aereo",
                    x: x,
                    y: y
                });
                
                sistemaColisiones.registrarEnemigo(enemigo);
                this.enemigos.push(enemigo);
                
            }, i * 1000);
        }
    }
    
    actualizarEnemigos() {
        if (!this.player) return;
        
        for (let i = this.enemigos.length - 1; i >= 0; i--) {
            const enemigo = this.enemigos[i];
            
            if (!enemigo || !enemigo.element || !document.body.contains(enemigo.element)) {
                this.enemigos.splice(i, 1);
                continue;
            }
            
            enemigo.moverHaciaJugador(this.player.x, this.player.y);
        }
        
        // Sistema de oleadas
        const enemigosVivos = this.enemigos.filter(e => e.vida > 0);
        if (enemigosVivos.length === 0 && this.oleadaActual > 0) {
            console.log(`¡Oleada ${this.oleadaActual} completada!`);
            setTimeout(() => {
                this.generarOleada(this.oleadaActual + 1);
            }, 3000);
        }
    }
    
    procesarDañoJugador(daño) {
        if (!this.player) return false;
        
        console.log(`Jugador recibe ${daño} de daño`);
        
        // Escudo primero
        let dañoRestante = daño;
        if (this.player.escudoActual > 0) {
            const dañoEscudo = Math.min(dañoRestante, this.player.escudoActual);
            this.player.escudoActual -= dañoEscudo;
            dañoRestante -= dañoEscudo;
            console.log(`Escudo reducido: ${this.player.escudoActual}`);
        }
        
        // Salud después
        if (dañoRestante > 0 && this.player.saludActual > 0) {
            this.player.saludActual = Math.max(0, this.player.saludActual - dañoRestante);
            console.log(`Salud reducida: ${this.player.saludActual}`);
        }
        
        // Efecto visual
        if (this.player.el) {
            this.player.el.style.filter = 'brightness(1.5)';
            setTimeout(() => {
                if (this.player.el) {
                    this.player.el.style.filter = 'brightness(1)';
                }
            }, 100);
        }
        
        // Actualizar HUD si existe
        if (typeof this.player.actualizarHUD === 'function') {
            this.player.actualizarHUD();
        }
        
        return this.player.saludActual <= 0;
    }
    
    bucleJuego() {
        if (!this.enJuego) return;
        
        try {
            // Actualizar colisiones
            sistemaColisiones.actualizar(this.player);
            
            // Procesar eventos de daño del jugador
            const eventos = [...sistemaColisiones.eventosDaño];
            eventos.forEach(evento => {
                if (evento.tipo === 'enemigo_a_jugador') {
                    const murio = this.procesarDañoJugador(evento.daño);
                    if (murio) {
                        this.gameOver();
                    }
                }
            });
            
            // Actualizar enemigos
            this.actualizarEnemigos();
            
        } catch (error) {
            console.error("Error en bucle:", error);
        }
        
        requestAnimationFrame(() => this.bucleJuego());
    }
    
    gameOver() {
        this.enJuego = false;
        console.log(`¡GAME OVER! Oleadas: ${this.oleadaActual}`);
        
        const gameOverDiv = document.createElement("div");
        gameOverDiv.innerHTML = `
            <h1>¡GAME OVER!</h1>
            <p>Oleadas superadas: ${this.oleadaActual}</p>
            <p>Puntuación: ${this.puntuacion}</p>
            <button onclick="location.reload()">Reiniciar</button>
        `;
        gameOverDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 40px;
            border-radius: 10px;
            text-align: center;
            z-index: 10000;
        `;
        
        document.body.appendChild(gameOverDiv);
    }
}

// Inicialización
let sistemaJuego = null;

function iniciarSistemaJuego(player) {
    console.log("Iniciando sistema con jugador:", player);
    
    if (!player) {
        console.error("¡No hay jugador!");
        return;
    }
    
    // Asegurar que el jugador tenga estadísticas iniciales
    if (!player.saludActual) player.saludActual = 100;
    if (!player.escudoActual) player.escudoActual = 50;
    
    sistemaJuego = new SistemaJuego(player);
    sistemaJuego.iniciar();
    
    console.log("✅ Sistema de juego iniciado correctamente");
}