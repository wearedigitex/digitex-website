import { NextResponse } from 'next/server';

const BLOG_POSTS = [
  {
    id: 1,
    category: "Technology",
    title: "The Rise of Quantum Computing in 2026",
    excerpt: "Exploring how quantum leaps are redefining encryption and processing power.",
    date: "Jan 10, 2026",
    image: "/images/blog-quantum.jpg" 
  },
  {
    id: 2,
    category: "Startups",
    title: "Unicorns of Southeast Asia: Q1 Report",
    excerpt: "A deep dive into the emerging markets and the startups leading the charge.",
    date: "Jan 08, 2026",
    image: "/images/blog-startup.jpg"
  },
  {
    id: 3,
    category: "Innovation",
    title: "The future of Sustainable Energy",
    excerpt: "How student researchers are breaking ground in solar efficiency.",
    date: "Jan 05, 2026",
    image: "/images/blog-energy.jpg"
  },
  {
    id: 4,
    category: "Campus",
    title: "Hackathon 2025: Winners Announced",
    excerpt: "Highlights from the 48-hour coding marathon that took over the engineering hub.",
    date: "Jan 03, 2026",
    image: "/images/blog-hackathon.jpg"
  },
  {
    id: 5,
    category: "Opinion",
    title: "Why AI Regulation is Essential",
    excerpt: "Balancing innovation with safety in the age of generative intelligence.",
    date: "Jan 02, 2026",
    image: "/images/blog-ai.jpg"
  },
  {
    id: 6,
    category: "Design",
    title: "Minimalism in the Metaverse",
    excerpt: "Designing user interfaces for spatial computing and AR environments.",
    date: "Dec 28, 2025",
    image: "/images/blog-design.jpg"
  },
]

export async function GET() {
  // Simulate database delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return NextResponse.json(BLOG_POSTS);
}
