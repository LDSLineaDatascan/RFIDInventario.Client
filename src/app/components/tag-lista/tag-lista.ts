import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagApi, TagTienda } from '../../services/tag-api';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tag-lista',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './tag-lista.html',
  styleUrl: './tag-lista.css'
})
export class TagLista implements OnInit {
  tags: TagTienda[] = [];
  error: string | null = null;

  tagsFiltradas: TagTienda[] = [];
  filtro: string = '';

  pageSize: number = 10;
  currentPage: number = 1;
  Math = Math;

  constructor(private tagApi: TagApi) {}

  ngOnInit(): void {
    this.obtenerTags();
  }

  obtenerTags(): void {
    this.tagApi.obtenerTags().subscribe({
      next: (data) => {
        this.tags = data;
        this.tagsFiltradas = data;
        this.error = null;
      },
      error: (err) => {
        this.error = 'error al cargar los tags';
        console.error(err);
      }
    });
  }

  filtrarTags(): void {
    this.currentPage = 1;
    const q = this.filtro.trim().toLowerCase();
    if (!q) {
      this.tagsFiltradas = this.tags;
      return;
    }

    this.tagsFiltradas = this.tags.filter(t =>
      (t.idTienda?.toString() || '').toLowerCase().includes(q) ||
      (t.tag || '').toLowerCase().includes(q) ||
      (t.ean || '').toLowerCase().includes(q)
    );
  }


  //Paginacion
  get tagsPaginadas(){
    const startIndex = (this.currentPage -1) * this.pageSize;
    return this.tagsFiltradas.slice(startIndex, startIndex + this.pageSize);
  }

  nextPage(){
    if((this.currentPage * this.pageSize) < this.tagsFiltradas.length){
      this.currentPage++;
    }
  }

  prevPage(){
    if(this.currentPage > 1){
      this.currentPage--;
    }
  }
}
