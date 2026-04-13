import urllib.request
import json
import xml.etree.ElementTree as ET
import os
import subprocess
import socket
import math
import time
import random
import threading
from datetime import datetime
from flask import Flask, send_from_directory, request, jsonify
from werkzeug.utils import secure_filename

import mimetypes
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('image/svg+xml', '.svg')

# Create absolute paths that systemd cannot mess up
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DIST_DIR = os.path.join(BASE_DIR, 'dist')
WALLPAPER_DIR = os.path.join(BASE_DIR, 'wallpapers')
MPD_MUSIC_DIR = '/var/lib/mpd/music'
os.makedirs(WALLPAPER_DIR, exist_ok=True)

# Tell Flask exactly where the UI lives
app = Flask(__name__, static_folder=DIST_DIR, static_url_path='/')

SHORTCUTS_FILE = '/opt/dashboard/shortcuts.json'
UPLOAD_FOLDER = '/opt/dashboard/uploads'
last_cpu_total = 0
last_cpu_idle = 0

# Ensure directories exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# --- MATH: ISS DISTANCE CALCULATION ---
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in kilometers
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat/2) * math.sin(dLat/2) + math.cos(math.radians(lat1)) \
        * math.cos(math.radians(lat2)) * math.sin(dLon/2) * math.sin(dLon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return int(R * c)

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response


# --- REACT FRONTEND ROUTING ---
@app.route('/')
def serve_frontend():
    return send_from_directory(app.static_folder, 'index.html')

# Explicitly map the Vite assets folder
@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory(os.path.join(app.static_folder, 'assets'), filename)

@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, 'index.html')

# Serve uploaded wallpapers to the frontend
@app.route('/uploads/<filename>')
def serve_uploads(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# --- AUDIO UPLINK (EDIFIER BLUETOOTH) ---

@app.route('/api/bluetooth/status')
def bt_status():
    try:
        # Ask bluetoothctl what is currently connected
        res = subprocess.run(['bluetoothctl', 'info'], capture_output=True, text=True)
        if "Missing device address" in res.stdout or not res.stdout.strip():
            return jsonify({"status": "success", "state": "IDLE", "device_name": None})

        name = None
        for line in res.stdout.split('\n'):
            if "Name:" in line:
                name = line.split("Name:")[1].strip()
        return jsonify({"status": "success", "state": "CONNECTED", "device_name": name})
    except:
        return jsonify({"status": "error", "state": "OFFLINE"})

@app.route('/api/bluetooth/scan')
def bt_scan():
    try:
        # Force the Bluetooth radio to scan for exactly 5 seconds, then stop
        subprocess.run(['bluetoothctl', '--timeout', '5', 'scan', 'on'])
        res = subprocess.run(['bluetoothctl', 'devices'], capture_output=True, text=True)
        devices = []
        for line in res.stdout.split('\n'):
            if line.startswith('Device '):
                parts = line.split(' ', 2)
                if len(parts) >= 3:
                    devices.append({"mac": parts[1], "name": parts[2]})
        return jsonify({"status": "success", "devices": devices})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/bluetooth/connect', methods=['POST'])
def bt_connect():
    try:
        mac = request.json.get('mac')

        # 1. Attempt to pair (fails silently and safely if already paired)
        subprocess.run(['bluetoothctl', 'pair', mac], capture_output=True)
        # 2. Trust the device for auto-routing
        subprocess.run(['bluetoothctl', 'trust', mac], capture_output=True)
        # 3. Connect to the device
        res = subprocess.run(['bluetoothctl', 'connect', mac], capture_output=True, text=True)

        # Look for 'successful' in lowercase!
        if "successful" in res.stdout.lower():
            # Kick the music player so it instantly recognizes the new audio sink
            subprocess.run(['systemctl', 'restart', 'mpd'])
            return jsonify({"status": "success"})

        return jsonify({"status": "error", "message": "Connection refused by device."}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/media/status', methods=['GET'])
def media_status():
    try:
        result = subprocess.run(['mpc', 'status'], capture_output=True, text=True)
        lines = result.stdout.split('\n')

        status = {
            "track": "No track playing",
            "state": "stopped",
            "volume": "100%"
        }

        if len(lines) > 0 and lines[0]:
            if "volume:" not in lines[0]:
                status["track"] = lines[0]
                if "[playing]" in result.stdout:
                    status["state"] = "playing"
                elif "[paused]" in result.stdout:
                    status["state"] = "paused"

        return jsonify(status)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/media/toggle', methods=['POST'])
def media_toggle():
    subprocess.run(['mpc', 'toggle'])
    return jsonify({"status": "success"})

@app.route('/api/media/playlist', methods=['GET'])
def get_playlist():
    try:
        # 'mpc playlist' gets the currently active queue
        result = subprocess.run(['mpc', 'playlist'], capture_output=True, text=True)
        tracks = [line for line in result.stdout.split('\n') if line.strip()]
        return jsonify({'status': 'success', 'playlist': tracks})
    except Exception as e:
        return jsonify({'status': 'error', 'playlist': []})

@app.route('/api/media/play_index', methods=['POST'])
def media_play_index():
    try:
        idx = request.json.get('index')
        # mpc play uses a 1-based index (e.g., track 1, track 2)
        subprocess.run(['mpc', 'play', str(idx)])
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/media/upload', methods=['POST'])
def upload_media():
    try: # Wrapping the ENTIRE route to catch raw crashes
        if 'files' not in request.files:
            return jsonify({'status': 'error', 'message': 'No files detected'}), 400

        files = request.files.getlist('files')
        if not files or files[0].filename == '':
            return jsonify({'status': 'error', 'message': 'Empty filename or no files'}), 400

        clear_queue = request.form.get('clearQueue') == 'true'
        safe_filenames = []

        for file in files:
            if file:
                # Sanitize the filename without relying on external werkzeug imports
                safe_filename = file.filename.replace(" ", "_").replace("..", "")
                save_path = os.path.join(MPD_MUSIC_DIR, safe_filename)

                # 1. Save the file
                file.save(save_path)

                # 2. SHIELD DROP: Force the file to be readable by the 'mpd' background daemon
                os.chmod(save_path, 0o644)
                
                safe_filenames.append(safe_filename)

        # 3. Trigger the database update ONCE for the batch
        subprocess.run(['mpc', 'update'], check=False)

        # 4. Dynamic Sleep for Pi 1 bottleneck
        time.sleep(max(3.0, len(files) * 0.5))

        # 5. Queue Management
        if clear_queue:
            subprocess.run(['mpc', 'clear'], check=False)
            for safe_filename in safe_filenames:
                try:
                    subprocess.run(['mpc', 'add', safe_filename], check=True)
                except subprocess.CalledProcessError:
                    pass
            subprocess.run(['mpc', 'play'], check=False)
        else:
            for safe_filename in safe_filenames:
                try:
                    subprocess.run(['mpc', 'add', safe_filename], check=True)
                except subprocess.CalledProcessError:
                    pass

        return jsonify({'status': 'success', 'filenames': safe_filenames})

    except Exception as e:
        # This will print the EXACT reason it crashed in your Raspberry Pi terminal!
        print(f"\n[!!!] UPLOAD CRASHED: {str(e)}\n")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/media/next', methods=['POST'])
def media_next():
    subprocess.run(['mpc', 'next'])
    return jsonify({"status": "success"})

@app.route('/api/media/library', methods=['GET'])
def media_library():
    try:
        # Get all files in the music directory recursively
        result = subprocess.run(['mpc', 'listall'], capture_output=True, text=True)
        files = [line for line in result.stdout.split('\n') if line.strip()]
        return jsonify({'status': 'success', 'library': files})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/media/playlists', methods=['GET'])
def media_playlists():
    try:
        result = subprocess.run(['mpc', 'lsplaylists'], capture_output=True, text=True)
        playlists = [line for line in result.stdout.split('\n') if line.strip()]
        return jsonify({'status': 'success', 'playlists': playlists})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/media/playlists/load', methods=['POST'])
def media_playlists_load():
    try:
        name = request.json.get('name')
        if not name:
            return jsonify({'status': 'error', 'message': 'No playlist name provided'}), 400

        subprocess.run(['mpc', 'clear'], check=True)
        time.sleep(1.0) # Buffer for Pi 1
        subprocess.run(['mpc', 'load', name], check=True)
        time.sleep(1.0) # Buffer for Pi 1
        subprocess.run(['mpc', 'play'], check=True)

        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/media/playlists/save', methods=['POST'])
def media_playlists_save():
    try:
        name = request.json.get('name')
        if not name:
            return jsonify({'status': 'error', 'message': 'No playlist name provided'}), 400

        # Remove existing playlist if it exists to overwrite
        subprocess.run(['mpc', 'rm', name], check=False)
        time.sleep(0.5)

        subprocess.run(['mpc', 'save', name], check=True)
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/media/queue/add', methods=['POST'])
def media_queue_add():
    try:
        filename = request.json.get('filename')
        if not filename:
            return jsonify({'status': 'error', 'message': 'No filename provided'}), 400

        subprocess.run(['mpc', 'add', filename], check=True)
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/media/queue/clear', methods=['POST'])
def media_queue_clear():
    try:
        subprocess.run(['mpc', 'clear'], check=True)
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/media/delete', methods=['POST'])
def media_delete():
    try:
        filename = request.json.get('filename')
        if not filename:
            return jsonify({'status': 'error', 'message': 'No filename provided'}), 400

        safe_filename = filename.replace(" ", "_").replace("..", "")
        file_path = os.path.join(MPD_MUSIC_DIR, safe_filename)

        if os.path.exists(file_path):
            os.remove(file_path)

        subprocess.run(['mpc', 'update'], check=False)
        time.sleep(1.5)

        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# --- SYSTEM HARDWARE ---
@app.route('/api/stats')
def system_stats():
    global last_cpu_total, last_cpu_idle
    try:
        # CPU PERCENTAGE
        with open('/proc/stat', 'r') as f:
            cpu_line = f.readline().split()
        cpu_times = [float(x) for x in cpu_line[1:]]
        idle = cpu_times[3] + cpu_times[4]
        total = sum(cpu_times)
        delta_total = total - last_cpu_total
        delta_idle = idle - last_cpu_idle
        cpu_percent = 0
        if last_cpu_total > 0 and delta_total > 0:
            cpu_percent = int(100 * (delta_total - delta_idle) / delta_total)
        last_cpu_total = total
        last_cpu_idle = idle

        # RAM USAGE
        with open('/proc/meminfo', 'r') as f:
            lines = f.readlines()
            total_ram = free = buffers = cached = 0
            for line in lines:
                if 'MemTotal:' in line: total_ram = int(line.split()[1])
                elif 'MemFree:' in line: free = int(line.split()[1])
                elif 'Buffers:' in line: buffers = int(line.split()[1])
                elif 'Cached:' in line: cached = int(line.split()[1])
        used = total_ram - free - buffers - cached
        ram_percent = int((used / total_ram) * 100) if total_ram > 0 else 0

        # THERMAL CORE
        temp_c = 0.0
        try:
            with open('/sys/class/thermal/thermal_zone0/temp', 'r') as f:
                temp_c = int(f.read()) / 1000.0
        except:
            pass

        return jsonify({
            "status": "success", "cpu_percent": cpu_percent,
            "ram_percent": ram_percent, "ram_used_mb": used // 1024,
            "ram_total_mb": total_ram // 1024, "temp_c": round(temp_c, 1)
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/system/control', methods=['POST'])
def system_control():
    data = request.get_json()
    action = data.get('action')

    try:
        if action == 'reboot':
            subprocess.Popen(['reboot'])
            return jsonify({"status": "success", "message": "Initiating reboot sequence..."})
        elif action == 'shutdown':
            subprocess.Popen(['poweroff'])
            return jsonify({"status": "success", "message": "System powering down..."})
        elif action == 'commit':
            # DietPi writes directly to SD, so we just force a filesystem sync
            subprocess.run(['sync'], check=True)
            return jsonify({"status": "success", "message": "Filesystem synced to SD card."})
        elif action == 'update':
            # Switched to Debian 'apt'
            subprocess.run(['apt', 'update'], check=True)
            subprocess.run(['apt', 'upgrade', '-y'], check=True)
            return jsonify({"status": "success", "message": "System packages updated."})
        else:
            return jsonify({"status": "error", "message": "Unknown directive."}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": f"Execution failed: {str(e)}"}), 500

@app.route('/api/commit', methods=['POST'])
def commit_rom():
    try:
        subprocess.run(["sync"], check=True)
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error"}), 500

# --- NETWORK & DATA ---
@app.route('/api/radar')
def radar():
    targets = [
        {"name": "ROUTER_GATEWAY", "ip": "192.168.51.1", "port": 80},
        {"name": "GLOBAL_DNS", "ip": "8.8.8.8", "port": 53},
        {"name": "GITHUB_UPLINK", "ip": "github.com", "port": 443}
    ]
    results = []
    for t in targets:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex((t["ip"], t["port"]))
            sock.close()
            results.append({"name": t["name"], "status": "ONLINE" if result == 0 else "OFFLINE"})
        except:
            results.append({"name": t["name"], "status": "ERR_FAIL"})
    return jsonify({"status": "success", "targets": results})

@app.route('/api/network/scan')
def network_scan():
    try:
        result = subprocess.run(['arp', '-a'], capture_output=True, text=True)
        devices = []
        for line in result.stdout.split('\n'):
            if line.strip():
                parts = line.split()
                if len(parts) >= 4:
                    name = parts[0]
                    ip = parts[1].strip('()')
                    mac = parts[3]
                    if mac != '<incomplete>':
                        devices.append({"name": name, "ip": ip, "mac": mac})
        return jsonify({"status": "success", "devices": devices})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/iss')
def iss():
    try:
        req = urllib.request.Request("http://api.open-notify.org/iss-now.json", headers={'User-Agent': 'Pi-Dash'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            iss_lat = float(data['iss_position']['latitude'])
            iss_lon = float(data['iss_position']['longitude'])
            dist = haversine(49.0629, 33.4042, iss_lat, iss_lon)
            return jsonify({"status": "success", "lat": iss_lat, "lon": iss_lon, "distance": dist})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/lore')
def lore():
    lore_file = '/opt/dashboard/lore.json'
    try:
        with open(lore_file, 'r') as f:
            quotes = json.load(f)
        return jsonify({"status": "success", "quote": random.choice(quotes)})
    except Exception as e:
        return jsonify({"status": "error", "message": "ERR_ARCHIVE_NOT_FOUND"}), 500

@app.route('/api/shortcuts', methods=['GET', 'POST'])
def handle_shortcuts():
    if request.method == 'POST':
        data = request.json
        if isinstance(data, list):
            shortcuts_data = data
        else:
            shortcuts_data = []
            if os.path.exists(SHORTCUTS_FILE):
                with open(SHORTCUTS_FILE, 'r') as f:
                    try: shortcuts_data = json.load(f)
                    except: pass
            shortcuts_data.append({"name": data.get("name"), "url": data.get("url")})
        with open(SHORTCUTS_FILE, 'w') as f: json.dump(shortcuts_data, f)
        return jsonify({"status": "success"})
    else:
        if os.path.exists(SHORTCUTS_FILE):
            with open(SHORTCUTS_FILE, 'r') as f:
                try: return jsonify({"status": "success", "shortcuts": json.load(f)})
                except: pass
        return jsonify({"status": "success", "shortcuts": []})

@app.route('/api/wallpapers', methods=['GET'])
def list_wallpapers():
    try:
        files = [f for f in os.listdir(WALLPAPER_DIR) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp'))]
        return jsonify({"status": "success", "wallpapers": files})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/wallpapers/upload', methods=['POST'])
def upload_wallpaper():
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file detected."}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"status": "error", "message": "Empty filename."}), 400
    try:
        # Sanitize filename to prevent Linux pathing errors
        safe_name = file.filename.replace(" ", "_")
        file.save(os.path.join(WALLPAPER_DIR, safe_name))
        return jsonify({"status": "success", "filename": safe_name})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/wallpapers/view/<path:filename>')
def serve_wallpaper(filename):
    return send_from_directory(WALLPAPER_DIR, filename)

@app.route('/api/weather')
def weather():
    url = "https://api.open-meteo.com/v1/forecast?latitude=49.0629&longitude=33.4042&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,surface_pressure&daily=precipitation_probability_max&timezone=Europe%2FKyiv&forecast_days=1"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Pi-Dashboard/1.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            current = data.get('current', {})
            daily = data.get('daily', {})
            precip_prob = daily.get('precipitation_probability_max', [0])[0]

            return jsonify({
                "status": "success",
                "temp": current.get('temperature_2m'),
                "feels_like": current.get('apparent_temperature'),
                "humidity": current.get('relative_humidity_2m'),
                "wind": current.get('wind_speed_10m'),
                "pressure": current.get('surface_pressure'),
                "precip_chance": precip_prob
            })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/news')
def news():
    feeds = [
        {"tag": "TECH", "url": "https://www.theverge.com/rss/index.xml"},
        {"tag": "UKR", "url": "https://www.pravda.com.ua/eng/rss/"},
        {"tag": "MEDIA", "url": "https://www.cbr.com/feed/"}
    ]
    news_items = []
    for feed in feeds:
        try:
            req = urllib.request.Request(feed["url"], headers={'User-Agent': 'Pi-Dashboard/1.0'})
            with urllib.request.urlopen(req, timeout=5) as response:
                tree = ET.parse(response)
                root = tree.getroot()
                for elem in root.iter(): elem.tag = elem.tag.split('}')[-1]
                items = root.findall('.//item')
                if not items: items = root.findall('.//entry')
                for item in items[:2]:
                    title = item.find('title').text
                    link_node = item.find('link')
                    link = link_node.text if link_node.text and link_node.text.strip() else link_node.attrib.get('href', '#')
                    news_items.append({"title": f"[{feed['tag']}] {title}", "link": link})
        except Exception: news_items.append({"title": f"[{feed['tag']}] ERR_FEED_OFFLINE", "link": "#"})
    return jsonify({"status": "success", "articles": news_items})

@app.route('/api/debug/mpd')
def debug_mpd():
    try:
        diag = {}
        diag['ls_music'] = subprocess.run(['ls', '-la', MPD_MUSIC_DIR], capture_output=True, text=True).stdout
        diag['mpc_status'] = subprocess.run(['mpc', 'status'], capture_output=True, text=True).stdout
        diag['mpc_listall'] = subprocess.run(['mpc', 'listall'], capture_output=True, text=True).stdout
        diag['mpd_conf'] = subprocess.run(['grep', 'music_directory', '/etc/mpd.conf'], capture_output=True, text=True).stdout
        diag['mpd_user'] = subprocess.run(['ps', '-o', 'user', '-p', subprocess.run(['pgrep', 'mpd'], capture_output=True, text=True).stdout.strip()], capture_output=True, text=True).stdout if subprocess.run(['pgrep', 'mpd'], capture_output=True, text=True).stdout.strip() else "mpd not running"
        return jsonify(diag)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/calendar')
def calendar():
    ics_url = "INSERT_YOUR_SECRET_ICS_LINK_HERE"

    if ics_url == "YOUR_SECRET_ICS_LINK_HERE":
        return jsonify({"status": "error", "message": "ERR_NO_ICS_LINK"}), 500

    try:
        req = urllib.request.Request(ics_url, headers={'User-Agent': 'Pi-Dashboard/1.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            lines = response.read().decode('utf-8').splitlines()

        events = []
        seen_fingerprints = set()
        current_event = {}

        for line in lines:
            if line.startswith('BEGIN:VEVENT'):
                current_event = {}
            elif line.startswith('END:VEVENT'):
                if 'summary' in current_event and 'sort' in current_event:
                    fingerprint = current_event['sort'] + current_event['summary']
                    if fingerprint not in seen_fingerprints:
                        seen_fingerprints.add(fingerprint)
                        events.append(current_event)

            elif line.startswith('SUMMARY:'):
                current_event['summary'] = line.split(':', 1)[1]
            elif line.startswith('DTSTART'):
                val = line.split(':', 1)[1].replace('Z', '')
                clean = ''.join(filter(str.isdigit, val))
                try:
                    if len(clean) >= 14:
                        current_event['display'] = f"{clean[6:8]}/{clean[4:6]} {clean[8:10]}:{clean[10:12]}"
                        current_event['sort'] = clean[:14]
                    elif len(clean) >= 8:
                        current_event['display'] = f"{clean[6:8]}/{clean[4:6]} [ALL DAY]"
                        current_event['sort'] = clean[:8] + "000000"
                except: pass

        now_sort = datetime.now().strftime("%Y%m%d%H%M%S")
        upcoming = [e for e in events if e.get('sort', '') >= now_sort[:8]]
        upcoming.sort(key=lambda x: x['sort'])

        return jsonify({"status": "success", "events": upcoming[:6]})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/sync')
def master_sync():
    # 1. Get System Stats
    stats_data = system_stats().get_json()

    # 2. Get Audio Status
    try:
        media_result = subprocess.run(['mpc', 'status'], capture_output=True, text=True)
        lines = media_result.stdout.split('\n')
        media_data = {"track": "No track playing", "state": "stopped", "volume": "100%"}
        if len(lines) > 0 and lines[0] and "volume:" not in lines[0]:
            media_data["track"] = lines[0]
            if "[playing]" in media_result.stdout: media_data["state"] = "playing"
            elif "[paused]" in media_result.stdout: media_data["state"] = "paused"
    except:
        media_data = {"track": "ERR_LINK_SEVERED", "state": "offline", "volume": "0%"}

    # 3. Get Network Radar (Quick Arp Scan)
    try:
        net_result = subprocess.run(['arp', '-a'], capture_output=True, text=True)
        devices = []
        for line in net_result.stdout.split('\n'):
            if line.strip():
                parts = line.split()
                if len(parts) >= 4 and parts[3] != '<incomplete>':
                    devices.append({"name": parts[0], "ip": parts[1].strip('()'), "mac": parts[3]})
    except:
        devices = []

    # Return the unified payload
    return jsonify({
        "status": "success",
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "hardware": stats_data,
        "audio": media_data,
        "network": devices
    })

def initialize_mpd():
    # The Pi 1 Boot Buffer: Give the OS 20 seconds to fully start the mpd daemon
    time.sleep(20.0)
    
    # Update & Indexing Buffer: Update the library and give the slow CPU 10s to index
    subprocess.run(['mpc', 'update'], check=False)
    time.sleep(10.0)
    
    # Queue Restoration: Check current playlist and populate if empty
    result = subprocess.run(['mpc', 'playlist'], capture_output=True, text=True)
    if not result.stdout.strip():
        subprocess.run('mpc listall | mpc add', shell=True, check=False)

# Execute the initialization in the background so Flask can boot immediately
threading.Thread(target=initialize_mpd, daemon=True).start()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
