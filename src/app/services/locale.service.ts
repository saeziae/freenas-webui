import { Injectable } from '@angular/core';
import { CoreEvent } from 'app/interfaces/events';
import { Option } from 'app/interfaces/option.interface';
import { PreferencesService } from 'app/core/services/preferences.service';
import { SystemGeneralService } from '.';
import { Subject } from 'rxjs';
import { CoreService } from 'app/core/services/core.service';
import { T } from 'app/translate-marker';
import { format, utcToZonedTime } from 'date-fns-tz';

@Injectable()
export class LocaleService {
  t24 = T('(24 Hours)');
  timeZone: string;
  isWaiting = false;
  dateFormat = 'yyyy-MM-dd';
  timeFormat = 'HH:mm:ss';
  dateTimeFormatChange$ = new Subject();
  target: Subject<CoreEvent> = new Subject();

  constructor(public prefService: PreferencesService, public sysGeneralService: SystemGeneralService,
    private core: CoreService) {
    this.sysGeneralService.getGeneralConfig.subscribe((res: any) => {
      this.timeZone = res.timezone;
    });
    if (window.localStorage.dateFormat) {
      this.dateFormat = window.localStorage.getItem('dateFormat');
    }
    if (window.localStorage.timeFormat) {
      this.timeFormat = window.localStorage.getItem('timeFormat');
    }
    this.getPrefs();
  }

  getPrefs(): void {
    this.core.emit({ name: 'UserPreferencesRequest', sender: this });
    this.core.register({ observerClass: this, eventName: 'UserPreferencesReady' })
      .subscribe((evt: CoreEvent) => {
        if (this.isWaiting) {
          this.target.next({ name: 'SubmitComplete', sender: this });
          this.isWaiting = false;
        }
        this.dateFormat = evt.data.dateFormat;
        this.timeFormat = evt.data.timeFormat;
        this.storeDateTimeFormat(this.dateFormat, this.timeFormat);
        this.dateTimeFormatChange$.next();
      });
  }

  getDateFormatOptions(tz?: string): Option[] {
    let date = new Date();
    if (tz) {
      date = utcToZonedTime(new Date().valueOf(), tz);
    }

    return [
      { label: format(date, 'yyyy-MM-dd'), value: 'yyyy-MM-dd' },
      { label: format(date, 'MMMM d, yyyy'), value: 'MMMM d, yyyy' },
      { label: format(date, 'd MMMM, yyyy'), value: 'd MMMM, yyyy' },
      { label: format(date, 'MMM d, yyyy'), value: 'MMM d, yyyy' },
      { label: format(date, 'd MMM yyyy'), value: 'd MMM yyyy' },
      { label: format(date, 'MM/dd/yyyy'), value: 'MM/dd/yyyy' },
      { label: format(date, 'dd/MM/yyyy'), value: 'dd/MM/yyyy' },
      { label: format(date, 'dd.MM.yyyy'), value: 'dd.MM.yyyy' },
    ];
  }

  getTimeFormatOptions(tz?: string): Option[] {
    let date = new Date();
    if (tz) {
      date = utcToZonedTime(new Date().valueOf(), tz);
    }
    return [
      { label: `${format(date, 'HH:mm:ss')} ${this.t24}`, value: 'HH:mm:ss' },
      { label: format(date, 'hh:mm:ss aaaaa\'m\''), value: 'hh:mm:ss aaaaa\'m\'' },
      { label: format(date, 'hh:mm:ss aa'), value: 'hh:mm:ss aa' },
    ];
  }

  formatDateTime(date: Date, tz?: string): string {
    if (tz) {
      date = utcToZonedTime(date.valueOf(), tz);
    } else if (this.timeZone) {
      date = utcToZonedTime(date.valueOf(), this.timeZone);
    }

    return format(date, `${this.dateFormat} ${this.timeFormat}`);
  }

  formatDateTimeWithNoTz(date: Date): string {
    return format(date.valueOf(), `${this.dateFormat} ${this.timeFormat}`);
  }

  getTimeOnly(date: Date, seconds = true, tz?: string): string {
    if (tz) {
      date = utcToZonedTime(date.valueOf(), tz);
    } else if (this.timeZone) {
      date = utcToZonedTime(date.valueOf(), this.timeZone);
    }
    let formatStr: string;
    formatStr = this.timeFormat;
    if (!seconds) {
      formatStr = formatStr.replace(':ss', '');
    }

    return format(date, formatStr);
  }

  saveDateTimeFormat(dateFormat: any, timeFormat: any): void {
    this.dateFormat = dateFormat;
    this.timeFormat = timeFormat;
    this.storeDateTimeFormat(this.dateFormat, this.timeFormat);
    this.dateTimeFormatChange$.next();

    this.core.emit({
      name: 'ChangePreference',
      data: {
        key: 'dateFormat', value: dateFormat,
      },
      sender: this,
    });
    this.core.emit({
      name: 'ChangePreference',
      data: {
        key: 'timeFormat', value: timeFormat,
      },
      sender: this,
    });
  }

  storeDateTimeFormat(dateFormat: string, timeFormat: string): void {
    window.localStorage.setItem('dateFormat', dateFormat);
    window.localStorage.setItem('timeFormat', timeFormat);
  }

  getPreferredDateFormat(): string {
    return this.dateFormat;
  }

  getPreferredTimeFormat(): string {
    return this.timeFormat;
  }

  getDateAndTime(tz?: string): [string, string] {
    let date = new Date();
    if (tz) {
      date = utcToZonedTime(new Date().valueOf(), tz);
    } else if (this.timeZone) {
      date = utcToZonedTime(new Date().valueOf(), this.timeZone);
    }
    return [format(date, `${this.dateFormat}`), format(date, `${this.timeFormat}`)];
  }

  // Translates moment.js format to angular template format for use in special cases such as form-scheduler
  getAngularFormat(): string {
    // Renders lowercase am and pm
    const ngTimeFormat = this.timeFormat === 'hh:mm:ss a' ? 'hh:mm:ss aaaaa\'m\'' : this.timeFormat;
    const tempStr = `${this.dateFormat} ${ngTimeFormat}`;
    let dateStr = '';
    for (let i = 0; i < tempStr.length; i++) {
      tempStr[i] === 'M' || tempStr[i] === 'Z' || tempStr[i] === 'H' ? dateStr += tempStr[i]
        : dateStr += tempStr[i].toLowerCase();
    }
    return dateStr;
  }

  getCopyrightYearFromBuildTime(): string {
    const buildTime = localStorage.getItem('buildtime')?.trim();
    if (!buildTime) {
      return '';
    }

    const buildTimeInMillis = parseInt(buildTime);
    return new Date(buildTimeInMillis).getFullYear().toString();
  }
}
