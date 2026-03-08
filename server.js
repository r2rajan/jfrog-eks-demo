const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>JFrog-EKS Demo</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .container {
          text-align: center;
          padding: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          backdrop-filter: blur(10px);
        }
        h1 { margin: 0 0 20px 0; }
        .info { font-size: 14px; opacity: 0.9; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 GitHub + JFrog + AWS EKS Demo</h1>
        <p>Application is running successfully!</p>
        <div class="info">
          <p>Version: ${process.env.APP_VERSION || '1.0.0'}</p>
          <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
