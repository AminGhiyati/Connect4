export default {
    server: {
        proxy: {
            '/socket.io': {
                target: 'http://localhost:3001',
                ws: true
            }
        }
    }
}
