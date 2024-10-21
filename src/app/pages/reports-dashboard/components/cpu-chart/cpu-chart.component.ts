import {
  ChangeDetectionStrategy, Component, Renderer2, OnInit, OnDestroy,
} from '@angular/core';

@Component({
  selector: 'ix-cpu-chart',
  templateUrl: './cpu-chart.component.html',
  styleUrl: './cpu-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class IxCpuChartComponent implements OnInit, OnDestroy {
  private scriptElement: HTMLScriptElement;

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    this.scriptElement = this.renderer.createElement('script') as HTMLScriptElement;
    this.scriptElement.src = 'https://netdata.firehol.org/dashboard.js';
    this.scriptElement.type = 'text/javascript';

    this.renderer.appendChild(document.body, this.scriptElement);
  }

  ngOnDestroy(): void {
    if (this.scriptElement) {
      this.renderer.removeChild(document.body, this.scriptElement);
    }
  }
}
