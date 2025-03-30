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
  isBackAttack: boolean = false;
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
      this.isBackAttack = simulation.isBackAttack;
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
        isIndirect: this.isIndirect,
        isBackAttack: this.isBackAttack
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
      
      // Get resistance reduction
      const resistance = this.obtenerResistenciaEnemigo(domain);
      const resistanceReduction = 1 - (this.obtenerPorcentajeResistencia(resistance) / 100);
      
      // Get primary domain level
      const domainLevel = this.domainLevels[domain] || 0;
      const domainMultiplier = domainLevel / 100;
      
      // Get secondary domain bonuses
      const secondaryDomainBonus = this.obtenerBonificacionDominioSecundario(domain);
      const secondaryMultiplier = (domainLevel + secondaryDomainBonus) / 100;
      
      // Apply position multipliers (front: 1.0, side: 1.1, back: 1.25)
      let positionMultiplier = 1.0;
      if (this.attackPosition === 'lado' && !this.isIndirect) {
        positionMultiplier = 1.1;
      } else if (this.attackPosition === 'espalda' && !this.isIndirect) {
        positionMultiplier = 1.25;
      }
      
      // Apply back attack checkbox bonus
      if (this.isBackAttack && !this.isIndirect && this.attackPosition !== 'espalda') {
        positionMultiplier = 1.25;
      }
      
      // Apply critical multiplier (1.25 or 1.0)
      const criticalMultiplier = this.isCritical ? 1.25 : 1.0;
      
      // Apply indirect damage flag (no position or distance bonuses if indirect)
      
      // Get damage infliction bonuses
      const damageInflicted = this.obtenerDanioInfligidoAumentado(domain);
      
      // Apply all multipliers to base damage
      // Base formula: base * domain * position * critical * resistance * damage_inflicted
      let calculatedDamage = baseDamage;
      
      // Apply domain level multiplier (primary or secondary based on flags)
      calculatedDamage *= this.isCritical || this.attackPosition === 'espalda' || 
                         this.isBackAttack || this.distanceType !== 'mele' ? 
                         secondaryMultiplier : domainMultiplier;
      
      // Apply position multiplier (if not indirect)
      calculatedDamage *= positionMultiplier;
      
      // Apply critical multiplier
      calculatedDamage *= criticalMultiplier;
      
      // Apply resistance reduction (lower damage based on enemy resistance)
      calculatedDamage *= resistanceReduction;
      
      // Apply damage infliction bonus
      calculatedDamage *= damageInflicted;
      
      // Round to integer
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
    
    // Disable back attack checkbox if already attacking from back
    if (position === 'espalda') {
      this.isBackAttack = false;
    }
    
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
  toggleGolpeCritico(force?: boolean): void {
    if (force !== undefined) {
      this.isCritical = force;
    } else {
      this.isCritical = !this.isCritical;
    }
    
    this.calculateDamage();
    this.saveCurrentSimulation();
  }
  
  // Toggle para el modo berserker
  toggleModoBerserker(force?: boolean): void {
    if (force !== undefined) {
      this.isBerserker = force;
    } else {
      this.isBerserker = !this.isBerserker;
    }
    
    this.calculateDamage();
    this.saveCurrentSimulation();
  }
  
  // Toggle para el ataque de espalda
  toggleAtaqueEspalda(force?: boolean): void {
    // No permitir activar si ya estamos atacando desde la espalda
    if (this.attackPosition === 'espalda') {
      this.isBackAttack = false;
      return;
    }
    
    if (force !== undefined) {
      this.isBackAttack = force;
    } else {
      this.isBackAttack = !this.isBackAttack;
    }
    
    this.calculateDamage();
    this.saveCurrentSimulation();
  }
  
  // Toggle para el ataque indirecto
  toggleEsIndirecto(force?: boolean): void {
    if (force !== undefined) {
      this.isIndirect = force;
    } else {
      this.isIndirect = !this.isIndirect;
    }
    
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
