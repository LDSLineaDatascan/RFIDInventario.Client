import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiendaLista } from './tienda-lista';

describe('TiendaLista', () => {
  let component: TiendaLista;
  let fixture: ComponentFixture<TiendaLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TiendaLista]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TiendaLista);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
