function App() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-xl p-8 text-center">
        <h1 className="text-3xl font-bold text-blue-500 mb-2">
          StackGap
        </h1>
        <p className="text-slate-400 mb-6">
          If this card has a dark background, a blue heading, rounded
          corners, and padding — Tailwind CSS is working correctly.
        </p>
        <button className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors">
          Tailwind is working
        </button>
      </div>
    </div>
  )
}

export default App
