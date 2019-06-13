import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { WebSocketService, AppLoaderService } from '../../../../services';
import { FieldConfig } from '../../../common/entity/entity-form/models/field-config.interface';
import { FieldSet } from 'app/pages/common/entity/entity-form/models/fieldset.interface';
import helptext from 'app/helptext/services/components/service-netdata';
import { Placeholder } from '@angular/compiler/src/i18n/i18n_ast';

@Component({
  selector: 'app-service-netdata',
  template : ` <entity-form [conf]="this"></entity-form>`
})
export class ServiceNetDataComponent implements OnInit {
    protected resource_name: string = 'services/netdata';
    protected isBasicMode: boolean = true;
    protected route_success: string[] = [ 'services' ];

    public fieldConfig: FieldConfig[] = []
    public fieldSets: FieldSet[] = [
        {
            name: 'global_settings',
            class: 'global_settings',
            label: false,
            config:[
                {
                    type: 'paragraph',
                    name: 'global_label',
                    paraText: helptext.global_paratext
                },
                {
                    type : 'input',
                    name : 'history',
                    placeholder : helptext.history.placeholder,
                    tooltip: helptext.history.tooltip,
                    validation: helptext.history.validation
                },
                {
                    type : 'input',
                    name : 'update_frequency',
                    placeholder : helptext.update_frequency.placeholder,
                    tooltip: helptext.update_frequency.tooltip,
                    validation: helptext.update_frequency.validation
                },
                {
                    type : 'input',
                    name : 'http_port_listen_backlog',
                    placeholder : helptext.http_port_listen_backlog.placeholder,
                    tooltip: helptext.http_port_listen_backlog.tooltip,
                    validation: helptext.http_port_listen_backlog.validation
                },
                {
                    type : 'select',
                    name : 'bind_to',
                    placeholder : helptext.bind_to.placeholder,
                    tooltip: helptext.bind_to.tooltip,
                    multiple : true,
                    options : [
                        {label : '0.0.0.0', value : '0.0.0.0'},
                        {label : '10.231.2.63', value : '10.231.2.63'},
                        {label : 'other_dummy', value : 'Dummy Data'}
                    ]
                },
                {
                    type : 'input',
                    name : 'bind_to_port',
                    placeholder : helptext.bind_to_port.placeholder,
                    tooltip: helptext.bind_to_port.tooltip,
                    validation: helptext.bind_to_port.validation,
                    value: 19999
                },
                {
                    type : 'textarea', // need more info on accceptable key/values
                    name : 'additional_params',
                    placeholder : helptext.additional_params.placeholder,
                    tooltip: helptext.additional_params.tooltip
                }
            ]
        },
        {
            name: 'alarms',
            class: 'alarms',
            label: false,
            config:[
                {
                    type: 'paragraph',
                    name: 'alarms_label',
                    paraText: helptext.alarms_paratext,
                    class: 'entity_form_label'
                },
                {
                    type : 'textarea', // need more info on accceptable key/values
                    name : 'alarms',
                    placeholder : helptext.alarms.placeholder,
                    tooltip: helptext.alarms.tooltip
                }
            ]
        },
        {
            name: 'streaming_metrics',
            class: 'streaming_metrics',
            label: false,
            config:[
                {
                    type: 'paragraph',
                    name: 'streaming_label',
                    paraText: helptext.streaming_paratext
                },
                {
                    type : 'select',
                    name : 'stream_mode',
                    placeholder : helptext.stream_mode.placeholder,
                    tooltip: helptext.stream_mode.tooltip,
                    options : [
                        {label : 'None', value : 'none'},
                        {label : 'Slave', value : 'slave'},
                        {label : 'Master', value : 'master'}
                    ],
                    value: 'none'
                },
                {
                    type : 'input', 
                    name : 'destination',
                    placeholder : helptext.destination.placeholder,
                    tooltip: helptext.destination.tooltip,
                    isHidden: true
                },
                {
                    type : 'input', 
                    name : 'api_key',
                    placeholder : helptext.api_key.placeholder,
                    tooltip: helptext.api_key.tooltip,
                    isHidden: true
                },
                {
                    type : 'input', 
                    name : 'allow_from',
                    placeholder : helptext.allow_from.placeholder,
                    tooltip: helptext.allow_from.tooltip,
                    value: "*",
                    isHidden: true
                },
                
            ]
        }
    ];

    protected advanced_field: Array<any> = [
        'http_port_listen_backlog',
        'additional_params',
        'alarms',
        'stream_mode',
        'destination',
        'api_key',
        'allow_from',
        'streaming_label',
        'alarms_label'
    ];

    isCustActionVisible(actionId: string) {
        if (actionId == 'advanced_mode' && this.isBasicMode == false) {
            return false;
        } else if (actionId == 'basic_mode' && this.isBasicMode == true) {
            return false;
        }
        return true;
    }

    public custActions: Array<any> = [
        {
            id : 'basic_mode',
            name : 'Basic Mode',
            function : () => { this.isBasicMode = !this.isBasicMode; }
        },
        {
            'id' : 'advanced_mode',
            name : 'Advanced Mode',
            function : () => { this.isBasicMode = !this.isBasicMode; }
        }
    ];
    constructor(
        protected router: Router,
        protected ws: WebSocketService,
    ) {}

    afterInit(entity: any) {
        entity.formGroup.controls['stream_mode'].valueChanges.subscribe((res) => {
            console.log(res)
            if (res === 'none') {
                this.hideField('destination', true, entity);
                this.hideField('api_key', true, entity);
                this.hideField('allow_from', true, entity);
            } else if (res === 'slave') {
                this.hideField('destination', false, entity);
                this.hideField('api_key', false, entity);
                this.hideField('allow_from', true, entity);
            } else if (res === 'master') {
                this.hideField('destination', true, entity);
                this.hideField('api_key', false, entity);
                this.hideField('allow_from', false, entity);
            }
        })
    }

    ngOnInit() {

    }

    hideField(fieldName: any, show: boolean, entity: any) {
        let target = _.find(this.fieldConfig, {'name' : fieldName});
        target['isHidden'] = show;
        entity.setDisabled(fieldName, show, show);
    }
}