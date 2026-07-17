#!/usr/bin/env node

/**
 * Post-export script to enhance SEO of the generated index.html
 * Run after: npx expo export --platform web
 */

const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distPath, 'index.html');

// Read the generated index.html
let html = fs.readFileSync(indexPath, 'utf8');

// Additional meta tags to inject
const additionalMeta = `
    <!-- Primary Meta Tags (Enhanced) -->
    <meta name="title" content="Marathon Training Plan - Free 18-Week Training Schedules" />
    <meta name="keywords" content="marathon training plan, marathon training schedule, 18 week marathon plan, hal higdon marathon, free marathon training, running plan, marathon preparation, first marathon training, beginner marathon plan" />
    <meta name="author" content="Marathon Training Plan" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://marathontrainingplan.com/" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://marathontrainingplan.com/" />
    <meta property="og:title" content="Marathon Training Plan - Free 18-Week Training Schedules" />
    <meta property="og:description" content="Free personalized marathon training plans based on proven methodology. Get an 18-week schedule tailored to your race day. Track workouts, sync across devices." />
    <meta property="og:image" content="https://marathontrainingplan.com/og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Marathon Training Plan" />
    <meta property="og:locale" content="en_US" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="https://marathontrainingplan.com/" />
    <meta name="twitter:title" content="Marathon Training Plan - Free 18-Week Training Schedules" />
    <meta name="twitter:description" content="Free personalized marathon training plans. Get an 18-week schedule tailored to your race day with proven methodology." />
    <meta name="twitter:image" content="https://marathontrainingplan.com/og-image.png" />

    <!-- Additional Mobile Meta -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Marathon Plan" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.json" />

    <!-- Preconnect -->
    <link rel="preconnect" href="https://akyldbuvwjdcsrcqwqbk.supabase.co" />
    <link rel="preconnect" href="https://www.googletagmanager.com" />

    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-W2VBGR482T"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-W2VBGR482T');
    </script>
`;

// Structured data to inject before </head>
const structuredData = `
    <!-- Structured Data - WebApplication -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Marathon Training Plan",
      "description": "Free personalized marathon training plans with customizable schedules based on proven Hal Higdon methodology.",
      "url": "https://marathontrainingplan.com",
      "applicationCategory": "HealthApplication",
      "operatingSystem": "Web, iOS",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "18-week marathon training schedules",
        "Personalized plans based on race date",
        "Multiple difficulty levels (Novice to Advanced)",
        "Workout tracking and progress monitoring",
        "Cross-device sync",
        "Offline support",
        "Free to use"
      ]
    }
    </script>

    <!-- Structured Data - FAQPage -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How long is the marathon training plan?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our marathon training plans are 18 weeks long, which is the optimal duration recommended by running experts to prepare for a marathon without risking overtraining or injury."
          }
        },
        {
          "@type": "Question",
          "name": "Is the marathon training plan really free?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! Marathon Training Plan is completely free to use. There are no subscriptions, no hidden fees, and no premium tiers. All training plans and features are available to everyone."
          }
        },
        {
          "@type": "Question",
          "name": "What training methodology do you use?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our plans are based on proven marathon training principles popularized by Hal Higdon, one of the most respected names in marathon coaching. The plans include a mix of easy runs, long runs, pace work, and rest days."
          }
        },
        {
          "@type": "Question",
          "name": "Can I use the app offline?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! The app works fully offline. Your training plan and workout data are stored locally on your device. When you have internet access, your data syncs automatically if you have an account."
          }
        }
      ]
    }
    </script>
`;

// Inject additional meta tags after the existing description meta tag
html = html.replace(
  /<meta name="description"[^>]*>/,
  `$&${additionalMeta}`
);

// Inject structured data before </head>
html = html.replace('</head>', `${structuredData}\n  </head>`);

// Update noscript message to be more helpful
html = html.replace(
  /<noscript>[^<]*<\/noscript>/,
  `<noscript>
      <div style="padding: 40px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e293b;">Marathon Training Plan</h1>
        <p style="color: #64748b; line-height: 1.6;">Get a free, personalized 18-week marathon training plan tailored to your race day.</p>
        <p style="color: #64748b; line-height: 1.6;">JavaScript is required to run this application. Please enable JavaScript in your browser settings.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 14px;">Features: Proven training schedules, Progress tracking, Offline support, Cross-device sync</p>
      </div>
    </noscript>`
);

// Write the enhanced HTML
fs.writeFileSync(indexPath, html);

// Copy public files to dist
const publicPath = path.join(__dirname, '..', 'public');
if (fs.existsSync(publicPath)) {
  const files = fs.readdirSync(publicPath);
  files.forEach(file => {
    const src = path.join(publicPath, file);
    const dest = path.join(distPath, file);
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${file}`);
  });
}

console.log('SEO enhancements applied successfully!');
console.log('Files in dist:', fs.readdirSync(distPath).join(', '));
