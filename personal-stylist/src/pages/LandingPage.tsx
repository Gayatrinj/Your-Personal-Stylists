import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-zinc-900" />
            <span className="text-lg font-semibold">StyleAI</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              to="/login?mode=login"
              className="rounded-md px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              Log in
            </Link>
            <Link
              to="/login?mode=signup"
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 py-16 md:grid-cols-2">
        <section>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
            Your Personal Stylist
          </h1>
          <p className="mt-3 max-w-xl text-zinc-600">
            Get AI-powered style recommendations tailored to your taste and preferences.
            Discover your perfect look with personalized outfit suggestions every day.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              to="/login?mode=signup"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Sign up
            </Link>
            <Link
              to="/login?mode=login"
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
            >
              Log in
            </Link>
          </div>
        </section>

        {/* Right: image collage */}
        <section className="grid grid-cols-2 gap-4">
            <div className="h-72 rounded-xl bg-[url('https://images.unsplash.com/photo-1519744792095-2f2205e87b6f?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
            <div className="h-72 rounded-xl bg-[url('https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />

            <div className="h-64 rounded-xl bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
            <div className="h-64 rounded-xl bg-[url('https://images.unsplash.com/photo-1734057491918-0d51f2383712?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwb3V0Zml0fGVufDF8fHx8MTc2MDIxNjcxOXww&ixlib=rb-4.1.0&q=80&w=1080')] bg-cover bg-center" />

        </section>
      </main>
    </div>
  );
}
