import {
  ChangeDetectionStrategy, Component, signal, OnInit,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { environment } from 'environments/environment';
import {
  combineLatest, Observable, tap,
} from 'rxjs';
import { AppLoaderService } from 'app/modules/loader/app-loader.service';
import { IxCpuChartComponent } from 'app/pages/reports-dashboard/components/cpu-chart/cpu-chart.component';
import { SafePipe, ValueType } from 'app/pages/reports-dashboard/components/netdata/safe.pipe';
import { ReportsService } from 'app/pages/reports-dashboard/reports.service';
import { AuthService } from 'app/services/auth/auth.service';
import { ErrorHandlerService } from 'app/services/error-handler.service';
import { WebSocketService } from 'app/services/ws.service';

@UntilDestroy()
@Component({
  selector: 'ix-netdata-dashboard',
  templateUrl: 'netdata.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    SafePipe,
    IxCpuChartComponent,
  ],
})
export class NetdataComponent implements OnInit {
  url = signal('');
  readonly ValueType = ValueType;

  constructor(
    private ws: WebSocketService,
    private reportsService: ReportsService,
    private loader: AppLoaderService,
    private errorHandler: ErrorHandlerService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.generatePassword(),
      this.auth.user$,
    ]).pipe(
      tap(([password, userData]) => {
        // console.log('username', userData.pw_name);
        // console.log('password', password);
        const urlStr = `http://${environment.remote}`;
        // console.log('urlStr', urlStr);
        const url = new URL(urlStr);
        url.username = userData.pw_name;
        url.password = password;
        url.pathname = '/netdata/';
        // console.log('url', url.toString());
        this.url.set(urlStr + '/netdata/');
      }),
      untilDestroyed(this),
    ).subscribe();
  }

  protected onGeneratePasswordPressed(): void {
    this.generatePassword()
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  private generatePassword(): Observable<string> {
    return this.ws.call('reporting.netdataweb_generate_password')
      .pipe(
        this.loader.withLoader(),
        this.errorHandler.catchError(),
      );
  }
}
