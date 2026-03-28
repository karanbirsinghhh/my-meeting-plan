import './globals.css';

export const metadata = {
  title: 'My Meeting Plan - Scheduling Platform',
  description: 'A modern scheduling platform inspired by Calendly. Create event types, set availability, and let others book meetings with you.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ overflow: 'auto', height: 'auto' }}>
        {children}
      </body>
    </html>
  );
}
