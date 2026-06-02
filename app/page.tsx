import Link from 'next/link'
import { BookOpen, MapPin, Calendar, Camera, Star, Heart } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/70 dark:bg-white/10 backdrop-blur-sm border border-orange-200/50 dark:border-white/10 rounded-full px-4 py-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 mb-8 animate-fade-in">
            <Heart className="w-3.5 h-3.5 fill-current" />
            Your Family Story Begins Here
          </div>

          {/* Title */}
          <h1 className="font-display text-5xl sm:text-7xl font-black text-gray-900 dark:text-white leading-tight tracking-tight mb-6 animate-slide-up">
            Family{' '}
            <span className="text-brand-500 relative">
              Journal
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                <path d="M2 9 C50 3, 150 3, 198 9" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-slide-up">
            Record your family's favorite places, wishlist adventures, attended events, and precious memories — all in one beautiful journal.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-scale-in">
            <Link
              href="/register"
              className="btn-primary text-base px-8 py-3 rounded-2xl shadow-lg shadow-orange-200 dark:shadow-orange-900/30"
            >
              <BookOpen className="w-5 h-5" />
              Start Your Journal
            </Link>
            <Link
              href="/login"
              className="btn-secondary text-base px-8 py-3 rounded-2xl"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-3 px-8 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-base hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          {[
            { icon: MapPin, title: 'Places', desc: 'Track restaurants, cafes, playgrounds & attractions', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
            { icon: Calendar, title: 'Events', desc: 'Log family events, concerts & school activities', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
            { icon: Star, title: 'Reviews', desc: 'Rate and give your family verdict on every visit', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
            { icon: Camera, title: 'Photos', desc: 'Upload photos to remember each memory', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
            { icon: Heart, title: 'Wishlist', desc: 'Save places you want to visit someday', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
            { icon: BookOpen, title: 'Timeline', desc: 'Browse your family memories chronologically', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-10 text-sm text-gray-400 dark:text-gray-600">
        <p>Made with ❤️ for families everywhere</p>
      </footer>
    </main>
  )
}
