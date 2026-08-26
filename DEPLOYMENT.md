# Network Configuration & USB Reverse Tethering Runbook

## 📶 1. Wi-Fi Local Network Setup
Ensure both PC and smartphone are connected to the same Wi-Fi router.

## 🔌 2. USB Reverse Tethering (Zero Jitter Mode)
For competitive gaming and live streaming where Wi-Fi interference exists:

1. Enable **USB Debugging** on your Android smartphone.
2. Connect phone via USB cable to PC.
3. Run ADB port forward:
   ```bash
   adb reverse tcp:3000 tcp:3000
   ```
4. On phone browser, navigate directly to **`http://localhost:3000`**.
