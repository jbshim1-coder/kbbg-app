"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
      <p className="text-gray-500 mb-6">An unexpected error occurred. Please try again.</p>
      <button onClick={reset} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
        Try again
      </button>
    </div>
  );
}
