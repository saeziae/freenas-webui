# coding=utf-8
"""Core UI feature tests."""

import time
from selenium.webdriver import ActionChains
import reusableSeleniumCode as rsc
import xpaths
from function import (
    wait_on_element,
    is_element_present,
    wait_on_element_disappear,
    ssh_cmd
)
from pytest_bdd import (
    given,
    scenario,
    then,
    when,
    parsers
)


@scenario('features/NAS-T1132.feature', 'Verify Box Cloud Sync task works')
def test_verify_box_cloud_sync_task_works(driver):
    """Verify Box Cloud Sync task works."""
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


@when('on the dashboard, click on Storage on the side menu, click on Pools')
def on_the_dashboard_click_on_storage_on_the_side_menu_click_on_pools(driver):
    """on the dashboard, click on Storage on the side menu, click on Pools."""
    assert wait_on_element(driver, 10, '//li[contains(.,"Dashboard")]')
    assert wait_on_element(driver, 5, '//mat-list-item[@ix-auto="option__Storage"]', 'clickable')
    driver.find_element_by_xpath('//mat-list-item[@ix-auto="option__Storage"]').click()
    assert wait_on_element(driver, 5, '//mat-list-item[@ix-auto="option__Pools"]', 'clickable')
    driver.find_element_by_xpath('//mat-list-item[@ix-auto="option__Pools"]').click()


@then('click on the system pool three dots button, select Add Dataset')
def click_on_the_system_pool_three_dots_button_select_add_dataset(driver):
    """click on the system pool three dots button, select Add Dataset."""
    assert wait_on_element(driver, 5, '//div[contains(.,"Pools")]')
    assert wait_on_element(driver, 5, '//mat-icon[@id="actions_menu_button__system"]', 'clickable')
    driver.find_element_by_xpath('//mat-icon[@id="actions_menu_button__system"]').click()
    assert wait_on_element(driver, 7, '//div[@class="title" and contains(.,"Dataset Actions")]')
    assert wait_on_element(driver, 5, '//button[@ix-auto="action__system_Create Snapshot"]', 'clickable')
    assert wait_on_element(driver, 5, '//button[@ix-auto="action__system_Add Dataset"]', 'clickable')
    driver.find_element_by_xpath('//button[@ix-auto="action__system_Add Dataset"]').click()
    assert wait_on_element(driver, 5, '//h4[contains(.,"Name and Options")]')


@then('input box_cloud for Name, select Generic as Share Type, and click Submit')
def input_box_cloud_for_name_select_generic_as_share_type_and_click_submit(driver):
    """input box_cloud for Name, select Generic as Share Type, and click Submit."""
    assert wait_on_element(driver, 5, '//input[@ix-auto="input__Name"]', 'inputable')
    driver.find_element_by_xpath('//input[@ix-auto="input__Name"]').clear()
    driver.find_element_by_xpath('//input[@ix-auto="input__Name"]').send_keys('box_cloud')
    assert wait_on_element(driver, 5, '//mat-select[@ix-auto="select__Share Type"]', 'clickable')
    driver.find_element_by_xpath('//mat-select[@ix-auto="select__Share Type"]').click()
    assert wait_on_element(driver, 5, '//mat-option[@ix-auto="option__Share Type_Generic"]', 'clickable')
    driver.find_element_by_xpath('//mat-option[@ix-auto="option__Share Type_Generic"]').click()
    assert wait_on_element(driver, 5, xpaths.button.summit, 'clickable')
    rsc.click_The_Summit_Button(driver)


@then('the dataset should be created without error')
def the_dataset_should_be_created_without_error(driver):
    """the dataset should be created without error."""
    assert wait_on_element_disappear(driver, 30, '//h6[contains(.,"Please wait")]')
    assert wait_on_element(driver, 10, '//span[contains(.,"box_cloud")]')


@then('click Tasks on the left sidebar, then click on Cloud Sync Tasks')
def click_tasks_on_the_left_sidebar_then_click_on_cloud_sync_tasks(driver):
    """click Tasks on the left sidebar, then click on Cloud Sync Tasks."""
    assert wait_on_element(driver, 5, '//mat-list-item[@ix-auto="option__Tasks"]', 'clickable')
    driver.find_element_by_xpath('//mat-list-item[@ix-auto="option__Tasks"]').click()
    assert wait_on_element(driver, 5, '//mat-list-item[@ix-auto="option__Cloud Sync Tasks"]', 'clickable')
    driver.find_element_by_xpath('//mat-list-item[@ix-auto="option__Cloud Sync Tasks"]').click()


@then('on the Cloud Sync Tasks, click ADD')
def on_the_cloud_sync_tasks_click_add(driver):
    """on the Cloud Sync Tasks, click ADD."""
    assert wait_on_element(driver, 5, '//div[contains(.,"Cloud Sync Tasks")]')
    assert wait_on_element(driver, 5, '//button[@ix-auto="button__Cloud Sync Tasks_ADD"]', 'clickable')
    driver.find_element_by_xpath('//button[@ix-auto="button__Cloud Sync Tasks_ADD"]').click()


@then('input a description and ensure PULL is selected as the Direction')
def input_a_description_and_ensure_pull_is_selected_as_the_direction(driver):
    """input a description and ensure PULL is selected as the Direction."""
    assert wait_on_element(driver, 7, '//mat-checkbox[@ix-auto="checkbox__Follow Symlinks"]', 'clickable')
    assert wait_on_element(driver, 5, '//input[@placeholder="Description"]', 'inputable')
    driver.find_element_by_xpath('//input[@placeholder="Description"]').clear()
    driver.find_element_by_xpath('//input[@placeholder="Description"]').send_keys('My BOX Cloud task')
    assert wait_on_element(driver, 5, '//mat-select[contains(.,"PULL")]')


@then(parsers.parse('select "{selection}" under the Credential drop-down'))
def select_selection_under_the_credential_dropdown(driver, selection):
    """select "selection" under the Credential drop-down."""
    assert wait_on_element(driver, 5, '//mat-select[@ix-auto="select__Credential"]', 'clickable')
    driver.find_element_by_xpath('//mat-select[@ix-auto="select__Credential"]').click()
    assert wait_on_element(driver, 5, f'//mat-option[@ix-auto="option__Credential_{selection}"]', 'clickable')
    driver.find_element_by_xpath(f'//mat-option[@ix-auto="option__Credential_{selection}"]').click()
    time.sleep(0.5)


@then(parsers.parse('select {path} folder, then Under Directory/Files, choose box_cloud'))
def select_the_path_folder_then_under_directoryfiles_choose_box_cloud(driver, path):
    """select {path} folder, then Under Directory/Files, choose box_cloud."""
    assert wait_on_element(driver, 5, '//input[@placeholder="Folder"]')
    driver.find_element_by_xpath('//input[@placeholder="Folder"]').clear()
    driver.find_element_by_xpath('//input[@placeholder="Folder"]').send_keys(path)
    assert wait_on_element(driver, 5, '//input[@placeholder="Directory/Files"]')
    driver.find_element_by_xpath('//input[@placeholder="Directory/Files"]').clear()
    driver.find_element_by_xpath('//input[@placeholder="Directory/Files"]').send_keys('/mnt/system/box_cloud')


@then('under Transfer Mode, select COPY, click Save')
def under_transfer_mode_select_copy_click_save(driver):
    """under Transfer Mode, select COPY, click Save."""
    assert wait_on_element(driver, 5, '//mat-select[contains(.,"COPY")]')
    assert wait_on_element(driver, 5, xpaths.button.summit, 'clickable')
    rsc.click_The_Summit_Button(driver)
    assert wait_on_element_disappear(driver, 30, '//h6[contains(.,"Please wait")]')


@then('the Box tasks should save without error')
def the_box_tasks_should_save_without_error(driver):
    """the Box tasks should save without error."""
    assert wait_on_element(driver, 7, '//div[contains(.,"Cloud Sync Tasks")]')
    assert wait_on_element(driver, 10, '//div[contains(text(),"My BOX Cloud task")]')


@then('expand the task on the NAS UI and click Run Now')
def expand_the_task_on_the_nas_ui_and_click_run_now(driver):
    """expand the task on the NAS UI and click Run Now."""
    assert wait_on_element(driver, 5, '//a[@ix-auto="expander__My BOX Cloud task"]', 'clickable')
    driver.find_element_by_xpath('//a[@ix-auto="expander__My BOX Cloud task"]').click()
    time.sleep(0.5)
    assert wait_on_element(driver, 5, '//button[@id="action_button___run_now"]', 'clickable')
    driver.find_element_by_xpath('//button[@id="action_button___run_now"]').click()
    assert wait_on_element(driver, 5, '//h1[text()="Run Now"]')
    assert wait_on_element(driver, 5, '//button[@ix-auto="button__CONTINUE"]', 'clickable')
    driver.find_element_by_xpath('//button[@ix-auto="button__CONTINUE"]').click()
    assert wait_on_element(driver, 7, '//h1[contains(text(),"Task Started")]')
    assert wait_on_element(driver, 5, '//button[@ix-auto="button__CLOSE"]', 'clickable')
    driver.find_element_by_xpath('//button[@ix-auto="button__CLOSE"]').click()
    assert wait_on_element_disappear(driver, 30, '//h1[contains(text(),"Task Started")]')
    time.sleep(1)
    assert wait_on_element(driver, 180, '//button[@id="My BOX Cloud task_Status-button" and contains(.,"SUCCESS")]')


@then('verify all files are copied from Box are into the dataset')
def verify_all_files_are_copied_from_box_are_into_the_dataset(driver, nas_ip):
    """verify all files are copied from Box are into the dataset."""
    cmd = 'test -f /mnt/system/box_cloud/music/Mr_Smith_Pequeñas_Guitarras.mp3'
    timeout = time.time() + 30
    while timeout > time.time():
        if ssh_cmd(cmd, 'root', 'testing', nas_ip)['result']:
            break
    cmd = 'test -f /mnt/system/box_cloud/Gloomy_Forest_wallpaper_ForWallpapercom.jpg'
    results = ssh_cmd(cmd, 'root', 'testing', nas_ip)
    assert results['result'] is True, results['output']
    cmd = 'test -f /mnt/system/box_cloud/Explaining_BSD.pdf'
    results = ssh_cmd(cmd, 'root', 'testing', nas_ip)
    assert results['result'] is True, results['output']
    cmd = 'test -f /mnt/system/box_cloud/music/Mr_Smith_Pequeñas_Guitarras.mp3'
    results = ssh_cmd(cmd, 'root', 'testing', nas_ip)
    assert results['result'] is True, results['output']


@then('on the NAS cloud sync task tab, click Edit')
def on_the_nas_cloud_sync_task_tab_click_edit(driver):
    """on the NAS cloud sync task tab, click Edit."""
    driver.switch_to.window(driver.window_handles[0])
    assert wait_on_element(driver, 7, '//div[contains(.,"Cloud Sync Tasks")]')
    assert wait_on_element(driver, 10, '//div[contains(text(),"My BOX Cloud task")]')
    time.sleep(1)
    assert wait_on_element(driver, 5, '//a[@ix-auto="expander__My BOX Cloud task"]', 'clickable')
    if not wait_on_element(driver, 2, '//button[@ix-auto="button___edit"]'):
        driver.find_element_by_xpath('//a[@ix-auto="expander__My BOX Cloud task"]').click()
    assert wait_on_element(driver, 7, '//p[contains(text(),"boxcredentials")]')
    assert wait_on_element(driver, 7, '//button[@ix-auto="button___edit"]')
    time.sleep(2)
    assert wait_on_element(driver, 5, '//button[@ix-auto="button___edit"]', 'clickable')
    driver.find_element_by_xpath('//button[@ix-auto="button___edit"]').click()
    assert wait_on_element(driver, 7, '//h4[contains(.,"Transfer")]')
    assert wait_on_element(driver, 5, '//h4[contains(.,"Advanced Options")]')
    time.sleep(1)


@then('select PUSH as the Direction then under Transfer Mode, select COPY')
def select_push_as_the_direction_then_under_transfer_mode_select_copy(driver):
    """select PUSH as the Direction then under Transfer Mode, select COPY."""
    assert wait_on_element(driver, 7, '//mat-checkbox[@ix-auto="checkbox__Follow Symlinks"]', 'clickable')
    assert wait_on_element(driver, 5, '//mat-select[contains(.,"PULL")]')
    assert wait_on_element(driver, 5, '//mat-select[contains(.,"COPY")]')
    assert wait_on_element(driver, 5, '//mat-select[@ix-auto="select__Direction"]', 'clickable')
    driver.find_element_by_xpath('//mat-select[@ix-auto="select__Direction"]').click()
    assert wait_on_element(driver, 5, '//mat-option[@ix-auto="option__Direction_PUSH"]', 'clickable')
    driver.find_element_by_xpath('//mat-option[@ix-auto="option__Direction_PUSH"]').click()
    assert wait_on_element(driver, 5, '//mat-select[contains(.,"PUSH")]')
    assert wait_on_element(driver, 5, '//mat-select[contains(.,"COPY")]')


@then(parsers.parse('select the {path} folder, and click save'))
def select_the_path_folder_and_click_save(driver, path):
    """select the {path} folder, and click save."""
    assert wait_on_element(driver, 5, '//input[@placeholder="Folder"]', 'inputable')
    driver.find_element_by_xpath('//input[@placeholder="Folder"]').clear()
    driver.find_element_by_xpath('//input[@placeholder="Folder"]').send_keys(path)
    assert wait_on_element(driver, 5, '//button[@id="save_button"]', 'clickable')
    driver.find_element_by_xpath('//button[@id="save_button"]').click()
    assert wait_on_element_disappear(driver, 30, '//h1[contains(.,"Please wait")]')
    # give time to the system to handle changes
    time.sleep(2)


@then(parsers.parse('open a new tab navigate to "{box_url}"'))
def open_a_new_tab_navigate_to_box_url_and_input_account_id(driver, box_url):
    """open a new tab navigate to <box_url> and input <account_id>."""
    driver.execute_script("window.open();")
    driver.switch_to.window(driver.window_handles[1])
    driver.get(box_url)
    assert wait_on_element(driver, 5, '//h1[text()="Sign In to Your Account"]')


@then(parsers.parse('input "{user_name}" and "{password}", click Sign in'))
def input_user_name_and_password_click_sign_in(driver, user_name, password):
    """input <user_name> and <password>, click Sign in."""
    assert wait_on_element(driver, 5, '//input[@id="login-email"]', 'inputable')
    driver.find_element_by_xpath('//input[@id="login-email"]').send_keys(user_name)
    assert wait_on_element(driver, 5, '//button[@id="login-submit"]', 'clickable')
    driver.find_element_by_xpath('//button[@id="login-submit"]').click()
    assert wait_on_element(driver, 5, '//span[text()="Password"]')
    assert wait_on_element(driver, 5, '//input[@id="password-login"]', 'inputable')
    driver.find_element_by_xpath('//input[@id="password-login"]').send_keys(password)
    assert wait_on_element(driver, 5, '//button[@id="login-submit-password"]', 'clickable')
    driver.find_element_by_xpath('//button[@id="login-submit-password"]').click()
    assert wait_on_element(driver, 15, '//h1[text()="All Files"]')
    time.sleep(1)


@then(parsers.parse('click on {folder1} then click on the test folder'))
def click_on_folder1_then_click_on_the_test_folder(driver, folder1):
    """click on {folder1} then click on the test folder."""
    assert wait_on_element(driver, 5, f'//a[text()="{folder1}"]', 'clickable')
    driver.find_element_by_xpath(f'//a[text()="{folder1}"]').click()
    assert wait_on_element(driver, 5, f'//h1[text()="{folder1}"]')
    time.sleep(1)
    assert wait_on_element(driver, 5, '//a[text()="test"]', 'clickable')
    driver.find_element_by_xpath('//a[text()="test"]').click()
    time.sleep(1)


@then('verify all files are in the test folder')
def verify_all_files_are_in_the_test_folder(driver):
    """verify all files are in the test folder."""
    assert wait_on_element(driver, 7, '//h1[text()="test"]')
    assert wait_on_element(driver, 5, '//a[text()="Explaining_BSD.pdf"]', 'clickable')
    assert wait_on_element(driver, 5, '//a[text()="Gloomy_Forest_wallpaper_ForWallpapercom.jpg"]', 'clickable')
    assert wait_on_element(driver, 5, '//a[text()="music"]', 'clickable')
    driver.find_element_by_xpath('//a[text()="music"]').click()
    assert wait_on_element(driver, 5, '//h1[text()="music"]')
    assert wait_on_element(driver, 5, '//a[text()="Mr_Smith_Pequeñas_Guitarras.mp3"]', 'clickable')
    driver.find_element_by_xpath('//a[text()="test"]').click()


@then('remove all files from the dataset')
def remove_all_files_from_the_dataset(driver, nas_ip):
    """remove all files from the dataset."""
    cmd = 'rm -f /mnt/system/box_cloud/Gloomy_Forest_wallpaper_ForWallpapercom.jpg'
    results = ssh_cmd(cmd, 'root', 'testing', nas_ip)
    assert results['result'] is True, results['output']
    cmd = 'rm -f /mnt/system/box_cloud/Explaining_BSD.pdf'
    results = ssh_cmd(cmd, 'root', 'testing', nas_ip)
    assert results['result'] is True, results['output']
    cmd = 'rm -rf /mnt/system/box_cloud/music'
    results = ssh_cmd(cmd, 'root', 'testing', nas_ip)
    assert results['result'] is True, results['output']


@then('select PULL as the Direction then under Transfer Mode, select MOVE')
def select_pull_as_the_direction_then_under_transfer_mode_select_move(driver):
    """select PULL as the Direction then under Transfer Mode, select MOVE."""
    assert wait_on_element(driver, 7, '//mat-checkbox[@ix-auto="checkbox__Follow Symlinks"]', 'clickable')
    assert wait_on_element(driver, 5, '//mat-select[contains(.,"PUSH")]')
    assert wait_on_element(driver, 5, '//mat-select[contains(.,"COPY")]')
    assert wait_on_element(driver, 5, '//mat-select[@ix-auto="select__Direction"]', 'clickable')
    driver.find_element_by_xpath('//mat-select[@ix-auto="select__Direction"]').click()
    assert wait_on_element(driver, 5, '//mat-option[@ix-auto="option__Direction_PULL"]', 'clickable')
    driver.find_element_by_xpath('//mat-option[@ix-auto="option__Direction_PULL"]').click()
    assert wait_on_element(driver, 5, '//mat-select[contains(.,"PULL")]')
    driver.find_element_by_xpath('//mat-select[@ix-auto="select__Transfer Mode"]').click()
    assert wait_on_element(driver, 5, '//mat-option[@ix-auto="option__Transfer Mode_MOVE"]', 'clickable')
    driver.find_element_by_xpath('//mat-option[@ix-auto="option__Transfer Mode_MOVE"]').click()
    assert wait_on_element(driver, 5, '//mat-select[contains(.,"MOVE")]')


@then('click Save, the Box tasks should save without error')
def click_save_the_box_tasks_should_save_without_error(driver):
    """click Save, the Box tasks should save without error."""
    assert wait_on_element(driver, 5, '//button[@id="save_button"]', 'clickable')
    driver.find_element_by_xpath('//button[@id="save_button"]').click()
    assert wait_on_element_disappear(driver, 30, '//h6[contains(.,"Please wait")]')
    assert wait_on_element(driver, 7, '//div[contains(.,"Cloud Sync Tasks")]')
    assert wait_on_element(driver, 10, '//div[contains(text(),"My BOX Cloud task")]')
    # give time to the system to handle changes
    time.sleep(2)


@then('verify all files are moved from the Box test folder to the dataset')
def verify_all_files_are_moved_from_the_box_test_folder_to_the_dataset(driver, nas_ip):
    """verify all files are moved from the Box test folder to the dataset."""
    cmd = 'test -f /mnt/system/box_cloud/music/Mr_Smith_Pequeñas_Guitarras.mp3'
    timeout = time.time() + 30
    while timeout > time.time():
        if ssh_cmd(cmd, 'root', 'testing', nas_ip)['result']:
            break
    cmd = 'test -f /mnt/system/box_cloud/Gloomy_Forest_wallpaper_ForWallpapercom.jpg'
    results = ssh_cmd(cmd, 'root', 'testing', nas_ip)
    assert results['result'] is True, results['output']
    cmd = 'test -f /mnt/system/box_cloud/Explaining_BSD.pdf'
    results = ssh_cmd(cmd, 'root', 'testing', nas_ip)
    assert results['result'] is True, results['output']
    cmd = 'test -f /mnt/system/box_cloud/music/Mr_Smith_Pequeñas_Guitarras.mp3'
    results = ssh_cmd(cmd, 'root', 'testing', nas_ip)
    assert results['result'] is True, results['output']
    driver.switch_to.window(driver.window_handles[1])
    time.sleep(1)
    driver.refresh()
    time.sleep(1)
    assert wait_on_element(driver, 7, '//h1[text()="test"]')
    assert wait_on_element(driver, 5, '//a[text()="music"]', 'clickable')
    assert wait_on_element_disappear(driver, 10, '//a[text()="Explaining_BSD.pdf"]')
    assert not is_element_present(driver, '//a[text()="Explaining_BSD.pdf"]')
    assert not is_element_present(driver, '//a[text()="Gloomy_Forest_wallpaper_ForWallpapercom.jpg"]')
    driver.find_element_by_xpath('//a[text()="music"]').click()
    assert wait_on_element(driver, 5, '//h1[text()="music"]')
    assert not is_element_present(driver, '//a[text()="Mr_Smith_Pequeñas_Guitarras.mp3"]')
    driver.find_element_by_xpath('//a[text()="test"]').click()


@then('select PUSH as the Direction then under Transfer Mode, select MOVE')
def select_push_as_the_direction_then_under_transfer_mode_select_move(driver):
    """select PUSH as the Direction then under Transfer Mode, select MOVE."""
    assert wait_on_element(driver, 7, '//mat-checkbox[@ix-auto="checkbox__Follow Symlinks"]', 'clickable')
    assert wait_on_element(driver, 5, '//mat-select[contains(.,"PULL")]')
    assert wait_on_element(driver, 5, '//mat-select[contains(.,"MOVE")]')
    assert wait_on_element(driver, 5, '//mat-select[@ix-auto="select__Direction"]', 'clickable')
    driver.find_element_by_xpath('//mat-select[@ix-auto="select__Direction"]').click()
    assert wait_on_element(driver, 5, '//mat-option[@ix-auto="option__Direction_PUSH"]', 'clickable')
    driver.find_element_by_xpath('//mat-option[@ix-auto="option__Direction_PUSH"]').click()
    assert wait_on_element(driver, 5, '//mat-select[contains(.,"PUSH")]')
    assert wait_on_element(driver, 5, '//h1[contains(.,"Transfer Mode Reset")]')
    assert wait_on_element(driver, 5, '//button[@ix-auto="button__CLOSE"]', 'clickable')
    driver.find_element_by_xpath('//button[@ix-auto="button__CLOSE"]').click()
    assert wait_on_element(driver, 5, '//mat-select[contains(.,"COPY")]')
    assert wait_on_element(driver, 5, '//mat-select[@ix-auto="select__Transfer Mode"]', 'clickable')
    driver.find_element_by_xpath('//mat-select[@ix-auto="select__Transfer Mode"]').click()
    assert wait_on_element(driver, 5, '//mat-option[@ix-auto="option__Transfer Mode_MOVE"]', 'clickable')
    driver.find_element_by_xpath('//mat-option[@ix-auto="option__Transfer Mode_MOVE"]').click()
    assert wait_on_element(driver, 5, '//mat-select[contains(.,"MOVE")]')


@then('verify all files are moved from the dataset to the Box test folder')
def verify_all_files_are_moved_from_the_dataset_to_the_box_test_folder(driver, nas_ip):
    """verify all files are moved from the dataset to the Box test folder."""
    cmd = 'test -f /mnt/system/box_cloud/music/Mr_Smith_Pequeñas_Guitarras.mp3'
    timeout = time.time() + 30
    while timeout > time.time():
        if not ssh_cmd(cmd, 'root', 'testing', nas_ip)['result']:
            break
    cmd = 'test -f /mnt/system/box_cloud/Gloomy_Forest_wallpaper_ForWallpapercom.jpg'
    results = ssh_cmd(cmd, 'root', 'testing', nas_ip)
    assert results['result'] is False, results['output']
    cmd = 'test -f /mnt/system/box_cloud/Explaining_BSD.pdf'
    results = ssh_cmd(cmd, 'root', 'testing', nas_ip)
    assert results['result'] is False, results['output']
    cmd = 'test -f /mnt/system/box_cloud/music/Mr_Smith_Pequeñas_Guitarras.mp3'
    results = ssh_cmd(cmd, 'root', 'testing', nas_ip)
    assert results['result'] is False, results['output']
    driver.switch_to.window(driver.window_handles[1])
    time.sleep(1)
    driver.refresh()
    assert wait_on_element(driver, 5, '//h1[text()="test"]')
    assert wait_on_element(driver, 5, '//a[text()="Explaining_BSD.pdf"]', 'clickable')
    assert wait_on_element(driver, 5, '//a[text()="Gloomy_Forest_wallpaper_ForWallpapercom.jpg"]', 'clickable')
    assert wait_on_element(driver, 5, '//a[text()="music"]', 'clickable')
    driver.find_element_by_xpath('//a[text()="music"]').click()
    assert wait_on_element(driver, 5, '//h1[text()="music"]')
    assert wait_on_element(driver, 5, '//a[text()="Mr_Smith_Pequeñas_Guitarras.mp3"]', 'clickable')
    driver.find_element_by_xpath('//a[text()="test"]').click()


@then('select PULL as the Direction then under Transfer Mode, select SYNC')
def select_pull_as_the_direction_then_under_transfer_mode_select_sync(driver):
    """select PULL as the Direction then under Transfer Mode, select SYNC."""
    assert wait_on_element(driver, 7, '//mat-checkbox[@ix-auto="checkbox__Follow Symlinks"]', 'clickable')
    assert wait_on_element(driver, 5, '//mat-select[contains(.,"PUSH")]')
    assert wait_on_element(driver, 5, '//mat-select[contains(.,"MOVE")]')
    assert wait_on_element(driver, 5, '//mat-select[@ix-auto="select__Direction"]', 'clickable')
    driver.find_element_by_xpath('//mat-select[@ix-auto="select__Direction"]').click()
    assert wait_on_element(driver, 5, '//mat-option[@ix-auto="option__Direction_PULL"]', 'clickable')
    driver.find_element_by_xpath('//mat-option[@ix-auto="option__Direction_PULL"]').click()
    assert wait_on_element(driver, 5, '//mat-select[contains(.,"PULL")]')
    assert wait_on_element(driver, 5, '//h1[contains(.,"Transfer Mode Reset")]')
    assert wait_on_element(driver, 5, '//button[@ix-auto="button__CLOSE"]', 'clickable')
    driver.find_element_by_xpath('//button[@ix-auto="button__CLOSE"]').click()
    assert wait_on_element(driver, 5, '//mat-select[contains(.,"COPY")]')
    assert wait_on_element(driver, 5, '//mat-select[@ix-auto="select__Transfer Mode"]', 'clickable')
    driver.find_element_by_xpath('//mat-select[@ix-auto="select__Transfer Mode"]').click()
    assert wait_on_element(driver, 5, '//mat-option[@ix-auto="option__Transfer Mode_SYNC"]', 'clickable')
    driver.find_element_by_xpath('//mat-option[@ix-auto="option__Transfer Mode_SYNC"]').click()
    assert wait_on_element(driver, 5, '//mat-select[contains(.,"SYNC")]')


@then('verify all files are sync to the dataset folder')
def verify_all_files_are_sync_to_the_dataset_folder(driver, nas_ip):
    """verify all files are sync to the dataset folder."""
    cmd = 'test -f /mnt/system/box_cloud/music/Mr_Smith_Pequeñas_Guitarras.mp3'
    timeout = time.time() + 30
    while timeout > time.time():
        if ssh_cmd(cmd, 'root', 'testing', nas_ip)['result']:
            break
    cmd = 'test -f /mnt/system/box_cloud/Gloomy_Forest_wallpaper_ForWallpapercom.jpg'
    results = ssh_cmd(cmd, 'root', 'testing', nas_ip)
    assert results['result'] is True, results['output']
    cmd = 'test -f /mnt/system/box_cloud/Explaining_BSD.pdf'
    results = ssh_cmd(cmd, 'root', 'testing', nas_ip)
    assert results['result'] is True, results['output']
    cmd = 'test -f /mnt/system/box_cloud/music/Mr_Smith_Pequeñas_Guitarras.mp3'
    results = ssh_cmd(cmd, 'root', 'testing', nas_ip)
    assert results['result'] is True, results['output']


@then('on the Box test folder tab, delete one file')
def on_the_box_test_folder_tab_delete_one_file(driver):
    """on the Box test folder tab, delete one file."""
    driver.switch_to.window(driver.window_handles[1])
    time.sleep(1)
    driver.refresh()
    time.sleep(1)
    assert wait_on_element(driver, 7, '//h1[text()="test"]')
    assert wait_on_element(driver, 7, '//a[text()="music"]', 'clickable')
    assert wait_on_element(driver, 5, '//a[text()="Explaining_BSD.pdf"]', 'clickable')
    assert wait_on_element(driver, 5, '//a[text()="Gloomy_Forest_wallpaper_ForWallpapercom.jpg"]', 'clickable')
    action = ActionChains(driver)
    action.move_to_element(driver.find_element_by_xpath('//a[text()="Gloomy_Forest_wallpaper_ForWallpapercom.jpg"]')).perform()
    action.context_click().perform()
    assert wait_on_element(driver, 5, '//li[@class="menu-item TrashMenuItem" and contains(.,"Trash")]', 'clickable')
    driver.find_element_by_xpath('//li[@class="menu-item TrashMenuItem" and contains(.,"Trash")]').click()
    assert wait_on_element(driver, 5, '//h2[contains(.,"Delete Item")]')
    time.sleep(1)
    assert wait_on_element(driver, 5, '//button[@data-resin-target="primarybutton"]', 'clickable')
    driver.find_element_by_xpath('//button[@data-resin-target="primarybutton"]').click()
    assert wait_on_element_disappear(driver, 7, '//a[text()="Gloomy_Forest_wallpaper_ForWallpapercom.jpg"]')


@then('on the NAS cloud sync task tab, click Run Now')
def on_the_nas_cloud_sync_task_tab_click_run_now(driver):
    """on the NAS cloud sync task tab, click Run Now."""
    driver.switch_to.window(driver.window_handles[0])
    assert wait_on_element(driver, 7, '//div[contains(.,"Cloud Sync Tasks")]')
    assert wait_on_element(driver, 10, '//div[contains(text(),"My BOX Cloud task")]')
    assert wait_on_element(driver, 5, '//a[@ix-auto="expander__My BOX Cloud task"]', 'clickable')
    time.sleep(0.5)
    assert wait_on_element(driver, 5, '//button[@id="action_button___run_now"]', 'clickable')
    driver.find_element_by_xpath('//button[@id="action_button___run_now"]').click()
    assert wait_on_element(driver, 5, '//h1[text()="Run Now"]')
    assert wait_on_element(driver, 5, '//button[@ix-auto="button__CONTINUE"]', 'clickable')
    driver.find_element_by_xpath('//button[@ix-auto="button__CONTINUE"]').click()
    assert wait_on_element(driver, 7, '//h1[contains(text(),"Task Started")]')
    assert wait_on_element(driver, 5, '//button[@ix-auto="button__CLOSE"]', 'clickable')
    driver.find_element_by_xpath('//button[@ix-auto="button__CLOSE"]').click()
    assert wait_on_element_disappear(driver, 30, '//h1[contains(text(),"Task Started")]')
    time.sleep(1)
    assert wait_on_element(driver, 180, '//button[@id="My BOX Cloud task_Status-button" and contains(.,"SUCCESS")]')
    # give time to the system to be ready.


@then('verify the file is removed from the dataset folder')
def verify_the_file_is_removed_from_the_dataset_folder(driver, nas_ip):
    """verify the file is removed from the dataset folder."""
    cmd = 'test -f /mnt/system/box_cloud/Gloomy_Forest_wallpaper_ForWallpapercom.jpg'
    timeout = time.time() + 30
    while timeout > time.time():
        if not ssh_cmd(cmd, 'root', 'testing', nas_ip)['result']:
            break
    cmd = 'test -f /mnt/system/box_cloud/Gloomy_Forest_wallpaper_ForWallpapercom.jpg'
    results = ssh_cmd(cmd, 'root', 'testing', nas_ip)
    assert results['result'] is False, results['output']
    cmd = 'test -f /mnt/system/box_cloud/Explaining_BSD.pdf'
    results = ssh_cmd(cmd, 'root', 'testing', nas_ip)
    assert results['result'] is True, results['output']
    cmd = 'test -f /mnt/system/box_cloud/music/Mr_Smith_Pequeñas_Guitarras.mp3'
    results = ssh_cmd(cmd, 'root', 'testing', nas_ip)
    assert results['result'] is True, results['output']


@then('on the Box test folder tab, delete all file')
def on_the_box_test_folder_tab_delete_all_file(driver):
    """on the Box test folder tab, delete all file."""
    driver.switch_to.window(driver.window_handles[1])
    time.sleep(1)
    assert wait_on_element(driver, 5, '//h1[text()="test"]')
    action = ActionChains(driver)
    assert wait_on_element(driver, 5, '//a[text()="music"]')
    action.move_to_element(driver.find_element_by_xpath('//a[text()="music"]')).perform()
    action.context_click().perform()
    assert wait_on_element(driver, 5, '//li[@class="menu-item TrashMenuItem" and contains(.,"Trash")]', 'clickable')
    driver.find_element_by_xpath('//li[@class="menu-item TrashMenuItem" and contains(.,"Trash")]').click()
    assert wait_on_element(driver, 5, '//h2[contains(.,"Delete Item")]')
    assert wait_on_element(driver, 5, '//button[@data-resin-target="primarybutton"]', 'clickable')
    driver.find_element_by_xpath('//button[@data-resin-target="primarybutton"]').click()
    assert wait_on_element_disappear(driver, 5, '//a[text()="music"]')
    action = ActionChains(driver)
    assert wait_on_element(driver, 5, '//a[text()="Explaining_BSD.pdf"]')
    action.move_to_element(driver.find_element_by_xpath('//a[text()="Explaining_BSD.pdf"]')).perform()
    action.context_click().perform()
    assert wait_on_element(driver, 5, '//li[@class="menu-item TrashMenuItem" and contains(.,"Trash")]', 'clickable')
    driver.find_element_by_xpath('//li[@class="menu-item TrashMenuItem" and contains(.,"Trash")]').click()
    assert wait_on_element(driver, 5, '//h2[contains(.,"Delete Item")]')
    assert wait_on_element(driver, 5, '//button[@data-resin-target="primarybutton"]', 'clickable')
    driver.find_element_by_xpath('//button[@data-resin-target="primarybutton"]').click()
    assert wait_on_element_disappear(driver, 5, '//a[text()="Explaining_BSD.pdf"]')


@then('select PUSH as the Direction then under Transfer Mode, select SYNC')
def select_push_as_the_direction_then_under_transfer_mode_select_sync(driver):
    """select PUSH as the Direction then under Transfer Mode, select SYNC."""
    assert wait_on_element(driver, 7, '//mat-checkbox[@ix-auto="checkbox__Follow Symlinks"]', 'clickable')
    assert wait_on_element(driver, 5, '//mat-select[contains(.,"PULL")]')
    assert wait_on_element(driver, 5, '//mat-select[contains(.,"SYNC")]')
    assert wait_on_element(driver, 5, '//mat-select[@ix-auto="select__Direction"]', 'clickable')
    driver.find_element_by_xpath('//mat-select[@ix-auto="select__Direction"]').click()
    assert wait_on_element(driver, 5, '//mat-option[@ix-auto="option__Direction_PUSH"]', 'clickable')
    driver.find_element_by_xpath('//mat-option[@ix-auto="option__Direction_PUSH"]').click()
    assert wait_on_element(driver, 5, '//mat-select[contains(.,"PUSH")]')
    assert wait_on_element(driver, 5, '//h1[contains(.,"Transfer Mode Reset")]')
    assert wait_on_element(driver, 5, '//button[@ix-auto="button__CLOSE"]', 'clickable')
    driver.find_element_by_xpath('//button[@ix-auto="button__CLOSE"]').click()
    assert wait_on_element(driver, 5, '//mat-select[contains(.,"COPY")]')
    assert wait_on_element(driver, 5, '//mat-select[@ix-auto="select__Transfer Mode"]', 'clickable')
    driver.find_element_by_xpath('//mat-select[@ix-auto="select__Transfer Mode"]').click()
    assert wait_on_element(driver, 5, '//mat-option[@ix-auto="option__Transfer Mode_SYNC"]', 'clickable')
    driver.find_element_by_xpath('//mat-option[@ix-auto="option__Transfer Mode_SYNC"]').click()
    assert wait_on_element(driver, 5, '//mat-select[contains(.,"SYNC")]')


@then('verify all files are sync to the Box test folder tab')
def verify_all_files_are_sync_to_the_Box_test_folder_tab(driver):
    """verify all files are sync to the Box test folder tab."""
    driver.switch_to.window(driver.window_handles[1])
    time.sleep(1)
    driver.refresh()
    assert wait_on_element(driver, 5, '//h1[text()="test"]')
    assert wait_on_element(driver, 5, '//a[text()="Explaining_BSD.pdf"]', 'clickable')
    assert wait_on_element(driver, 5, '//a[text()="music"]', 'clickable')
    driver.find_element_by_xpath('//a[text()="music"]').click()
    assert wait_on_element(driver, 5, '//h1[text()="music"]')
    assert wait_on_element(driver, 5, '//a[text()="Mr_Smith_Pequeñas_Guitarras.mp3"]', 'clickable')
    driver.find_element_by_xpath('//a[text()="test"]').click()


@then('on the dataset folder, delete a file')
def on_the_dataset_folder_delete_a_file(driver, nas_ip):
    """on the dataset folder, delete a file."""
    cmd = 'rm -rf /mnt/system/box_cloud/music'
    results = ssh_cmd(cmd, 'root', 'testing', nas_ip)
    assert results['result'] is True, results['output']


@then('verify the file is removed from the Box test folder tab')
def verify_the_file_is_removed_from_the_box_test_folder_tab(driver):
    """verify the file is removed from the Box test folder tab."""
    driver.switch_to.window(driver.window_handles[1])
    time.sleep(1)
    # loop for 15 second or until music disappear
    timeout = time.time() + 15
    while timeout > time.time():
        driver.refresh()
        time.sleep(1)
        assert wait_on_element(driver, 5, '//h1[text()="test"]')
        assert wait_on_element(driver, 5, '//a[text()="Explaining_BSD.pdf"]', 'clickable')
        if not is_element_present(driver, '//a[text()="music"]'):
            assert not is_element_present(driver, '//a[text()="music"]')
            break
    else:
        assert not is_element_present(driver, '//a[text()="music"]')
    # clean the test folder on box tab before closing the tab.
    action = ActionChains(driver)
    assert wait_on_element(driver, 5, '//a[text()="Explaining_BSD.pdf"]')
    action.move_to_element(driver.find_element_by_xpath('//a[text()="Explaining_BSD.pdf"]')).perform()
    action.context_click().perform()
    assert wait_on_element(driver, 5, '//li[@class="menu-item TrashMenuItem" and contains(.,"Trash")]', 'clickable')
    driver.find_element_by_xpath('//li[@class="menu-item TrashMenuItem" and contains(.,"Trash")]').click()
    assert wait_on_element(driver, 5, '//h2[contains(.,"Delete Item")]')
    assert wait_on_element(driver, 5, '//button[@data-resin-target="primarybutton"]', 'clickable')
    driver.find_element_by_xpath('//button[@data-resin-target="primarybutton"]').click()
    assert wait_on_element_disappear(driver, 5, '//a[text()="Explaining_BSD.pdf"]')
    driver.close()
    driver.switch_to.window(driver.window_handles[0])
