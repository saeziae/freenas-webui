# coding=utf-8
"""Core UI feature tests."""

import time
import reusableSeleniumCode as rsc
import xpaths
from function import (
    wait_on_element,
    is_element_present,
    wait_on_element_disappear
)
from pytest_bdd import (
    given,
    scenario,
    then,
    when,
    parsers
)


@scenario('features/NAS-T1128.feature', 'Verify Box credentials can be added')
def test_verify_box_credentials_can_be_added(driver):
    """Verify Box credentials can be added."""
    pass


@given('the browser is open on the TrueNAS URL and logged in')
def the_browser_is_open_on_the_truenas_url_and_logged_in(driver, nas_ip, root_password):
    """the browser is open on the TrueNAS URL and logged in."""
    if nas_ip not in driver.current_url:
        driver.get(f"http://{nas_ip}")
        assert wait_on_element(driver, 10, '//input[@placeholder="Username"]')
    if not is_element_present(driver, '//mat-list-item[@ix-auto="option__Dashboard"]'):
        assert wait_on_element(driver, 10, '//input[@placeholder="Username"]')
        driver.find_element_by_xpath('//input[@placeholder="Username"]').clear()
        driver.find_element_by_xpath('//input[@placeholder="Username"]').send_keys('root')
        driver.find_element_by_xpath('//input[@placeholder="Password"]').clear()
        driver.find_element_by_xpath('//input[@placeholder="Password"]').send_keys(root_password)
        assert wait_on_element(driver, 5, '//button[@name="signin_button"]')
        driver.find_element_by_xpath('//button[@name="signin_button"]').click()
    if not is_element_present(driver, '//li[contains(.,"Dashboard")]'):
        rsc.scroll_To(driver, xpaths.sideMenu.root)
        assert wait_on_element(driver, 5, '//mat-list-item[@ix-auto="option__Dashboard"]', 'clickable')
        driver.find_element_by_xpath('//mat-list-item[@ix-auto="option__Dashboard"]').click()


@when('on the dashboard, click System on the left sidebar, then click on Cloud Credentials')
def on_the_dashboard_click_system_on_the_left_sidebar_then_click_on_cloud_credentials(driver):
    """on the dashboard, click System on the left sidebar, then click on Cloud Credentials."""
    assert wait_on_element(driver, 10, '//li[contains(.,"Dashboard")]')
    assert wait_on_element(driver, 5, '//mat-list-item[@ix-auto="option__System"]', 'clickable')
    driver.find_element_by_xpath('//mat-list-item[@ix-auto="option__System"]').click()
    assert wait_on_element(driver, 5, '//mat-list-item[@ix-auto="option__Cloud Credentials"]', 'clickable')
    driver.find_element_by_xpath('//mat-list-item[@ix-auto="option__Cloud Credentials"]').click()


@then('on the Cloud Credentials page, click Add')
def on_the_cloud_credentials_page_click_add(driver):
    """on the Cloud Credentials page, click Add."""
    assert wait_on_element(driver, 5, '//div[contains(.,"Cloud Credentials")]')
    assert wait_on_element(driver, 5, '//button[@ix-auto="button__Cloud Credentials_ADD"]', 'clickable')
    driver.find_element_by_xpath('//button[@ix-auto="button__Cloud Credentials_ADD"]').click()


@then(parsers.parse('input {account_name} as Name, select Box has Provider'))
def input_account_name_as_name_select_box_has_provider(driver, account_name):
    """input account_name as Name, select Box has Provider."""
    assert wait_on_element(driver, 5, '//li[contains(.,"Add")]')
    assert wait_on_element(driver, 5, '//input[@placeholder="Name"]', 'inputable')
    driver.find_element_by_xpath('//input[@placeholder="Name"]').send_keys(account_name)
    assert wait_on_element(driver, 5, '//mat-select[@ix-auto="select__Provider"]', 'clickable')
    driver.find_element_by_xpath('//mat-select[@ix-auto="select__Provider"]').click()
    assert wait_on_element(driver, 5, '//mat-option[@ix-auto="option__Provider_Box"]', 'clickable')
    driver.find_element_by_xpath('//mat-option[@ix-auto="option__Provider_Box"]').click()


@then('click on Login to Provider Authorization box will appear')
def click_on_login_to_provider_authorization_box_will_appear(driver):
    """click on Login to Provider Authorization box will appear."""
    assert wait_on_element(driver, 5, '//button[@id="cust_button_LOGIN TO PROVIDER"]', 'clickable')
    driver.find_element_by_xpath('//button[@id="cust_button_LOGIN TO PROVIDER"]').click()
    driver.switch_to.window(driver.window_handles[1])
    assert wait_on_element(driver, 10, '//h1[text()="Authorization"]')


@then(parsers.parse('click Proceed, then enter the login "{user_name}" and "{password}"'))
def click_proceed_then_enter_the_login_user_name_and_password(driver, user_name, password):
    """click Proceed, then enter the login <user_name> and <password>."""
    assert wait_on_element(driver, 10, '//a[text()="Proceed"]', 'clickable')
    driver.find_element_by_xpath('//a[text()="Proceed"]').click()
    assert wait_on_element(driver, 10, '//img[@class="box_logo"]')
    assert wait_on_element(driver, 5, '//input[@placeholder="Email Address"]', 'inputable')
    driver.find_element_by_xpath('//input[@placeholder="Email Address"]').send_keys(user_name)
    driver.find_element_by_xpath('//input[@placeholder="Password"]').send_keys(password)
    assert wait_on_element(driver, 5, '//div[@class="login_submit_div"]', 'clickable')
    driver.find_element_by_xpath('//div[@class="login_submit_div"]').click()


@then('click Authorize and then click Grant Access to Box')
def click_authorize_and_then_click_grant_access_to_box(driver):
    """click Authorize and then click Grant Access to Box."""
    assert wait_on_element(driver, 5, xpaths.authorization.box_Auth_Message)
    assert wait_on_element(driver, 5, xpaths.authorization.Grant_Access_To_Box_Button, 'clickable')
    driver.find_element_by_xpath(xpaths.authorization.Grant_Access_To_Box_Button).click()
    assert rsc.wait_For_The_Tab_To_Close(driver) is True
    driver.switch_to.window(driver.window_handles[0])


@then('click Verify Credential to verify it is valid')
def click_verify_credential_to_verify_it_is_valid(driver):
    """click Verify Credential to verify it is valid."""
    assert wait_on_element(driver, 5, '//input[@placeholder="Access Token"]', 'inputable')
    element1 = driver.find_element_by_xpath('//input[@placeholder="Access Token"]')
    assert element1.get_attribute('value') != '', element1.get_attribute('value')
    element2 = driver.find_element_by_xpath('//input[@placeholder="OAuth Client ID"]')
    assert element2.get_attribute('value') != '', element2.get_attribute('value')
    element3 = driver.find_element_by_xpath('//input[@placeholder="OAuth Client Secret"]')
    assert element3.get_attribute('value') != '', element3.get_attribute('value')
    assert wait_on_element(driver, 5, '//button[@ix-auto="button__VERIFY CREDENTIAL"]', 'clickable')
    driver.find_element_by_xpath('//button[@ix-auto="button__VERIFY CREDENTIAL"]').click()
    if wait_on_element(driver, 5, '//h1[contains(.,"Please wait")]'):
        assert wait_on_element_disappear(driver, 20, '//h1[contains(.,"Please wait")]')
    assert wait_on_element(driver, 10, '//h1[normalize-space(text())="Valid"]')
    assert wait_on_element(driver, 10, '//textarea[text()="The Credential is valid."]')
    assert wait_on_element(driver, 5, '//button[@ix-auto="button__CLOSE"]', 'clickable')
    driver.find_element_by_xpath('//button[@ix-auto="button__CLOSE"]').click()


@then(parsers.parse('click Summit, {account_name} should be added to the list'))
def click_summit_account_name_should_be_added_to_the_list(driver, account_name):
    """click Summit, account_name should be added to the list."""
    rsc.click_The_Summit_Button(driver)
    assert wait_on_element_disappear(driver, 30, '//h1[contains(.,"Please wait")]')
    assert wait_on_element(driver, 5, f'//div[normalize-space(text())="{account_name}"]')
