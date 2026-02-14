# AI System Control Commands - Quick Reference

## ✨ Natural Language Commands

### 🔆 Brightness Control
```
"Set brightness to 75%"
"Make screen brighter" (sets to 100%)
"Dim the screen" (sets to 30%)
"Set brightness to 50 percent"
```

### 🔊 Volume Control
```
"Set volume to 60%"
"Increase volume to 80%"
"Lower volume to 20%"
"Mute" (sets to 0%)
"Max volume" (sets to 100%)
```

### 📡 WiFi Control
```
"Turn on WiFi"
"Enable WiFi"
"Turn off WiFi"
"Disable WiFi"
"Check WiFi status"
```

### 🔵 Bluetooth Control
```
"Turn on Bluetooth"
"Enable Bluetooth"
"Turn off Bluetooth"
"Disable Bluetooth"
```

---

## 🖥️ Direct Shell Commands

### Windows

#### Brightness
```bash
powershell -Command "(Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightnessMethods).WmiSetBrightness(1,50)"
```

#### Volume
```bash
nircmd.exe setsysvolume 32768
```

#### WiFi
```bash
# Enable
netsh interface set interface "Wi-Fi" enabled

# Disable
netsh interface set interface "Wi-Fi" disabled

# Status
netsh interface show interface "Wi-Fi"
```

#### Bluetooth
```powershell
# Requires DevCon or Bluetooth Command Line Tools
devcon enable *Bluetooth*
devcon disable *Bluetooth*
```

---

### macOS

#### Brightness
```bash
brightness 0.5  # 50%
```

#### Volume
```bash
osascript -e "set volume output volume 50"
```

#### WiFi
```bash
# Enable
networksetup -setairportpower en0 on

# Disable
networksetup -setairportpower en0 off

# Status
networksetup -getairportpower en0
```

#### Bluetooth
```bash
# Enable
blueutil --power 1

# Disable
blueutil --power 0

# Status
blueutil --power
```

---

### Linux

#### Brightness
```bash
brightnessctl set 50%
```

#### Volume
```bash
amixer set 'Master' 50%
```

#### WiFi
```bash
# Enable
nmcli radio wifi on

# Disable
nmcli radio wifi off

# Status
nmcli radio wifi
```

#### Bluetooth
```bash
# Enable
rfkill unblock bluetooth

# Disable
rfkill block bluetooth

# Status
rfkill list bluetooth
```

---

## 🤖 AI Command Format

The AI understands these action commands:

```
[SET_BRIGHTNESS: percentage]
[SET_VOLUME: percentage]
[SHELL_COMMAND: command]
```

### Examples:

**User:** "Set brightness to 75%"
**AI Response:** `[SET_BRIGHTNESS: 75]`

**User:** "Turn off WiFi"
**AI Response (Windows):** `[SHELL_COMMAND: netsh interface set interface "Wi-Fi" disabled]`

**User:** "Set volume to 60%"
**AI Response:** `[SET_VOLUME: 60]`

---

## 📋 Installation Requirements

### Windows
- ✅ PowerShell (pre-installed)
- ⚠️ NirCmd (download and add to PATH)
  - Download: https://www.nirsoft.net/utils/nircmd.html
  - Extract to `C:\Windows\System32\` or add to PATH

### macOS
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install brightness control
brew install brightness

# Install Bluetooth control
brew install blueutil
```

### Linux (Ubuntu/Debian)
```bash
# Brightness control
sudo apt install brightnessctl

# Volume control (ALSA)
sudo apt install alsa-utils

# WiFi control (usually pre-installed)
sudo apt install network-manager

# Bluetooth control (usually pre-installed)
sudo apt install rfkill
```

---

## 🔒 Permissions

### Windows
- Brightness: May require administrator privileges
- WiFi: Requires administrator privileges
- Volume: No special permissions
- Bluetooth: Requires administrator privileges

### macOS
- Brightness: No special permissions (with brew package)
- WiFi: No special permissions
- Volume: No special permissions
- Bluetooth: No special permissions (with brew package)

### Linux
- Brightness: May require udev rules or sudo
- WiFi: Usually requires sudo or user in `netdev` group
- Volume: No special permissions
- Bluetooth: May require sudo or user in `bluetooth` group

---

## 🐛 Troubleshooting

### "Command not found"
**Solution:** Install the required tool (see Installation Requirements)

### "Access denied" / "Permission denied"
**Solution:** Run with administrator/sudo privileges or add user to appropriate group

### Brightness not changing
**Windows:** Check if WMI is supported by your hardware
**macOS:** Ensure `brightness` tool is installed
**Linux:** Check if `brightnessctl` has proper permissions

### Volume not changing
**Windows:** Install NirCmd
**macOS:** Should work out of the box
**Linux:** Ensure ALSA is installed and configured

### WiFi/Bluetooth not responding
**Solution:** Check if the interface name is correct (e.g., "Wi-Fi" vs "WiFi" vs "WLAN")

---

## 💡 Pro Tips

1. **Test commands manually first** in terminal/PowerShell before using AI
2. **Use exact interface names** for WiFi (check with `ipconfig` or `ifconfig`)
3. **Install all dependencies** before expecting commands to work
4. **Check permissions** if commands fail silently
5. **Use AI natural language** instead of memorizing shell commands

---

## 🎯 Example Workflows

### Morning Routine
```
"Set brightness to 80%"
"Set volume to 50%"
"Turn on WiFi"
"Turn on Bluetooth"
```

### Night Mode
```
"Set brightness to 20%"
"Set volume to 30%"
```

### Presentation Mode
```
"Set brightness to 100%"
"Set volume to 70%"
"Turn off WiFi"  # Avoid notifications
```

### Battery Saving
```
"Set brightness to 30%"
"Turn off WiFi"
"Turn off Bluetooth"
```

---

## 📞 Support

If commands don't work:
1. Check installation requirements
2. Verify permissions
3. Test command manually in terminal
4. Check error messages in console (F12)
5. Refer to FIXES_COMPLETE.md for detailed troubleshooting

---

**Last Updated:** February 11, 2026
**Version:** 0.1.9
