import HomeClient from "./HomeClient"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Digitex | The Future Decoded",
  description: "Digitex is a student-led publication exploring the intersection of technology, innovation, and society.",
  openGraph: {
    title: "Digitex | The Future Decoded",
    description: "Digitex is a student-led publication exploring the intersection of technology, innovation, and society.",
    type: "website",
    url: "https://wearedigitex.org",
  },
}

export default function HomePage() {
  return <HomeClient />
}
