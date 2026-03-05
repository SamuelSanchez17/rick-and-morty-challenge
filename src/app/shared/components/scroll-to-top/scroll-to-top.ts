import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  NgZone,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TranslationService } from '../../../core/services';

@Component({
  selector: 'app-scroll-to-top',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <button
        class="scroll-to-top"
        type="button"
        [attr.aria-label]="t().scrollToTop"
        (click)="scrollToTop()"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M10 16V4M10 4L4 10M10 4L16 10"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    }
  `,
  styles: `
    .scroll-to-top {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 90;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border: none;
      border-radius: 50%;
      background: rgba(0, 212, 170, 0.15);
      color: #00d4aa;
      cursor: pointer;
      backdrop-filter: blur(8px);
      box-shadow:
        0 4px 16px rgba(0, 0, 0, 0.3),
        0 0 12px rgba(0, 212, 170, 0.15);
      transition:
        transform 0.2s ease,
        background 0.2s ease,
        box-shadow 0.2s ease;
      animation: fadeSlideUp 0.3s ease-out;

      &:hover {
        background: rgba(0, 212, 170, 0.25);
        transform: translateY(-2px);
        box-shadow:
          0 6px 20px rgba(0, 0, 0, 0.35),
          0 0 20px rgba(0, 212, 170, 0.25);
      }

      &:focus-visible {
        outline: 2px solid #00d4aa;
        outline-offset: 3px;
      }

      &:active {
        transform: translateY(0);
      }
    }

    @keyframes fadeSlideUp {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
})
export class ScrollToTopComponent implements OnInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private readonly translationService = inject(TranslationService);

  protected readonly t = this.translationService.t;
  protected readonly visible = signal(false);

  private scrollListener: (() => void) | null = null;

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      const handler = () => {
        const show = (this.document.defaultView?.scrollY ?? 0) > 400;
        if (show !== this.visible()) {
          this.visible.set(show);
        }
      };
      this.document.defaultView?.addEventListener('scroll', handler, { passive: true });
      this.scrollListener = () =>
        this.document.defaultView?.removeEventListener('scroll', handler);
    });
  }

  ngOnDestroy(): void {
    this.scrollListener?.();
  }

  protected scrollToTop(): void {
    this.document.defaultView?.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
