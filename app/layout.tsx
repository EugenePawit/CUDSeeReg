import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "CUDSeeReg - ระบบช่วยเลือกวิชาเลือก",
    description: "ระบบช่วยนักเรียนค้นหาและวางแผนตารางเรียนวิชาเลือกของโรงเรียนสาธิต จุฬาลงกรณ์มหาวิทยาลัย",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="th">
            <body className="font-sans antialiased min-h-screen">
                {children}
            </body>
        </html>
    );
}
