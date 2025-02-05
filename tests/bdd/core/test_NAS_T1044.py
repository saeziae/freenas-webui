# coding=utf-8
"""CORE feature tests."""

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
    when
)


@scenario('features/NAS-T1044.feature', 'Verify you can Delete a user')
def test_verify_you_can_delete_a_user(driver):
    """Verify you can Delete a user."""
    pass


@given('the browser is open on the TrueNAS URL and logged in')
def the_browser_is_open_on_the_truenas_url_and_logged_in(driver, nas_ip, root_password):
    """the browser is open on the TrueNAS URL and logged in."""
    if nas_ip not in driver.current_url:
        driver.get(f"http://{nas_ip}")
        assert wait_on_element(driver, 10, '//input[@placeholder="Username"]')
        time.sleep(1)
    if not is_element_present(driver, '//mat-list-item[@ix-auto="option__Dashboard"]'):
        assert wait_on_element(driver, 10, '//input[@placeholder="Username"]')
        driver.find_element_by_xpath('//input[@placeholder="Username"]').clear()
        driver.find_element_by_xpath('//input[@placeholder="Username"]').send_keys('root')
        driver.find_element_by_xpath('//input[@placeholder="Password"]').clear()
        driver.find_element_by_xpath('//input[@placeholder="Password"]').send_keys(root_password)
        assert wait_on_element(driver, 4, '//button[@name="signin_button"]')
        driver.find_element_by_xpath('//button[@name="signin_button"]').click()
    if not is_element_present(driver, '//li[contains(.,"Dashboard")]'):
        rsc.scroll_To(driver, xpaths.sideMenu.root)
        assert wait_on_element(driver, 7, '//mat-list-item[@ix-auto="option__Dashboard"]', 'clickable')
        driver.find_element_by_xpath('//mat-list-item[@ix-auto="option__Dashboard"]').click()


@when('you are on the dashboard')
def you_are_on_the_dashboard(driver):
    """you are on the dashboard."""
    assert wait_on_element(driver, 10, '//li[contains(.,"Dashboard")]')
    assert wait_on_element(driver, 10, '//span[contains(.,"System Information")]')


@then('click on the Accounts on the side menu, click on Users')
def click_on_the_accounts_on_the_side_menu_click_on_users(driver):
    """click on the Accounts on the side menu, click on Users."""
    driver.find_element_by_xpath(xpaths.sideMenu.accounts).click()
    assert wait_on_element(driver, 7, '//mat-list-item[@ix-auto="option__Users"]')
    element = driver.find_element_by_xpath(xpaths.sideMenu.accounts)
    class_attribute = element.get_attribute('class')
    assert 'open' in class_attribute, class_attribute
    rsc.click_on_element(driver, xpaths.sideMenu.users)


@then('on the Users page, click the foo user right arrow')
def on_the_users_page_click_the_foo_user_right_arrow(driver):
    """on the Users page, click the foo user right arrow."""
    assert wait_on_element(driver, 7, '//div[contains(.,"Users")]')
    assert wait_on_element(driver, 7, '//a[@ix-auto="expander__foo"]', 'clickable')
    driver.find_element_by_xpath('//a[@ix-auto="expander__foo"]').click()


@then('when the user field expand down, click the Delete button')
def when_the_user_field_expand_down_click_the_delete_button(driver):
    """when the user field expand down, click the Delete button."""
    assert wait_on_element(driver, 7, '//button[@ix-auto="button__DELETE_foo"]', 'clickable')
    driver.find_element_by_xpath('//button[@ix-auto="button__DELETE_foo"]').click()


@then('on the dialog box, Confirm deletion and click Delete')
def on_the_dialog_box_confirm_deletion_and_click_delete(driver):
    """on the dialog box, Confirm deletion and click Delete."""
    assert wait_on_element(driver, 7, '//h1[contains(.,"Delete User")]')
    assert wait_on_element(driver, 7, '//mat-checkbox[@ix-auto="checkbox__Delete user primary group foo"]', 'clickable')
    driver.find_element_by_xpath('//mat-checkbox[@ix-auto="checkbox__Delete user primary group foo"]').click()
    driver.find_element_by_xpath('//mat-checkbox[@ix-auto="checkbox__CONFIRM"]').click()
    assert wait_on_element(driver, 7, '//button[@ix-auto="button__DELETE"]', 'clickable')
    driver.find_element_by_xpath('//button[@ix-auto="button__DELETE"]').click()


@then('the foo user should be removed from the user account list')
def the_foo_user_should_be_removed_from_the_user_account_list(driver):
    """the foo user should be removed from the user account list."""
    assert wait_on_element_disappear(driver, 10, '//h6[contains(.,"Please wait")]')
    assert wait_on_element(driver, 7, '//div[contains(.,"Users")]')
    assert is_element_present(driver, '//div[@ix-auto="value__foo_Username"]') is False
