export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="mb-6 text-5xl md:text-7xl font-bold">
            🍷 WineSnap
          </h1>
          
          <p className="mb-4 text-2xl md:text-3xl font-semibold text-purple-100">
            Gotta Taste 'Em All!
          </p>
          
          <p className="mb-12 text-lg md:text-xl text-purple-200 max-w-3xl mx-auto">
            Transform wine discovery into an addictive gaming experience. Collect wines like Pokemon, 
            and become the ultimate wine master!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="/auth/signin" className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold px-8 py-3 text-lg rounded-lg">
              🎮 Start Your Journey
            </a>
            <a href="/capture" className="border-2 border-white text-white hover:bg-white hover:text-purple-900 px-8 py-3 text-lg font-semibold rounded-lg">
              📸 Try Demo
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
              <div className="text-2xl font-bold text-yellow-300">1</div>
              <div className="text-sm text-purple-200">Player Level</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
              <div className="text-2xl font-bold text-green-300">0</div>
              <div className="text-sm text-purple-200">Wines Caught</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
              <div className="text-2xl font-bold text-red-300">0</div>
              <div className="text-sm text-purple-200">Regions</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
              <div className="text-2xl font-bold text-blue-300">0</div>
              <div className="text-sm text-purple-200">Trading Cards</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}