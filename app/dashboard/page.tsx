import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileEdit, Eye, Trash2, LogOut } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-black text-white pt-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
           <div>
             <h1 className="text-4xl font-bold mb-2">Welcome Back, Iraj Gupta</h1>
             <p className="text-gray-400">Executive Committee Dashboard</p>
           </div>
           <Link href="/">
             <Button variant="destructive" className="gap-2">
               <LogOut className="w-4 h-4" /> Logout
             </Button>
           </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
           {/* Tool 1 */}
           <Card className="bg-[#111] border-white/10 hover:border-[#28829E] transition-colors cursor-pointer group">
             <CardHeader>
               <div className="w-12 h-12 rounded-lg bg-teal-500/10 flex items-center justify-center mb-4 group-hover:bg-[#28829E] transition-colors">
                  <FileEdit className="w-6 h-6 text-[#28829E] group-hover:text-white" />
               </div>
               <CardTitle className="text-white">Write Article</CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-gray-400 text-sm">Create and publish new insights for the DigiteX community.</p>
             </CardContent>
           </Card>

           {/* Tool 2 */}
           <Card className="bg-[#111] border-white/10 hover:border-[#0EA5E9] transition-colors cursor-pointer group">
             <CardHeader>
               <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-[#0EA5E9] transition-colors">
                  <Eye className="w-6 h-6 text-[#0EA5E9] group-hover:text-white" />
               </div>
               <CardTitle className="text-white">Manage Visibility</CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-gray-400 text-sm">Control post visibility and feature status.</p>
             </CardContent>
           </Card>

           {/* Tool 3 */}
           <Card className="bg-[#111] border-white/10 hover:border-red-500 transition-colors cursor-pointer group">
             <CardHeader>
               <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-4 group-hover:bg-red-500 transition-colors">
                  <Trash2 className="w-6 h-6 text-red-500 group-hover:text-white" />
               </div>
               <CardTitle className="text-white">Delete Content</CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-gray-400 text-sm">Remove outdated articles or corrections.</p>
             </CardContent>
           </Card>
        </div>
      </div>
    </main>
  )
}
