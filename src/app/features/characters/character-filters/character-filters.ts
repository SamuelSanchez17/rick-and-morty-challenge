import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import type { CharacterFilters } from '../../../core/models';

@Component({
  selector: 'app-character-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="applyFilters()" class="filters" role="search" aria-label="Filtrar personajes">
      <div class="filters__field">
        <label for="filter-name">Nombre</label>
        <input id="filter-name" formControlName="name" type="text" placeholder="Buscar por nombre..." />
      </div>

      <div class="filters__field">
        <label for="filter-status">Estado</label>
        <select id="filter-status" formControlName="status">
          <option value="">Todos</option>
          <option value="Alive">Vivo</option>
          <option value="Dead">Muerto</option>
          <option value="unknown">Desconocido</option>
        </select>
      </div>

      <div class="filters__field">
        <label for="filter-species">Especie</label>
        <input id="filter-species" formControlName="species" type="text" placeholder="Human, Alien..." />
      </div>

      <div class="filters__field">
        <label for="filter-gender">Género</label>
        <select id="filter-gender" formControlName="gender">
          <option value="">Todos</option>
          <option value="Female">Femenino</option>
          <option value="Male">Masculino</option>
          <option value="Genderless">Sin género</option>
          <option value="unknown">Desconocido</option>
        </select>
      </div>

      <div class="filters__actions">
        <button type="submit" class="btn btn--primary">Buscar</button>
        <button type="button" class="btn btn--secondary" (click)="clearFilters()">Limpiar</button>
      </div>
    </form>
  `,
  styles: `
    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: flex-end;
      padding: 1rem;
      background: #1a1a2e;
      border-radius: 12px;
      margin-bottom: 1.5rem;
    }

    .filters__field {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      flex: 1;
      min-width: 160px;

      label {
        font-size: 0.8rem;
        color: #a0a0b8;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      input,
      select {
        padding: 0.6rem 0.8rem;
        border: 1px solid #2a2a4a;
        border-radius: 8px;
        background: #0f3460;
        color: #fff;
        font-size: 0.9rem;

        &::placeholder {
          color: #6a6a8a;
        }

        &:focus {
          outline: 2px solid #00d4aa;
          outline-offset: 1px;
          border-color: transparent;
        }
      }
    }

    .filters__actions {
      display: flex;
      gap: 0.5rem;
      align-items: flex-end;
    }

    .btn {
      padding: 0.6rem 1.2rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.9rem;
      transition: opacity 0.2s;

      &:hover {
        opacity: 0.85;
      }

      &:focus-visible {
        outline: 2px solid #00d4aa;
        outline-offset: 2px;
      }
    }

    .btn--primary {
      background: #00d4aa;
      color: #1a1a2e;
    }

    .btn--secondary {
      background: #2a2a4a;
      color: #b0b0c0;
    }
  `,
})
export class CharacterFiltersComponent {
  readonly filtersChanged = output<Partial<CharacterFilters>>();

  private readonly fb = new FormBuilder();

  readonly form = this.fb.nonNullable.group({
    name: [''],
    status: [''],
    species: [''],
    gender: [''],
  });

  applyFilters(): void {
    const value = this.form.getRawValue();
    this.filtersChanged.emit(value as Partial<CharacterFilters>);
  }

  clearFilters(): void {
    this.form.reset();
    this.filtersChanged.emit({});
  }
}
