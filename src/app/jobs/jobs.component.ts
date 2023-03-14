import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.css']
})
export class JobsComponent implements OnInit {
  nivelInicial: number = 1;
  nivelObjetivo: number = 10;
  experienciaActual: number = 30;
  experienciaPorReceta: number = 495;
  progreso: number = 0;
  xpRequired: number = 0;
  qRecipes: number = 0;

  ingrediente1:number = 0;
  ingrediente2: number = 0;
  ingrediente3: number = 0;
  ingrediente4: number = 0;
  ingrediente5: number = 0;
  ingrediente6: number = 0;
  ingrediente7: number = 0;
  ingrediente8: number = 0;
  onExperienciaActualChange() {
    this.progreso = (this.experienciaActual /  this.expNivel(this.nivelInicial)) * 100;
    this.fixValues()
  }

  expNivel(lvl: number){
    return ((150*lvl)+75);
  }
  constructor() { }

  ngOnInit(): void {
    this.onExperienciaActualChange()
    this.fixValues()
  }

  onNivelInicialChange() {
  this.fixValues()

  }

  onNivelObjetivoChange(){
    this.fixValues()
  }
  fixValues(){

    if (this.nivelObjetivo > this.nivelInicial +10 || this.nivelObjetivo < this.nivelInicial) {
      this.nivelObjetivo = this.nivelInicial+10;
    }

    if(this.nivelInicial +10 < this.nivelObjetivo){
      this.nivelInicial = this.nivelObjetivo-10;
    }

    this.xpRequired = 0
    for (let i = this.nivelInicial; i < this.nivelObjetivo; i++) {
      this.xpRequired += this.expNivel(i)
    }
    this.xpRequired -= this.experienciaActual
    this.qRecipes = Math.ceil(this.xpRequired / this.experienciaPorReceta)
  }
}
