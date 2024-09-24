import {
  Component, ChangeDetectionStrategy, input, computed,
  effect,
  signal,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ChartData } from 'chart.js';
import { LoadingState } from 'app/helpers/operators/to-loading-state.helper';
import { AppStats } from 'app/interfaces/app.interface';
import { ThemeService } from 'app/services/theme/theme.service';

@Component({
  selector: 'ix-app-disk-info',
  templateUrl: './app-disk-info.component.html',
  styleUrls: ['./app-disk-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppDiskInfoComponent {
  stats = input.required<LoadingState<AppStats>>();

  protected readonly initialDiskStats = Array.from({ length: 60 }, () => ([0, 0]));
  protected readonly cachedDiskStats = signal<number[][]>([]);
  readonly diskStats = computed(() => {
    const cachedStats = this.cachedDiskStats();
    return [...this.initialDiskStats, ...cachedStats].slice(-60);
  });

  protected diskChartData = computed<ChartData<'line'>>(() => {
    const currentTheme = this.theme.currentTheme();
    const data = this.diskStats();
    const labels: number[] = data.map((_, index) => (0 + index) * 1000);

    return {
      datasets: [
        {
          label: this.translate.instant('Read'),
          data: data.map((item, index) => ({ x: labels[index], y: item[0] })),
          borderColor: currentTheme.blue,
          backgroundColor: currentTheme.blue,
          pointBackgroundColor: currentTheme.blue,
          pointRadius: 0,
          tension: 0.2,
          fill: true,
        },
        {
          label: this.translate.instant('Write'),
          data: data.map((item, index) => ({ x: labels[index], y: -item[1] })),
          borderColor: currentTheme.orange,
          backgroundColor: currentTheme.orange,
          pointBackgroundColor: currentTheme.orange,
          pointRadius: 0,
          tension: 0.2,
          fill: true,
        },
      ],
    };
  });

  constructor(
    private theme: ThemeService,
    private translate: TranslateService,
  ) {
    effect(() => {
      const diskStats = this.stats()?.value?.blkio;
      if (diskStats) {
        this.cachedDiskStats.update((cachedStats) => {
          return [...cachedStats, [diskStats.read, diskStats.write]].slice(-60);
        });
      }
    }, { allowSignalWrites: true });
  }
}