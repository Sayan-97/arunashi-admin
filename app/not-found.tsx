import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        404 - Page Not Found
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
