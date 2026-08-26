"""
Android-to-PC Microphone — Python Virtual Audio Cable Bridge
Connects to the WebSocket audio server and feeds live PCM audio to your default Windows audio output or VB-Audio Cable.
"""

import sys
import asyncio
import websockets

try:
    import pyaudio
except ImportError:
    print("[Error] pyaudio not installed. Run: pip install pyaudio")
    sys.exit(1)

# Audio Stream Specs
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 48000
CHUNK = 1024

async def stream_receiver(server_ws_url="ws://localhost:3000?role=receiver"):
    p = pyaudio.PyAudio()
    
    # Open audio output stream
    stream = p.open(format=FORMAT,
                    channels=CHANNELS,
                    rate=RATE,
                    output=True,
                    frames_per_buffer=CHUNK)

    print(f"[*] Connecting to Audio Server: {server_ws_url}")
    
    try:
        async with websockets.connect(server_ws_url, max_size=None) as websocket:
            print("[+] Connected! Live audio streaming to speakers / Virtual Cable.")
            while True:
                pcm_data = await websocket.recv()
                if isinstance(pcm_data, bytes):
                    stream.write(pcm_data)
    except Exception as e:
        print(f"[-] Connection Error: {e}")
    finally:
        stream.stop_stream()
        stream.close()
        p.terminate()

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "ws://localhost:3000?role=receiver"
    asyncio.run(stream_receiver(url))
