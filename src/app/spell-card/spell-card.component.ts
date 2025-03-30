import { Component, OnInit } from '@angular/core';

interface Effect {
  domain: string;
  baseDamage: number;
  calculatedDamage: number;
}

// Available domain types
type DomainType = 'fire' | 'water' | 'air' | 'earth' | 'healing';

// Interface for enemy statistics
interface EnemyStats {
  fireResistance: number;
  waterResistance: number;
  airResistance: number;
  earthResistance: number;
}

// Interface for additional character statistics
interface AdditionalStats {
  dominioCritico: number;
  dominioMele: number;
  dominioEspalda: number;
  dominioDistancia: number;
  danioInfligido: number;
  danioIndirecto: number;
}

// Interface for saved state
interface SavedState {
  effects: Effect[];
  domainLevels: Record<DomainType, number>;
  enemyStats: EnemyStats;
  additionalStats: AdditionalStats;
  attackPosition: string;
  distanceType: string;
  isCritical: boolean;
  isBerserker: boolean;
  isIndirect: boolean;
  isBackAttack: boolean;
}

@Component({
  selector: 'app-spell-card',
  templateUrl: './spell-card.component.html',
  styleUrls: ['./spell-card.component.css']
})
export class SpellCardComponent implements OnInit {
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
  effects: Effect[] = [
    { domain: 'fire', baseDamage: 10, calculatedDamage: 12 },
    { domain: 'water', baseDamage: 8, calculatedDamage: 10 }
  ];
  
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
  additionalStats: AdditionalStats = {
    dominioCritico: 0,
    dominioMele: 0,
    dominioEspalda: 0,
    dominioDistancia: 0,
    danioInfligido: 0,
    danioIndirecto: 0
  };
  
  // Enemy resistance statistics
  enemyStats: EnemyStats = {
    fireResistance: 0,
    waterResistance: 0,
    airResistance: 0,
    earthResistance: 0
  };
  
  // Spell level
  spellLevel: number = 100;
  
  constructor() { }

  ngOnInit(): void {
    this.loadFromLocalStorage();
    this.calculateDamage();
  }

  // Load data from localStorage
  loadFromLocalStorage(): void {
    const savedData = localStorage.getItem('wakfu-calculator-state');
    if (savedData) {
      try {
        const parsedData: SavedState = JSON.parse(savedData);
        
        if (parsedData.effects) this.effects = parsedData.effects;
        if (parsedData.domainLevels) this.domainLevels = parsedData.domainLevels;
        if (parsedData.enemyStats) {
          this.enemyStats = {
            fireResistance: parsedData.enemyStats.fireResistance || 0,
            waterResistance: parsedData.enemyStats.waterResistance || 0,
            airResistance: parsedData.enemyStats.airResistance || 0,
            earthResistance: parsedData.enemyStats.earthResistance || 0
          };
        }
        if (parsedData.additionalStats) this.additionalStats = parsedData.additionalStats;
        if (parsedData.attackPosition) this.attackPosition = parsedData.attackPosition;
        if (parsedData.distanceType) this.distanceType = parsedData.distanceType;
        if (parsedData.isCritical !== undefined) this.isCritical = parsedData.isCritical;
        if (parsedData.isBerserker !== undefined) this.isBerserker = parsedData.isBerserker;
        if (parsedData.isIndirect !== undefined) this.isIndirect = parsedData.isIndirect;
        if (parsedData.isBackAttack !== undefined) this.isBackAttack = parsedData.isBackAttack;
      } catch (e) {
        console.error('Error loading from localStorage:', e);
      }
    }
  }

  // Save current state to localStorage
  saveToLocalStorage(): void {
    const dataToSave: SavedState = {
      effects: this.effects,
      domainLevels: this.domainLevels,
      enemyStats: this.enemyStats,
      additionalStats: this.additionalStats,
      attackPosition: this.attackPosition,
      distanceType: this.distanceType,
      isCritical: this.isCritical,
      isBerserker: this.isBerserker,
      isIndirect: this.isIndirect,
      isBackAttack: this.isBackAttack
    };
    
    localStorage.setItem('wakfu-calculator-state', JSON.stringify(dataToSave));
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
    this.saveToLocalStorage();
  }
  
  eliminarEfecto(index: number): void {
    this.effects.splice(index, 1);
    this.calculateDamage();
    this.saveToLocalStorage();
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
      const isHealing = domain === 'healing';
      
      // Get base level of main domain
      let mainDomainLevel = this.domainLevels[domain] || 100;
      if (isNaN(mainDomainLevel)) mainDomainLevel = 0;
      
      // Get secondary domain bonus
      const secondaryBonus = this.obtenerBonificacionDominioSecundario(domain);
      
      // Total applicable domain
      const applicableDomain = mainDomainLevel + secondaryBonus;
      
      // First calculation: base damage * (domain/100)
      const calculationA1 = effect.baseDamage * (applicableDomain / 100);
      
      // Get inflicted damage increase
      const inflictedDamageIncrease = this.obtenerDanioInfligidoAumentado(domain);
      
      // Second calculation: (A1 + base damage) * inflicted damage increase
      const calculationA2 = (calculationA1 + effect.baseDamage) * inflictedDamageIncrease;
      
      // Get enemy resistance (doesn't apply for healing)
      const baseResistance = isHealing ? 0 : this.obtenerResistenciaEnemigo(domain);
      const resistancePercentage = isHealing ? 0 : this.obtenerPorcentajeResistencia(baseResistance);
      
      // Final calculation: A2 * ((100 - resistance%) / 100)
      const result = calculationA2 * ((100 - resistancePercentage) / 100);
      
      // Update calculated damage
      effect.calculatedDamage = Math.round(result);
    });
    
    // Save the state after calculation
    this.saveToLocalStorage();
  }
  
  actualizarDomainLevel(domain: DomainType, value: number): void {
    // Update the domain level with the input value
    this.domainLevels[domain] = isNaN(value) ? 0 : value;
    this.calculateDamage();
    this.saveToLocalStorage();
  }
  
  actualizarDanioBase(index: number, event: any): void {
    const value = parseInt(event.target.innerText);
    if (!isNaN(value)) {
      this.effects[index].baseDamage = value;
    } else {
      this.effects[index].baseDamage = 0;
      event.target.innerText = "0";
    }
    this.calculateDamage();
    this.saveToLocalStorage();
  }
  
  cambiarDominio(index: number, domain: string): void {
    this.effects[index].domain = domain;
    this.calculateDamage();
    this.saveToLocalStorage();
  }
  
  actualizarNombre(event: any): void {
    const value = event.target.innerText;
    if (value && value.trim() !== '') {
      this.spellName = value;
    } else {
      event.target.innerText = this.spellName;
    }
    this.saveToLocalStorage();
  }
  
  actualizarCostoPA(event: any): void {
    const value = parseInt(event.target.innerText);
    if (!isNaN(value)) {
      this.apCost = value;
      this.saveToLocalStorage();
    }
  }
  
  actualizarRangoMin(event: any): void {
    const value = parseInt(event.target.innerText);
    if (!isNaN(value)) {
      this.minRange = value;
      this.saveToLocalStorage();
    }
  }
  
  actualizarRangoMax(event: any): void {
    const value = parseInt(event.target.innerText);
    if (!isNaN(value)) {
      this.maxRange = value;
      this.saveToLocalStorage();
    }
  }
  
  cambiarTipoAlcance(type: string): void {
    this.rangeType = type;
    this.saveToLocalStorage();
  }
  
  cambiarPosicionAtaque(position: string): void {
    this.attackPosition = position;
    
    // Auto-sync the "back attack" checkbox with the position
    if (position === 'espalda') {
      this.toggleAtaqueEspalda(true);
    } else if (this.isBackAttack) {
      this.toggleAtaqueEspalda(false);
    }
    
    this.calculateDamage();
    this.saveToLocalStorage();
  }
  
  cambiarTipoDistancia(type: string): void {
    this.distanceType = type;
    this.calculateDamage();
    this.saveToLocalStorage();
  }
  
  toggleGolpeCritico(force?: boolean): void {
    if (force !== undefined) {
      this.isCritical = force;
    } else {
      this.isCritical = !this.isCritical;
    }
    this.calculateDamage();
    this.saveToLocalStorage();
  }
  
  toggleModoBerserker(force?: boolean): void {
    if (force !== undefined) {
      this.isBerserker = force;
    } else {
      this.isBerserker = !this.isBerserker;
    }
    this.calculateDamage();
    this.saveToLocalStorage();
  }
  
  toggleAtaqueEspalda(force?: boolean): void {
    if (force !== undefined) {
      this.isBackAttack = force;
    } else {
      this.isBackAttack = !this.isBackAttack;
      
      // Keep position and checkbox in sync
      if (this.isBackAttack && this.attackPosition !== 'espalda') {
        this.attackPosition = 'espalda';
      }
    }
    this.calculateDamage();
    this.saveToLocalStorage();
  }
  
  toggleEsIndirecto(force?: boolean): void {
    if (force !== undefined) {
      this.isIndirect = force;
    } else {
      this.isIndirect = !this.isIndirect;
    }
    this.calculateDamage();
    this.saveToLocalStorage();
  }
  
  // Update character domain levels
  actualizarNivelDominio(domain: DomainType, event: any): void {
    const value = (event.target as HTMLInputElement).value;
    this.domainLevels[domain] = parseInt(value);
    this.calculateDamage();
    this.saveToLocalStorage();
  }
  
  // Update enemy resistance
  actualizarResistenciaEnemigo(type: string, event: any): void {
    let value: number;
    
    if (typeof event === 'object' && event !== null) {
      // Handling event object from input
      if (event.target) {
        value = parseInt(event.target.value || '0');
      } else {
        // Direct ngModelChange event
        value = parseInt(event || '0');
      }
    } else {
      // Direct value
      value = parseInt(event || '0');
    }
    
    // Ensure value is a number
    if (isNaN(value)) value = 0;
    
    // Apply value based on domain
    switch (type) {
      case 'fire':
        this.enemyStats.fireResistance = value;
        break;
      case 'water':
        this.enemyStats.waterResistance = value;
        break;
      case 'air':
        this.enemyStats.airResistance = value;
        break;
      case 'earth':
        this.enemyStats.earthResistance = value;
        break;
    }
    
    // Calculate damage and save state
    this.calculateDamage();
    this.saveToLocalStorage();
  }
  
  cerrarFicha(): void {
    // Implement logic to close the card (could emit an event)
    console.log('Close card');
  }
}
