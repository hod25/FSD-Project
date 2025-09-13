# ==== FILE: main.py ====
from fastapi import FastAPI, Query, Request, HTTPException
from fastapi.responses import StreamingResponse, HTMLResponse
from streamer import (
    generate_frames, 
    generate_live_stream, 
    test_rtmp_connection, 
    cleanup_resources,
    get_connection_stats
)
import uvicorn
import signal
import sys
import uuid
import atexit

app = FastAPI(title="PRO SAFE - Safety Detection System")


@app.get("/")
def home():
    return {
        "status": "🟢 PRO SAFE System Online",
        "endpoints": {
            "processed_video": "/video?site_id=X&area_id=Y",
            "live_stream": "/live?site_id=X&area_id=Y",
            "status": "/status",
            "connections": "/connections",
            "test": "/test"
        },
        "rtmp_config": {
            "server": "rtmp://YOUR_SERVER_IP:1935/live",
            "stream_key": "stream"
        }
    }


@app.get("/video")
def video(request: Request, site_id: str = Query(...), area_id: str = Query(...)):
    """
    Video endpoint with automatic connection management
    """
    connection_id = str(uuid.uuid4())
    print(f"📹 New video request: {connection_id[:8]} from {request.client.host}")
    
    return StreamingResponse(
        generate_frames(site_id=site_id, area_id=area_id, connection_id=connection_id),
        media_type="multipart/x-mixed-replace; boundary=frame",
        headers={
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
            "Connection": "close"
        }
    )


@app.get("/live")
def live_stream(request: Request, site_id: str = Query(default="live"), area_id: str = Query(default="camera1")):
    """
    Live stream endpoint with automatic connection management
    """
    connection_id = str(uuid.uuid4())
    print(f"📡 New live stream request: {connection_id[:8]} from {request.client.host}")
    
    return StreamingResponse(
        generate_live_stream(site_id=site_id, area_id=area_id, connection_id=connection_id),
        media_type="multipart/x-mixed-replace; boundary=frame",
        headers={
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache", 
            "Expires": "0",
            "Connection": "close"
        }
    )


@app.get("/status")
def check_status():
    """
    System status endpoint
    """
    rtmp_active = test_rtmp_connection()
    stats = get_connection_stats()
    
    return {
        "system": "🟢 Online",
        "rtmp_server": "🟢 Connected" if rtmp_active else "🔴 No stream detected",
        "connections": stats
    }


@app.get("/connections")
def connection_status():
    """
    Detailed connection status
    """
    return get_connection_stats()


@app.get("/test")
def test_page():
    """
    Test page with improved connection handling
    """
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>PRO SAFE - Stream Test</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                padding: 20px; 
                background-color: #f5f5f5; 
            }
            h1 { 
                margin-bottom: 8px; 
                color: #333; 
            }
            .row { 
                display: flex; 
                gap: 20px; 
                flex-wrap: wrap; 
                margin-bottom: 20px; 
            }
            .card { 
                border: 1px solid #ddd; 
                border-radius: 10px; 
                padding: 15px; 
                background: white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                flex: 1;
                min-width: 300px;
            }
            img { 
                max-width: 100%; 
                height: auto; 
                display: block; 
                border: 1px solid #ddd;
                border-radius: 5px;
            }
            .status { 
                margin-top: 15px; 
                padding: 10px; 
                background: #e8f4fd; 
                border-radius: 5px; 
                font-size: 14px;
            }
            .connection-info {
                background: #f0f8ff;
                padding: 10px;
                border-radius: 5px;
                margin-top: 10px;
                font-family: monospace;
                font-size: 12px;
            }
            button {
                background: #007bff;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                margin: 5px;
            }
            button:hover {
                background: #0056b3;
            }
            .error {
                color: #dc3545;
                background: #f8d7da;
                border: 1px solid #f5c6cb;
                padding: 10px;
                border-radius: 4px;
                margin: 10px 0;
            }
        </style>
    </head>
    <body>
        <h1>PRO SAFE - Stream Test Page</h1>
        
        <div class="status">
            <strong>Connection Status:</strong> 
            <span id="connectionStatus">Loading...</span>
            <button onclick="refreshStatus()">Refresh Status</button>
            <button onclick="stopAllStreams()">Stop All Streams</button>
        </div>

        <div class="row">
            <div class="card">
                <h3>📹 Processed Video (AI Detection)</h3>
                <img id="video1" width="640" src="/video?site_id=test&area_id=camera1" 
                     onerror="handleImageError(this, 'video')" onload="handleImageLoad(this, 'video')">
                <div class="connection-info" id="videoInfo">
                    Status: <span id="videoStatus">Connecting...</span><br>
                    Connection ID: <span id="videoConnId">-</span>
                </div>
                <button onclick="restartStream('video')">Restart Video</button>
            </div>
            
            <div class="card">
                <h3>📡 Live Stream (RTMP)</h3>
                <img id="live1" width="640" src="/live?site_id=live&area_id=camera1" 
                     onerror="handleImageError(this, 'live')" onload="handleImageLoad(this, 'live')">
                <div class="connection-info" id="liveInfo">
                    Status: <span id="liveStatus">Connecting...</span><br>
                    Connection ID: <span id="liveConnId">-</span>
                </div>
                <button onclick="restartStream('live')">Restart Live</button>
            </div>
        </div>

        <div id="errorMessages"></div>

        <script>
            let videoConnId = generateUUID();
            let liveConnId = generateUUID();
            let statusRefreshInterval;
            let streamErrorCount = { video: 0, live: 0 };

            function generateUUID() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            }

            function updateConnectionIds() {
                document.getElementById('videoConnId').textContent = videoConnId.substring(0, 8);
                document.getElementById('liveConnId').textContent = liveConnId.substring(0, 8);
            }

            function handleImageLoad(img, type) {
                document.getElementById(type + 'Status').textContent = '✅ Connected';
                document.getElementById(type + 'Status').style.color = 'green';
                streamErrorCount[type] = 0;
                clearErrorMessage(type);
            }

            function handleImageError(img, type) {
                streamErrorCount[type]++;
                document.getElementById(type + 'Status').textContent = '❌ Error';
                document.getElementById(type + 'Status').style.color = 'red';
                
                showErrorMessage(type, `Stream error (${streamErrorCount[type]} attempts)`);
                
                // Auto-retry after 3 seconds, max 5 attempts
                if (streamErrorCount[type] < 5) {
                    setTimeout(() => {
                        restartStream(type);
                    }, 3000);
                }
            }

            function restartStream(type) {
                if (type === 'video') {
                    videoConnId = generateUUID();
                                        document.getElementById('video1').src = `/video?site_id=test&area_id=camera1&t=${Date.now()}`;
                } else if (type === 'live') {
                    liveConnId = generateUUID();
                    document.getElementById('live1').src = `/live?site_id=live&area_id=camera1&t=${Date.now()}`;
                }
                
                document.getElementById(type + 'Status').textContent = '🔄 Reconnecting...';
                document.getElementById(type + 'Status').style.color = 'orange';
                updateConnectionIds();
                streamErrorCount[type] = 0;
                clearErrorMessage(type);
            }

            function stopAllStreams() {
                document.getElementById('video1').src = '';
                document.getElementById('live1').src = '';
                document.getElementById('videoStatus').textContent = '⏹️ Stopped';
                document.getElementById('liveStatus').textContent = '⏹️ Stopped';
                document.getElementById('videoStatus').style.color = 'gray';
                document.getElementById('liveStatus').style.color = 'gray';
            }

            function showErrorMessage(type, message) {
                const errorDiv = document.getElementById('errorMessages');
                const errorId = type + 'Error';
                
                // Remove existing error for this type
                const existing = document.getElementById(errorId);
                if (existing) existing.remove();
                
                const errorElement = document.createElement('div');
                errorElement.id = errorId;
                errorElement.className = 'error';
                errorElement.innerHTML = `<strong>${type.toUpperCase()} Stream Error:</strong> ${message}`;
                errorDiv.appendChild(errorElement);
            }

            function clearErrorMessage(type) {
                const errorElement = document.getElementById(type + 'Error');
                if (errorElement) errorElement.remove();
            }

            async function refreshStatus() {
                try {
                    const response = await fetch('/connections');
                    const data = await response.json();
                    
                    let statusText = `Total: ${data.total_connections} | `;
                    statusText += `Video: ${data.by_type.video || 0} | `;
                    statusText += `Live: ${data.by_type.live || 0} | `;
                    statusText += `Processors: ${data.active_processors}`;
                    
                    document.getElementById('connectionStatus').textContent = statusText;
                } catch (error) {
                    document.getElementById('connectionStatus').textContent = 'Status fetch failed';
                }
            }

            // Initialize
            updateConnectionIds();
            refreshStatus();
            
            // Auto-refresh status every 10 seconds
            statusRefreshInterval = setInterval(refreshStatus, 10000);

            // Handle page unload
            window.addEventListener('beforeunload', function() {
                clearInterval(statusRefreshInterval);
                stopAllStreams();
            });
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)


def shutdown_handler(signum, frame):
    """Handle graceful shutdown"""
    print("\n🛑 Shutdown requested. Cleaning up connections...")
    cleanup_resources()
    sys.exit(0)


def cleanup_on_exit():
    """Cleanup function for normal exit"""
    cleanup_resources()


# Register cleanup handlers
signal.signal(signal.SIGINT, shutdown_handler)
signal.signal(signal.SIGTERM, shutdown_handler)
atexit.register(cleanup_on_exit)


if __name__ == "__main__":
    try:
        print("🚀 Starting PRO SAFE System...")
        print("📊 Connection management enabled")
        print("🧹 Auto-cleanup every 10 seconds")
        print("⏰ Connection timeout: 30 seconds")
        
        # הערה: uvloop/httptools זמינים רק אם מותקנים; אם לא, הסר את הפרמטרים
        uvicorn.run("main:app", host="0.0.0.0", port=8000)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {e}")
    finally:
        cleanup_resources()