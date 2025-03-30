import { Component, OnInit, OnDestroy } from '@angular/core';
import { SimulationService, Simulation, Effect, DomainType } from '../services/simulation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-spell-card',
  templateUrl: './spell-card.component.html',
  styleUrls: ['./spell-card.component.css']
})
export class SpellCardComponent implements OnInit, OnDestroy {
  // Spell properties
  spellName: string = 'Spell Name';
  apCost: number = 3;
  minRange: number = 1;
  maxRange: number = 5;
  
  // Type of range (line, area, etc.)
  rangeType: string = 'normal'; // 'normal', 'linea', 'area', 'multi'
  
  // Tabs
  activeTab: string = 'efectos'; // 'efectos', 'enemigo'
  
  // Spell effects
  effects: Effect[] = [];
  
  // Available domains
  availableDomains: DomainType[] = [
    'fire', 'water', 'air', 'earth', 'healing'
  ];
  
  // Options for damage calculation
  attackPosition: string = 'frente'; // 'frente', 'lado', 'espalda'
  distanceType: string = 'mele'; // 'mele', 'distancia'
  isCritical: boolean = false;
  isBerserker: boolean = false;
  isIndirect: boolean = false;
  
  // Character domain levels
  domainLevels: Record<DomainType, number> = {
    fire: 100,
    water: 100,
    air: 100,
    earth: 100,
    healing: 100
  };
  
  // Additional character statistics
  additionalStats = {
    dominioCritico: 0,
    dominioMele: 0,
    dominioEspalda: 0,
    dominioDistancia: 0,
    danioInfligido: 0,
    danioIndirecto: 0
  };
  
  // Enemy resistance statistics
  enemyStats = {
    fireResistance: 0,
    waterResistance: 0,
    airResistance: 0,
    earthResistance: 0
  };
  
  // Spell level
  spellLevel: number = 100;

  // Simulaciones
  simulations: Simulation[] = [];
  currentSimulationId: string | null = null;
  isEditingTabName = false;
  newTabName = '';

  // Control de diálogo
  showNewSimulationDialog = false;
  newSimulationName = '';

  private subscriptions: Subscription[] = [];
  
  constructor(private simulationService: SimulationService) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.simulationService.simulations$.subscribe(simulations => {
        this.simulations = simulations;
      }),

      this.simulationService.currentSimulationId$.subscribe(id => {
        this.currentSimulationId = id;
        if (id) {
          this.loadCurrentSimulation();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadCurrentSimulation(): void {
    const simulation = this.simulationService.getCurrentSimulation();
    if (simulation) {
      this.effects = [...simulation.effects];
      this.domainLevels = {...simulation.domainLevels};
      this.enemyStats = {...simulation.enemyStats};
      this.additionalStats = {...simulation.additionalStats};
      this.attackPosition = simulation.attackPosition;
      this.distanceType = simulation.distanceType;
      this.isCritical = simulation.isCritical;
      this.isBerserker = simulation.isBerserker;
      this.isIndirect = simulation.isIndirect;
    }
  }

  saveCurrentSimulation(): void {
    if (!this.currentSimulationId) return;
    
    const currentSimulation = this.simulationService.getCurrentSimulation();
    if (currentSimulation) {
      const updatedSimulation: Simulation = {
        ...currentSimulation,
        effects: [...this.effects],
        domainLevels: {...this.domainLevels},
        enemyStats: {...this.enemyStats},
        additionalStats: {...this.additionalStats},
        attackPosition: this.attackPosition,
        distanceType: this.distanceType,
        isCritical: this.isCritical,
        isBerserker: this.isBerserker,
        isIndirect: this.isIndirect
      };
      
      this.simulationService.updateSimulation(updatedSimulation);
    }
  }

  // Métodos para gestionar simulaciones
  selectSimulation(id: string): void {
    if (id !== this.currentSimulationId) {
      this.saveCurrentSimulation();
      this.simulationService.selectSimulation(id);
    }
  }

  openNewSimulationDialog(): void {
    this.showNewSimulationDialog = true;
    this.newSimulationName = '';
  }

  createNewSimulation(): void {
    if (this.newSimulationName.trim()) {
      this.saveCurrentSimulation();
      this.simulationService.addSimulation(this.newSimulationName.trim());
      this.showNewSimulationDialog = false;
    }
  }

  cancelNewSimulation(): void {
    this.showNewSimulationDialog = false;
  }

  startEditingTabName(simulation: Simulation): void {
    this.isEditingTabName = true;
    this.newTabName = simulation.name;
  }

  saveTabName(simulation: Simulation): void {
    if (this.newTabName.trim()) {
      this.simulationService.renameSimulation(simulation.id, this.newTabName.trim());
    }
    this.isEditingTabName = false;
  }

  cancelEditTabName(): void {
    this.isEditingTabName = false;
  }

  deleteSimulation(id: string, event: Event): void {
    event.stopPropagation();
    if (confirm('¿Estás seguro de que quieres eliminar esta simulación?')) {
      this.simulationService.deleteSimulation(id);
    }
  }

  cambiarPestania(tab: string): void {
    this.activeTab = tab;
  }
  
  agregarEfecto(): void {
    this.effects.push({ 
      domain: this.availableDomains[0], 
      baseDamage: 0, 
      calculatedDamage: 0 
    });
    this.calculateDamage();
    this.saveCurrentSimulation();
  }
  
  eliminarEfecto(index: number): void {
    this.effects.splice(index, 1);
    this.calculateDamage();
    this.saveCurrentSimulation();
  }
  
  // Get resistance percentage based on value with better formula
  obtenerPorcentajeResistencia(resistanceValue: number): number {
    // Formula: (1 - 0.8^(resistance/100)) * 100
    // With maximum of 90% resistance
    const result = (1 - Math.pow(0.8, resistanceValue / 100)) * 100;
    return Math.min(result, 90); // Cap at 90%
  }
  
  // Get enemy resistance according to domain
  obtenerResistenciaEnemigo(domain: DomainType): number {
    switch (domain) {
      case 'fire': return this.enemyStats.fireResistance;
      case 'water': return this.enemyStats.waterResistance;
      case 'air': return this.enemyStats.airResistance;
      case 'earth': return this.enemyStats.earthResistance;
      default: return 0;
    }
  }
  
  // Get secondary domain bonus
  obtenerBonificacionDominioSecundario(domain: DomainType): number {
    let bonus = 0;
    
    // Apply critical bonus
    if (this.isCritical) {
      const critBonus = this.additionalStats.dominioCritico || 0;
      bonus += isNaN(critBonus) ? 0 : critBonus;
    }
    
    // Apply back attack bonus (both from position and checkbox)
    if (this.attackPosition === 'espalda' && !this.isIndirect) {
      const backBonus = this.additionalStats.dominioEspalda || 0;
      bonus += isNaN(backBonus) ? 0 : backBonus;
    }
    
    // Apply distance type bonus
    if (this.distanceType === 'mele') {
      const meleBonus = this.additionalStats.dominioMele || 0;
      bonus += isNaN(meleBonus) ? 0 : meleBonus;
    } else if (this.distanceType === 'distancia') {
      const distBonus = this.additionalStats.dominioDistancia || 0;
      bonus += isNaN(distBonus) ? 0 : distBonus;
    }
    
    return bonus;
  }
  
  // Get increased inflicted damage
  obtenerDanioInfligidoAumentado(domain: DomainType): number {
    let damageIncrease = this.additionalStats.danioInfligido || 0;
    if (isNaN(damageIncrease)) damageIncrease = 0;
    
    // Add indirect damage bonus if applicable
    if (this.isIndirect) {
      const indirectBonus = this.additionalStats.danioIndirecto || 0;
      damageIncrease += isNaN(indirectBonus) ? 0 : indirectBonus;
    }
    
    return (damageIncrease / 100) + 1;
  }
  
  calculateDamage(): void {
    // Calculate damage for each effect
    this.effects.forEach(effect => {
      const domain = effect.domain as DomainType;
      const baseDamage = effect.baseDamage || 0;
      
      // Obtenemos el dominio elemental según el tipo de daño
      const elementalDomain = this.domainLevels[domain] || 0;
      
      // Obtenemos los subdominios aplicables
      let subDomains = 0;
      
      // Aplicar bonificación según la distancia
      if (this.distanceType === 'distancia') {
        const distBonus = this.additionalStats.dominioDistancia || 0;
        subDomains += isNaN(distBonus) ? 0 : distBonus;
      } else {
        const meleBonus = this.additionalStats.dominioMele || 0;
        subDomains += isNaN(meleBonus) ? 0 : meleBonus;
      }
      
      // Aplicar bonificación de crítico si corresponde
      if (this.isCritical) {
        const critBonus = this.additionalStats.dominioCritico || 0;
        subDomains += isNaN(critBonus) ? 0 : critBonus;
      }
      
      // Aplicar bonificación de espalda si corresponde
      if (this.attackPosition === 'espalda') {
        const backBonus = this.additionalStats.dominioEspalda || 0;
        subDomains += isNaN(backBonus) ? 0 : backBonus;
      }
      
      // Calculamos el dominio total
      const totalDomain = elementalDomain + subDomains;
      
      // Calculamos el daño incrementado
      let increasedDamage = this.additionalStats.danioInfligido || 0;
      if (this.isIndirect) {
        const indirectBonus = this.additionalStats.danioIndirecto || 0;
        increasedDamage += isNaN(indirectBonus) ? 0 : indirectBonus;
      }
      // Convertimos el porcentaje a multiplicador (ej: 30% -> 1.3)
      const damageMultiplier = 1 + (increasedDamage / 100);
      
      // Cálculo inicial con dominio total
      let calculatedDamage = baseDamage + (baseDamage * (totalDomain / 100));
      
      // Aplicamos el multiplicador de daño
      calculatedDamage *= damageMultiplier;
      
      // Aplicamos el multiplicador de posición solo si no es indirecto
      if (this.attackPosition === 'lado') {
        calculatedDamage *= 1.1;
      } else if (this.attackPosition === 'espalda') {
        calculatedDamage *= 1.25;
      }
    
      // Aplicamos la reducción por resistencia
      const resistance = this.obtenerResistenciaEnemigo(domain);
      const resistanceReduction = 1 - (this.obtenerPorcentajeResistencia(resistance) / 100);
      calculatedDamage *= resistanceReduction;
      
      // Redondeamos al entero más cercano
      effect.calculatedDamage = Math.round(calculatedDamage);
    });
    
    this.saveCurrentSimulation();
  }
  
  // Actualizar nivel de dominio en la interfaz
  actualizarDomainLevel(domain: DomainType, value: number): void {
    this.domainLevels[domain] = isNaN(value) ? 0 : value;
    this.calculateDamage();
    this.saveCurrentSimulation();
  }
  
  // Actualiza el daño base de un efecto
  actualizarDanioBase(index: number, event: any): void {
    const value = parseInt(event.target.value);
    if (this.effects[index]) {
      this.effects[index].baseDamage = isNaN(value) ? 0 : value;
      this.calculateDamage();
      this.saveCurrentSimulation();
    }
  }
  
  // Actualiza el tipo de dominio de un efecto
  cambiarDominio(index: number, domain: string): void {
    if (this.effects[index]) {
      this.effects[index].domain = domain;
      this.calculateDamage();
      this.saveCurrentSimulation();
    }
  }
  
  // Update spell name
  actualizarNombre(event: any): void {
    const value = event.target.value;
    this.spellName = value;
    
    // Could save in localStorage if needed
    // this.saveToLocalStorage();
  }
  
  // Actualiza el costo de PA
  actualizarCostoPA(event: any): void {
    const value = parseInt(event.target.value);
    this.apCost = isNaN(value) ? 1 : Math.max(1, value);
    
    // Could save in localStorage if needed
    // this.saveToLocalStorage();
  }
  
  // Actualiza el rango mínimo
  actualizarRangoMin(event: any): void {
    const value = parseInt(event.target.value);
    this.minRange = isNaN(value) ? 1 : Math.max(1, value);
    
    // Could save in localStorage if needed
    // this.saveToLocalStorage();
  }
  
  // Actualiza el rango máximo
  actualizarRangoMax(event: any): void {
    const value = parseInt(event.target.value);
    this.maxRange = isNaN(value) ? 1 : Math.max(this.minRange, value);
    
    // Could save in localStorage if needed
    // this.saveToLocalStorage();
  }
  
  // Cambia el tipo de alcance
  cambiarTipoAlcance(type: string): void {
    this.rangeType = type;
    // this.saveToLocalStorage();
  }
  
  // Cambia la posición de ataque
  cambiarPosicionAtaque(position: string): void {
    this.attackPosition = position;
    this.calculateDamage();
    this.saveCurrentSimulation();
  }
  
  // Cambia el tipo de distancia
  cambiarTipoDistancia(type: string): void {
    this.distanceType = type;
    this.calculateDamage();
    this.saveCurrentSimulation();
  }
  
  // Toggle para el golpe crítico
  toggleGolpeCritico(): void {
    this.isCritical = !this.isCritical;
    this.calculateDamage();
    this.saveCurrentSimulation();
  }
  
  // Toggle para el modo berserker
  toggleModoBerserker(): void {
    this.isBerserker = !this.isBerserker;
    this.calculateDamage();
    this.saveCurrentSimulation();
  }
  
  // Toggle para el ataque indirecto
  toggleEsIndirecto(): void {
    this.isIndirect = !this.isIndirect;
    this.calculateDamage();
    this.saveCurrentSimulation();
  }
  
  // Actualiza un nivel de dominio
  actualizarNivelDominio(domain: DomainType, event: any): void {
    const value = parseInt(event.target.value);
    this.domainLevels[domain] = isNaN(value) ? 0 : Math.max(0, value);
    this.calculateDamage();
    this.saveCurrentSimulation();
  }
  
  // Actualiza la resistencia del enemigo
  actualizarResistenciaEnemigo(type: string, event: any): void {
    const value = parseInt(event);
    
    // Ensure value is a number and apply limits
    const clampedValue = isNaN(value) ? 0 : Math.max(0, Math.min(1500, value));
    
    // Update the appropriate resistance based on domain type
    switch (type) {
      case 'fire':
        this.enemyStats.fireResistance = clampedValue;
        break;
      case 'water':
        this.enemyStats.waterResistance = clampedValue;
        break;
      case 'air':
        this.enemyStats.airResistance = clampedValue;
        break;
      case 'earth':
        this.enemyStats.earthResistance = clampedValue;
        break;
    }
    
    this.calculateDamage();
    this.saveCurrentSimulation();
  }
  
  // Method to close the spell card
  cerrarFicha(): void {
    // Could handle closing the component here
    console.log('Closing spell card...');
  }
}
