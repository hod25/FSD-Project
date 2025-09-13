#!/bin/bash

# PM2 Control Script for ProSafe Server

case "$1" in
    start)
        echo "🚀 Starting ProSafe server..."
        sudo pm2 start ecosystem.config.js
        ;;
    stop)
        echo "🛑 Stopping ProSafe server..."
        sudo pm2 stop prosafe-server
        ;;
    restart)
        echo "🔄 Restarting ProSafe server..."
        sudo pm2 restart prosafe-server
        ;;
    reload)
        echo "🔄 Reloading ProSafe server with new config..."
        sudo pm2 reload ecosystem.config.js
        ;;
    status)
        echo "📊 ProSafe server status:"
        sudo pm2 status
        ;;
    logs)
        echo "📋 ProSafe server logs:"
        sudo pm2 logs prosafe-server --lines 50
        ;;
    monitor)
        echo "📈 Opening PM2 monitor..."
        sudo pm2 monit
        ;;
    delete)
        echo "🗑️ Deleting ProSafe server from PM2..."
        sudo pm2 delete prosafe-server
        ;;
    build)
        echo "🔨 Building server..."
        cd server && npm run build
        echo "✅ Build complete!"
        ;;
    deploy)
        echo "🚀 Full deployment: build + restart..."
        cd server && npm run build
        cd ..
        sudo pm2 restart prosafe-server
        echo "✅ Deployment complete!"
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|reload|status|logs|monitor|delete|build|deploy}"
        echo ""
        echo "Commands:"
        echo "  start    - Start the server"
        echo "  stop     - Stop the server"
        echo "  restart  - Restart the server"
        echo "  reload   - Reload with new config"
        echo "  status   - Show server status"
        echo "  logs     - Show recent logs"
        echo "  monitor  - Open PM2 monitor"
        echo "  delete   - Remove from PM2"
        echo "  build    - Build server only"
        echo "  deploy   - Build and restart"
        exit 1
        ;;
esac

exit 0
