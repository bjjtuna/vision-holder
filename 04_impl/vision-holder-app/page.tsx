import Link from 'next/link'
import { Brain, Code, Users, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Vision Holder
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="#features" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Features
              </Link>
              <Link href="#about" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                About
              </Link>
              <Link href="#contact" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Contact
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="btn-secondary">
                Sign In
              </button>
              <button className="btn-primary">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 text-dyslexia-friendly">
            AI Coding Assistant for{' '}
            <span className="text-primary-600 dark:text-primary-400">Everyone</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto text-dyslexia-friendly">
            Designed specifically for people with ADHD, dyslexia, and those who can't code. 
            Get more control and structure than traditional "vibe coding" approaches.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary text-lg px-8 py-4">
              Start Your First Project
            </button>
            <button className="btn-secondary text-lg px-8 py-4">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mt-32">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-16 text-dyslexia-friendly">
            Built for Your Brain
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card text-center">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 text-dyslexia-friendly">
                ADHD-Friendly
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-dyslexia-friendly">
                Clear, step-by-step processes that keep you focused and on track
              </p>
            </div>
            
            <div className="card text-center">
              <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Code className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 text-dyslexia-friendly">
                Dyslexia-Friendly
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-dyslexia-friendly">
                High contrast, readable fonts, and visual organization
              </p>
            </div>
            
            <div className="card text-center">
              <div className="w-12 h-12 bg-success-100 dark:bg-success-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-success-600 dark:text-success-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 text-dyslexia-friendly">
                User Control
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-dyslexia-friendly">
                You maintain control over your project direction and decisions
              </p>
            </div>
            
            <div className="card text-center">
              <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-warning-600 dark:text-warning-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 text-dyslexia-friendly">
                AI-Powered
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-dyslexia-friendly">
                Advanced AI assistance that adapts to your learning style
              </p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="mt-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 text-dyslexia-friendly">
                More Than Just Code Generation
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 text-dyslexia-friendly">
                Vision Holder bridges the gap between no-code solutions and full development. 
                We provide structured guidance that helps you understand what you're building 
                while maintaining full control over your project.
              </p>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300 text-dyslexia-friendly">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Visual project structure with clear file organization
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Progress tracking and milestone celebrations
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Built-in error prevention and validation
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Learning-focused approach that builds confidence
                </li>
              </ul>
            </div>
            <div className="card">
              <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900 dark:to-secondary-900 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Code className="w-16 h-16 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 text-dyslexia-friendly">
                    Interactive Demo Coming Soon
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">Vision Holder</h3>
              </div>
              <p className="text-gray-400 text-dyslexia-friendly">
                Making coding accessible to everyone, regardless of neurodiversity.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-dyslexia-friendly">Product</h4>
              <ul className="space-y-2 text-gray-400 text-dyslexia-friendly">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-dyslexia-friendly">Support</h4>
              <ul className="space-y-2 text-gray-400 text-dyslexia-friendly">
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Community</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-dyslexia-friendly">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-dyslexia-friendly">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Accessibility</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-dyslexia-friendly">
            <p>&copy; 2024 Vision Holder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 