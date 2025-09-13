module.exports = {
    apps: [
        {
            name: 'prosafe-server',
            script: './server/dist/server.js',
            interpreter: 'node',
            cwd: '/home/cs101/FSD-Project',
            env: {
                NODE_ENV: 'production',
                PORT: 5000,
                NODE_OPTIONS: '--max-old-space-size=2048'
            },
            instances: 1,
            exec_mode: 'fork',
            watch: false,

            // Memory management
            max_memory_restart: '1G',

            // Restart policies
            autorestart: true,
            max_restarts: 15,
            min_uptime: '30s',
            restart_delay: 4000,

            // Health monitoring
            exp_backoff_restart_delay: 100,

            // Process management
            kill_timeout: 5000,
            listen_timeout: 8000,

            // Logging
            log_file: './logs/prosafe.log',
            error_file: './logs/prosafe-error.log',
            out_file: './logs/prosafe-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            log_type: 'json',

            // Error handling
            ignore_watch: ['node_modules', 'logs'],

            // Resource limits
            max_old_space_size: 2048,

            // Auto-update options
            pmx: false,

            // Environment specific
            instance_var: 'INSTANCE_ID',

            // Advanced options
            node_args: [
                '--trace-warnings',
                '--enable-source-maps'
            ],

            // Graceful shutdown
            shutdown_with_message: true,
            wait_ready: true,
            listen_timeout: 10000,

            // Monitoring and health checks
            health_check_delay: 30000,

            // Cron restart (optional - restart daily at 3 AM)
            cron_restart: '0 3 * * *'
        }
    ]
};
