export default function() {
  server.route({
    path: 'http://127.0.0.1:9200/_cluster/health',
    method: 'GET',
    handler() {
      return { health: {} };
    },
  });
}
