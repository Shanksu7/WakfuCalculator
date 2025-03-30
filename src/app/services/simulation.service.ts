import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Tipo para el dominio 
export type DomainType = 'fire' | 'water' | 'air' | 'earth' | 'healing';

// Interfaz para efectos
export interface Effect {
  domain: string;
  baseDamage: number;
  calculatedDamage: number;
}

// Interfaz para estadísticas enemigas
export interface EnemyStats {
  fireResistance: number;
  waterResistance: number;
  airResistance: number;
  earthResistance: number;
}

// Interfaz para estadísticas adicionales
export interface AdditionalStats {
  dominioCritico: number;
  dominioMele: number;
  dominioEspalda: number;
  dominioDistancia: number;
  danioInfligido: number;
  danioIndirecto: number;
}

// Interfaz para una simulación
export interface Simulation {
  id: string;
  name: string;
  effects: Effect[];
  domainLevels: Record<DomainType, number>;
  enemyStats: EnemyStats;
  additionalStats: AdditionalStats;
  attackPosition: string;
  distanceType: string;
  isCritical: boolean;
  isBerserker: boolean;
  isIndirect: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  private simulations = new BehaviorSubject<Simulation[]>([]);
  simulations$ = this.simulations.asObservable();
  
  private currentSimulationId = new BehaviorSubject<string | null>(null);
  currentSimulationId$ = this.currentSimulationId.asObservable();
  
  private readonly STORAGE_KEY = 'wakfu-calculator-simulations';

  constructor() {
    this.loadSimulations();
  }

  private loadSimulations(): void {
    const savedData = localStorage.getItem(this.STORAGE_KEY);
    if (savedData) {
      try {
        const loadedSimulations: Simulation[] = JSON.parse(savedData);
        this.simulations.next(loadedSimulations);
        
        // Si hay simulaciones guardadas, seleccionar la primera por defecto
        if (loadedSimulations.length > 0) {
          this.currentSimulationId.next(loadedSimulations[0].id);
        }
      } catch (e) {
        console.error('Error loading simulations from localStorage:', e);
        this.initializeDefaultSimulation();
      }
    } else {
      this.initializeDefaultSimulation();
    }
  }

  private initializeDefaultSimulation(): void {
    const defaultSimulation: Simulation = {
      id: this.generateId(),
      name: 'Default Simulation',
      effects: [
        { domain: 'fire', baseDamage: 10, calculatedDamage: 12 },
        { domain: 'water', baseDamage: 8, calculatedDamage: 10 }
      ],
      domainLevels: {
        fire: 100,
        water: 100,
        air: 100,
        earth: 100,
        healing: 100
      },
      enemyStats: {
        fireResistance: 0,
        waterResistance: 0,
        airResistance: 0,
        earthResistance: 0
      },
      additionalStats: {
        dominioCritico: 0,
        dominioMele: 0,
        dominioEspalda: 0,
        dominioDistancia: 0,
        danioInfligido: 0,
        danioIndirecto: 0
      },
      attackPosition: 'frente',
      distanceType: 'mele',
      isCritical: false,
      isBerserker: false,
      isIndirect: false,
    };
    
    this.simulations.next([defaultSimulation]);
    this.currentSimulationId.next(defaultSimulation.id);
    this.saveSimulations();
  }

  private saveSimulations(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.simulations.value));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  getCurrentSimulation(): Simulation | null {
    const currentId = this.currentSimulationId.value;
    if (!currentId) return null;
    
    return this.simulations.value.find(sim => sim.id === currentId) || null;
  }

  selectSimulation(id: string): void {
    this.currentSimulationId.next(id);
  }

  addSimulation(name: string): void {
    const currentSim = this.getCurrentSimulation();
    let newSimulation: Simulation;
    
    if (currentSim) {
      // Clonar la simulación actual
      newSimulation = {
        ...JSON.parse(JSON.stringify(currentSim)),
        id: this.generateId(),
        name: name
      };
    } else {
      // Crear una nueva simulación predeterminada
      newSimulation = {
        id: this.generateId(),
        name: name,
        effects: [
          { domain: 'fire', baseDamage: 10, calculatedDamage: 12 }
        ],
        domainLevels: {
          fire: 100,
          water: 100,
          air: 100,
          earth: 100,
          healing: 100
        },
        enemyStats: {
          fireResistance: 0,
          waterResistance: 0,
          airResistance: 0,
          earthResistance: 0
        },
        additionalStats: {
          dominioCritico: 0,
          dominioMele: 0,
          dominioEspalda: 0,
          dominioDistancia: 0,
          danioInfligido: 0,
          danioIndirecto: 0
        },
        attackPosition: 'frente',
        distanceType: 'mele',
        isCritical: false,
        isBerserker: false,
        isIndirect: false,
      };
    }
    
    const updatedSimulations = [...this.simulations.value, newSimulation];
    this.simulations.next(updatedSimulations);
    this.currentSimulationId.next(newSimulation.id);
    this.saveSimulations();
  }

  updateSimulation(updatedSimulation: Simulation): void {
    const simulations = this.simulations.value;
    const index = simulations.findIndex(sim => sim.id === updatedSimulation.id);
    
    if (index !== -1) {
      simulations[index] = updatedSimulation;
      this.simulations.next([...simulations]);
      this.saveSimulations();
    }
  }

  renameSimulation(id: string, newName: string): void {
    const simulations = this.simulations.value;
    const simulation = simulations.find(sim => sim.id === id);
    
    if (simulation) {
      simulation.name = newName;
      this.simulations.next([...simulations]);
      this.saveSimulations();
    }
  }

  deleteSimulation(id: string): void {
    let simulations = this.simulations.value;
    const index = simulations.findIndex(sim => sim.id === id);
    
    if (index !== -1) {
      simulations = simulations.filter(sim => sim.id !== id);
      this.simulations.next(simulations);
      
      // Si eliminamos la simulación actual, seleccionar otra
      if (id === this.currentSimulationId.value) {
        const newCurrentId = simulations.length > 0 ? simulations[0].id : null;
        this.currentSimulationId.next(newCurrentId);
        
        // Si no hay más simulaciones, crear una predeterminada
        if (!newCurrentId) {
          this.initializeDefaultSimulation();
        }
      }
      
      this.saveSimulations();
    }
  }
} 