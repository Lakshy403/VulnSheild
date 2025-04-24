import nmap

def scan_lab_network(subnet='192.168.1.0/24'):
    scanner = nmap.PortScanner()
    scanner.scan(hosts=subnet, arguments='-sV -T4')
    scan_results = {}

    for host in scanner.all_hosts():
        host_info = {
            'status': scanner[host].state(),
            'hostnames': scanner[host].hostname(),
            'ports': {}
        }
        for proto in scanner[host].all_protocols():
            ports = scanner[host][proto].keys()
            for port in ports:
                service = scanner[host][proto][port]
                host_info['ports'][port] = {
                    'state': service['state'],
                    'name': service['name'],
                    'version': service.get('version', ''),
                    'product': service.get('product', '')
                }
        scan_results[host] = host_info
    return scan_results

def discover_lab_devices(subnet='192.168.1.0/24'):
    scanner = nmap.PortScanner()
    print(f"[+] Scanning subnet: {subnet}")
    scanner.scan(hosts=subnet, arguments='-sn')  # Ping scan only (no ports)

    live_hosts = []
    for host in scanner.all_hosts():
        if scanner[host].state() == "up":
            live_hosts.append({
                "ip": host,
                "hostname": scanner[host].hostname()
            })

    return live_hosts