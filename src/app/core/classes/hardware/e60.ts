import { Container, Texture, Sprite } from 'pixi.js';
import { DriveTray } from './drivetray';
import { Chassis } from './chassis';
import { ChassisView, Position } from './chassis-view';

export class E60 extends Chassis {
  constructor() {
    super();
    this.model = 'e60';

    this.front = new ChassisView();
    this.front.container = new PIXI.Container();
    this.front.chassisPath = 'assets/images/hardware/e60/e60_960w.png';
    this.front.driveTrayBackgroundPath = 'assets/images/hardware/e60/e60_960w_drivetray_bg.png';
    this.front.driveTrayHandlePath = 'assets/images/hardware/e60/e60_960w_drivetray_handle.png';
    this.front.totalDriveTrays = 60;
    this.front.rows = 12;
    this.front.columns = 5;

    // Scale
    this.front.driveTrays.scale.y = 1.15;

    // Offsets
    this.front.driveTraysOffsetX = -20;
    this.front.driveTraysOffsetY = -40;

    this.front.layout = {
      generatePosition: (displayObject, index, offsetX, offsetY, orientation) => {
        const mod = index % this.front.rows;
        const nextPositionX = Math.floor(index / this.front.rows) * (displayObject.width + this.front.gapX) + offsetX;
        const nextPositionY = mod * (displayObject.height + this.front.gapY) + offsetY;

        const iomGap = mod > 5 ? 25 : 0;

        return { x: nextPositionX, y: nextPositionY + iomGap };
      },
    };
  }

  generatePerspectiveOffset() {
    this.front.driveTrays.transform.position.x = 32;
    this.front.driveTrays.transform.position.y = 32;
  }
}
