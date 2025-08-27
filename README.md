<html>
<body>
<!--StartFragment--><html><head></head><body><h1>Code Quality Dashboard 📊</h1>
<blockquote>
<p>A comprehensive, open-source tool for analyzing GitHub repositories and visualizing code quality, security vulnerabilities, and maintainability metrics.</p>
</blockquote>
<h2>✨ Features</h2>
<ul>
<li><strong>📈 Quality Score Analysis</strong> - Get an overall quality score for any GitHub repository</li>
<li><strong>🔍 Code Metrics</strong> - Test coverage, maintainability index, and cyclomatic complexity</li>
<li><strong>🛡️ Security Scanning</strong> - Identify vulnerabilities in dependencies</li>
<li><strong>📊 Interactive Visualizations</strong> - Charts and graphs for trends and distributions</li>
<li><strong>🎯 Actionable Insights</strong> - Prioritized recommendations for improvements</li>
<li><strong>📱 Responsive Design</strong> - Works seamlessly on desktop and mobile</li>
<li><strong>🔄 Historical Tracking</strong> - Monitor quality improvements over time</li>
<li><strong>🏷️ Quality Badges</strong> - Generate badges for your repository README</li>
</ul>
<h2>🚀 Quick Start</h2>
<h3>Prerequisites</h3>
<ul>
<li>Node.js 16.0 or higher</li>
<li>npm or yarn</li>
<li>GitHub personal access token (for API access)</li>
</ul>
<h3>Installation</h3>
<ol>
<li>
<p><strong>Clone the repository</strong></p>
<pre><code class="language-bash">git clone https://github.com/yourusername/code-quality-dashboard.git
cd code-quality-dashboard
</code></pre>
</li>
<li>
<p><strong>Install dependencies</strong></p>
<pre><code class="language-bash"># Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
</code></pre>
</li>
<li>
<p><strong>Set up environment variables</strong></p>
<pre><code class="language-bash"># Create .env file in backend directory
cp .env.example .env

# Add your GitHub token
GITHUB_TOKEN=your_github_personal_access_token
PORT=3001
</code></pre>
</li>
<li>
<p><strong>Start the development servers</strong></p>
<pre><code class="language-bash"># Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
</code></pre>
</li>
<li>
<p><strong>Open your browser</strong>
Navigate to <code>http://localhost:3000</code> and start analyzing repositories!</p>
</li>
<li>Enter a GitHub repository URL in the input field</li>
<li>Click "Analyze Repository"</li>
<li>Wait for the analysis to complete (usually 30-60 seconds)</li>
<li>Explore the comprehensive quality report</li>
</ol>
<h3>Supported Repository Types</h3>
<ul>
<li>✅ JavaScript/TypeScript projects</li>
<li>✅ Python projects</li>
<li>✅ Java projects</li>
<li>✅ C# projects</li>
<li>✅ Go projects</li>
<li>🔄 More languages coming soon!</li>
</ul>
<h3>API Usage</h3>
<p>You can also use the dashboard programmatically:</p>
<pre><code class="language-javascript">// Analyze a repository
const response = await fetch('http://localhost:3001/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    repoUrl: 'https://github.com/user/repo'
  })
});

const analysis = await response.json();
console.log('Quality Score:', analysis.qualityScore);
</code></pre>
<h2>🔧 Configuration</h2>
<h3>Analysis Settings</h3>
<p>Customize the analysis by creating a <code>quality-config.json</code> file in your repository:</p>
<pre><code class="language-json">{
  "rules": {
    "testCoverageThreshold": 80,
    "complexityThreshold": 10,
    "maintainabilityThreshold": 70
  },
  "exclude": [
    "node_modules/**",
    "dist/**",
    "build/**"
  ],
  "plugins": [
    "eslint",
    "sonarjs",
    "security"
  ]
}
</code></pre>
<h3>Environment Variables</h3>

Variable | Description | Default
-- | -- | --
GITHUB_TOKEN | GitHub personal access token | Required
PORT | Backend server port | 3001
REDIS_URL | Redis URL for caching | Optional
DB_URL | Database URL for historical data | Optional


<h2>🏗️ Architecture</h2>
<pre><code>┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  React Frontend │    │  Express API    │    │ Analysis Engine │
│                 │────│                 │────│                 │
│  • Dashboard    │    │ • GitHub API    │    │  • ESLint       │
│  • Charts       │    │ • REST Routes   │    │  • SonarJS      │
│  • Components   │    │ • Authentication│    │  • npm audit    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
</code></pre>
<h2>🤝 Contributing</h2>
<p>We love contributions! Please see our <a href="https://claude.ai/chat/CONTRIBUTING.md">Contributing Guide</a> for details.</p>
<h3>Development Setup</h3>
<ol>
<li>Fork the repository</li>
<li>Create a feature branch: <code>git checkout -b feature/amazing-feature</code></li>
<li>Make your changes</li>
<li>Add tests for new functionality</li>
<li>Commit your changes: <code>git commit -m 'Add amazing feature'</code></li>
<li>Push to the branch: <code>git push origin feature/amazing-feature</code></li>
<li>Open a Pull Request</li>
</ol>
<h3>Code Style</h3>
<p>We use Prettier and ESLint to maintain code quality:</p>
<pre><code class="language-bash"># Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
</code></pre>
<h2>📋 Roadmap</h2>
<ul>
<li>[ ] <strong>v1.0</strong> - Basic repository analysis</li>
<li>[ ] <strong>v1.1</strong> - Historical tracking and trends</li>
<li>[ ] <strong>v1.2</strong> - Team collaboration features</li>
<li>[ ] <strong>v1.3</strong> - CI/CD integration</li>
<li>[ ] <strong>v1.4</strong> - Custom rules engine</li>
<li>[ ] <strong>v1.5</strong> - Multi-language support expansion</li>
<li>[ ] <strong>v2.0</strong> - ML-powered suggestions</li>
</ul>
<p>See our <a href="https://github.com/yourusername/code-quality-dashboard/projects/1">detailed roadmap</a> for more information.</p>
<h2>📊 Metrics Explained</h2>
<h3>Quality Score</h3>
<p>A composite score (0-100) based on:</p>
<ul>
<li><strong>Test Coverage</strong> (30% weight)</li>
<li><strong>Code Complexity</strong> (25% weight)</li>
<li><strong>Security Issues</strong> (25% weight)</li>
<li><strong>Maintainability</strong> (20% weight)</li>
</ul>
<h3>Maintainability Index</h3>
<p>Calculated using the formula:</p>
<pre><code>MI = 171 - 5.2 * ln(Halstead Volume) - 0.23 * (Cyclomatic Complexity) - 16.2 * ln(Lines of Code)
</code></pre>
<h3>Security Scanning</h3>
<p>We check for:</p>
<ul>
<li>Known vulnerabilities in dependencies</li>
<li>Insecure coding patterns</li>
<li>Outdated packages with security fixes</li>
<li>License compatibility issues</li>
</ul>
<h2>🐛 Troubleshooting</h2>
&lt;details&gt;
&lt;summary&gt;Common Issues and Solutions&lt;/summary&gt;
<h3>"GitHub API rate limit exceeded"</h3>
<ul>
<li><strong>Solution</strong>: Add a GitHub personal access token to your <code>.env</code> file</li>
<li><strong>Tip</strong>: Authenticated requests have a much higher rate limit (5000/hour vs 60/hour)</li>
</ul>
<h3>Analysis takes too long</h3>
<ul>
<li><strong>Solution</strong>: Large repositories may take several minutes to analyze</li>
<li><strong>Tip</strong>: Enable Redis caching to speed up subsequent analyses</li>
</ul>
<h3>Missing test coverage data</h3>
<ul>
<li><strong>Solution</strong>: Ensure your project has a coverage report (lcov.info or coverage.json)</li>
<li><strong>Tip</strong>: Run <code>npm test -- --coverage</code> before analysis</li>
</ul>
&lt;/details&gt;
<h2>📚 Documentation</h2>
<ul>
<li><a href="https://claude.ai/chat/docs/API.md">API Documentation</a></li>
<li><a href="https://claude.ai/chat/docs/CONFIGURATION.md">Configuration Guide</a></li>
<li><a href="https://claude.ai/chat/docs/DEPLOYMENT.md">Deployment Guide</a></li>
<li><a href="https://claude.ai/chat/docs/PLUGINS.md">Plugin Development</a></li>
</ul>
<h2>🛡️ Security</h2>
<p>If you discover a security vulnerability, please send an e-mail to security@yourdomain.com. All security vulnerabilities will be promptly addressed.</p>
<h2>📄 License</h2>
<p>This project is licensed under the MIT License - see the <a href="https://claude.ai/chat/LICENSE">LICENSE</a> file for details.</p>
<h2>🙏 Acknowledgments</h2>
<ul>
<li><a href="https://eslint.org/">ESLint</a> for JavaScript linting</li>
<li><a href="https://github.com/SonarSource/SonarJS">SonarJS</a> for code quality rules</li>
<li><a href="https://docs.github.com/en/rest">GitHub API</a> for repository data</li>
<li><a href="https://recharts.org/">Recharts</a> for beautiful visualizations</li>
<li><a href="https://tailwindcss.com/">Tailwind CSS</a> for styling</li>
</ul>
<h2>💖 Support</h2>
<p>If you find this project helpful, please consider:</p>
<ul>
<li>⭐ Starring the repository</li>
<li>🐛 Reporting bugs or suggesting features</li>
<li>📢 Sharing with your developer friends</li>
<li>☕ <a href="https://buymeacoffee.com/yourusername">Buying me a coffee</a></li>
</ul>
<hr>
</body></html><!--EndFragment-->
</body>
</html># Code Quality Dashboard 📊

> A comprehensive, open-source tool for analyzing GitHub repositories and visualizing code quality, security vulnerabilities, and maintainability metrics.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.0+-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16.0+-green.svg)](https://nodejs.org/)

![Code Quality Dashboard Screenshot](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Dashboard+Screenshot)

## ✨ Features

- **📈 Quality Score Analysis** - Get an overall quality score for any GitHub repository
- **🔍 Code Metrics** - Test coverage, maintainability index, and cyclomatic complexity
- **🛡️ Security Scanning** - Identify vulnerabilities in dependencies
- **📊 Interactive Visualizations** - Charts and graphs for trends and distributions
- **🎯 Actionable Insights** - Prioritized recommendations for improvements
- **📱 Responsive Design** - Works seamlessly on desktop and mobile
- **🔄 Historical Tracking** - Monitor quality improvements over time
- **🏷️ Quality Badges** - Generate badges for your repository README

## 🚀 Quick Start

### Prerequisites

- Node.js 16.0 or higher
- npm or yarn
- GitHub personal access token (for API access)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/code-quality-dashboard.git
   cd code-quality-dashboard
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file in backend directory
   cp .env.example .env
   
   # Add your GitHub token
   GITHUB_TOKEN=your_github_personal_access_token
   PORT=3001
   ```

4. **Start the development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` and start analyzing repositories!

## 📸 Screenshots

<details>
<summary>Click to view screenshots</summary>

### Dashboard Overview
![Dashboard Overview](https://via.placeholder.com/600x300/4F46E5/FFFFFF?text=Dashboard+Overview)

### Code Metrics
![Code Metrics](https://via.placeholder.com/600x300/10B981/FFFFFF?text=Code+Metrics)

### Security Analysis
![Security Analysis](https://via.placeholder.com/600x300/EF4444/FFFFFF?text=Security+Analysis)

</details>

## 🛠️ Usage

### Basic Analysis

1. Enter a GitHub repository URL in the input field
2. Click "Analyze Repository"
3. Wait for the analysis to complete (usually 30-60 seconds)
4. Explore the comprehensive quality report

### Supported Repository Types

- ✅ JavaScript/TypeScript projects
- ✅ Python projects  
- ✅ Java projects
- ✅ C# projects
- ✅ Go projects
- 🔄 More languages coming soon!

### API Usage

You can also use the dashboard programmatically:

```javascript
// Analyze a repository
const response = await fetch('http://localhost:3001/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    repoUrl: 'https://github.com/user/repo'
  })
});

const analysis = await response.json();
console.log('Quality Score:', analysis.qualityScore);
```

## 🔧 Configuration

### Analysis Settings

Customize the analysis by creating a `quality-config.json` file in your repository:

```json
{
  "rules": {
    "testCoverageThreshold": 80,
    "complexityThreshold": 10,
    "maintainabilityThreshold": 70
  },
  "exclude": [
    "node_modules/**",
    "dist/**",
    "build/**"
  ],
  "plugins": [
    "eslint",
    "sonarjs",
    "security"
  ]
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GITHUB_TOKEN` | GitHub personal access token | Required |
| `PORT` | Backend server port | 3001 |
| `REDIS_URL` | Redis URL for caching | Optional |
| `DB_URL` | Database URL for historical data | Optional |

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Express API    │    │  Analysis Engine│
│                 │────│                 │────│                 │
│  • Dashboard    │    │  • GitHub API   │    │  • ESLint       │
│  • Charts       │    │  • REST Routes  │    │  • SonarJS      │
│  • Components   │    │  • Authentication│   │  • npm audit    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🤝 Contributing

We love contributions! Please see our [[Contributing Guide](https://claude.ai/chat/CONTRIBUTING.md)](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

We use Prettier and ESLint to maintain code quality:

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 📋 Roadmap

- [ ] **v1.0** - Basic repository analysis
- [ ] **v1.1** - Historical tracking and trends
- [ ] **v1.2** - Team collaboration features
- [ ] **v1.3** - CI/CD integration
- [ ] **v1.4** - Custom rules engine
- [ ] **v1.5** - Multi-language support expansion
- [ ] **v2.0** - ML-powered suggestions

See our [[detailed roadmap](https://github.com/yourusername/code-quality-dashboard/projects/1)](https://github.com/yourusername/code-quality-dashboard/projects/1) for more information.

## 📊 Metrics Explained

### Quality Score
A composite score (0-100) based on:
- **Test Coverage** (30% weight)
- **Code Complexity** (25% weight)  
- **Security Issues** (25% weight)
- **Maintainability** (20% weight)

### Maintainability Index
Calculated using the formula:
```
MI = 171 - 5.2 * ln(Halstead Volume) - 0.23 * (Cyclomatic Complexity) - 16.2 * ln(Lines of Code)
```

### Security Scanning
We check for:
- Known vulnerabilities in dependencies
- Insecure coding patterns
- Outdated packages with security fixes
- License compatibility issues

## 🐛 Troubleshooting

<details>
<summary>Common Issues and Solutions</summary>

### "GitHub API rate limit exceeded"
- **Solution**: Add a GitHub personal access token to your `.env` file
- **Tip**: Authenticated requests have a much higher rate limit (5000/hour vs 60/hour)

### Analysis takes too long
- **Solution**: Large repositories may take several minutes to analyze
- **Tip**: Enable Redis caching to speed up subsequent analyses

### Missing test coverage data
- **Solution**: Ensure your project has a coverage report (lcov.info or coverage.json)
- **Tip**: Run `npm test -- --coverage` before analysis

</details>

## 📚 Documentation

- [[API Documentation](https://claude.ai/chat/docs/API.md)](docs/API.md)
- [[Configuration Guide](https://claude.ai/chat/docs/CONFIGURATION.md)](docs/CONFIGURATION.md)
- [[Deployment Guide](https://claude.ai/chat/docs/DEPLOYMENT.md)](docs/DEPLOYMENT.md)
- [[Plugin Development](https://claude.ai/chat/docs/PLUGINS.md)](docs/PLUGINS.md)

## 🛡️ Security

If you discover a security vulnerability, please send an e-mail to security@yourdomain.com. All security vulnerabilities will be promptly addressed.

## 📄 License

This project is licensed under the MIT License - see the [[LICENSE](https://claude.ai/chat/LICENSE)](LICENSE) file for details.

## 🙏 Acknowledgments

- [[ESLint](https://eslint.org/)](https://eslint.org/) for JavaScript linting
- [[SonarJS](https://github.com/SonarSource/SonarJS)](https://github.com/SonarSource/SonarJS) for code quality rules
- [[GitHub API](https://docs.github.com/en/rest)](https://docs.github.com/en/rest) for repository data
- [[Recharts](https://recharts.org/)](https://recharts.org/) for beautiful visualizations
- [[Tailwind CSS](https://tailwindcss.com/)](https://tailwindcss.com/) for styling

## 💖 Support

If you find this project helpful, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs or suggesting features
- 📢 Sharing with your developer friends
- ☕ [[Buying me a coffee](https://buymeacoffee.com/yourusername)](https://buymeacoffee.com/yourusername)

---

<div align="center">
  <strong>Made with ❤️ by developers, for developers</strong>
  <br>
  <sub>Help make code quality visible and actionable for everyone</sub>
</div>
