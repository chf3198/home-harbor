const { createApp } = require('./app');
const { loadData } = require('./dataService');

const PORT = process.env.PORT || 3000;

async function start() {
  await loadData();
  const app = createApp();

  app.listen(PORT, () => {
    console.log(`HomeHarbor running on http://localhost:${PORT}`);
  });
}

start();

process.on('SIGINT', () => {
  console.log('Shutting down HomeHarbor server');
  process.exit(0);
});
