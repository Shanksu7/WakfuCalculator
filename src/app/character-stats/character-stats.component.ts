import { Component, OnInit } from '@angular/core';

interface DominioElemental {
  valor: number;
  bonus: number;
}

interface ValorNumerico {
  valor: number;
}

@Component({
  selector: 'app-character-stats',
  templateUrl: './character-stats.component.html',
  styleUrls: ['./character-stats.component.css']
})
export class CharacterStatsComponent implements OnInit {
  // Datos del personaje
  personaje = {
    faccion: 'Xelor',
    nombre: 'Vueko\'X',
    nivel: 155,
    xpActual: 3734264998,
    xpTotal: 21038513518
  };

  // Estadísticas principales
  stats = {
    pdv: 5193,
    pa: 13,
    pm: 3,
    pw: 19
  };

  // Dominios y resistencias
  dominios: Record<string, DominioElemental> = {
    fuego: { valor: 766, bonus: 467 },
    agua: { valor: 766, bonus: 460 },
    tierra: { valor: 201, bonus: 465 },
    aire: { valor: 393, bonus: 321 }
  };

  // Estadísticas de combate
  combate: Record<string, ValorNumerico> = {
    danosFinal: { valor: 33 },
    curasFinal: { valor: -22 },
    golpeCritico: { valor: 46 },
    anticipacion: { valor: 3 },
    iniciativa: { valor: 18 },
    alcance: { valor: 4 },
    esquiva: { valor: 442 },
    placaje: { valor: 95 },
    sabiduria: { valor: 10 },
    prospeccion: { valor: 10 },
    control: { valor: 1 },
    voluntad: { valor: 0 }
  };

  // Estadísticas secundarias
  secundario: Record<string, ValorNumerico> = {
    dominioCritico: { valor: 322 },
    resistenciaCritica: { valor: 0 },
    dominioEspalda: { valor: 0 },
    resistenciaEspalda: { valor: 0 },
    dominioMele: { valor: 0 },
    armaduraDada: { valor: 0 },
    dominioDistancia: { valor: 1219 },
    armaduraRecibida: { valor: 0 },
    dominioCura: { valor: 0 },
    danosIndirectos: { valor: 0 },
    dominioBerserker: { valor: 0 }
  };
  
  // Indica qué sección está siendo editada (si alguna)
  seccionEditando: string | null = null;
  
  constructor() { }

  ngOnInit(): void {
  }
  
  // Método para iniciar edición de una sección
  editarSeccion(seccion: string): void {
    this.seccionEditando = seccion;
  }
  
  // Método para guardar cambios
  guardarCambios(): void {
    this.seccionEditando = null;
    // Aquí se implementaría la lógica para guardar cambios en un servicio o API
  }
  
  // Método para determinar si un valor debe mostrarse en verde (positivo) o rojo (negativo)
  getClaseValor(valor: number): string {
    if (valor > 0) return 'positivo';
    if (valor < 0) return 'negativo';
    return 'neutral';
  }
  
  // Calcula el porcentaje para la barra de experiencia
  getPorcentajeXP(): number {
    return (this.personaje.xpActual / this.personaje.xpTotal) * 100;
  }

  // Calcula el porcentaje de resistencia según la fórmula proporcionada
  calcularPorcentajeResistencia(resistScore: number): number {
    return Math.round((1 - Math.pow(0.8, resistScore/100)) * 100);
  }
  
  // Método para actualizar un valor después de la edición
  actualizarValor(objeto: any, propiedad: string, evento: Event): void {
    const target = evento.target as HTMLElement;
    const nuevoValor = parseInt(target.textContent || '0');
    if (!isNaN(nuevoValor)) {
      objeto[propiedad] = nuevoValor;
    } else {
      // Si no es un número válido, restaurar el valor original
      target.textContent = objeto[propiedad].toString();
    }
  }
  
  // Método para manejar la edición de los dominios
  actualizarDominio(dominio: 'fuego' | 'agua' | 'tierra' | 'aire', propiedad: 'valor' | 'bonus', evento: Event): void {
    const target = evento.target as HTMLElement;
    const nuevoValor = parseInt(target.textContent || '0');
    if (!isNaN(nuevoValor)) {
      this.dominios[dominio][propiedad] = nuevoValor;
    } else {
      // Si no es un número válido, restaurar el valor original
      target.textContent = this.dominios[dominio][propiedad].toString();
    }
  }
  
  // Método para manejar la edición de estadísticas de combate
  actualizarCombate(propiedad: string, evento: Event): void {
    const target = evento.target as HTMLElement;
    const contenido = target.textContent?.replace('%', '') || '0';
    const nuevoValor = parseInt(contenido);
    if (!isNaN(nuevoValor)) {
      this.combate[propiedad].valor = nuevoValor;
    } else {
      // Si no es un número válido, restaurar el valor original
      target.textContent = this.combate[propiedad].valor.toString() + (target.textContent?.includes('%') ? '%' : '');
    }
  }
  
  // Método para manejar la edición de estadísticas secundarias
  actualizarSecundario(propiedad: string, evento: Event): void {
    const target = evento.target as HTMLElement;
    const contenido = target.textContent?.replace('%', '') || '0';
    const nuevoValor = parseInt(contenido);
    if (!isNaN(nuevoValor)) {
      this.secundario[propiedad].valor = nuevoValor;
    } else {
      // Si no es un número válido, restaurar el valor original
      target.textContent = this.secundario[propiedad].valor.toString() + (target.textContent?.includes('%') ? '%' : '');
    }
  }
}
