import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="container-custom">
        <div className="py-8">
          <div className="md:flex md:items-center md:justify-between">
            {/* Left side - Logo and description */}
            <div className="flex items-center space-x-2">
              <Github className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                Code Quality Dashboard
              </span>
            </div>

            {/* Center - Links */}
            <nav className="mt-4 md:mt-0">
              <div className="flex space-x-6">
                <Link
                  to="/about"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  About
                </Link>
                <Link
                  to="/privacy"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Privacy
                </Link>
                <Link
                  to="/terms"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Terms
                </Link>
                <Link
                  to="/api"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  API
                </Link>
                <a
                  href="https://github.com/yourusername/code-quality-dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  GitHub
                </a>
              </div>
            </nav>

            {/* Right side - Copyright */}
            <div className="mt-4 md:mt-0 flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
              <span>© {currentYear}</span>
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500" fill="currentColor" />
              <span>for developers</span>
            </div>
          </div>

          {/* Bottom section */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center md:text-left">
              Open source code quality analysis for GitHub repositories. 
              Help improve code quality, security, and maintainability across the developer community.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;