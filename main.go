package main

import (
	"bufio"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io"
	"log"
	"math"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"
)

var (
	baseDir       string
	distDir       string
	wallpaperDir  string
	mpdMusicDir   = "/var/lib/mpd/music"
	shortcutsFile = "/opt/dashboard/shortcuts.json"
	uploadFolder  = "/opt/dashboard/uploads"
	lastCPUTotal  float64
	lastCPUIdle   float64
	cpuStatsMutex sync.Mutex
	updateLogs    []string
	updateStatus  string = "idle"
	updateMutex   sync.Mutex
)

// SystemStatsData represents the hardware status payload
type SystemStatsData struct {
	Status      string  `json:"status"`
	CPUPercent  int     `json:"cpu_percent"`
	RAMPercent  int     `json:"ram_percent"`
	RAMUsedMB   int     `json:"ram_used_mb"`
	RAMTotalMB  int     `json:"ram_total_mb"`
	TempC       float64 `json:"temp_c"`
	DiskPercent int     `json:"disk_percent"`
	DiskUsedGB  float64 `json:"disk_used_gb"`
	DiskTotalGB float64 `json:"disk_total_gb"`
}

// RSS/Atom struct parsing
type RSS struct {
	Channel struct {
		Items []struct {
			Title string `xml:"title"`
			Link  string `xml:"link"`
		} `xml:"item"`
	} `xml:"channel"`
}

type Atom struct {
	Entries []struct {
		Title string `xml:"title"`
		Link  struct {
			Href string `xml:"href,attr"`
		} `xml:"link"`
	} `xml:"entry"`
}

func initDirs() {
	var err error
	baseDir, err = os.Getwd()
	if err != nil {
		log.Fatal(err)
	}
	distDir = filepath.Join(baseDir, "dist")
	wallpaperDir = filepath.Join(baseDir, "wallpapers")

	os.MkdirAll(wallpaperDir, 0755)
	os.MkdirAll(uploadFolder, 0755)
}

// haversine calculates distance between two coordinates
func haversine(lat1, lon1, lat2, lon2 float64) int {
	R := 6371.0
	dLat := (lat2 - lat1) * math.Pi / 180.0
	dLon := (lon2 - lon1) * math.Pi / 180.0
	lat1Rad := lat1 * math.Pi / 180.0
	lat2Rad := lat2 * math.Pi / 180.0

	a := math.Sin(dLat/2)*math.Sin(dLat/2) + math.Cos(lat1Rad)*math.Cos(lat2Rad)*math.Sin(dLon/2)*math.Sin(dLon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	return int(R * c)
}

// corsMiddleware appends CORS headers to all responses
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// respondJSON is a helper to write JSON responses
func respondJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}

// respondError is a helper to write JSON 500/400 errors
func respondError(w http.ResponseWriter, err error, status int) {
	respondJSON(w, status, map[string]interface{}{
		"status":  "error",
		"message": err.Error(),
	})
}

// requirePost enforces POST requests
func requirePost(w http.ResponseWriter, r *http.Request) bool {
	if r.Method != http.MethodPost {
		respondError(w, fmt.Errorf("Method Not Allowed"), http.StatusMethodNotAllowed)
		return false
	}
	return true
}

// runCmd executes a bash command and returns its combined output
func runCmd(name string, args ...string) (string, error) {
	cmd := exec.Command(name, args...)
	out, err := cmd.CombinedOutput()
	return string(out), err
}

// --- STATIC FILE SERVING ---

func serveFrontend(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path == "/" || r.URL.Path == "/index.html" {
		http.ServeFile(w, r, filepath.Join(distDir, "index.html"))
		return
	}
	// Fallback for React Router
	path := filepath.Join(distDir, r.URL.Path)
	if _, err := os.Stat(path); os.IsNotExist(err) {
		http.ServeFile(w, r, filepath.Join(distDir, "index.html"))
	} else {
		http.ServeFile(w, r, path)
	}
}

// --- BLUETOOTH ---

func btStatus(w http.ResponseWriter, r *http.Request) {
	out, err := runCmd("bluetoothctl", "info")
	if err != nil || strings.Contains(out, "Missing device address") || strings.TrimSpace(out) == "" {
		respondJSON(w, http.StatusOK, map[string]interface{}{
			"status": "success", "state": "IDLE", "device_name": nil,
		})
		return
	}

	var name *string
	for _, line := range strings.Split(out, "\n") {
		if strings.Contains(line, "Name:") {
			parts := strings.SplitN(line, "Name:", 2)
			if len(parts) == 2 {
				n := strings.TrimSpace(parts[1])
				name = &n
			}
		}
	}
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"status": "success", "state": "CONNECTED", "device_name": name,
	})
}

func btScan(w http.ResponseWriter, r *http.Request) {
	runCmd("bluetoothctl", "--timeout", "5", "scan", "on")
	out, err := runCmd("bluetoothctl", "devices")
	if err != nil {
		respondError(w, err, http.StatusInternalServerError)
		return
	}

	var devices []map[string]string
	for _, line := range strings.Split(out, "\n") {
		if strings.HasPrefix(line, "Device ") {
			parts := strings.SplitN(line, " ", 3)
			if len(parts) >= 3 {
				devices = append(devices, map[string]string{
					"mac":  parts[1],
					"name": parts[2],
				})
			}
		}
	}
	if devices == nil {
		devices = []map[string]string{}
	}
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"status": "success", "devices": devices,
	})
}

func btConnect(w http.ResponseWriter, r *http.Request) {
	if !requirePost(w, r) {
		return
	}
	var payload struct {
		Mac string `json:"mac"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		respondError(w, err, http.StatusBadRequest)
		return
	}

	runCmd("bluetoothctl", "pair", payload.Mac)
	runCmd("bluetoothctl", "trust", payload.Mac)
	out, err := runCmd("bluetoothctl", "connect", payload.Mac)
	if err != nil {
		respondError(w, err, http.StatusInternalServerError)
		return
	}

	if strings.Contains(strings.ToLower(out), "successful") {
		runCmd("systemctl", "restart", "mpd")
		respondJSON(w, http.StatusOK, map[string]interface{}{"status": "success"})
		return
	}
	respondJSON(w, http.StatusBadRequest, map[string]interface{}{
		"status": "error", "message": "Connection refused by device.",
	})
}

// --- MEDIA CONTROLS ---

func mediaStatus(w http.ResponseWriter, r *http.Request) {
	out, err := runCmd("mpc", "status")
	if err != nil {
		respondError(w, err, http.StatusInternalServerError)
		return
	}

	status := map[string]string{
		"track":  "No track playing",
		"state":  "stopped",
		"volume": "100%",
	}

	lines := strings.Split(out, "\n")
	if len(lines) > 0 && lines[0] != "" {
		if !strings.Contains(lines[0], "volume:") {
			status["track"] = lines[0]
			if strings.Contains(out, "[playing]") {
				status["state"] = "playing"
			} else if strings.Contains(out, "[paused]") {
				status["state"] = "paused"
			}
		}
	}
	respondJSON(w, http.StatusOK, status)
}

func mediaToggle(w http.ResponseWriter, r *http.Request) {
	if !requirePost(w, r) {
		return
	}
	runCmd("mpc", "toggle")
	respondJSON(w, http.StatusOK, map[string]interface{}{"status": "success"})
}

func getPlaylist(w http.ResponseWriter, r *http.Request) {
	out, _ := runCmd("mpc", "playlist")
	var tracks []string
	for _, line := range strings.Split(out, "\n") {
		if strings.TrimSpace(line) != "" {
			tracks = append(tracks, line)
		}
	}
	if tracks == nil {
		tracks = []string{}
	}
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"status": "success", "playlist": tracks,
	})
}

func mediaPlayIndex(w http.ResponseWriter, r *http.Request) {
	if !requirePost(w, r) {
		return
	}
	var payload struct {
		Index interface{} `json:"index"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		respondError(w, err, http.StatusBadRequest)
		return
	}

	idx := fmt.Sprintf("%v", payload.Index)
	_, err := runCmd("mpc", "play", idx)
	if err != nil {
		respondError(w, err, http.StatusInternalServerError)
		return
	}
	respondJSON(w, http.StatusOK, map[string]interface{}{"status": "success"})
}

func uploadMedia(w http.ResponseWriter, r *http.Request) {
	if !requirePost(w, r) {
		return
	}
	if err := r.ParseMultipartForm(50 << 20); err != nil { // 50MB maximum
		respondError(w, err, http.StatusBadRequest)
		return
	}

	files := r.MultipartForm.File["files"]
	if len(files) == 0 {
		respondJSON(w, http.StatusBadRequest, map[string]interface{}{
			"status": "error", "message": "No files detected",
		})
		return
	}

	clearQueue := r.FormValue("clearQueue") == "true"
	var safeFilenames []string

	for _, fileHeader := range files {
		if fileHeader.Filename == "" {
			continue
		}

		safeFilename := strings.ReplaceAll(fileHeader.Filename, " ", "_")
		safeFilename = strings.ReplaceAll(safeFilename, "..", "")
		savePath := filepath.Join(mpdMusicDir, safeFilename)

		file, err := fileHeader.Open()
		if err != nil {
			log.Printf("[!!!] UPLOAD FILE OPEN ERROR: %v\n", err)
			continue
		}

		dst, err := os.Create(savePath)
		if err != nil {
			log.Printf("[!!!] UPLOAD FILE CREATE ERROR: %v\n", err)
			file.Close()
			continue
		}

		if _, err := io.Copy(dst, file); err != nil {
			log.Printf("[!!!] UPLOAD FILE COPY ERROR: %v\n", err)
		}
		dst.Close()
		file.Close()

		// SHIELD DROP: Force file to be readable by mpd daemon
		os.Chmod(savePath, 0644)

		safeFilenames = append(safeFilenames, safeFilename)
	}

	runCmd("mpc", "update")

	// Dynamic Sleep for Pi 1 bottleneck
	sleepDuration := math.Max(3.0, float64(len(files))*0.5)
	time.Sleep(time.Duration(sleepDuration * float64(time.Second)))

	if clearQueue {
		runCmd("mpc", "clear")
		for _, safeFilename := range safeFilenames {
			runCmd("mpc", "add", safeFilename)
		}
		runCmd("mpc", "play")
	} else {
		for _, safeFilename := range safeFilenames {
			runCmd("mpc", "add", safeFilename)
		}
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"status": "success", "filenames": safeFilenames,
	})
}

func mediaNext(w http.ResponseWriter, r *http.Request) {
	if !requirePost(w, r) {
		return
	}
	runCmd("mpc", "next")
	respondJSON(w, http.StatusOK, map[string]interface{}{"status": "success"})
}

func mediaLibrary(w http.ResponseWriter, r *http.Request) {
	out, _ := runCmd("mpc", "listall")
	var files []string
	for _, line := range strings.Split(out, "\n") {
		if strings.TrimSpace(line) != "" {
			files = append(files, line)
		}
	}
	if files == nil {
		files = []string{}
	}
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"status": "success", "library": files,
	})
}

func mediaPlaylists(w http.ResponseWriter, r *http.Request) {
	out, _ := runCmd("mpc", "lsplaylists")
	var playlists []string
	for _, line := range strings.Split(out, "\n") {
		if strings.TrimSpace(line) != "" {
			playlists = append(playlists, line)
		}
	}
	if playlists == nil {
		playlists = []string{}
	}
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"status": "success", "playlists": playlists,
	})
}

func mediaPlaylistsLoad(w http.ResponseWriter, r *http.Request) {
	if !requirePost(w, r) {
		return
	}
	var payload struct {
		Name string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		respondError(w, err, http.StatusBadRequest)
		return
	}
	if payload.Name == "" {
		respondJSON(w, http.StatusBadRequest, map[string]interface{}{
			"status": "error", "message": "No playlist name provided",
		})
		return
	}

	runCmd("mpc", "clear")
	time.Sleep(1 * time.Second)
	_, err := runCmd("mpc", "load", payload.Name)
	if err != nil {
		respondError(w, err, http.StatusInternalServerError)
		return
	}
	time.Sleep(1 * time.Second)
	runCmd("mpc", "play")

	respondJSON(w, http.StatusOK, map[string]interface{}{"status": "success"})
}

func mediaPlaylistsSave(w http.ResponseWriter, r *http.Request) {
	if !requirePost(w, r) {
		return
	}
	var payload struct {
		Name string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		respondError(w, err, http.StatusBadRequest)
		return
	}
	if payload.Name == "" {
		respondJSON(w, http.StatusBadRequest, map[string]interface{}{
			"status": "error", "message": "No playlist name provided",
		})
		return
	}

	runCmd("mpc", "rm", payload.Name)
	time.Sleep(500 * time.Millisecond)
	_, err := runCmd("mpc", "save", payload.Name)
	if err != nil {
		respondError(w, err, http.StatusInternalServerError)
		return
	}
	respondJSON(w, http.StatusOK, map[string]interface{}{"status": "success"})
}

func mediaQueueAdd(w http.ResponseWriter, r *http.Request) {
	if !requirePost(w, r) {
		return
	}
	var payload struct {
		Filename string `json:"filename"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		respondError(w, err, http.StatusBadRequest)
		return
	}
	if payload.Filename == "" {
		respondJSON(w, http.StatusBadRequest, map[string]interface{}{
			"status": "error", "message": "No filename provided",
		})
		return
	}
	_, err := runCmd("mpc", "add", payload.Filename)
	if err != nil {
		respondError(w, err, http.StatusInternalServerError)
		return
	}
	respondJSON(w, http.StatusOK, map[string]interface{}{"status": "success"})
}

func mediaQueueClear(w http.ResponseWriter, r *http.Request) {
	if !requirePost(w, r) {
		return
	}
	_, err := runCmd("mpc", "clear")
	if err != nil {
		respondError(w, err, http.StatusInternalServerError)
		return
	}
	respondJSON(w, http.StatusOK, map[string]interface{}{"status": "success"})
}

func mediaDelete(w http.ResponseWriter, r *http.Request) {
	if !requirePost(w, r) {
		return
	}
	var payload struct {
		Filename string `json:"filename"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		respondError(w, err, http.StatusBadRequest)
		return
	}
	if payload.Filename == "" {
		respondJSON(w, http.StatusBadRequest, map[string]interface{}{
			"status": "error", "message": "No filename provided",
		})
		return
	}

	safeFilename := strings.ReplaceAll(payload.Filename, " ", "_")
	safeFilename = strings.ReplaceAll(safeFilename, "..", "")
	filePath := filepath.Join(mpdMusicDir, safeFilename)

	os.Remove(filePath)
	runCmd("mpc", "update")
	time.Sleep(1500 * time.Millisecond)

	respondJSON(w, http.StatusOK, map[string]interface{}{"status": "success"})
}

// --- SYSTEM HARDWARE ---

func getSystemStats() (SystemStatsData, error) {
	cpuStatsMutex.Lock()
	defer cpuStatsMutex.Unlock()

	var stats SystemStatsData
	stats.Status = "success"

	// CPU PERCENTAGE
	statBytes, err := os.ReadFile("/proc/stat")
	if err == nil {
		lines := strings.Split(string(statBytes), "\n")
		if len(lines) > 0 {
			fields := strings.Fields(lines[0])
			if len(fields) >= 5 {
				var cpuTimes []float64
				for _, f := range fields[1:] {
					val, _ := strconv.ParseFloat(f, 64)
					cpuTimes = append(cpuTimes, val)
				}
				if len(cpuTimes) >= 4 {
					idle := cpuTimes[3]
					if len(cpuTimes) > 4 {
						idle += cpuTimes[4]
					}
					var total float64
					for _, t := range cpuTimes {
						total += t
					}
					deltaTotal := total - lastCPUTotal
					deltaIdle := idle - lastCPUIdle
					cpuPercent := 0
					if lastCPUTotal > 0 && deltaTotal > 0 {
						cpuPercent = int(100 * (deltaTotal - deltaIdle) / deltaTotal)
					}
					stats.CPUPercent = cpuPercent
					lastCPUTotal = total
					lastCPUIdle = idle
				}
			}
		}
	}

	// RAM USAGE
	memBytes, err := os.ReadFile("/proc/meminfo")
	if err == nil {
		var totalRAM, free, buffers, cached int
		lines := strings.Split(string(memBytes), "\n")
		for _, line := range lines {
			if strings.HasPrefix(line, "MemTotal:") {
				fmt.Sscanf(line, "MemTotal: %d", &totalRAM)
			} else if strings.HasPrefix(line, "MemFree:") {
				fmt.Sscanf(line, "MemFree: %d", &free)
			} else if strings.HasPrefix(line, "Buffers:") {
				fmt.Sscanf(line, "Buffers: %d", &buffers)
			} else if strings.HasPrefix(line, "Cached:") {
				fmt.Sscanf(line, "Cached: %d", &cached)
			}
		}
		used := totalRAM - free - buffers - cached
		if totalRAM > 0 {
			stats.RAMPercent = int((float64(used) / float64(totalRAM)) * 100)
		}
		stats.RAMUsedMB = used / 1024
		stats.RAMTotalMB = totalRAM / 1024
	}

	// THERMAL CORE
	tempBytes, err := os.ReadFile("/sys/class/thermal/thermal_zone0/temp")
	if err == nil {
		tempStr := strings.TrimSpace(string(tempBytes))
		temp, _ := strconv.ParseFloat(tempStr, 64)
		stats.TempC = math.Round((temp/1000.0)*10) / 10
	}

	var stat syscall.Statfs_t
	if err := syscall.Statfs("/", &stat); err == nil {
		totalSpace := stat.Blocks * uint64(stat.Bsize)
		freeSpace := stat.Bavail * uint64(stat.Bsize)
		usedSpace := totalSpace - freeSpace

		if totalSpace > 0 {
			stats.DiskPercent = int((float64(usedSpace) / float64(totalSpace)) * 100)
		}
		stats.DiskTotalGB = math.Round((float64(totalSpace)/(1024*1024*1024))*10) / 10
		stats.DiskUsedGB = math.Round((float64(usedSpace)/(1024*1024*1024))*10) / 10
	}

	return stats, nil
}

func apiStats(w http.ResponseWriter, r *http.Request) {
	stats, err := getSystemStats()
	if err != nil {
		respondError(w, err, http.StatusInternalServerError)
		return
	}
	respondJSON(w, http.StatusOK, stats)
}

func systemControl(w http.ResponseWriter, r *http.Request) {
	if !requirePost(w, r) {
		return
	}
	var data struct {
		Action string `json:"action"`
	}
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		respondError(w, err, http.StatusBadRequest)
		return
	}

	switch data.Action {
	case "reboot":
		exec.Command("reboot").Start()
		respondJSON(w, http.StatusOK, map[string]interface{}{"status": "success", "message": "Initiating reboot sequence..."})
	case "shutdown":
		exec.Command("poweroff").Start()
		respondJSON(w, http.StatusOK, map[string]interface{}{"status": "success", "message": "System powering down..."})
	case "commit":
		_, err := runCmd("sync")
		if err != nil {
			respondError(w, err, http.StatusInternalServerError)
			return
		}
		respondJSON(w, http.StatusOK, map[string]interface{}{"status": "success", "message": "Filesystem synced to SD card."})
	default:
		respondJSON(w, http.StatusBadRequest, map[string]interface{}{"status": "error", "message": "Unknown directive."})
	}
}

func startSystemUpdate(w http.ResponseWriter, r *http.Request) {
	if !requirePost(w, r) {
		return
	}
	updateMutex.Lock()
	if updateStatus == "running" {
		updateMutex.Unlock()
		respondJSON(w, http.StatusBadRequest, map[string]interface{}{"status": "error", "message": "Update already running"})
		return
	}
	updateStatus = "running"
	updateLogs = []string{}
	updateMutex.Unlock()

	go func() {
		cmd := exec.Command("bash", "-c", "/boot/dietpi/dietpi-update 1")
		stdout, _ := cmd.StdoutPipe()
		stderr, _ := cmd.StderrPipe()
		cmd.Start()

		scannerOut := bufio.NewScanner(stdout)
		scannerErr := bufio.NewScanner(stderr)

		var wg sync.WaitGroup
		wg.Add(2)

		logReader := func(scanner *bufio.Scanner) {
			defer wg.Done()
			for scanner.Scan() {
				line := scanner.Text()
				updateMutex.Lock()
				updateLogs = append(updateLogs, line)
				if len(updateLogs) > 100 {
					updateLogs = updateLogs[len(updateLogs)-100:]
				}
				updateMutex.Unlock()
			}
		}

		go logReader(scannerOut)
		go logReader(scannerErr)

		wg.Wait()
		cmd.Wait()

		updateMutex.Lock()
		updateStatus = "done"
		updateMutex.Unlock()
	}()

	respondJSON(w, http.StatusOK, map[string]interface{}{"status": "success"})
}

func pollSystemUpdate(w http.ResponseWriter, r *http.Request) {
	updateMutex.Lock()
	defer updateMutex.Unlock()
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"status": updateStatus,
		"logs":   updateLogs,
	})
}

func commitRom(w http.ResponseWriter, r *http.Request) {
	if !requirePost(w, r) {
		return
	}
	_, err := runCmd("sync")
	if err != nil {
		respondError(w, err, http.StatusInternalServerError)
		return
	}
	respondJSON(w, http.StatusOK, map[string]interface{}{"status": "success"})
}

// --- NETWORK & DATA ---

func radar(w http.ResponseWriter, r *http.Request) {
	targets := []struct {
		Name string
		IP   string
		Port string
	}{
		{"ROUTER_GATEWAY", "192.168.51.1", "80"},
		{"GLOBAL_DNS", "8.8.8.8", "53"},
		{"GITHUB_UPLINK", "github.com", "443"},
	}
	var results []map[string]string
	for _, t := range targets {
		conn, err := net.DialTimeout("tcp", net.JoinHostPort(t.IP, t.Port), 1*time.Second)
		status := "ERR_FAIL"
		if err == nil {
			status = "ONLINE"
			conn.Close()
		} else if strings.Contains(err.Error(), "timeout") {
			status = "OFFLINE"
		} else {
			status = "OFFLINE"
		}
		results = append(results, map[string]string{"name": t.Name, "status": status})
	}
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"status": "success", "targets": results,
	})
}

func getNetworkDevices() []map[string]string {
	out, _ := runCmd("arp", "-a")
	var devices []map[string]string
	for _, line := range strings.Split(out, "\n") {
		if strings.TrimSpace(line) != "" {
			parts := strings.Fields(line)
			if len(parts) >= 4 {
				name := parts[0]
				ip := strings.Trim(parts[1], "()")
				mac := parts[3]
				if mac != "<incomplete>" {
					devices = append(devices, map[string]string{
						"name": name, "ip": ip, "mac": mac,
					})
				}
			}
		}
	}
	if devices == nil {
		devices = []map[string]string{}
	}
	return devices
}

func networkScan(w http.ResponseWriter, r *http.Request) {
	devices := getNetworkDevices()
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"status": "success", "devices": devices,
	})
}

func iss(w http.ResponseWriter, r *http.Request) {
	client := http.Client{Timeout: 5 * time.Second}
	req, _ := http.NewRequest("GET", "http://api.open-notify.org/iss-now.json", nil)
	req.Header.Set("User-Agent", "Pi-Dash")
	resp, err := client.Do(req)
	if err != nil {
		respondError(w, err, http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var data struct {
		ISSPosition struct {
			Latitude  string `json:"latitude"`
			Longitude string `json:"longitude"`
		} `json:"iss_position"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		respondError(w, err, http.StatusInternalServerError)
		return
	}
	lat, _ := strconv.ParseFloat(data.ISSPosition.Latitude, 64)
	lon, _ := strconv.ParseFloat(data.ISSPosition.Longitude, 64)
	dist := haversine(49.0629, 33.4042, lat, lon)

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"status": "success", "lat": lat, "lon": lon, "distance": dist,
	})
}

func lore(w http.ResponseWriter, r *http.Request) {
	b, err := os.ReadFile("/opt/dashboard/lore.json")
	if err != nil {
		respondError(w, fmt.Errorf("File Error: %v", err), http.StatusInternalServerError)
		return
	}
	var quotes []struct {
		Tag    string `json:"tag"`
		Author string `json:"author"`
		Text   string `json:"text"`
	}
	if err := json.Unmarshal(b, &quotes); err != nil {
		respondError(w, fmt.Errorf("JSON Error: %v", err), http.StatusInternalServerError)
		return
	}
	if len(quotes) == 0 {
		respondError(w, fmt.Errorf("JSON Error: array is empty"), http.StatusInternalServerError)
		return
	}
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"status": "success",
		"quote":  quotes[time.Now().UnixNano()%int64(len(quotes))],
	})
}

func handleShortcuts(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		var data interface{}
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			respondError(w, err, http.StatusBadRequest)
			return
		}

		var shortcutsData []map[string]string

		switch v := data.(type) {
		case []interface{}:
			for _, item := range v {
				if m, ok := item.(map[string]interface{}); ok {
					name, _ := m["name"].(string)
					url, _ := m["url"].(string)
					shortcutsData = append(shortcutsData, map[string]string{"name": name, "url": url})
				}
			}
		case map[string]interface{}:
			if b, err := os.ReadFile(shortcutsFile); err == nil {
				json.Unmarshal(b, &shortcutsData)
			}
			name, _ := v["name"].(string)
			url, _ := v["url"].(string)
			shortcutsData = append(shortcutsData, map[string]string{"name": name, "url": url})
		}

		if b, err := json.Marshal(shortcutsData); err == nil {
			os.WriteFile(shortcutsFile, b, 0644)
		}
		respondJSON(w, http.StatusOK, map[string]interface{}{"status": "success"})
	} else {
		var shortcutsData []map[string]string
		if b, err := os.ReadFile(shortcutsFile); err == nil {
			json.Unmarshal(b, &shortcutsData)
		}
		if shortcutsData == nil {
			shortcutsData = []map[string]string{}
		}
		respondJSON(w, http.StatusOK, map[string]interface{}{"status": "success", "shortcuts": shortcutsData})
	}
}

func listWallpapers(w http.ResponseWriter, r *http.Request) {
	var files []string
	entries, err := os.ReadDir(wallpaperDir)
	if err == nil {
		for _, e := range entries {
			if !e.IsDir() {
				ext := strings.ToLower(filepath.Ext(e.Name()))
				if ext == ".png" || ext == ".jpg" || ext == ".jpeg" || ext == ".gif" || ext == ".webp" {
					files = append(files, e.Name())
				}
			}
		}
	}
	if files == nil {
		files = []string{}
	}
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"status": "success", "wallpapers": files,
	})
}

func uploadWallpaper(w http.ResponseWriter, r *http.Request) {
	if !requirePost(w, r) {
		return
	}
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		respondError(w, err, http.StatusBadRequest)
		return
	}
	file, fileHeader, err := r.FormFile("file")
	if err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]interface{}{
			"status": "error", "message": "No file detected.",
		})
		return
	}
	defer file.Close()
	if fileHeader.Filename == "" {
		respondJSON(w, http.StatusBadRequest, map[string]interface{}{
			"status": "error", "message": "Empty filename.",
		})
		return
	}
	safeName := strings.ReplaceAll(fileHeader.Filename, " ", "_")
	dst, err := os.Create(filepath.Join(wallpaperDir, safeName))
	if err != nil {
		respondError(w, err, http.StatusInternalServerError)
		return
	}
	defer dst.Close()
	io.Copy(dst, file)
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"status": "success", "filename": safeName,
	})
}

func weather(w http.ResponseWriter, r *http.Request) {
	url := "https://api.open-meteo.com/v1/forecast?latitude=49.0629&longitude=33.4042&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,surface_pressure&daily=precipitation_probability_max&timezone=Europe%2FKyiv&forecast_days=1"

	client := http.Client{Timeout: 5 * time.Second}
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("User-Agent", "Pi-Dashboard/1.0")
	resp, err := client.Do(req)
	if err != nil {
		respondError(w, err, http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var data map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		respondError(w, err, http.StatusInternalServerError)
		return
	}

	current, _ := data["current"].(map[string]interface{})
	daily, _ := data["daily"].(map[string]interface{})

	var precipChance interface{} = 0
	if daily != nil {
		if probList, ok := daily["precipitation_probability_max"].([]interface{}); ok && len(probList) > 0 {
			precipChance = probList[0]
		}
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"status":        "success",
		"temp":          current["temperature_2m"],
		"feels_like":    current["apparent_temperature"],
		"humidity":      current["relative_humidity_2m"],
		"wind":          current["wind_speed_10m"],
		"pressure":      current["surface_pressure"],
		"precip_chance": precipChance,
	})
}

func fetchFeed(tag, url string) []map[string]string {
	var items []map[string]string

	client := http.Client{Timeout: 5 * time.Second}
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("User-Agent", "Pi-Dashboard/1.0")
	resp, err := client.Do(req)
	if err != nil {
		return []map[string]string{{"title": fmt.Sprintf("[%s] ERR_FEED_OFFLINE", tag), "link": "#"}}
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	// Try RSS parsing
	var rss RSS
	if err := xml.Unmarshal(body, &rss); err == nil && len(rss.Channel.Items) > 0 {
		for i, item := range rss.Channel.Items {
			if i >= 2 {
				break
			}
			items = append(items, map[string]string{
				"title": fmt.Sprintf("[%s] %s", tag, item.Title),
				"link":  item.Link,
			})
		}
		return items
	}

	// Try Atom parsing
	var atom Atom
	if err := xml.Unmarshal(body, &atom); err == nil && len(atom.Entries) > 0 {
		for i, entry := range atom.Entries {
			if i >= 2 {
				break
			}
			items = append(items, map[string]string{
				"title": fmt.Sprintf("[%s] %s", tag, entry.Title),
				"link":  entry.Link.Href,
			})
		}
		return items
	}

	return []map[string]string{{"title": fmt.Sprintf("[%s] ERR_FEED_PARSE", tag), "link": "#"}}
}

func news(w http.ResponseWriter, r *http.Request) {
	feeds := []map[string]string{
		{"tag": "TECH", "url": "https://www.theverge.com/rss/index.xml"},
		{"tag": "UKR", "url": "https://www.pravda.com.ua/eng/rss/"},
		{"tag": "MEDIA", "url": "https://www.cbr.com/feed/"},
	}
	var newsItems []map[string]string
	for _, feed := range feeds {
		newsItems = append(newsItems, fetchFeed(feed["tag"], feed["url"])...)
	}
	if newsItems == nil {
		newsItems = []map[string]string{}
	}
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"status": "success", "articles": newsItems,
	})
}

func debugMpd(w http.ResponseWriter, r *http.Request) {
	diag := make(map[string]string)

	out, _ := runCmd("ls", "-la", mpdMusicDir)
	diag["ls_music"] = out

	out, _ = runCmd("mpc", "status")
	diag["mpc_status"] = out

	out, _ = runCmd("mpc", "listall")
	diag["mpc_listall"] = out

	out, _ = runCmd("grep", "music_directory", "/etc/mpd.conf")
	diag["mpd_conf"] = out

	out, _ = runCmd("pgrep", "mpd")
	pid := strings.TrimSpace(out)
	if pid != "" {
		out, _ = runCmd("ps", "-o", "user", "-p", pid)
		diag["mpd_user"] = out
	} else {
		diag["mpd_user"] = "mpd not running"
	}

	respondJSON(w, http.StatusOK, diag)
}

func calendar(w http.ResponseWriter, r *http.Request) {
	icsURL := "YOUR_SECRET_ICS_LINK_HERE"
	if icsURL == "YOUR_SECRET_ICS_LINK_HERE" || icsURL == "INSERT_YOUR_SECRET_ICS_LINK_HERE" {
		respondError(w, fmt.Errorf("ERR_NO_ICS_LINK"), http.StatusInternalServerError)
		return
	}

	client := http.Client{Timeout: 5 * time.Second}
	req, _ := http.NewRequest("GET", icsURL, nil)
	req.Header.Set("User-Agent", "Pi-Dashboard/1.0")
	resp, err := client.Do(req)
	if err != nil {
		respondError(w, err, http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	lines := strings.Split(string(body), "\n")

	var events []map[string]string
	seenFingerprints := make(map[string]bool)
	currentEvent := make(map[string]string)

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "BEGIN:VEVENT") {
			currentEvent = make(map[string]string)
		} else if strings.HasPrefix(line, "END:VEVENT") {
			if summary, ok := currentEvent["summary"]; ok {
				if sortVal, ok := currentEvent["sort"]; ok {
					fingerprint := sortVal + summary
					if !seenFingerprints[fingerprint] {
						seenFingerprints[fingerprint] = true
						events = append(events, currentEvent)
					}
				}
			}
		} else if strings.HasPrefix(line, "SUMMARY:") {
			parts := strings.SplitN(line, ":", 2)
			if len(parts) == 2 {
				currentEvent["summary"] = parts[1]
			}
		} else if strings.HasPrefix(line, "DTSTART") {
			parts := strings.SplitN(line, ":", 2)
			if len(parts) == 2 {
				val := strings.ReplaceAll(parts[1], "Z", "")
				var clean strings.Builder
				for _, char := range val {
					if char >= '0' && char <= '9' {
						clean.WriteRune(char)
					}
				}
				cleanStr := clean.String()
				if len(cleanStr) >= 14 {
					currentEvent["display"] = fmt.Sprintf("%s/%s %s:%s", cleanStr[6:8], cleanStr[4:6], cleanStr[8:10], cleanStr[10:12])
					currentEvent["sort"] = cleanStr[:14]
				} else if len(cleanStr) >= 8 {
					currentEvent["display"] = fmt.Sprintf("%s/%s [ALL DAY]", cleanStr[6:8], cleanStr[4:6])
					currentEvent["sort"] = cleanStr[:8] + "000000"
				}
			}
		}
	}

	nowSort := time.Now().Format("20060102150405")
	var upcoming []map[string]string
	for _, e := range events {
		if e["sort"] >= nowSort[:8] {
			upcoming = append(upcoming, e)
		}
	}

	// Sort events
	for i := 0; i < len(upcoming); i++ {
		for j := i + 1; j < len(upcoming); j++ {
			if upcoming[i]["sort"] > upcoming[j]["sort"] {
				upcoming[i], upcoming[j] = upcoming[j], upcoming[i]
			}
		}
	}
	if len(upcoming) > 6 {
		upcoming = upcoming[:6]
	}
	if upcoming == nil {
		upcoming = []map[string]string{}
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"status": "success", "events": upcoming,
	})
}

// masterSync concurrently fetches systems stats, audio status, and network devices
func masterSync(w http.ResponseWriter, r *http.Request) {
	var wg sync.WaitGroup
	var statsData SystemStatsData
	var mediaData map[string]string
	var devices []map[string]string

	wg.Add(3)

	go func() {
		defer wg.Done()
		statsData, _ = getSystemStats()
	}()

	go func() {
		defer wg.Done()
		out, err := runCmd("mpc", "status")
		mediaData = map[string]string{
			"track":  "No track playing",
			"state":  "stopped",
			"volume": "100%",
		}
		if err != nil {
			mediaData["track"] = "ERR_LINK_SEVERED"
			mediaData["state"] = "offline"
			mediaData["volume"] = "0%"
			return
		}
		lines := strings.Split(out, "\n")
		if len(lines) > 0 && lines[0] != "" && !strings.Contains(lines[0], "volume:") {
			mediaData["track"] = lines[0]
			if strings.Contains(out, "[playing]") {
				mediaData["state"] = "playing"
			} else if strings.Contains(out, "[paused]") {
				mediaData["state"] = "paused"
			}
		}
	}()

	go func() {
		defer wg.Done()
		devices = getNetworkDevices()
	}()

	wg.Wait()

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"status":    "success",
		"timestamp": time.Now().Format("15:04:05"),
		"hardware":  statsData,
		"audio":     mediaData,
		"network":   devices,
	})
}

func mediaRestart(w http.ResponseWriter, r *http.Request) {
	if !requirePost(w, r) {
		return
	}
	runCmd("systemctl", "restart", "mpd")
	time.Sleep(1500 * time.Millisecond)
	respondJSON(w, http.StatusOK, map[string]interface{}{"status": "success"})
}

// initializeMPD runs in the background at startup
func initializeMPD() {
	// The Pi 1 Boot Buffer: Give OS 20 seconds to fully start mpd daemon
	time.Sleep(20 * time.Second)

	// Update library and buffer
	exec.Command("mpc", "update").Run()
	time.Sleep(10 * time.Second)

	// Queue restoration
	out, _ := runCmd("mpc", "playlist")
	if strings.TrimSpace(out) == "" {
		cmd1 := exec.Command("mpc", "listall")
		cmd2 := exec.Command("mpc", "add")

		pipe, _ := cmd1.StdoutPipe()
		cmd2.Stdin = pipe

		cmd1.Start()
		cmd2.Start()
		cmd1.Wait()
		cmd2.Wait()
	}
}

func main() {
	initDirs()
	go initializeMPD()

	mux := http.NewServeMux()

	// Frontend & Assets
	mux.HandleFunc("/", serveFrontend)
	mux.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir(filepath.Join(distDir, "assets")))))
	mux.Handle("/uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir(uploadFolder))))
	mux.Handle("/api/wallpapers/view/", http.StripPrefix("/api/wallpapers/view/", http.FileServer(http.Dir(wallpaperDir))))

	// Bluetooth
	mux.HandleFunc("/api/bluetooth/status", btStatus)
	mux.HandleFunc("/api/bluetooth/scan", btScan)
	mux.HandleFunc("/api/bluetooth/connect", btConnect)

	// Media
	mux.HandleFunc("/api/media/status", mediaStatus)
	mux.HandleFunc("/api/media/toggle", mediaToggle)
	mux.HandleFunc("/api/media/playlist", getPlaylist)
	mux.HandleFunc("/api/media/play_index", mediaPlayIndex)
	mux.HandleFunc("/api/media/upload", uploadMedia)
	mux.HandleFunc("/api/media/next", mediaNext)
	mux.HandleFunc("/api/media/library", mediaLibrary)
	mux.HandleFunc("/api/media/playlists", mediaPlaylists)
	mux.HandleFunc("/api/media/playlists/load", mediaPlaylistsLoad)
	mux.HandleFunc("/api/media/playlists/save", mediaPlaylistsSave)
	mux.HandleFunc("/api/media/queue/add", mediaQueueAdd)
	mux.HandleFunc("/api/media/queue/clear", mediaQueueClear)
	mux.HandleFunc("/api/media/delete", mediaDelete)
	mux.HandleFunc("/api/media/restart", mediaRestart)

	// System Stats
	mux.HandleFunc("/api/stats", apiStats)
	mux.HandleFunc("/api/system/control", systemControl)
	mux.HandleFunc("/api/system/update/start", startSystemUpdate)
	mux.HandleFunc("/api/system/update/poll", pollSystemUpdate)
	mux.HandleFunc("/api/commit", commitRom)

	// Network & Radar
	mux.HandleFunc("/api/radar", radar)
	mux.HandleFunc("/api/network/scan", networkScan)

	// External & Extras
	mux.HandleFunc("/api/iss", iss)
	mux.HandleFunc("/api/lore", lore)
	mux.HandleFunc("/api/shortcuts", handleShortcuts)
	mux.HandleFunc("/api/wallpapers", listWallpapers)
	mux.HandleFunc("/api/wallpapers/upload", uploadWallpaper)
	mux.HandleFunc("/api/weather", weather)
	mux.HandleFunc("/api/news", news)
	mux.HandleFunc("/api/debug/mpd", debugMpd)
	mux.HandleFunc("/api/calendar", calendar)

	// Concurrent Data Route
	mux.HandleFunc("/api/sync", masterSync)

	// Wrapping with CORS middleware
	handler := corsMiddleware(mux)

	log.Println("Server starting on port 80...")
	if err := http.ListenAndServe("0.0.0.0:80", handler); err != nil {
		log.Fatal(err)
	}
}
