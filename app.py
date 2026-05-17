import threading
import schedule
import time
import json
import os
import sys
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from datetime import datetime
import pystray
from PIL import Image, ImageDraw
from plyer import notification

# ── Đường dẫn lưu config ──────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(BASE_DIR, "config.json")

DEFAULT_CONFIG = {
    "medicine": {"enabled": True,  "time": "08:00"},
    "water":    {"enabled": True,  "time": "10:00", "interval_hours": 2},
    "walk":     {"enabled": True,  "time_morning": "08:30", "time_afternoon": "17:30"},
    "startup":  False,
    "stats": {
        "date": "",
        "medicine_taken": False,
        "water_count": 0,
        "walk_morning_completed": False,
        "walk_afternoon_completed": False,
        "walk_completed": False
    }
}

PORT = 5678
server = None
icon_global = None

# ── Đọc / ghi config ─────────────────────────────────────────────────────────
def get_statistical_date():
    import datetime
    now = datetime.datetime.now()
    # Nếu thời gian hiện tại trước 7:00 AM, ngày thống kê sẽ là ngày hôm qua
    if now.hour < 7:
        stat_date = now.date() - datetime.timedelta(days=1)
    else:
        stat_date = now.date()
    return stat_date.isoformat()

def load_config():
    stat_date_str = get_statistical_date()
    cfg = dict(DEFAULT_CONFIG)
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                # merge để không mất key mới
                for k, v in DEFAULT_CONFIG.items():
                    if k not in data:
                        data[k] = v
                cfg = data
        except Exception:
            pass
            
    # Reset stats nếu sang ngày thống kê mới hoặc chưa khởi tạo
    if "stats" not in cfg or cfg["stats"].get("date") != stat_date_str:
        cfg["stats"] = {
            "date": stat_date_str,
            "medicine_taken": False,
            "water_count": 0,
            "walk_morning_completed": False,
            "walk_afternoon_completed": False,
            "walk_completed": False
        }
        save_config(cfg)
        
    return cfg

def save_config(cfg):
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(cfg, f, ensure_ascii=False, indent=2)

# ── Gửi thông báo ─────────────────────────────────────────────────────────────
def notify(title, message):
    # Sử dụng duy nhất kênh PowerShell Balloon Tip vì hoạt động cực kỳ ổn định trên Windows 10/11
    # và hỗ trợ đầy đủ Unicode tiếng Việt + Emoji
    try:
        import subprocess
        # Escape dấu nháy kép để tránh lỗi cú pháp PowerShell
        clean_title = title.replace('"', "'")
        clean_message = message.replace('"', "'")
        
        powershell_code = f'''
        [void] [System.Reflection.Assembly]::LoadWithPartialName("System.Windows.Forms")
        $objNotifyIcon = New-Object System.Windows.Forms.NotifyIcon
        $objNotifyIcon.Icon = [System.Drawing.SystemIcons]::Information
        $objNotifyIcon.BalloonTipIcon = "Info"
        $objNotifyIcon.BalloonTipTitle = "{clean_title}"
        $objNotifyIcon.BalloonTipText = "{clean_message}"
        $objNotifyIcon.Visible = $True
        $objNotifyIcon.ShowBalloonTip(8000)
        '''
        
        # 0x08000000 là CREATE_NO_WINDOW để không bị nháy màn hình đen console cmd/powershell
        subprocess.run(
            ["powershell", "-Command", powershell_code],
            capture_output=True,
            creationflags=0x08000000
        )
    except Exception as e:
        print(f"[PowerShell notification error] {e}")

# ── Scheduler ─────────────────────────────────────────────────────────────────
def setup_schedule(cfg):
    schedule.clear()

    if cfg["medicine"]["enabled"]:
        t = cfg["medicine"]["time"]
        schedule.every().day.at(t).do(
            notify,
            "💊 Uống thuốc",
            f"Đã đến {t}, nhớ uống thuốc nhé!"
        )

    if cfg["walk"]["enabled"]:
        t_morning = cfg["walk"].get("time_morning", "08:30")
        schedule.every().day.at(t_morning).do(
            notify,
            "🚶 Vận động buổi sáng",
            f"Đã đến {t_morning}, hãy dành 15 phút đi bộ khởi động ngày mới năng động nhé!"
        )
        t_afternoon = cfg["walk"].get("time_afternoon", "17:30")
        schedule.every().day.at(t_afternoon).do(
            notify,
            "🚶 Đi bộ thư giãn buổi chiều",
            f"Đã đến {t_afternoon}, ra ngoài đi bộ thư giãn đầu óc sau ngày làm việc nào!"
        )

    if cfg["water"]["enabled"]:
        interval = int(cfg["water"].get("interval_hours", 2))
        schedule.every(interval).hours.do(
            notify,
            "💧 Uống nước",
            "Uống một ly nước để giữ đủ nước cho cơ thể!"
        )

def run_scheduler(stop_event):
    tick = 0
    while not stop_event.is_set():
        schedule.run_pending()
        time.sleep(10)  # Check every 10 seconds for faster updates
        tick += 1
        if tick >= 6:
            tick = 0
            try:
                load_config()
            except Exception:
                pass

# ── Tự khởi động cùng Windows ────────────────────────────────────────────────
def set_startup(enable: bool):
    try:
        import winreg
        key_path = r"Software\Microsoft\Windows\CurrentVersion\Run"
        app_name = "HealthReminder"
        
        # Thay thế python.exe bằng pythonw.exe để chạy ngầm hoàn toàn không hiện cửa sổ
        python_exe = sys.executable
        if python_exe.lower().endswith("python.exe"):
            python_exe = python_exe[:-10] + "pythonw.exe"
        
        exe_path = f'"{python_exe}" "{os.path.abspath(__file__)}"'
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, key_path, 0, winreg.KEY_SET_VALUE)
        if enable:
            winreg.SetValueEx(key, app_name, 0, winreg.REG_SZ, exe_path)
        else:
            try:
                winreg.DeleteValue(key, app_name)
            except FileNotFoundError:
                pass
        winreg.CloseKey(key)
    except Exception as e:
        print(f"[Startup error] {e}")

# ── Tạo icon tray (Dạng chữ thập y tế chuyên nghiệp màu trắng trên nền Indigo) ─
def create_tray_icon():
    size = 64
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    # Vẽ vòng tròn màu Indigo hiện đại
    draw.ellipse([4, 4, size-4, size-4], fill="#6366F1")
    # Vẽ chữ thập y tế màu trắng căn giữa chính xác
    draw.rectangle([20, 27, 44, 37], fill="white")  # Ngang
    draw.rectangle([27, 20, 37, 44], fill="white")  # Dọc
    return img

# ── Web Server Handler ────────────────────────────────────────────────────────
class WebSettingsHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Tắt log yêu cầu ở console để giữ giao diện console gọn gàng
        pass

    def do_GET(self):
        if self.path == "/":
            self.send_response(200)
            self.send_header("Content-type", "text/html; charset=utf-8")
            self.end_headers()
            index_path = os.path.join(BASE_DIR, "index.html")
            try:
                with open(index_path, "r", encoding="utf-8") as f:
                    content = f.read()
                self.wfile.write(content.encode("utf-8"))
            except Exception as e:
                self.wfile.write(f"<h3>Lỗi tải giao diện: {e}</h3>".encode("utf-8"))
        elif self.path == "/api/config":
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            cfg = load_config()
            self.wfile.write(json.dumps(cfg).encode("utf-8"))
        elif self.path == "/calendar":
            # Redirect to /calendar/ to ensure relative paths resolve correctly
            self.send_response(301)
            self.send_header("Location", "/calendar/")
            self.end_headers()
            return
        elif self.path.startswith("/calendar"):
            # Serve calendar static files
            # self.path is like "/calendar/" or "/calendar/style.css"
            rel_path = self.path.lstrip("/")
            if rel_path == "calendar/":
                rel_path = "calendar/index.html"
            
            full_path = os.path.join(BASE_DIR, rel_path)
            if os.path.exists(full_path) and os.path.isfile(full_path):
                self.send_response(200)
                # Determine content type
                if rel_path.endswith(".html"):
                    self.send_header("Content-type", "text/html; charset=utf-8")
                elif rel_path.endswith(".css"):
                    self.send_header("Content-type", "text/css; charset=utf-8")
                elif rel_path.endswith(".js"):
                    self.send_header("Content-type", "application/javascript; charset=utf-8")
                else:
                    self.send_header("Content-type", "application/octet-stream")
                self.end_headers()
                try:
                    with open(full_path, "rb") as f:
                        self.wfile.write(f.read())
                except Exception as e:
                    self.wfile.write(f"Error: {e}".encode("utf-8"))
            else:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b"Not Found")
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"Not Found")

    def do_POST(self):
        global icon_global
        if self.path == "/api/config":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                new_cfg = json.loads(post_data.decode("utf-8"))
                
                # Validate dữ liệu cơ bản
                for k in ["medicine", "water", "walk"]:
                    if k not in new_cfg:
                        raise ValueError(f"Thiếu cài đặt cho {k}")
                    if "enabled" not in new_cfg[k]:
                        raise ValueError(f"Thiếu tham số enabled cho {k}")
                    if k == "walk":
                        if "time_morning" not in new_cfg[k] or "time_afternoon" not in new_cfg[k]:
                            raise ValueError("Thiếu tham số time_morning hoặc time_afternoon cho walk")
                    else:
                        if "time" not in new_cfg[k]:
                            raise ValueError(f"Thiếu tham số time cho {k}")
                
                save_config(new_cfg)
                setup_schedule(new_cfg)
                set_startup(new_cfg.get("startup", False))
                
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success"}).encode("utf-8"))
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
                
        elif self.path == "/api/test-notify":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            test_type = "general"
            try:
                data = json.loads(post_data.decode("utf-8"))
                test_type = data.get("type", "general")
            except Exception:
                pass
            
            if test_type == "medicine":
                notify("💊 Uống thuốc (Gửi thử)", "Nhớ uống thuốc đúng liều lượng và giờ giấc bạn nhé!")
            elif test_type == "water":
                notify("💧 Uống nước (Gửi thử)", "Đã đến lúc tiếp nước cho cơ thể rồi, uống một ly nước nhé!")
            elif test_type == "walk":
                notify("🚶 Đi bộ (Gửi thử)", "Cùng vận động cơ thể bằng 15-30 phút đi bộ nhẹ nhàng thôi!")
            else:
                notify("🔔 Test thông báo", "Thông báo đang hoạt động bình thường!")
                
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success"}).encode("utf-8"))
            
        elif self.path == "/api/stats":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                stats_update = json.loads(post_data.decode("utf-8"))
                cfg = load_config()
                if "stats" not in cfg:
                    cfg["stats"] = {}
                for k, v in stats_update.items():
                    cfg["stats"][k] = v
                save_config(cfg)
                
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success"}).encode("utf-8"))
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
                
        elif self.path == "/api/quit":
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success"}).encode("utf-8"))
            # Tắt app sau một khoảng thời gian ngắn để trả về response cho web
            threading.Timer(0.5, lambda: quit_app(icon_global)).start()
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"Not Found")

# ── Điều hướng Trình duyệt ────────────────────────────────────────────────────
def open_browser(icon=None, item=None):
    try:
        # Chờ 0.5s để server chắc chắn đã khởi động xong nếu chạy lần đầu
        time.sleep(0.5)
        webbrowser.open(f"http://127.0.0.1:{PORT}")
    except Exception as e:
        print(f"[Browser error] {e}")

# ── Chạy Web Server ──────────────────────────────────────────────────────────
def start_server():
    global PORT, server
    # Thử tự động chọn các cổng dự phòng nếu cổng chính bị bận
    for p in [5678, 5679, 5680, 8080]:
        try:
            server = ThreadingHTTPServer(("127.0.0.1", p), WebSettingsHandler)
            PORT = p
            print(f"[Web Server] Running at http://127.0.0.1:{PORT}")
            t_server = threading.Thread(target=server.serve_forever, daemon=True)
            t_server.start()
            return
        except OSError:
            print(f"[Web Server] Port {p} is busy, trying next...")
    print("[Web Server] Critical error: No free port found.")
    sys.exit(1)

# ── Thoát app ────────────────────────────────────────────────────────────────
stop_event = threading.Event()

def quit_app(icon, item=None):
    stop_event.set()
    if server:
        try:
            server.shutdown()
        except Exception:
            pass
    if icon:
        icon.stop()
    os._exit(0)

# ── Main ─────────────────────────────────────────────────────────────────────
def main():
    global icon_global
    cfg = load_config()
    setup_schedule(cfg)

    # 1. Khởi động Web Server
    start_server()

    # 2. Thread chạy scheduler nhắc nhở sức khỏe
    t_sched = threading.Thread(target=run_scheduler, args=(stop_event,), daemon=True)
    t_sched.start()

    # 3. Mở cài đặt tự động trên trình duyệt lần đầu
    t_open = threading.Thread(target=open_browser, daemon=True)
    t_open.start()

    # 4. Khởi chạy khay hệ thống (System Tray Icon)
    tray_img = create_tray_icon()
    menu = pystray.Menu(
        pystray.MenuItem("⚙️  Cài đặt (Web)", open_browser, default=True),
        pystray.MenuItem("🔔  Test thông báo", lambda icon, item: notify("🔔 Test thông báo", "Thông báo đang hoạt động bình thường!")),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem("❌  Thoát", quit_app),
    )
    icon_global = pystray.Icon("health_reminder", tray_img, "HealthSync Console", menu)
    icon_global.run()

if __name__ == "__main__":
    main()
