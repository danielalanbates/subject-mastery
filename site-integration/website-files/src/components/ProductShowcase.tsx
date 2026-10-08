import { motion } from 'framer-motion';

const categories = [
  {
    name: 'Web Solutions',
    products: [
      {
        name: 'DaemonManager',
        description: 'Open-source infrastructure for managing autonomous AI agents. SwiftUI app for controlling Telegram bots, failover chains, and 15+ background daemons. Complete with documentation and developer guides.',
        iconImage: '/daemonmanager-icon.png',
        icon: '🤖',
        tags: ['Open Source', 'AI Agents', 'GitHub', 'macOS'],
        status: 'Live',
        link: 'https://github.com/danielalanbates/DaemonManager',
        downloadUrl: '/downloads/DaemonManager_7.0.0.dmg'
      },
    ]
  },
  {
    name: 'Web Apps',
    products: [
      {
        name: 'Tri-City Utility',
        description: 'Track and compare electricity, water, and sewer rates across the Tri-Cities. Interactive bill calculator and AI meeting summaries.',
        icon: '💡',
        tags: ['Web App', 'React', 'Utilities'],
        status: 'Live',
        link: 'https://batesai.org/tri-citiesutilitymonitor'
      },
      {
        name: 'Subject Mastery',
        description: 'Standardized subject paths you can play as audio or read as text. Progress is tracked lesson by lesson, anything you already know is one tap to skip, and Google sign-in keeps your place on every device. Not a tutor, not accredited.',
        icon: '🎧',
        tags: ['Web App', 'Audio', 'Learning'],
        status: 'Beta',
        link: 'https://batesai.org/subjectmastery/'
      },
    ]
  },
  {
    name: 'macOS Apps',
    products: [
      {
        name: 'KeepCursor',
        description: 'Stops World of Warcraft (and other macOS games) from losing your mouse cursor when you Command-Tab. Reacts to the alt-tab event, unwinds the cursor hide counter, re-associates the mouse, and forces a hardware-cursor repaint — fixing the bug that naive once-per-second tools miss. Zero config, no special permissions, global ⌥⌘C restore hotkey, launch-at-login. Universal, Apple-notarized.',
        icon: '🖱️',
        tags: ['macOS App', 'Menu Bar', 'Gaming', 'Open Source'],
        status: 'Live',
        link: 'https://github.com/danielalanbates/keepcursor',
        downloadUrl: '/downloads/KeepCursor.zip'
      },
      {
        name: 'Battery Optimizer',
        description: 'Advanced battery health and performance management for MacBooks. Automatically optimizes power settings for maximum longevity.',
        icon: '🔋',
        tags: ['macOS App', 'Utility', 'Power'],
        status: 'Live',
        link: 'https://github.com/danielalanbates/battery-saver',
        downloadUrl: '/downloads/BatteryOptimizer.zip'
      },
      {
        name: 'LowPower Automator',
        description: 'Automatic Low Power Mode for macOS. Menu bar app that extends battery life with customizable thresholds.',
        icon: '⚡',
        tags: ['macOS App', 'Menu Bar', 'Battery'],
        status: 'Live',
        link: 'https://github.com/danielalanbates/lowpowerautomator',
        downloadUrl: '/downloads/LowPowerAutomator.zip'
      },
      {
        name: 'Claude Usage',
        description: 'Monitor Claude AI usage limits and overage credits in real-time. Native macOS SwiftUI menu bar app with multi-profile support.',
        icon: '📊',
        tags: ['macOS App', 'SwiftUI', 'Claude API'],
        status: 'Live',
        link: 'https://batesai.org'
      },
      {
        name: 'Shifting Tiles',
        description: 'Dynamic, AI-powered desktop screensaver and photo shifting utility for macOS. Stops instantly on interaction.',
        icon: '🖼️',
        tags: ['macOS App', 'Desktop', 'Photos'],
        status: 'Live',
        link: 'https://batesai.org',
        downloadUrl: '/downloads/ShiftingTiles.zip'
      },
      {
        name: 'MenuTemp',
        description: 'Cute, lightweight menu bar temperature monitor for macOS with color-coded indicators.',
        icon: '🌡️️',
        tags: ['macOS App', 'Menu Bar', 'Utility'],
        status: 'Live',
        link: 'https://github.com/danielalanbates/menutemp',
        downloadUrl: '/downloads/MenuTemp.zip'
      },
      {
        name: 'FileGenius',
        description: 'Intelligent file organization for macOS. Automatically sorts downloads and files by type, date, or custom rules.',
        iconImage: '/filegenius-icon.png',
        icon: '📁',
        tags: ['macOS App', 'Automation', 'Files'],
        status: 'Live',
        link: 'https://github.com/danielalanbates/filegenius',
        downloadUrl: '/downloads/FileGenius.zip'
      },
      {
        name: 'DaemonManager',
        description: 'Autonomous AI agent infrastructure for macOS. Manages 15+ department-level Telegram agents, failover chains, and background daemons from a native SwiftUI app.',
        iconImage: '/daemonmanager-icon.png',
        icon: '🤖',
        tags: ['macOS App', 'SwiftUI', 'AI Agents', 'Automation'],
        status: 'Live',
        link: 'https://github.com/danielalanbates/DaemonManager',
        downloadUrl: '/downloads/DaemonManager_7.0.0.dmg'
      },
      {
        name: 'Stock Analyzer',
        description: 'Native macOS stock platform with true real-time streaming quotes (Yahoo WebSocket, no login) and live intraday charts. Auto-backtests the market on launch and ranks the top 10 by a backtest-validated 0-100 Recommendation Points score (blending momentum, a walk-forward strategy backtest, and fundamentals). Candlestick charting with SMA/EMA/Bollinger/MACD/RSI, a momentum screener, watchlists, real-time price alerts with notifications, and live portfolio P&L. Notarized, self-contained SwiftUI app.',
        icon: '📈',
        tags: ['macOS App', 'SwiftUI', 'Open Source', 'Finance'],
        status: 'Live',
        link: 'https://github.com/danielalanbates/stock-analyzer',
        downloadUrl: 'https://downloads.batesai.org/StockAnalyzer-2.4.dmg'
      },
    ]
  },
  {
    name: 'Extensions',
    products: [
      {
        name: 'MeetingNotes Extension',
        description: 'Auto-appearing notepad for video calls. Capture notes without switching windows during Zoom, Meet, or Teams.',
        icon: '📝',
        tags: ['Chrome Extension', 'Meetings', 'Productivity'],
        status: 'Live',
        storeLink: 'https://chromewebstore.google.com/detail/meeting-notes/ccemkdiamclmhjelhgcloianlongeled'
      },
    ]
  },
  {
    name: 'Games',
    products: [
      {
        name: 'Antediluvia',
        description: 'Open-source MMORPG in Rust and Bevy. A hosted alpha shard keeps the world running so characters persist between sessions.',
        icon: '⚔️',
        tags: ['Game', 'MMORPG', 'Rust'],
        status: 'Alpha',
        // Straight into the game — the /antediluvia page is the secondary,
        // "tell me about it first" route, not the primary one.
        link: '/play/',
        linkLabel: 'Play now'
      },
      {
        name: 'Flappy Axolotl',
        description: 'Charming underwater Flappy Bird game. Guide a cute pink axolotl through coral obstacles. Cross-platform fun.',
        icon: '🦎',
        tags: ['Game', 'Cross-Platform', 'Arcade'],
        status: 'Live',
        link: 'https://github.com/danielalanbates/flappy-axolotl',
        downloadUrl: 'https://downloads.batesai.org/FlappyAxolotl.dmg'
      },
    ]
  },
];

const ProductCard = ({ product, index }: { product: any; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, borderColor: 'rgba(0, 217, 255, 0.6)' }}
      className="group p-5 md:p-6 h-full rounded-2xl bg-bates-navy/30 border border-bates-cyan/20 backdrop-blur-sm transition-all flex flex-col"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl group-hover:scale-110 transition-transform">
          {product.iconImage ? (
            <img src={product.iconImage} alt={product.name} className="w-10 h-10 rounded-lg" />
          ) : (
            product.icon
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              product.status === 'Live'
                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                : product.status === 'Beta'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/50'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
            }`}
          >
            {product.status}
          </span>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-2 text-bates-cyan group-hover:text-white transition-colors">
        {product.name}
      </h3>

      <p className="text-gray-400 text-sm mb-4">
        {product.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {product.tags.map((tag: string, j: number) => (
          <span
            key={j}
            className="px-2 py-0.5 bg-bates-cyan/10 text-bates-cyan rounded-full text-xs border border-bates-cyan/30"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-3 mt-auto">
        {product.downloadUrl && (
          <a
            href={product.downloadUrl}
            download
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/50 rounded-lg font-bold text-sm hover:bg-green-500/30 transition"
          >
            ↓ Download {product.downloadUrl.endsWith('.dmg') ? 'DMG' : 'ZIP'} <span>→</span>
          </a>
        )}
        {product.storeLink && (
          <a
            href={product.storeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-bates-cyan text-bates-dark rounded-lg font-bold text-sm hover:glow-cyan-strong transition"
          >
            Chrome Web Store <span>→</span>
          </a>
        )}
        {product.link && (
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition ${
              (product.storeLink || product.downloadUrl)
                ? 'border border-bates-cyan/30 text-bates-cyan hover:bg-bates-cyan/10'
                : 'bg-bates-cyan text-bates-dark hover:glow-cyan-strong'
            }`}
          >
            {product.linkLabel ?? (product.link.includes('github') ? 'View Source' : product.tags?.includes('Game') ? 'Play Game' : 'View Project')} <span>→</span>
          </a>
        )}
      </div>
    </motion.div>
  );
};

export default function ProductShowcase() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-4">
            Free AI Software Built by <span className="text-bates-cyan">BatesAI</span>
          </h2>
          <p className="text-xl text-gray-400">macOS apps, web tools, and games — all free and open source</p>
        </motion.div>

        {categories.map((category, ci) => (
          <div key={ci} id={category.name.toLowerCase().replace(' ', '')} className={ci > 0 ? 'mt-12' : ''}>
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-2xl font-bold text-bates-cyan mb-5"
            >
              {category.name}
            </motion.h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {category.products.map((product, i) => (
                <ProductCard key={i} product={product} index={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
