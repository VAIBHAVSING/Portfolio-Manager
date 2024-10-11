import Navbar from "@/components/Navbar";

export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="en">
        <body>
            <div className="sticky top-0">
                <Navbar/>
            </div>
            {children}
        </body>
      </html>
    );
  }