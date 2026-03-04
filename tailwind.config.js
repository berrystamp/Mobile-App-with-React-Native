module.exports = {
  // Update this to match exactly where your files live!
  content: [
    "./App.{js,jsx,ts,tsx}", 
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}", // Add this if you have a screens folder
    "./app/**/*.{js,jsx,ts,tsx}"      // Add this if using Expo Router
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}