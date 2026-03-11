export default function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col items-center justify-center p-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-primary">
          Welcome to ServiceBridge
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl">
          A verified, AI-assisted marketplace where you can hire, book, and securely pay skilled professionals.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/customer"
            className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            I need a professional
          </a>
          <a href="/provider" className="text-sm font-semibold leading-6">
            I am a professional <span aria-hidden="true">→</span>
          </a>
        </div>
      </main>
    </div>
  );
}
