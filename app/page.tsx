import HomeClient from "./HomeClient"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Digitex | The Future Decoded",
  description: "Digitex is a student-led platform empowering the next generation to explore their interests, discover their passions, and find their path forward.",
  alternates: {
    canonical: 'https://wearedigitex.org/',
  },
  openGraph: {
    title: "Digitex | The Future Decoded",
    description: "Digitex is a student-led platform empowering the next generation to explore their interests, discover their passions, and find their path forward.",
    type: "website",
    url: "https://wearedigitex.org",
  },
}

export default function HomePage() {
  return <HomeClient />
}
