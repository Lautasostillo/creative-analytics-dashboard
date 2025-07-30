'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Application Error</h1>
            <p className="text-muted-foreground mb-4">A global error occurred.</p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}