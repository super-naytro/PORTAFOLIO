class Arma {
    constructor(nombre, id, daño, cadencia, imagen_bala, capacidad_de_cargador, alcance, velocidad_de_proyectil, municion, velocidad_de_recarga, hitbox_bala) {
        this.nombre = nombre;
        this.id = id;
        this.daño = daño;
        this.cadencia = cadencia;
        this.imagen_proyectil = imagen_bala;
       this.capacidad_de_cargador = capacidad_de_cargador;
       this.alcance = alcance;
       this.velocidad_de_proyectil = velocidad_de_proyectil;
       this.municion = municion;
       this.velocidad_de_recarga = velocidad_de_recarga;
       this.hitbox_bala = hitbox_bala;
    }
}


const Armas = new Arma( "rifle de asalto",
                         1,
                          15,
                          100,
                           "Imagenes/proyectil/disparo.png",
                            30,
                             1000,
                              100,
                               120,
                                5,
                                 [15, 15]);