import { Injectable, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { WebSocketService } from '../../services/ws.service';
import { RestService } from '../../services/rest.service';
import { CoreService, CoreEvent } from './core.service';
import { DialogService } from '../../services';
import * as _ from 'lodash';
// import { DataService } from './data.service';

interface ApiCall {
  namespace: string; // namespace for ws and path for rest
  args?: any;
  operation?: string;
  responseEvent?: any;// The event name of the response this service will send
  errorResponseEvent?: any;// The event name of the response this service will send in case it fails
}

interface ApiDefinition {
  apiCall: ApiCall;
  preProcessor?: (def: ApiCall) => ApiCall;
  postProcessor?: (res: ApiCall, callArgs: any) => ApiCall;
}

@Injectable()
export class ApiService {
  debug = false;

  private apiDefinitions = {
    UserDataRequest: {
      apiCall: {
        protocol: 'websocket',
        version: '2.0',
        namespace: 'user.query',
        args: [], // eg. [["id", "=", "foo"]]
        responseEvent: 'UserData',
      },
      preProcessor(def: ApiCall) {
        // console.log("API SERVICE: USER DATA REQUESTED");
        return def;
      },
    },
    UserDataUpdate: {
      apiCall: {
        protocol: 'websocket',
        version: '2.0',
        namespace: 'user.set_attribute',
        args: [],
      },
      preProcessor(def: ApiCall) {
        const uid = 1;
        const redef = { ...def };
        redef.args = [uid, 'preferences', def.args];
        return redef;
      },
      postProcessor(res, callArgs, core) {
        const cloneRes = { ...res };
        if (res == 1) {
          core.emit({ name: 'UserDataRequest', data: [[['id', '=', 1]]] });
        }
        return cloneRes;
      },
    },
    VolumeDataRequest: {
      apiCall: {
        protocol: 'websocket',
        version: '2.0',
        namespace: 'pool.dataset.query',
        args: [],
        responseEvent: 'VolumeData',
      },
      preProcessor(def: ApiCall) {
        const queryFilters = [
          ['name', '~', '^[^\/]+$'], // Root datasets only
        ];

        return { args: [queryFilters], ...def };
      },
    },
    DisksRequest: {
      apiCall: {
        protocol: 'websocket',
        version: '2.0',
        args: [],
        namespace: 'disk.query',
        responseEvent: 'DisksData',
      },
    },
    DisksRequestExtra: {
      apiCall: {
        protocol: 'websocket',
        version: '2.0',
        args: [[], { extra: { pools: true } }],
        namespace: 'disk.query',
        responseEvent: 'DisksData',
      },
    },
    MultipathRequest: {
      apiCall: {
        protocol: 'websocket',
        version: '2.0',
        args: [],
        namespace: 'multipath.query',
        responseEvent: 'MultipathData',
      },
    },
    EnclosureDataRequest: {
      apiCall: {
        protocol: 'websocket',
        version: '2.0',
        args: [],
        namespace: 'enclosure.query',
        responseEvent: 'EnclosureData',
      },
    },
    EnclosureUpdate: {
      apiCall: {
        protocol: 'websocket',
        version: '2.0',
        args: [],
        namespace: 'enclosure.update',
        responseEvent: 'EnclosureChanged',
      },
    },
    SetEnclosureLabel: {
      apiCall: {
        protocol: 'websocket',
        version: '2.0',
        args: [],
        namespace: 'enclosure.update',
        responseEvent: 'EnclosureLabelChanged',
      },
      preProcessor(def: ApiCall) {
        const redef = { ...def };
        const args = [def.args.id, { label: def.args.label }];
        redef.args = args;
        return redef;
      },
      postProcessor(res, callArgs) {
        return { label: res.label, index: callArgs.index, id: res.id };
      },
    },
    SetEnclosureSlotStatus: {
      apiCall: {
        protocol: 'websocket',
        version: '2.0',
        args: [],
        namespace: 'enclosure.set_slot_status',
        responseEvent: 'EnclosureSlotStatusChanged',
      },
    },
    PoolDataRequest: {
      apiCall: {
        protocol: 'websocket',
        version: '2.0',
        args: [],
        namespace: 'pool.query',
        responseEvent: 'PoolData',
      },
    },
    PoolDisksRequest: {
      apiCall: {
        protocol: 'websocket',
        version: '2.0',
        namespace: 'pool.get_disks',
        args: [],
        responseEvent: 'PoolDisks',
      },
      preProcessor(def: ApiCall) {
        const redef = { ...def };
        redef.responseEvent = def.args.length > 0 ? def.responseEvent + def.args.join() : def.responseEvent;
        return redef;
      },
      postProcessor(res, callArgs) {
        let cloneRes = { ...res };
        cloneRes = { callArgs, data: res };
        return cloneRes;
      },
    },
    PrimaryNicInfoRequest: {
      apiCall: {
        protocol: 'websocket',
        version: '2.0',
        namespace: 'interface.websocket_interface',
        args: [],
        responseEvent: 'PrimaryNicInfo',
      },
    },
    NicInfoRequest: {
      apiCall: {
        protocol: 'websocket',
        version: '2.0',
        namespace: 'interface.query',
        args: [],
        responseEvent: 'NicInfo',
      },
    },
    NetInfoRequest: {
      apiCall: {
        protocol: 'websocket',
        version: '2.0',
        namespace: 'network.general.summary',
        args: [],
        responseEvent: 'NetInfo',
      },
    },
    UpdateCheck: {
      apiCall: {
        protocol: 'websocket',
        version: '2.0',
        namespace: 'update.check_available',
        args: [],
        responseEvent: 'UpdateChecked',
      },
    },
    VmProfilesRequest: {
      apiCall: {
        protocol: 'websocket',
        version: '2.0', // Middleware returns device info but no status
        namespace: 'vm.query',
        args: [],
        responseEvent: 'VmProfiles',
      },
    },
    VmProfileRequest: {
      apiCall: {
        protocol: 'websocket',
        version: '2.0',
        namespace: 'vm.query',
        args: [], // eg. [["id", "=", "foo"]]
        responseEvent: 'VmProfile',
      },
    },
    VmProfileUpdate: {
      apiCall: {
        protocol: 'websocket',
        version: '2.0',
        namespace: 'vm.update',
        args: [], // eg. [25, {"name": "Fedora", "description": "Linux", "vcpus": 1, "memory": 2048, "bootloader": "UEFI", "autostart": true}]
        responseEvent: 'VmProfileRequest',
      },
      postProcessor(res, callArgs) {
        // DEBUG: console.log(res);
        let cloneRes = { ...res };
        cloneRes = [[['id', '=', res]]];// eg. [["id", "=", "foo"]]
        return cloneRes;
      },
    },
    VmStatusRequest: {
      apiCall: {
        protocol: 'websocket',
        version: '2.0',
        namespace: 'vm.query',
        args: [], // eg. [["id", "=", "foo"]]
        responseEvent: 'VmStatus',
      },
      postProcessor(res, callArgs) {
        const cloneRes = [];
        for (const vmstatus of res) {
          cloneRes.push({ id: vmstatus.id, state: vmstatus.status.state });
        }
        return cloneRes;
      },
    },
    VmStart: {
      apiCall: {
        protocol: 'websocket',
        version: '1',
        namespace: 'vm.start',
        args: [],
        responseEvent: 'VmProfiles',
        errorResponseEvent: 'VmStartFailure',
      },
      postProcessor(res, callArgs) {
        let cloneRes = { ...res };
        cloneRes = { id: callArgs[0], state: res }; // res:boolean
        return cloneRes;
      },
    },
    VmRestart: {
      apiCall: {
        protocol: 'websocket',
        version: '1',
        namespace: 'vm.restart',
        args: [],
        responseEvent: 'VmProfiles',
        errorResponseEvent: 'VmStartFailure',
      },
      postProcessor(res, callArgs) {
        let cloneRes = { ...res };
        cloneRes = { id: callArgs[0], state: res }; // res:boolean
        return cloneRes;
      },
    },
    VmStop: {
      apiCall: {
        protocol: 'websocket',
        version: '1',
        namespace: 'vm.stop',
        args: [],
        responseEvent: 'VmProfiles',
        errorResponseEvent: 'VmStopFailure',
      },
      postProcessor(res, callArgs) {
        let cloneRes = { ...res };
        cloneRes = { id: callArgs[0] }; // res:boolean
        return cloneRes;
      },
    },
    VmPowerOff: {
      apiCall: {
        protocol: 'websocket',
        version: '2',
        namespace: 'vm.stop',
        args: [],
        responseEvent: 'VmProfiles',
        errorResponseEvent: 'VmStopFailure',
      },
      preProcessor(def: ApiCall) {
        const uid = 1;
        const redef = { ...def };
        redef.args.push(true);
        return redef;
      },
      postProcessor(res, callArgs) {
        let cloneRes = { ...res };
        cloneRes = { id: callArgs[0] }; // res:boolean
        return cloneRes;
      },
    },
    VmCreate: {
      apiCall: {
        protocol: 'websocket',
        version: '1',
        namespace: 'vm.create',
        args: [],
        responseEvent: 'VmProfiles',
      },
    },
    VmClone: {
      apiCall: {
        protocol: 'websocket',
        version: '2',
        namespace: 'vm.clone',
        args: [],
        responseEvent: 'VmProfiles',
        errorResponseEvent: 'VmCloneFailure',
      },
      postProcessor(res, callArgs) {
        let cloneRes = { ...res };
        cloneRes = null;
        return cloneRes;
      },
    },
    VmDelete: {
      apiCall: {
        protocol: 'websocket',
        version: '1',
        namespace: 'vm.delete',
        args: [],
        errorResponseEvent: 'VmDeleteFailure',
        responseEvent: 'VmProfiles',
      },
    },
    // Used by stats service!!
    StatsRequest: {
      apiCall: {
        protocol: 'websocket',
        version: '2',
        namespace: 'stats.get_data',
        args: {},
        responseEvent: 'StatsData',
      },
      preProcessor(def: ApiCall) {
        const redef = { ...def };
        redef.responseEvent = 'Stats' + def.args.responseEvent;
        redef.args = def.args.args;
        return redef;
      },
      postProcessor(res, callArgs) {
        const cloneRes = { ...res };
        const legend = res.meta.legend;
        const l = [];
        for (const i in legend) {
          if (callArgs.legendPrefix) {
            const spl = legend[i].split(callArgs.legendPrefix);
            l.push(spl[1]);
          } else {
            l.push(legend[i]);
          }
        }
        cloneRes.meta.legend = l;
        return cloneRes;
      },
    },
    // Used by stats service!!
    StatsSourcesRequest: {
      apiCall: {
        protocol: 'websocket',
        version: '1',
        namespace: 'stats.get_sources',
        args: [],
        responseEvent: 'StatsSources',
      },
    },
    ReportingGraphsRequest: {
      apiCall: {
        protocol: 'websocket',
        version: '2',
        namespace: 'reporting.graphs',
        args: [],
        responseEvent: 'ReportingGraphs',
      },
    },
    StatsCpuRequest: {
      apiCall: {
        protocol: 'websocket',
        version: '1',
        namespace: 'stats.get_data',
        args: [],
        responseEvent: 'StatsData',
      },
      preProcessor(def: ApiCall) {
        const redef = { ...def };
        // Do some stuff here
        const dataList = [];
        const oldDataList = redef.args[0];
        const options = redef.args[1];

        for (const i in oldDataList) {
          dataList.push({
            source: 'aggregation-cpu-sum',
            type: 'cpu-' + oldDataList[i],
            dataset: 'value',
          });
        }

        redef.args = [dataList, options];
        redef.responseEvent = 'StatsCpuData';
        return redef;
      },
      postProcessor(res, callArgs) {
        const cloneRes = { ...res };
        const legend = res.meta.legend;
        const l = [];
        for (const i in legend) {
          const spl = legend[i].split('aggregation-cpu-sum/cpu-');
          l.push(spl[1]);
        }
        cloneRes.meta.legend = l;
        return cloneRes;
      },
    },
    StatsMemoryRequest: {
      apiCall: {
        protocol: 'websocket',
        version: '1',
        namespace: 'stats.get_data',
        args: [],
        responseEvent: 'StatsData',
      },
      preProcessor(def: ApiCall) {
        const redef = { ...def };
        // Do some stuff here

        const dataList = [];
        const oldDataList = redef.args[0];
        const options = redef.args[1];

        for (const i in oldDataList) {
          dataList.push({
            source: 'memory',
            type: 'memory-' + oldDataList[i],
            dataset: 'value',
          });
        }

        redef.args = [dataList, options];
        redef.responseEvent = 'StatsMemoryData';
        return redef;
      },
      postProcessor(res, callArgs) {
        // DEBUG: console.log("******** MEM STAT RESPONSE ********");
        // DEBUG: console.log(res);

        const cloneRes = { ...res };
        const legend = res.meta.legend;
        const l = [];
        for (const i in legend) {
          const spl = legend[i].split('memory/memory-');
          l.push(spl[1]);
        }
        cloneRes.meta.legend = l;
        return cloneRes;
      },
    },
    StatsDiskTempRequest: {
      apiCall: {
        protocol: 'websocket',
        version: '2',
        namespace: 'stats.get_data',
        args: [],
        responseEvent: 'StatsData',
      },
      preProcessor(def: ApiCall) {
        // Clone the object
        const redef = { ...def };
        const dataList = [];
        const oldDataList = redef.args[0];

        for (const i in oldDataList) {
          dataList.push({
            source: 'disktemp-' + oldDataList, // disk name
            type: 'temperature',
            dataset: 'value',
          });
        }

        redef.args = [dataList];
        redef.responseEvent = 'StatsDiskTemp';
        return redef;
      },
      postProcessor(res, callArgs) {
        // DEBUG: console.log("******** DISK TEMP RESPONSE ********");
        // DEBUG: console.log(res);
        // DEBUG: console.log(callArgs);

        const cloneRes = { ...res };
        const legend = res.meta.legend;
        const l = [];
        for (const i in legend) {
          const spl = legend[i];
          l.push(spl[1]);
        }
        cloneRes.meta.legend = l;
        return { callArgs, data: cloneRes };
      },
    },
    StatsLoadAvgRequest: {
      apiCall: {
        protocol: 'websocket',
        version: '1',
        namespace: 'stats.get_data',
        args: [],
        responseEvent: 'StatsData',
      },
      preProcessor(def: ApiCall) {
        const redef = { ...def };
        // Do some stuff here
        const dataList = [];
        const oldDataList = redef.args[0];
        const options = redef.args[1];

        for (const i in oldDataList) {
          dataList.push({
            source: 'processes',
            type: 'ps_' + oldDataList[i],
            dataset: 'value',
          });
        }

        redef.args = [dataList, options];
        redef.responseEvent = 'StatsLoadAvgData';
        return redef;
      },
      postProcessor(res, call) {
        // DEBUG: console.log("******** LOAD STAT RESPONSE ********");
        // DEBUG: console.log(res);
        // return res;

        const cloneRes = { ...res };
        const legend = res.meta.legend;
        const l = [];
        for (const i in legend) {
          const spl = legend[i].split('processes/ps_state-');
          l.push(spl[1]);
        }
        cloneRes.meta.legend = l;
        return cloneRes;
      },
    },
    StatsVmemoryUsageRequest: {
      apiCall: {
        protocol: 'websocket',
        version: '2.0',
        namespace: 'vm.get_vmemory_in_use',
        args: [], // eg. [["id", "=", "foo"]]
        responseEvent: 'StatsVmemoryUsage',
      },
    },
    DisksInfoRequest: {
      apiCall: {
        protocol: 'websocket',
        version: '2.0',
        namespace: 'disk.query',
        args: [],
        responseEvent: 'DisksInfo',
      },
    },
    SensorDataRequest: {
      apiCall: {
        protocol: 'websocket',
        version: '2.0',
        namespace: 'sensor.query',
        args: [],
        responseEvent: 'SensorData',
      },
    },
  };

  constructor(
    protected core: CoreService,
    protected ws: WebSocketService,
    protected rest: RestService,
    private dialog: DialogService,
    // protected cache: DataService
  ) {
    this.ws.authStatus.subscribe((evt: any) => {
      this.core.emit({ name: 'UserDataRequest', data: [[['id', '=', 1]]] });
      this.core.emit({ name: 'Authenticated', data: evt, sender: this });
    });
    this.registerDefinitions();
  }

  registerDefinitions() {
    // DEBUG: console.log("APISERVICE: Registering API Definitions");
    for (var def in this.apiDefinitions) {
      // DEBUG: console.log("def = " + def);
      this.core.register({ observerClass: this, eventName: def }).subscribe(
        (evt: CoreEvent) => {
          // Process Event if CoreEvent is in the api definitions list
          if (this.apiDefinitions[evt.name]) {
            // DEBUG: console.log(evt);
            const apiDef = this.apiDefinitions[evt.name];
            // DEBUG: console.log(apiDef)
            // let call = this.parseCoreEvent(evt);
            if (apiDef.apiCall.protocol == 'websocket') {
              this.callWebsocket(evt, apiDef);
            } else if (apiDef.apiCall.protocol == 'rest') {
              this.callRest(evt, apiDef);
            }
          }
        },
        (err) => {
          // DEBUG: console.log(err)
        },
      );
    }
  }

  private callRest(evt, def) {
    const baseUrl = '/api/v' + def.apiCall.version + '/';
    const cloneDef = { ...def };
    if (evt.data) {
      // PreProcessor: ApiDefinition manipulates call to be sent out.
      if (def.preProcessor) {
        cloneDef.apiCall = def.preProcessor(def.apiCall);
      }

      const call = cloneDef.apiCall;// this.parseEventRest(evt);
      call.args = evt.data;
      this.rest[call.operation](baseUrl + call.namespace, evt.data, false).subscribe((res) => {
        if (this.debug) {
          console.log('*** API Response:');
          console.log(res);
        }

        // PostProcess
        if (def.postProcessor) {
          res = def.postProcessor(res, evt.data, this.core);
        }

        this.core.emit({ name: call.responseEvent, data: res.data, sender: evt.data });
      });
    } else {
      // PreProcessor: ApiDefinition manipulates call to be sent out.
      if (def.preProcessor) {
        cloneDef.apiCall = def.preProcessor(def.apiCall);
      }

      const call = cloneDef.apiCall;// this.parseEventRest(evt);
      call.args = evt.data;
      this.rest[call.operation](baseUrl + call.namespace, {}, false).subscribe((res) => {
        if (this.debug) {
          console.log('*** API Response:');
          console.log(call);
        }

        // PostProcess
        if (def.postProcessor) {
          res = def.postProcessor(res, evt.data, this.core);
        }

        this.core.emit({ name: call.responseEvent, data: res.data, sender: evt.data });
      });
    }
  }

  async callWebsocket(evt: CoreEvent, def) {
    const cloneDef = _.cloneDeep(def);
    const async_calls = [
      'vm.start',
      'vm.delete',
    ];

    if (evt.data) {
      cloneDef.apiCall.args = evt.data;

      if (cloneDef.preProcessor && !async_calls.includes(cloneDef.apiCall.namespace)) {
        cloneDef.apiCall = cloneDef.preProcessor(cloneDef.apiCall, this);
      }

      // PreProcessor: ApiDefinition manipulates call to be sent out.
      if (cloneDef.preProcessor && async_calls.includes(cloneDef.apiCall.namespace)) {
        cloneDef.apiCall = await cloneDef.preProcessor(cloneDef.apiCall, this);
        if (!cloneDef.apiCall) {
          this.core.emit({ name: 'VmStopped', data: { id: evt.data[0] } });
          return;
        }
      }

      const call = cloneDef.apiCall;// this.parseEventWs(evt);
      this.ws.call(call.namespace, call.args).subscribe((res) => {
        if (this.debug) {
          console.log('*** API Response:');
          console.log(call);
        }

        // PostProcess
        if (cloneDef.postProcessor) {
          res = cloneDef.postProcessor(res, evt.data, this.core);
        }
        if (this.debug) {
          console.log(call.responseEvent);
          console.log(res);
        }
        // this.core.emit({name:call.responseEvent, data:res, sender: evt.data}); // OLD WAY
        if (call.responseEvent) {
          this.core.emit({ name: call.responseEvent, data: res, sender: this });
        }
      },
      (error) => {
        error.id = call.args;
        if (call.errorResponseEvent) {
          this.core.emit({ name: call.errorResponseEvent, data: error, sender: this });
        }
        this.core.emit({ name: call.responseEvent, data: error, sender: this });
      });
    } else {
      // PreProcessor: ApiDefinition manipulates call to be sent out.
      if (cloneDef.preProcessor) {
        cloneDef.apiCall = cloneDef.preProcessor(cloneDef.apiCall);
      }

      const call = cloneDef.apiCall;// this.parseEventWs(evt);
      this.ws.call(call.namespace, call.args || []).subscribe((res) => {
        if (this.debug) {
          console.log('*** API Response:');
          console.log(call);
        }

        // PostProcess
        if (cloneDef.postProcessor) {
          res = cloneDef.postProcessor(res, evt.data, this.core);
        }

        // this.core.emit({name:call.responseEvent, data:res, sender:evt.data }); // OLD WAY
        if (call.responseEvent) {
          this.core.emit({ name: call.responseEvent, data: res, sender: this });
        }
      }, (error) => {
        console.log(error);
        if (call.responseFailedEvent) {
          error.id = call.args;
          this.core.emit({ name: call.responseFailedEvent, data: error, sender: this });
        }
      });
    }
  }
}
