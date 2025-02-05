# coding=utf-8
"""High Availability (tn-bhyve02) feature tests."""

import reusableSeleniumCode as rsc
import xpaths
import time
import os
import pytest
from function import (
    wait_on_element,
    is_element_present,
    setup_ssh_agent,
    create_key,
    add_ssh_key,
    attribute_value_exist,
    ssh_cmd
)
from pytest_bdd import (
    given,
    scenario,
    then,
    when,
    parsers
)

localHome = os.path.expanduser('~')
dotsshPath = localHome + '/.ssh'
keyPath = localHome + '/.ssh/ui_test_id_rsa'

setup_ssh_agent()
if os.path.isdir(dotsshPath) is False:
    os.makedirs(dotsshPath)
if os.path.exists(keyPath) is False:
    create_key(keyPath)
add_ssh_key(keyPath)


@pytest.fixture(scope='module')
def ssh_key():
    ssh_key_file = open(f'{keyPath}.pub', 'r')
    return ssh_key_file.read().strip()


@scenario('features/NAS-T930.feature', 'Adding sshkey to a user and verify it works')
def test_adding_sshkey_to_a_user_and_verify_it_works(driver):
    """Adding sshkey to a user and verify it works."""


@given(parsers.parse('The browser is open navigate to "{nas_url}"'))
def the_browser_is_open_navigate_to_nas_url(driver, nas_url):
    """The browser is open navigate to "{nas_url}"."""
    global host
    host = nas_url
    if nas_url not in driver.current_url:
        driver.get(f"http://{nas_url}/ui/dashboard/")
        time.sleep(1)


@when(parsers.parse('If login page appear enter "{user}" and "{password}"'))
def if_login_page_appear_enter_root_and_password(driver, user, password):
    """If login page appear enter "{user}" and "{password}"."""
    if not is_element_present(driver, '//mat-list-item[@ix-auto="option__Dashboard"]'):
        assert wait_on_element(driver, 5, xpaths.login.user_input)
        driver.find_element_by_xpath(xpaths.login.user_input).clear()
        driver.find_element_by_xpath(xpaths.login.user_input).send_keys(user)
        driver.find_element_by_xpath(xpaths.login.password_input).clear()
        driver.find_element_by_xpath(xpaths.login.password_input).send_keys(password)
        assert wait_on_element(driver, 5, xpaths.login.signin_button)
        driver.find_element_by_xpath(xpaths.login.signin_button).click()
    else:
        assert wait_on_element(driver, 5, '//span[contains(.,"root")]')
        element = driver.find_element_by_xpath('//span[contains(.,"root")]')
        driver.execute_script("arguments[0].scrollIntoView();", element)
        assert wait_on_element(driver, 5, '//mat-list-item[@ix-auto="option__Dashboard"]')
        driver.find_element_by_xpath('//mat-list-item[@ix-auto="option__Dashboard"]').click()


@then('You should see the dashboard')
def you_should_see_the_dashboard(driver):
    """You should see the dashboard."""
    assert wait_on_element(driver, 7, '//a[text()="Dashboard"]')
    assert wait_on_element(driver, 5, xpaths.dashboard.system_information)


@then('Click on the Accounts, Click on Users')
def click_on_the_accounts_click_on_users(driver):
    """Click on the Accounts, Click on Users."""
    assert wait_on_element(driver, 5, xpaths.sideMenu.accounts, 'clickable')
    driver.find_element_by_xpath(xpaths.sideMenu.accounts).click()
    rsc.click_on_element(driver, xpaths.sideMenu.users)


@then('The Users page should open')
def the_users_page_should_open(driver):
    """The Users page should open."""
    assert wait_on_element(driver, 5, '//div[contains(.,"Users")]')


@then('On the right side of the table, click the Greater-Than-Sign for one of the users')
def on_the_right_side_of_the_table_click_the_greaterthansign_for_one_of_the_users(driver):
    """On the right side of the table, click the Greater-Than-Sign for one of the users."""
    assert wait_on_element(driver, 7, '//div[@id="ericbsd_Username"]')
    assert wait_on_element(driver, 7, '//a[@ix-auto="expander__ericbsd"]', 'clickable')
    driver.find_element_by_xpath('//a[@ix-auto="expander__ericbsd"]').click()


@then('The User Field should expand down to list further details')
def the_user_field_should_expand_down_to_list_further_details(driver):
    """The User Field should expand down to list further details."""
    assert wait_on_element(driver, 5, '//button[@ix-auto="button__EDIT_ericbsd"]')


@then('Click the Edit button that appears')
def click_the_edit_button_that_appears(driver):
    """Click the Edit button that appears."""
    driver.find_element_by_xpath('//button[@ix-auto="button__EDIT_ericbsd"]').click()


@then('The User Edit Page should open')
def the_user_edit_page_should_open(driver):
    """The User Edit Page should open."""
    assert wait_on_element(driver, 5, '//h4[contains(.,"Identification")]')
    time.sleep(1)


@then('In the SSH public Key field paste a public key and save the change')
def in_the_ssh_public_key_field_paste_a_public_key_and_save_the_change(driver, ssh_key):
    """In the SSH public Key field paste a public key and save the change."""
    assert wait_on_element(driver, 5, '//textarea[@placeholder="SSH Public Key"]', 'clickable')
    driver.find_element_by_xpath('//textarea[@placeholder="SSH Public Key"]').clear()
    driver.find_element_by_xpath('//textarea[@placeholder="SSH Public Key"]').send_keys(ssh_key)
    assert wait_on_element(driver, 5, '//button[@ix-auto="button__SAVE"]', 'clickable')
    driver.find_element_by_xpath('//button[@ix-auto="button__SAVE"]').click()


@then('Change should be saved')
def change_should_be_saved(driver):
    """Change should be saved."""
    assert wait_on_element(driver, 5, '//div[contains(.,"Users")]')
    assert wait_on_element(driver, 7, '//div[@id="ericbsd_Username"]')


@then('Reopen the user edit page and ensure that the key was saved')
def reopen_the_user_edit_page_and_ensure_that_the_key_was_saved(driver):
    """Reopen the user edit page and ensure that the key was saved."""
    assert wait_on_element(driver, 7, '//a[@ix-auto="expander__ericbsd"]', 'clickable')
    driver.find_element_by_xpath('//a[@ix-auto="expander__ericbsd"]').click()
    assert wait_on_element(driver, 5, '//button[@ix-auto="button__EDIT_ericbsd"]')
    driver.find_element_by_xpath('//button[@ix-auto="button__EDIT_ericbsd"]').click()
    assert wait_on_element(driver, 5, '//h4[contains(.,"Identification")]')
    time.sleep(1)


@then('Public key should be on user page')
def public_key_should_be_on_user_page(driver, ssh_key):
    """Public key should be on user page."""
    assert wait_on_element(driver, 5, '//textarea[@placeholder="SSH Public Key"]')
    assert attribute_value_exist(driver, '//textarea[@placeholder="SSH Public Key"]', 'value', ssh_key)


@then('Try to ssh in with your sshkey')
def try_to_ssh_in_with_your_sshkey(driver):
    """Try to ssh in with your sshkey."""
    cmd = 'ls -al'
    global results
    results = ssh_cmd(cmd, 'ericbsd', None, host)
    assert results['result'], results['output']


@then('You should be able to ssh the sshkey')
def you_should_be_able_to_ssh_the_sshkey(driver):
    """You should be able to ssh the sshkey."""
    assert results['result'], results['output']
    assert 'ssh' in results['output'], results['output']
