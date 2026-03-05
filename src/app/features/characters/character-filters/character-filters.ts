import { Component, ChangeDetectionStrategy, output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, merge } from 'rxjs';
import type { CharacterFilters } from '../../../core/models';
import { TranslationService } from '../../../core/services';

@Component({
  selector: 'app-character-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="applyFilters()" class="filters" role="search" [attr.aria-label]="t().filterAriaLabel">
      <div class="filters__field">
        <label for="filter-name">{{ t().filterName }}</label>
        <input id="filter-name" formControlName="name" type="text" [placeholder]="t().filterNamePlaceholder" />
      </div>

      <div class="filters__field">
        <label for="filter-status">{{ t().filterStatus }}</label>
        <select id="filter-status" formControlName="status">
          <option value="">{{ t().filterAll }}</option>
          <option value="Alive">{{ t().filterAlive }}</option>
          <option value="Dead">{{ t().filterDead }}</option>
          <option value="unknown">{{ t().filterUnknown }}</option>
        </select>
      </div>

      <div class="filters__field">
        <label for="filter-species">{{ t().filterSpecies }}</label>
        <input id="filter-species" formControlName="species" type="text" [placeholder]="t().filterSpeciesPlaceholder" />
      </div>

      <div class="filters__field">
        <label for="filter-gender">{{ t().filterGender }}</label>
        <select id="filter-gender" formControlName="gender">
          <option value="">{{ t().filterAll }}</option>
          <option value="Female">{{ t().filterFemale }}</option>
          <option value="Male">{{ t().filterMale }}</option>
          <option value="Genderless">{{ t().filterGenderless }}</option>
          <option value="unknown">{{ t().filterUnknown }}</option>
        </select>
      </div>

      <div class="filters__actions">
        <button type="submit" class="btn btn--primary">{{ t().filterSearch }}</button>
        <button type="button" class="btn btn--secondary" (click)="clearFilters()">{{ t().filterClear }}</button>
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

      @media (max-width: 600px) {
        gap: 0.75rem;
        padding: 0.75rem;
      }
    }

    .filters__field {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      flex: 1;
      min-width: 160px;

      @media (max-width: 480px) {
        min-width: 100%;
      }

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
          color: #9090aa;
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

      @media (max-width: 480px) {
        width: 100%;

        .btn {
          flex: 1;
        }
      }
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
  private readonly translationService = inject(TranslationService);
  protected readonly t = this.translationService.t;

  readonly form = this.fb.nonNullable.group({
    name: [''],
    status: [''],
    species: [''],
    gender: [''],
  });

  constructor() {
    merge(this.form.controls.name.valueChanges, this.form.controls.species.valueChanges)
      .pipe(debounceTime(300), takeUntilDestroyed())
      .subscribe(() => this.emitFilters());
  }

  applyFilters(): void {
    this.emitFilters();
  }

  clearFilters(): void {
    this.form.reset();
    this.filtersChanged.emit({});
  }

  private emitFilters(): void {
    this.filtersChanged.emit(this.form.getRawValue() as Partial<CharacterFilters>);
  }
}
