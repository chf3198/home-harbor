import React from 'react';

function DevInfo() {
  return (
    <div>
      <h3>Technical Information</h3>
      <p>This application demonstrates modern serverless architecture.</p>

      <h4>Architecture</h4>
      <ul>
        <li><strong>Frontend:</strong> React with Vite</li>
        <li><strong>Backend:</strong> AWS Lambda functions</li>
        <li><strong>Database:</strong> DynamoDB with TTL caching</li>
        <li><strong>AI:</strong> OpenRouter API with cascading fallbacks</li>
      </ul>

      <h4>Data Sources</h4>
      <ul>
        <li>Redfin Market Analytics (public S3)</li>
        <li>Connecticut Open Data (government API)</li>
        <li>Google Street View (free tier)</li>
      </ul>
    </div>
  );
}

export default DevInfo;