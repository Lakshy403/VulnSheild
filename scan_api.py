from fastapi import APIRouter, Body, Form, Request
from datetime import datetime
from fastapi.responses import JSONResponse
import json
from fastapi.responses import FileResponse
from app.scanner.core import run_full_scan
from app.utils.report_generator import generate_pdf_report
from app.scanner.network_scan import scan_lab_network
import os
from app.scanner.network_scan import discover_lab_devices

router = APIRouter()


@router.get("/discover-hosts")
def get_all_hosts(subnet: str = "192.168.1.0/24"):
    return discover_lab_devices(subnet)

@router.post("/system-info")
def receive_system_info(data: dict = Body(...)):
    # Save to JSON file or a DB later
    computer_name = data.get("ComputerName", f"unknown_{datetime.now().isoformat()}")
    file_path = f"logs/{computer_name}.json"

    os.makedirs("logs", exist_ok=True)
    with open(file_path, "w") as f:
        json.dump(data, f, indent=4)

    return {"status": "received", "computer": computer_name}

@router.get("/system-info/list")
def get_all_system_info():
    logs_dir = "logs"
    if not os.path.exists(logs_dir):
        return []

    info_list = []
    for file in os.listdir(logs_dir):
        if file.endswith(".json"):
            with open(os.path.join(logs_dir, file)) as f:
                try:
                    data = json.load(f)
                    info_list.append(data)
                except:
                    continue
    return JSONResponse(content=info_list)

@router.get("/scan-network")
def scan_network(subnet: str = "192.168.1.0/24"):
    results = scan_lab_network(subnet)
    return results

@router.post("/report/pdf")
def generate_pdf(scan_data: dict):
    pdf_path = generate_pdf_report(scan_data)
    return FileResponse(pdf_path, media_type='application/pdf', filename='scan_report.pdf')


@router.post("/scan")
def scan_website(url: str = Form(...), ip: str = Form(...)):
    results = run_full_scan(url, ip)
    return results
