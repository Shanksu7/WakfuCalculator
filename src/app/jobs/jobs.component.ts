import { Component, OnInit } from '@angular/core';

interface Ingredient {
  quantity: number;
}

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.css']
})
export class JobsComponent implements OnInit {
  // Niveles
  currentLevel: number = 1;
  goalLevel: number = 10;
  
  // Experiencia
  currentXP: number = 0;
  xpPerRecipe: number = 495;
  
  // Progreso
  currentProgress: number = 15;
  currentProgressLevel: number = 1;
  
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
    this.calculateRequirements();
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
    return Math.floor(100 * Math.pow(1.465, level - 1));
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
    // Limitar el nivel objetivo a 10 niveles por encima del actual
    if (this.goalLevel > this.currentLevel + 10) {
      this.goalLevel = this.currentLevel + 10;
    }
    
    // Asegurar que el nivel objetivo sea mayor o igual al nivel actual
    if (this.goalLevel < this.currentLevel) {
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
}
