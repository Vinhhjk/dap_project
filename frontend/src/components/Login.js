import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion"; // Import Framer Motion
import { Typewriter } from "react-simple-typewriter"; // Import Typewriter effect

function Login({ onLogin }) {
  const login = useGoogleLogin({
    onSuccess: onLogin,
    onError: () => console.log("Login Failed"),
  });

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{
        backgroundImage: 'url("/background.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100%",
        height: "100vh",
      }}
    >
      {/* Navbar with brand and login button */}
      <nav className="w-full max-w-6xl flex justify-between items-center py-4">
        <div className="absolute top-5 left-5 text-white text-lg font-bold">
          Group 3
        </div>
        <div>
          <button
            className="absolute top-5 right-5 bg-black text-white px-4 py-2 rounded-lg"
            onClick={() => login()}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Center Content with Animation */}
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl mt-10">
        <motion.div
          className="text-center md:text-left md:w-1/2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Welcome Heading with Bounce Effect */}
          <motion.h1
            className="text-4xl md:text-6xl font-bold text-[#403b38]"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: [0, -5, 0], opacity: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            Welcome to
          </motion.h1>

          {/* Typing Effect for Subheading */}
          <p className="text-lg font-semibold text-gray-800 mt-3">
            <Typewriter
              words={["AI-Powered Toxicity Detection on Social Media"]}
              loop={false}
              typeSpeed={50}
              deleteSpeed={30}
            />
          </p>

          {/* NLP Approach Text with Fade-in */}
          <motion.p
            className="text-white text-lg mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            An NLP-Based Approach
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
