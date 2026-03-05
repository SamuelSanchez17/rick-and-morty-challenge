import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { TranslationService } from '../../../core/services';

@Component({
  selector: 'app-language-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="lang-toggle"
      [class.lang-toggle--animating]="animating()"
      (click)="toggle()"
      [attr.aria-label]="ariaLabel()"
    >
      <span class="lang-toggle__text">{{ langLabel() }}</span>
      <span class="lang-toggle__chevron" aria-hidden="true">▾</span>
    </button>
  `,
  styles: `
    :host { display: inline-flex; }

    .lang-toggle {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 14px;
      border: 1px solid #3a3a5a;
      border-radius: 20px;
      background: #2a2a4a;
      color: #d0d0e0;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: border-color 0.3s, background 0.3s, color 0.3s;

      &:hover {
        border-color: #00d4aa;
        color: #fff;
      }

      &:focus-visible {
        outline: 2px solid #00d4aa;
        outline-offset: 2px;
      }
    }

    .lang-toggle--animating {
      animation: portalFlip 0.5s ease-in-out;
    }

    .lang-toggle__chevron {
      font-size: 0.7rem;
      line-height: 1;
    }

    @keyframes portalFlip {
      0% {
        transform: perspective(400px) rotateY(0);
        box-shadow: 0 0 0 0 rgba(0, 212, 170, 0.3);
      }
      30% {
        transform: perspective(400px) rotateY(108deg) scale(1.1);
        box-shadow: 0 0 18px 5px rgba(0, 212, 170, 0.6);
        border-color: #00d4aa;
        color: #00d4aa;
      }
      60% {
        transform: perspective(400px) rotateY(252deg) scale(1.05);
        box-shadow: 0 0 12px 3px rgba(0, 212, 170, 0.4);
      }
      100% {
        transform: perspective(400px) rotateY(360deg);
        box-shadow: 0 0 0 0 rgba(0, 212, 170, 0);
      }
    }
  `,
})
export class LanguageToggleComponent {
  private readonly translationService = inject(TranslationService);

  protected readonly animating = signal(false);
  protected readonly langLabel = computed(() => this.translationService.lang().toUpperCase());
  protected readonly ariaLabel = computed(() =>
    this.translationService.lang() === 'es' ? 'Switch to English' : 'Cambiar a Español',
  );

  protected toggle(): void {
    this.animating.set(true);
    this.translationService.toggleLanguage();
    setTimeout(() => this.animating.set(false), 500);
  }
}
