import Link from "next/link"
import { Instagram, Linkedin, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 py-12 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#28829E]/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Three Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Left: Branding */}
          <div>
            <h3 className="text-2xl font-bold mb-3">
              Digite<span className="text-[#28829E]">X</span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering future innovators through cutting-edge content and community.
            </p>
          </div>

          {/* Center: Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                About Us
              </Link>
              <Link href="/#team" className="text-gray-400 hover:text-white transition-colors text-sm">
                Our Team
              </Link>
              <Link href="/blog" className="text-gray-400 hover:text-white transition-colors text-sm">
                Blog
              </Link>
              <Link href="/#contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                Contact
              </Link>
            </div>
          </div>

          {/* Right: Connect With Us */}
          <div>
            <h4 className="text-white font-bold mb-4">Connect With Us</h4>
            <div className="flex flex-col gap-3">
              {/* Email */}
              <a
                href="mailto:wearedigitex@gmail.com"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm group"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>wearedigitex@gmail.com</span>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/wearedigitex"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm group"
              >
                <Instagram className="w-4 h-4 flex-shrink-0" />
                <span>@wearedigitex</span>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/wearedigitex"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm group"
              >
                <Linkedin className="w-4 h-4 flex-shrink-0" />
                <span>wearedigitex</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom: Copyright */}
        <div className="text-center pt-8 border-t border-white/5">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Digitex. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
