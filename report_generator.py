import json
import pdfkit
import os

def generate_pdf_report(data):
    html_content = f"""
    <html>
    <head><title>Scan Report</title></head>
    <body style="font-family: Arial;">
    <h1>VulnShield - Web Vulnerability Scan Report</h1>
    <pre>{json.dumps(data, indent=4)}</pre>
    </body>
    </html>
    """

    with open("report.html", "w", encoding="utf-8") as f:
        f.write(html_content)

    config = pdfkit.configuration(wkhtmltopdf=r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe")  # Adjust if needed
    output_path = "scan_report.pdf"
    pdfkit.from_file("report.html", output_path, configuration=config)
    return output_path
