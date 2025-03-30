import { Component, OnInit } from '@angular/core';
import { ImageLoaderService } from '../services/image-loader.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isCopied = false;
  xelorImageUrl: SafeUrl | null = null;
  xelorAvatarUrl: SafeUrl | null = null;
  imagesLoaded = false;

  constructor(
    private imageLoader: ImageLoaderService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadXelorImages();
  }

  loadXelorImages(): void {
    // Verificar primero si hay imágenes en localStorage
    const cachedFullImage = this.imageLoader.getCachedImage('xelorFull');
    const cachedAvatarImage = this.imageLoader.getCachedImage('xelorAvatar');
    
    if (cachedFullImage && cachedAvatarImage) {
      this.xelorImageUrl = this.sanitizer.bypassSecurityTrustUrl(cachedFullImage);
      this.xelorAvatarUrl = this.sanitizer.bypassSecurityTrustUrl(cachedAvatarImage);
      this.imagesLoaded = true;
      return;
    }

    // Usar las imágenes de assets en lugar de descargarlas
    this.xelorImageUrl = this.sanitizer.bypassSecurityTrustUrl('assets/images/xelor-avatar.png');
    this.xelorAvatarUrl = this.sanitizer.bypassSecurityTrustUrl('assets/images/xelor-avatar-card.png');
    this.imagesLoaded = true;
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.isCopied = true;
      
      // Volver al estado original después de 2 segundos
      setTimeout(() => {
        this.isCopied = false;
      }, 2000);
    }).catch(err => {
      console.error('No se pudo copiar al portapapeles: ', err);
    });
  }
} 