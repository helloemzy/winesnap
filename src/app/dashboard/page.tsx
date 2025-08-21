import { Metadata } from 'next'
import { Wine, TrendingUp, Users, Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard - WineSnap',
  description: 'Your wine tasting journey overview',
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back to your wine tasting journey
        </p>
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center">
            <Wine className="h-8 w-8 text-wine" />
            <div className="ml-4">
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Total Tastings</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">This Month</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Favorites</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Recent Tastings</h2>
          <div className="flex items-center justify-center py-12 text-center">
            <div>
              <Wine className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No tastings yet
              </p>
              <p className="text-xs text-muted-foreground">
                Start your wine journey by adding your first tasting
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Discover</h2>
          <div className="flex items-center justify-center py-12 text-center">
            <div>
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Explore wine tastings from the community
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}