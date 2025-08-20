import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagApi, TagTienda } from '../../services/tag-api';

@Component({
  selector: 'app-tag-lista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tag-lista.html',
  styleUrl: './tag-lista.css'
})
export class TagLista implements OnInit {
  tags: TagTienda[] = [];
  error: string | null = null;

  constructor(private tagApi: TagApi) {}

  ngOnInit(): void {
    this.obtenerTags();
  }

  obtenerTags(): void {
    this.tagApi.obtenerTags().subscribe({
      next: (data) => {
        this.tags = data;
        this.error = null;
      },
      error: (err) => {
        this.error = 'error al cargar los tags';
        console.error(err);
      }
    });
  }
}
