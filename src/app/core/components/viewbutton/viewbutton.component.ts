import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../appMaterial.module';
import { ViewControlComponent } from 'app/core/components/viewcontrol/viewcontrol.component';

@Component({
  selector: 'viewbutton',
  templateUrl: './viewbutton.component.html',
  styleUrls: ['./viewbutton.component.css'],
})
export class ViewButtonComponent extends ViewControlComponent implements OnInit {
  readonly componentName = ViewButtonComponent;
  raised = true;
  contextColor = 'primary';
  label = 'Button';
  tooltipEnabled = false;
  tooltipText: string;
  tooltipPlacement: string;

  constructor() {
    super();
  }

  ngOnInit() {
  }
}
