"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion"; 

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.replace("/home"); 
    }
  }, [session, router]);

  const handleSignIn = async () => {
    const result = await signIn("google", { redirect: false });
    if (result?.error) {
      console.error("Sign-in error:", result.error);
    } else {
      router.replace("/home");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md w-full bg-white shadow-2xl rounded-3xl p-8 sm:p-10 transform transition-all hover:scale-[1.02] duration-300"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Welcome to WarrantyMe
        </motion.h1>
        <motion.p
          className="text-gray-600 text-lg sm:text-xl text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Sign in to create and manage your snippets with ease!
        </motion.p>
        <motion.button
          onClick={handleSignIn}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.545 10.52v3.07h5.88c-.24 1.58-1.79 4.64-5.88 4.64-3.54 0-6.42-2.93-6.42-6.54s2.88-6.54 6.42-6.54c1.61 0 3.06.66 4.11 1.73l2.81-2.73C17.84 2.02 15.24 1 12.55 1 6.72 1 2 5.72 2 11.55s4.72 10.55 10.55 10.55c6.07 0 10.07-4.27 10.07-10.28 0-.69-.07-1.36-.19-2.01h-10.88z"
            />
          </svg>
          Continue with Google
        </motion.button>
      </motion.div>
    </div>
  );
}