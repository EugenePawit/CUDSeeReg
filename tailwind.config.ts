import type { Config } from "tailwindcss";

export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fdf2f8',
                    100: '#fce7f3',
                    200: '#fbcfe8',
                    300: '#f9a8d4',
                    400: '#f472b6',
                    500: '#ec4899',
                    600: '#db2777',
                    700: '#be185d',
                    800: '#9d174d',
                    900: '#831843',
                },
                // Thai day colors
                day: {
                    monday: '#FBBF24',    // Yellow - วันจันทร์
                    tuesday: '#F472B6',   // Pink - วันอังคาร
                    wednesday: '#22C55E', // Green - วันพุธ
                    thursday: '#F97316', // Orange - วันพฤหัสบดี
                    friday: '#60A5FA',   // Blue - วันศุกร์
                }
            },
            fontFamily: {
                sans: ['Inter', 'Noto Sans Thai', 'sans-serif'],
                display: ['Outfit', 'Noto Sans Thai', 'sans-serif'],
            },
            transitionTimingFunction: {
                'liquid': 'cubic-bezier(0.4, 0, 0.2, 1)',
            },
            borderRadius: {
                'bento': '32px',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.25)',
                'glass-lg': '0 12px 48px 0 rgba(31, 38, 135, 0.45)',
            }
        },
    },
    plugins: [],
} satisfies Config;
