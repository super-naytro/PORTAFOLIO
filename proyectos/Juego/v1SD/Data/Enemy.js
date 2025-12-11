class Enemigo{
    constructor(nombre, vida, daño, velocidad, recompensa){
        this.nombre = nombre;
        this.vida = vida;
        this.daño = daño;
        this.velocidad = velocidad;
        this.recompensa = recompensa;
        this.imagen = imagen;
        this.hitbox_x_y = hitbox_x_y;
        this.tipo = tipo;
    }


    mirarAJugador(jugadorX, jugadorY, enemigoX, enemigoY) {
        const deltaX = jugadorX - enemigoX;
        const deltaY = jugadorY - enemigoY;
        const anguloRad = Math.atan2(deltaY, deltaX);
        const anguloDeg = anguloRad * (180 / Math.PI);
        return anguloDeg;
    }



}


const Enemigos = new Enemigo("drone", 50, 10, 5, 20, "Imagenes/Enemigos/dron-E.png", [40, 40], "aereo");