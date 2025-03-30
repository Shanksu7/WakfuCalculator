import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { JobsComponent } from './jobs/jobs.component';
import { CharacterStatsComponent } from './character-stats/character-stats.component';
import { SpellCardComponent } from './spell-card/spell-card.component';

@NgModule({
  declarations: [
    AppComponent,
    JobsComponent,
    CharacterStatsComponent,
    SpellCardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
