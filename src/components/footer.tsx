import Link from "next/link";
import {
  Twitter,
  Linkedin,
  Github,
  Sparkles,
  Globe,
  Shield,
  Zap,
  ArrowRight,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-blue-800 via-blue-900 to-purple-900 overflow-hidden">
      {/* Diagonal Stripes Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              rgba(255,255,255,0.1) 0px,
              rgba(255,255,255,0.1) 2px,
              transparent 2px,
              transparent 20px
            )`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* CTA Section */}
        {/* <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Let us take you from zero to
            <span className="block text-blue-200">tokenized assets</span>
          </h2>

          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of asset owners leveraging blockchain technology to
            unlock liquidity and access global DeFi markets through verified NFT
            tokenization.
          </p>

          <Link
            href="/sign-up"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-900 font-bold text-lg rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div> */}

        {/* Logo and tagline section */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-extrabold text-blue-600">Tf</span>
            </div>
            <h3 className="text-3xl font-bold text-white">TangibleFi</h3>
          </div>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Revolutionizing asset ownership through blockchain tokenization and
            instant DeFi liquidity access
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {/* Platform Column */}
          <div className="group">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-white text-lg">Platform</h3>
            </div>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#features"
                  className="text-blue-200 hover:text-white transition-colors duration-300 text-sm"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-blue-200 hover:text-white transition-colors duration-300 text-sm"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-blue-200 hover:text-white transition-colors duration-300 text-sm"
                >
                  Supported Chains
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-blue-200 hover:text-white transition-colors duration-300 text-sm"
                >
                  API Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions Column */}
          <div className="group">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-white text-lg">Solutions</h3>
            </div>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-blue-200 hover:text-white transition-colors duration-300 text-sm"
                >
                  Asset Tokenization
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-blue-200 hover:text-white transition-colors duration-300 text-sm"
                >
                  RWA Lending
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-blue-200 hover:text-white transition-colors duration-300 text-sm"
                >
                  Portfolio Management
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-blue-200 hover:text-white transition-colors duration-300 text-sm"
                >
                  Enterprise Solutions
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="group">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-white text-lg">Resources</h3>
            </div>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-blue-200 hover:text-white transition-colors duration-300 text-sm"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-blue-200 hover:text-white transition-colors duration-300 text-sm"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-blue-200 hover:text-white transition-colors duration-300 text-sm"
                >
                  Community
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-blue-200 hover:text-white transition-colors duration-300 text-sm"
                >
                  Status Page
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="group">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-white text-lg">Legal</h3>
            </div>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-blue-200 hover:text-white transition-colors duration-300 text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-blue-200 hover:text-white transition-colors duration-300 text-sm"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-blue-200 hover:text-white transition-colors duration-300 text-sm"
                >
                  Security
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-blue-200 hover:text-white transition-colors duration-300 text-sm"
                >
                  Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-blue-200 mb-4 md:mb-0 text-sm">
              © {currentYear} TangibleFi. All rights reserved.
            </div>

            <div className="flex items-center space-x-6">
              <a
                href="#"
                className="text-blue-200 hover:text-white transition-colors duration-300"
              >
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-blue-200 hover:text-white transition-colors duration-300"
              >
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-blue-200 hover:text-white transition-colors duration-300"
              >
                <span className="sr-only">GitHub</span>
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Brand statement */}
        <div className="text-center mt-8 pt-8 border-t border-white/10">
          <p className="text-xs text-blue-200 max-w-4xl mx-auto leading-relaxed">
            TangibleFi is a revolutionary blockchain platform that transforms
            real-world assets into verified NFTs, enabling instant USDC
            liquidity through cutting-edge DeFi protocols across multiple
            blockchain networks. Our platform supports Ethereum, Polygon, BNB
            Chain, and Arbitrum with enterprise-grade security and compliance.
          </p>
        </div>
      </div>
    </footer>
  );
}
