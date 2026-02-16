/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0F172A', // Slate 900
                surface: '#1E293B',    // Slate 800
                primary: '#6366f1',    // Indigo 500
                secondary: '#06b6d4',  // Cyan 500
                accent: '#8b5cf6',     // Violet 500
                success: '#10b981',    // Emerald 500
                warning: '#f59e0b',    // Amber 500
                danger: '#ef4444',     // Red 500
                text: {
                    primary: '#f8fafc',  // Slate 50
                    secondary: '#94a3b8' // Slate 400
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                'glow': '0 0 15px rgba(99, 102, 241, 0.5)',
            },
            backdropBlur: {
                'xs': '2px',
            }
        },
    },
    plugins: [],
}
