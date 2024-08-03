import { CatalogAppState } from 'app/enums/chart-release-status.enum';
import { JobState } from 'app/enums/job-state.enum';
import { ChartScaleResult, AppStartQueryParams } from 'app/interfaces/chart-release-event.interface';
import { App } from 'app/interfaces/chart-release.interface';
import { Job } from 'app/interfaces/job.interface';
import { getAppStatus } from 'app/pages/apps/utils/get-app-status';

describe('getAppStatus', () => {
  const app = {
    id: 'ix-test-app',
    name: 'test-app',
    metadata: {
      name: 'rude-cardinal',
    },
    catalog: 'test-catalog',
    catalog_train: 'test-catalog-train',
    state: CatalogAppState.Active,
  } as App;
  const job = {
    arguments: ['fake-name', { replica_count: 1 }] as AppStartQueryParams,
    state: JobState.Success,
  } as Job<ChartScaleResult, AppStartQueryParams>;

  it('should return Started', () => {
    const result = getAppStatus(app, job);

    expect(result).toEqual(CatalogAppState.Started);
  });

  it('should return Starting', () => {
    const result = getAppStatus(app, { ...job, state: JobState.Running });

    expect(result).toEqual(CatalogAppState.Starting);
  });

  it('should return Deploying', () => {
    const result = getAppStatus({
      ...app,
      state: CatalogAppState.Deploying,
    });

    expect(result).toEqual(CatalogAppState.Deploying);
  });

  it('should return Stopping', () => {
    const result = getAppStatus(app, {
      ...job,
      state: JobState.Running,
      arguments: ['fake-name', { replica_count: 0 }],
    });

    expect(result).toEqual(CatalogAppState.Stopping);
  });

  it('should return Stopped', () => {
    const result = getAppStatus({
      ...app,
      state: CatalogAppState.Stopped,
    }, {
      ...job,
      state: JobState.Success,
      arguments: ['fake-name', { replica_count: 0 }],
    });

    expect(result).toEqual(CatalogAppState.Stopped);
  });
});
