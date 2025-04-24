from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time


def scan_js_xss(url):
    payload = "<script>alert('XSS')</script>"
    test_url = f"{url}?input={payload}"

    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--log-level=3")  # suppress logs

    driver = webdriver.Chrome(executable_path="C:/Users/Laksh/CODES/VulnSheild/chromedriver.exe", options=options)

    try:
        driver.get(test_url)
        time.sleep(2)  # wait for JS to execute

        # Check if alert is triggered (mocked)
        if payload in driver.page_source:
            return "Potential JS-based XSS detected"
    except Exception as e:
        return f"Selenium XSS check failed: {e}"
    finally:
        driver.quit()

    return "No JS-based XSS detected"
