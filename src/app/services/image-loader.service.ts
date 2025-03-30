import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ImageLoaderService {
  private readonly STORAGE_KEY = 'wakfu_calculator_images';
  private imageCache: { [key: string]: string } = {};

  constructor(private http: HttpClient) {
    this.loadImagesFromStorage();
  }

  /**
   * Carga imágenes almacenadas en localStorage
   */
  private loadImagesFromStorage(): void {
    const storedImages = localStorage.getItem(this.STORAGE_KEY);
    if (storedImages) {
      try {
        this.imageCache = JSON.parse(storedImages);
      } catch (error) {
        console.error('Error al cargar imágenes almacenadas:', error);
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }

  /**
   * Guarda las imágenes en localStorage
   */
  private saveImagesToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.imageCache));
  }

  /**
   * Obtiene una imagen de la caché o la descarga
   */
  getImage(url: string, identifier: string): Observable<string> {
    // Si la imagen ya está en caché, devuélvela
    if (this.imageCache[identifier]) {
      return of(this.imageCache[identifier]);
    }

    // Descarga la imagen y convierte a base64
    return new Observable<string>(observer => {
      this.http.get(url, { responseType: 'blob' }).subscribe({
        next: (blob: Blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              this.imageCache[identifier] = reader.result;
              this.saveImagesToStorage();
              observer.next(reader.result);
              observer.complete();
            }
          };
          reader.readAsDataURL(blob);
        },
        error: error => {
          console.error(`Error al descargar imagen ${identifier}:`, error);
          observer.next('');
          observer.complete();
        }
      });
    });
  }

  /**
   * Devuelve una imagen de la caché
   */
  getCachedImage(identifier: string): string {
    return this.imageCache[identifier] || '';
  }
}
