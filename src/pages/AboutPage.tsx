import { motion } from 'motion/react';
import RuneDivider from '../components/arcane/RuneDivider';
import SpellCircle from '../components/arcane/SpellCircle';

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen bg-arcane-void">
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="font-heading text-4xl md:text-5xl text-arcane-parchment tracking-[0.1em] mb-6">
            Archive Notes
          </h1>
          <RuneDivider variant="ornate" glowColor="amber" className="max-w-md mx-auto" />
        </motion.div>

        {/* Philosophy section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="relative bg-arcane-surface/40 backdrop-blur-sm border border-arcane-cyan/15 rounded-lg p-8 shadow-[0_0_30px_rgba(77,208,225,0.05)]">
            {/* Decorative spell circle */}
            <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
              <SpellCircle size={80} glowColor="cyan" animate={true} />
            </div>

            <h2 className="font-heading text-xl text-arcane-amber tracking-wider mb-6">About this Archive</h2>
            <div className="space-y-5 font-body text-arcane-parchment-dim text-[15px] leading-relaxed">
              <p>
                This archive is a fun project I've wanted to put together to display my photos and my learning as a photographer.
              </p>
            </div>
          </div>
        </motion.section>

        <RuneDivider variant="simple" glowColor="cyan" className="my-12 opacity-40" />

        {/* Curator section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="relative bg-arcane-surface/30 border border-arcane-border rounded-lg p-8">
            <h2 className="font-heading text-xl text-arcane-cyan tracking-wider mb-8">Author's Note</h2>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Portrait placeholder */}
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-arcane-deep to-arcane-void border border-arcane-border flex-shrink-0 flex items-center justify-center shadow-[0_0_20px_rgba(77,208,225,0.08)]">
                <span className="font-display text-3xl text-arcane-brass/60">B</span>
              </div>
              <div className="font-body text-arcane-parchment-dim text-[15px] leading-relaxed space-y-4">
                <blockquote className="border-l-2 border-arcane-amber/40 pl-4 italic text-arcane-parchment/80">
                  "If you think you want to do it, just do it." - Dad
                </blockquote>
                <p>
                All my projects and creations are thanks to the amazing people who support and inspire me everyday.
                <br /> <br />
                Thank you to my mom and dad for giving me the chance they never had and inspiring me to be better everyday. Thank you to my brother who supported all my efforts and believed in my own abilities more than myself. Thank you to my sister who makes me feel like I'm someone worth while and inspires me to try new things. Thank you to my partner who continues to love me unconditionally and inspires me to put in effort for more than just myself. Thank you to my best friend for always being there when it counts.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <RuneDivider variant="simple" glowColor="amber" className="my-12 opacity-40" />

        {/* Technical notes */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="bg-arcane-surface/20 border border-arcane-border/50 rounded-lg p-8">
            <h2 className="font-heading text-xl text-arcane-brass tracking-wider mb-6">Archive Specifications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-body text-sm">
              <div>
                <dt className="text-arcane-muted mb-1 text-xs tracking-wider uppercase">Framework</dt>
                <dd className="text-arcane-parchment-dim">React + TypeScript + Vite</dd>
              </div>
              <div>
                <dt className="text-arcane-muted mb-1 text-xs tracking-wider uppercase">Styling</dt>
                <dd className="text-arcane-parchment-dim">Tailwind CSS v4</dd>
              </div>
              <div>
                <dt className="text-arcane-muted mb-1 text-xs tracking-wider uppercase">Animation</dt>
                <dd className="text-arcane-parchment-dim">Motion (formerly Framer Motion)</dd>
              </div>
              <div>
                <dt className="text-arcane-muted mb-1 text-xs tracking-wider uppercase">Image Format</dt>
                <dd className="text-arcane-parchment-dim">WebP (responsive variants)</dd>
              </div>
              <div>
                <dt className="text-arcane-muted mb-1 text-xs tracking-wider uppercase">Content Pipeline</dt>
                <dd className="text-arcane-parchment-dim">JSON + Avalonia Desktop App</dd>
              </div>
              <div>
                <dt className="text-arcane-muted mb-1 text-xs tracking-wider uppercase">Deployment</dt>
                <dd className="text-arcane-parchment-dim">GitHub Pages</dd>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
