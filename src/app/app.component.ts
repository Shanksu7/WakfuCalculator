import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'WakfuCalculator';
  isLightTheme = false;
  isHomePage = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadThemePreference();
    
    // Detectar cambios de ruta para aplicar estilos diferentes al navbar
    this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isHomePage = event.urlAfterRedirects === '/';
    });
    
    // Comprobar la ruta inicial
    this.isHomePage = this.router.url === '/' || this.router.url === '';
  }

  toggleTheme() {
    this.isLightTheme = !this.isLightTheme;
    if (this.isLightTheme) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('wakfu-calc-theme', this.isLightTheme ? 'light' : 'dark');
  }

  loadThemePreference() {
    const savedTheme = localStorage.getItem('wakfu-calc-theme');
    if (savedTheme === 'light') {
      this.isLightTheme = true;
      document.body.classList.add('light-theme');
    } else {
      this.isLightTheme = false;
      document.body.classList.remove('light-theme');
    }
  }
}
