class Player {
    constructor(naveData, armaData) {
        // --- ELEMENTOS DOM ---
        this.el = document.getElementById("player");
        
        // --- DATOS ---
        this.nave = naveData;
        this.arma = armaData;

        // --- POSICIÓN Y DIMENSIONES ---
        this.x = innerWidth / 2;
        this.y = innerHeight / 2;
        this.rot = 0;
        this.width = this.nave.hitbox_x_y[0];
        this.height = this.nave.hitbox_x_y[1];

        // --- ESTADÍSTICAS ---
        this.speed = this.nave.velocidad || 4;
        this.velBala = this.arma.velocidad_de_proyectil || 12;
        
        // CADENCIA EN MILISEGUNDOS: 1000 = 1 segundo entre disparos
        // Menos milisegundos = más rápido, Más milisegundos = más lento
        this.cadenciaMS = this.arma.cadencia || 1000; // 1000ms = 1 bala por segundo
        
        // --- SISTEMA DE MUNICIÓN ---
        this.municionActual = this.arma.capacidad_de_cargador || 30;
        this.municionTotal = this.arma.municion || 120;
        this.recargando = false;
        this.tiempoRecarga = (this.arma.velocidad_de_recarga || 3) * 1000;
        this.tiempoInicioRecarga = 0;
        
        // --- CONTROL DE DISPARO ---
        this.ultimoDisparo = 0; // Tiempo del último disparo en ms
        this.disparando = false;

        // --- BALAS ---
        this.balas = [];

        // --- CONFIGURACIÓN INICIAL ---
        this.configurarNave();
        this.configurarEventos();
        
        console.log(`Cadencia configurada: ${this.cadenciaMS}ms (${1000/this.cadenciaMS} disparos/segundo)`);
    }

    configurarNave() {
        this.el.style.backgroundImage = `url("${this.nave.imagen}")`;
        this.el.style.backgroundSize = "contain";
        this.el.style.backgroundRepeat = "no-repeat";
        this.el.style.backgroundPosition = "center";
        this.el.style.width = `${this.width}px`;
        this.el.style.height = `${this.height}px`;
        this.el.style.position = "absolute";
        this.el.style.transformOrigin = "center";
        this.el.style.left = `${this.x}px`;
        this.el.style.top = `${this.y}px`;
    }

    configurarEventos() {
        // --- MOUSE ---
        this.mouse = { x: 0, y: 0 };
        document.addEventListener("mousemove", (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // --- TECLADO ---
        this.keys = {};
        document.addEventListener("keydown", (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = true;
            
            // Recargar con R
            if (key === "r" && !this.recargando && this.municionActual < this.arma.capacidad_de_cargador && this.municionTotal > 0) {
                this.iniciarRecarga();
            }
            
            // Disparar con ESPACIO
            if (key === " " && !this.recargando && this.municionActual > 0) {
                this.disparando = true;
            }
            
            // PREVENIR SCROLL CON BARRA ESPACIADORA
            if (key === " ") {
                e.preventDefault();
            }
        });
        
        document.addEventListener("keyup", (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = false;
            
            if (key === " ") {
                this.disparando = false;
            }
        });

        // --- RATÓN ---
        document.addEventListener("mousedown", (e) => {
            if (!this.recargando && e.button === 0) { // Solo botón izquierdo
                this.disparando = true;
            }
        });
        
        document.addEventListener("mouseup", (e) => {
            if (e.button === 0) {
                this.disparando = false;
            }
        });
        
        // PREVENIR CLICK DERECHO (MENÚ CONTEXTUAL)
        document.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        });
    }

    iniciarRecarga() {
        this.recargando = true;
        this.tiempoInicioRecarga = performance.now();
        this.disparando = false;
        console.log("Iniciando recarga...");
    }

    finalizarRecarga() {
        const municionNecesaria = this.arma.capacidad_de_cargador - this.municionActual;
        const municionARecargar = Math.min(municionNecesaria, this.municionTotal);
        
        this.municionActual += municionARecargar;
        this.municionTotal -= municionARecargar;
        this.recargando = false;
        console.log(`Recarga completada. Munición: ${this.municionActual}/${this.municionTotal}`);
    }

    update(w, h) {
        // --- ACTUALIZAR RECARGA ---
        if (this.recargando) {
            if (performance.now() - this.tiempoInicioRecarga >= this.tiempoRecarga) {
                this.finalizarRecarga();
            }
        }

        // --- ROTACIÓN HACIA EL RATÓN ---
        const dx = this.mouse.x - this.x;
        const dy = this.mouse.y - this.y;
        this.rot = Math.atan2(dy, dx);

        // --- MOVIMIENTO ---
        this.mover(w, h);

        // --- ACTUALIZAR POSICIÓN Y ROTACIÓN DE LA NAVE ---
        this.el.style.left = `${this.x}px`;
        this.el.style.top = `${this.y}px`;
        this.el.style.transform = `translate(-50%, -50%) rotate(${this.rot}rad)`;

        // --- DISPARO (CON CADENCIA EN MILISEGUNDOS) ---
        this.controlarDisparo();

        // --- ACTUALIZAR BALAS ---
        this.actualizarBalas();
    }

    mover(w, h) {
        // Movimiento diagonal normalizado
        let moveX = 0;
        let moveY = 0;

        if (this.keys["w"] || this.keys["arrowup"]) moveY -= 1;
        if (this.keys["s"] || this.keys["arrowdown"]) moveY += 1;
        if (this.keys["a"] || this.keys["arrowleft"]) moveX -= 1;
        if (this.keys["d"] || this.keys["arrowright"]) moveX += 1;

        // Normalizar movimiento diagonal
        if (moveX !== 0 && moveY !== 0) {
            const diagonalSpeed = this.speed / Math.sqrt(2);
            this.x += moveX * diagonalSpeed;
            this.y += moveY * diagonalSpeed;
        } else {
            this.x += moveX * this.speed;
            this.y += moveY * this.speed;
        }

        // Limites con margen
        const margin = 10;
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        
        this.x = Math.max(halfWidth - margin, Math.min(w - halfWidth + margin, this.x));
        this.y = Math.max(halfHeight - margin, Math.min(h - halfHeight + margin, this.y));
    }

    controlarDisparo() {
        // No disparar si está recargando
        if (this.recargando) {
            this.disparando = false;
            return;
        }

        // No disparar si no hay munición
        if (this.municionActual <= 0) {
            this.disparando = false;
            
            // Recarga automática al vaciar el cargador
            if (this.municionTotal > 0 && !this.recargando) {
                this.iniciarRecarga();
            }
            return;
        }

        // Verificar si está disparando
        if (!this.disparando) {
            return;
        }

        // Verificar cadencia por tiempo (milisegundos)
        const ahora = performance.now();
        const tiempoDesdeUltimoDisparo = ahora - this.ultimoDisparo;
        
        if (tiempoDesdeUltimoDisparo < this.cadenciaMS) {
            return; // Aún no ha pasado el tiempo necesario
        }

        // DISPARAR
        this.ultimoDisparo = ahora; // Actualizar tiempo del último disparo
        this.municionActual--;
        
        // Recarga automática al vaciar el cargador
        if (this.municionActual === 0 && this.municionTotal > 0 && !this.recargando) {
            this.iniciarRecarga();
        }
        
        this.crearBala();
    }

    crearBala() {
        const bala = document.createElement("div");
        bala.className = "bala";
        
        // Configurar estilo de la bala
        bala.style.width = `${this.arma.hitbox_bala[0]}px`;
        bala.style.height = `${this.arma.hitbox_bala[1]}px`;
        bala.style.backgroundImage = `url("${this.arma.imagen_proyectil}")`;
        bala.style.backgroundSize = "contain";
        bala.style.backgroundRepeat = "no-repeat";
        bala.style.backgroundPosition = "center";
        bala.style.position = "absolute";
        bala.style.transformOrigin = "center";
        bala.style.pointerEvents = "none";
        
        // Posición inicial en la punta de la nave
        const offsetX = Math.cos(this.rot) * (this.width / 2);
        const offsetY = Math.sin(this.rot) * (this.height / 2);
        
        const startX = this.x + offsetX;
        const startY = this.y + offsetY;
        
        bala.style.left = `${startX}px`;
        bala.style.top = `${startY}px`;
        
        // ROTACIÓN DE LA BALA (misma que la nave)
        bala.style.transform = `translate(-50%, -50%) rotate(${this.rot}rad)`;
        
        // Almacenar datos de movimiento
        bala.dataset.vx = Math.cos(this.rot) * this.velBala;
        bala.dataset.vy = Math.sin(this.rot) * this.velBala;
        bala.dataset.alcance = this.arma.alcance || 500;
        bala.dataset.distancia = 0;

        document.body.appendChild(bala);
    }

    actualizarBalas() {
        const balas = document.querySelectorAll(".bala");
        
        balas.forEach(b => {
            // Obtener datos de movimiento
            const vx = parseFloat(b.dataset.vx);
            const vy = parseFloat(b.dataset.vy);
            let distancia = parseFloat(b.dataset.distancia);
            const alcance = parseFloat(b.dataset.alcance);
            
            // Actualizar posición
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
    }
}