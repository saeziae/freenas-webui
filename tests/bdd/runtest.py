#!/usr/bin/env python3

import sys
import os
import getopt
from configparser import ConfigParser
from subprocess import run
cwd = str(os.getcwd())
screenshot_path = f"{cwd}/screenshot"
argument = sys.argv
UsageMSG = f"""Usage for {argument[0]}:
Options:

--help                           - Show all options.
--ip <0.0.0.0>                   - IP of the targeted TrueNAS server/
--nas-password <password>       - need root password for login.
--convert-feature                - This convert Jira feature files
                                   for pytest-bdd.
--test-suite                     - To specify the test suite to run ha-bhyve02
                                   is use by default.
                                   test-suite options: ha-bhyve02, ha-tn09, core
--iso-version <name-version>     - The iso name and version
                                   Example: TrueNAS-12.0-INTERNAL-168
--marker      <marker>           - Pytest markers to use like debug_test
"""


# list of argument that should be use.
option_list = [
    "help",
    "ip=",
    'nas-password=',
    'convert-feature',
    'test-suite=',
    'iso-version=',
    'marker='
]

test_suite_list = [
    'ha-bhyve02',
    'ha-tn09',
    'core'
]

markers_list = [
    'debug_test'
]


def convert_jira_feature_file(directory):
    # convert Jira feature file for pytest-bdd cucumber results.
    feature_list = os.listdir(f'{directory}/features')
    if '.keepme' in feature_list:
        feature_list.remove('.keepme')

    for feature_file in feature_list:
        feature = open(f'{directory}/features/{feature_file}', 'r')
        old_feature = feature.readlines()
        new_feature = open(f'{directory}/features/{feature_file}', 'w')
        for line in old_feature:
            if 'Feature:' in line:
                feature_list = line.split(':')
                if len(feature_list) == 3:
                    new_line = f'{feature_list[0]}:{feature_list[1]}\n'
                    new_feature.writelines(new_line)
                else:
                    new_feature.writelines(line)
            elif 'Scenario' in line:
                scenario_list = line.split(':')
                if len(scenario_list) == 3:
                    new_line = f'{scenario_list[0]}:{scenario_list[2]}'
                    new_feature.writelines(new_line)
                else:
                    new_feature.writelines(line)
            else:
                new_feature.writelines(line)
        new_feature.close()


# look if all the argument are there.
try:
    myopts, args = getopt.getopt(argument[1:], None, option_list)
except getopt.GetoptError as e:
    print(str(e))
    print(UsageMSG)
    sys.exit(1)

global ip, password
test_suite = 'core'
run_convert = False
marker = ''

for output, arg in myopts:
    if output == '--ip':
        ip = arg
    elif output == '--nas-password':
        password = arg
    elif output == '--sudo-password':
        sudo_password = arg
    elif output == '--test-suite':
        test_suite = arg
        if test_suite not in test_suite_list:
            print(f'--test-suite {test_suite} it not valide')
            print('Only the folowing are allowed:')
            for suite in test_suite_list:
                print(f'    --test-suite {suite}')
            exit(1)
    elif output == '--iso-version':
        version = arg
    elif output == "--convert-feature":
        run_convert = True
    elif output == "--help":
        print(UsageMSG)
        exit(0)
    elif output == '--marker':
        if arg in markers_list:
            marker = arg
        else:
            print(f'"{arg}" is not a supported marker')
            print('Here is the list supported markers:\n',
                  markers_list)
            exit(1)


def run_testing():
    # store ip and password in environment variable if test suite is core.
    if 'ip' in globals() and 'password' in globals() and 'version' in globals() and test_suite == 'core':
        os.environ["nas_ip"] = ip
        os.environ["nas_password"] = password
        os.environ["nas_version"] = version
        os.environ['test_suite'] = test_suite
    elif os.path.exists(f'{cwd}/config.cfg') and test_suite == 'core':
        configs = ConfigParser()
        configs.read('config.cfg')
        os.environ["nas_ip"] = configs['NAS_CONFIG']['ip']
        os.environ["nas_password"] = configs['NAS_CONFIG']['password']
        os.environ["nas_version"] = configs['NAS_CONFIG']['version']
        os.environ['test_suite'] = test_suite
    elif not os.path.exists(f'{cwd}/config.cfg') and test_suite == 'core':
        msg = 'Please use --ip and --nas-password or add confing.cfg ' \
            'in this directory'
        print(msg)
        print('config.cfg example: ')
        cfg_msg = "[NAS_CONFIG]\n"
        cfg_msg += "ip = 0.0.0.0\n"
        cfg_msg += "password = testing\n"
        cfg_msg += "version = TrueNAS-12.0-U2\n"
        print(cfg_msg)
        exit(1)
    else:
        os.environ["nas_ip"] = 'None'
        os.environ["nas_password"] = 'None'
        os.environ["nas_version"] = 'None'
        os.environ['test_suite'] = test_suite

    convert_jira_feature_file(test_suite)
    pytest_cmd = [
        sys.executable,
        '-m',
        'pytest',
        '-v',
        test_suite,
        "--junitxml=results/junit/webui_test.xml",
        "--cucumber-json=results/cucumber/webui_test.json"
    ]
    if marker:
        pytest_cmd.append("-k")
        pytest_cmd.append(marker)
    run(pytest_cmd)


if run_convert is True:
    convert_jira_feature_file(test_suite)
else:
    run_testing()
