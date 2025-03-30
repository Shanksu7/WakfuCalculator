import { Component, OnInit } from '@angular/core';

interface Ingredient {
  quantity: number;
}

interface SavedJobsState {
  currentLevel: number;
  goalLevel: number;
  currentXP: number;
  xpPerRecipe: number;
  ingredients: Ingredient[];
}

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.css']
})
export class JobsComponent implements OnInit {
  // Niveles
  currentLevel: number = 0;
  goalLevel: number = 10;
  
  // Experiencia
  currentXP: number = 0;
  xpPerRecipe: number = 495;
  
  // Progreso
  currentProgress: number = 0;
  currentProgressLevel: number = 0;
  
  // Cantidad total de recetas
  totalRequired: number = 0;
  
  // Ingredientes
  ingredients: Ingredient[] = [
    { quantity: 0 },
    { quantity: 0 },
    { quantity: 0 },
    { quantity: 0 },
    { quantity: 0 },
    { quantity: 0 },
    { quantity: 0 },
    { quantity: 0 }
  ];
  
  constructor() { }

  ngOnInit(): void {
    this.loadFromLocalStorage();
    this.calculateRequirements();
  }
  
  // Load data from localStorage
  loadFromLocalStorage(): void {
    const savedData = localStorage.getItem('wakfu-jobs-calculator-state');
    if (savedData) {
      try {
        const parsedData: SavedJobsState = JSON.parse(savedData);
        
        // Load all saved values
        this.currentLevel = parsedData.currentLevel !== undefined ? parsedData.currentLevel : 0;
        this.goalLevel = parsedData.goalLevel !== undefined ? parsedData.goalLevel : 10;
        this.currentXP = parsedData.currentXP !== undefined ? parsedData.currentXP : 0;
        this.xpPerRecipe = parsedData.xpPerRecipe !== undefined ? parsedData.xpPerRecipe : 495;
        
        // Load ingredients if they exist
        if (parsedData.ingredients && parsedData.ingredients.length > 0) {
          // Ensure we don't exceed the array length
          const ingredientsLength = Math.min(parsedData.ingredients.length, this.ingredients.length);
          for (let i = 0; i < ingredientsLength; i++) {
            this.ingredients[i].quantity = parsedData.ingredients[i].quantity || 0;
          }
        }
        
        // Update progress after loading data
        this.updateProgress();
      } catch (e) {
        console.error('Error loading jobs data from localStorage:', e);
        // Reset to default values if error occurs
        this.resetToDefaults();
      }
    } else {
      // Use default values if no saved data exists
      this.resetToDefaults();
    }
  }
  
  // Save current state to localStorage
  saveToLocalStorage(): void {
    const dataToSave: SavedJobsState = {
      currentLevel: this.currentLevel,
      goalLevel: this.goalLevel,
      currentXP: this.currentXP,
      xpPerRecipe: this.xpPerRecipe,
      ingredients: this.ingredients
    };
    
    localStorage.setItem('wakfu-jobs-calculator-state', JSON.stringify(dataToSave));
  }
  
  // Reset to default values
  resetToDefaults(): void {
    this.currentLevel = 0;
    this.goalLevel = 10;
    this.currentXP = 0;
    this.xpPerRecipe = 495;
    this.ingredients.forEach(item => item.quantity = 0);
    this.currentProgressLevel = 0;
  }
  
  // Calcular la experiencia requerida para un nivel
  get xpRequired(): number {
    if (!this.currentLevel) return 0;
    return this.calculateLevelXP(this.currentLevel);
  }
  
  // Calcular la experiencia necesaria para subir al nivel objetivo
  get xpNeeded(): number {
    if (!this.goalLevel || !this.currentLevel) return 0;
    if (this.currentLevel >= this.goalLevel) return 0;
    
    let totalXPNeeded = 0;
    for (let i = this.currentLevel; i < this.goalLevel; i++) {
      totalXPNeeded += this.calculateLevelXP(i);
    }
    
    // Restar la experiencia actual
    totalXPNeeded -= this.currentXP;
    
    return totalXPNeeded > 0 ? totalXPNeeded : 0;
  }
  
  // Fórmula para calcular la experiencia requerida para un nivel
  calculateLevelXP(level: number): number {
    return (level * 150) + 75;
  }
  
  // Calcular cantidad de recetas y actualizar ingredientes
  calculateRequirements(): void {
    if (this.xpNeeded > 0 && this.xpPerRecipe > 0) {
      this.totalRequired = Math.ceil(this.xpNeeded / this.xpPerRecipe);
      
      // Actualizar progreso
      this.updateProgress();
    } else {
      this.totalRequired = 0;
    }
    
    // Save data after calculations
    this.saveToLocalStorage();
  }
  
  // Actualizar barra de progreso
  updateProgress(): void {
    if (!this.currentLevel) return;
    
    const totalLevelXP = this.calculateLevelXP(this.currentLevel);
    if (totalLevelXP > 0) {
      this.currentProgress = Math.min(100, (this.currentXP / totalLevelXP) * 100);
      this.currentProgressLevel = this.currentLevel;
    }
  }
  
  // Métodos para responder a cambios en los inputs
  onCurrentLevelChange(): void {
    // Asegurar que el nivel objetivo sea mayor o igual al nivel actual
    if (this.goalLevel < this.currentLevel) {
      this.goalLevel = this.currentLevel;
    }
    
    this.calculateRequirements();
  }
  
  onGoalLevelChange(): void {
    // Verificar límites solo cuando el usuario intenta excederlos
    const maxAllowedLevel = this.currentLevel + 10;
    
    if (this.goalLevel > maxAllowedLevel) {
      this.goalLevel = maxAllowedLevel;
    } else if (this.goalLevel < this.currentLevel) {
      this.goalLevel = this.currentLevel;
    }
    
    this.calculateRequirements();
  }
  
  onCurrentXPChange(): void {
    this.updateProgress();
    this.calculateRequirements();
  }
  
  onXPPerRecipeChange(): void {
    this.calculateRequirements();
  }
  
  // Métodos para botones de incremento/decremento
  incrementCurrentLevel(): void {
    this.currentLevel++;
    if (this.goalLevel < this.currentLevel) {
      this.goalLevel = this.currentLevel;
    }
    this.onCurrentLevelChange();
  }
  
  decrementCurrentLevel(): void {
    if (this.currentLevel > 0) {
      this.currentLevel--;
      this.onCurrentLevelChange();
    }
  }
  
  incrementGoalLevel(): void {
    const maxAllowedLevel = this.currentLevel + 10;
    if (this.goalLevel < maxAllowedLevel) {
      this.goalLevel++;
      this.onGoalLevelChange();
    }
  }
  
  decrementGoalLevel(): void {
    if (this.goalLevel > this.currentLevel) {
      this.goalLevel--;
      this.onGoalLevelChange();
    }
  }
  
  incrementIngredient(index: number): void {
    this.ingredients[index].quantity++;
    this.saveToLocalStorage();
  }
  
  decrementIngredient(index: number): void {
    if (this.ingredients[index].quantity > 0) {
      this.ingredients[index].quantity--;
      this.saveToLocalStorage();
    }
  }
}
