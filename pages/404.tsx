import Link from 'next/link';
import Head from 'next/head';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Page Not Found | SmartKidStories</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 to-orange-200 p-6">
        <div className="text-center max-w-md">
          <h1 className="text-6xl font-extrabold text-orange-600">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mt-4">Oops! Page not found</h2>
          <p className="text-gray-600 mt-2">
            We couldn't find the page you're looking for. Maybe it moved, or never existed.
          </p>

          <img
            src="/images/lost-book.svg"
            alt="Lost book"
            className="w-48 mx-auto mt-6 animate-bounce"
          />

          <Link href="/">
            <a className="inline-block mt-6 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-all">
              Back to Homepage
            </a>
          </Link>
        </div>
      </div>
    </>
  );
} 
