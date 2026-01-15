import Link from "next/link"
import { Instagram, Linkedin, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 py-16 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#28829E]/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">

          {/* Branding */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2">
              Digite<span className="text-[#28829E]">X</span>
            </h3>
            <p className="text-gray-400 text-sm">The Future Decoded</p>
          </div>

          {/* Contact & Social */}
          <div className="flex flex-col items-center gap-6">
            {/* Email */}
            <a
              href="mailto:wearedigitex@gmail.com"
              className="flex items-center gap-2 text-gray-300 hover:text-[#28829E] transition-colors group"
            >
              <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">wearedigitex@gmail.com</span>
            </a>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/wearedigitex"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#28829E] border border-white/10 hover:border-[#28829E] flex items-center justify-center transition-all hover:scale-110 group"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </a>
              <a
                href="https://www.linkedin.com/company/wearedigitex"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#28829E] border border-white/10 hover:border-[#28829E] flex items-center justify-center transition-all hover:scale-110 group"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
              Blog
            </Link>
            <Link href="/#team" className="text-gray-400 hover:text-white transition-colors">
              Team
            </Link>
            <Link href="/#contact" className="text-gray-400 hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Digitex. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
