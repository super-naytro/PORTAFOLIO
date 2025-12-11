class nave {
  constructor(nombre, id, salud, potencial_de_daño, velocidad, escudo, imagen, hitbox_x_y) {
    this.nombre = nombre;
    this.id = id;
    this.salud = salud;
    this.potencial_de_daño = potencial_de_daño;
    this.velocidad = velocidad;
    this.escudo = escudo;
    this.imagen = imagen; // Ajustar la ruta para que sea relativa al archivo HTML
    this.hitbox_x_y = hitbox_x_y;
  }

  Habilidad_especial() {
    return "No tiene habilidad especial";
  }
}

const Naves = new nave("viper", 1, 100, 25, 10, 50, "Imagenes/viper/Viper.png", [50, 50]);
