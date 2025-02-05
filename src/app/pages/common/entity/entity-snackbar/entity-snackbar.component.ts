import { Component } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-entity-snackbar',
  templateUrl: './entity-snackbar.component.html',
  styleUrls: ['./entity-snackbar.component.css'],
})
export class EntitySnackbarComponent {
  static message: string;
  static action: string;

  translatedMsg: string;
  action: string;

  constructor(private snackbar: MatSnackBar,
    protected translate: TranslateService,
    public snackBarRef: MatSnackBarRef<EntitySnackbarComponent>) {
    this.translate.get(EntitySnackbarComponent.message).subscribe((res) => {
      this.translatedMsg = res;
    });
    this.action = EntitySnackbarComponent.action;
  }
}
