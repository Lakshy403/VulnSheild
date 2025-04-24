import requests
import re
import nmap
import json
from bs4 import BeautifulSoup
import socket

from app.scanner.crawler import crawl_website
from app.scanner.vuln_checks import scan_js_xss  # if separated

# ------------------------- IP Extraction -------------------------

def extract_ip_from_url(url):
    hostname = url.split("//")[-1].split("/")[0].split('?')[0]
    try:
        ip = socket.gethostbyname(hostname)
        print(f"[+] Extracted IP from {hostname}: {ip}")
        return ip
    except Exception as e:
        print(f"[-] Failed to extract IP: {e}")
        return "127.0.0.1"

# ------------------------- Vulnerability Checks -------------------------

def scan_xss(url):
    payload = "<script>alert('XSS')</script>"
    test_url = f"{url}?q={payload}"
    try:
        response = requests.get(test_url)
        if payload in response.text:
            return "Vulnerable to XSS"
    except:
        pass
    return "No XSS detected"

def scan_sql_injection(url):
    payload = "' OR '1'='1"
    test_url = f"{url}?id={payload}"
    error_patterns = ["SQL syntax", "mysql_fetch", "SQL error", "you have an error in your sql"]
    try:
        response = requests.get(test_url)
        if any(re.search(pattern, response.text, re.IGNORECASE) for pattern in error_patterns):
            return "Vulnerable to SQL Injection"
    except:
        pass
    return "No SQL Injection detected"

def scan_lfi(url):
    payload = "../../../../../../../../etc/passwd"
    test_url = f"{url}?file={payload}"
    try:
        response = requests.get(test_url)
        if "root:x" in response.text:
            return "Vulnerable to LFI (Directory Traversal)"
    except:
        pass
    return "No LFI detected"

def scan_open_ports(ip):
    scanner = nmap.PortScanner()
    try:
        scanner.scan(ip, arguments='-F')
        return {
            port: scanner[ip]['tcp'][port]['name']
            for port in scanner[ip]['tcp']
            if scanner[ip]['tcp'][port]['state'] == 'open'
        }
    except:
        return {}

def check_weak_auth(url):
    passwords = ["123456", "admin", "password", "letmein"]
    for pwd in passwords:
        try:
            res = requests.post(url, data={"username": "admin", "password": pwd})
            if "incorrect" not in res.text.lower():
                return f"Weak password found: {pwd}"
        except:
            continue
    return "No weak passwords detected"

def fetch_cves(keyword):
    try:
        url = f"https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch={keyword}"
        headers = {"User-Agent": "Mozilla/5.0"}
        res = requests.get(url, headers=headers)
        if res.status_code == 200:
            cve_data = res.json()
            return [
                {
                    "CVE ID": item["cve"]["id"],
                    "Description": item["cve"]["descriptions"][0]["value"]
                }
                for item in cve_data.get("vulnerabilities", [])[:3]
            ]
    except:
        pass
    return []

# ------------------------- Main Scan Controller -------------------------

def run_full_scan(url, ip):
    # Auto-resolve IP if not provided
    if not ip or ip.strip() == "":
        ip = extract_ip_from_url(url)

    print(f"[+] Starting scan for {url} ({ip})")

    pages = crawl_website(url)
    print(f"[+] Discovered {len(pages)} pages.")

    xss_results = []
    js_xss_results = []
    sqli_results = []
    lfi_results = []

    for page in pages:
        try:
            xss_results.append({page: scan_xss(page)})
        except Exception as e:
            xss_results.append({page: f"XSS scan failed: {str(e)}"})

        try:
            js_xss_results.append({page: scan_js_xss(page)})
        except Exception as e:
            js_xss_results.append({page: f"JS-XSS scan failed: {str(e)}"})

        try:
            sqli_results.append({page: scan_sql_injection(page)})
        except Exception as e:
            sqli_results.append({page: f"SQLi scan failed: {str(e)}"})

        try:
            lfi_results.append({page: scan_lfi(page)})
        except Exception as e:
            lfi_results.append({page: f"LFI scan failed: {str(e)}"})

    try:
        ports = scan_open_ports(ip)
    except Exception as e:
        ports = f"Open port scan failed: {e}"

    try:
        weak_auth = check_weak_auth(url)
    except Exception as e:
        weak_auth = f"Weak auth check failed: {e}"

    results = {
        "XSS": xss_results,
        "JS-Based XSS": js_xss_results,
        "SQL Injection": sqli_results,
        "LFI": lfi_results,
        "Open Ports": {
            "Ports": ports,
        },
        "Weak Authentication": {
            "Status": weak_auth
        }
    }

    return results
