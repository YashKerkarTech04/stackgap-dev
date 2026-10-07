function Navbar() {
  return (
    <nav className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto h-16 px-6 flex items-center">
        <div className="flex items-center gap-2.5">
          {/* StackGap logo */}
          <div className="relative w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <span className="text-white text-lg font-bold tracking-tight">
              S
            </span>

            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-slate-950 border-2 border-blue-500" />
          </div>

          {/* Brand name */}
          <span className="text-xl font-semibold tracking-tight text-slate-100">
            Stack<span className="text-blue-400">Gap</span>
          </span>
        </div>
      </div>
    </nav>
  )
}

export default Navbar