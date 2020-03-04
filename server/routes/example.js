export default function(server) {
  server.route({
    path: '/api/newTestPlugin/example',
    method: 'GET',
    handler() {
      return { time: new Date().toISOString() };
    },
  });
}
