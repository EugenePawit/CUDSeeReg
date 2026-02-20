import type { Metadata } from "next";
import "./globals.css";
import FloatingNav from "./components/FloatingNav";

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
            <body className="font-sans antialiased min-h-screen flex flex-col text-slate-50">
                <FloatingNav />
                {children}
            </body>
        </html>
    );
}
