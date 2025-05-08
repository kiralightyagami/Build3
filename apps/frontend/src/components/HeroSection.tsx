import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
}

export function HeroSection({ prompt, setPrompt }: HeroSectionProps) {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate('/builder');
    }
  };

  return (
    <header className="relative z-10 px-6 py-24 md:pt-48 pt-24 md:mb-20">
      <div className="max-w-5xl mx-auto text-center">
        <div className=""></div>
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.5 }}
          className="space-y-6 pt-10 sm:pt-0"
        >
          <h1 className="text-4xl md:text-5xl font-semibold text-white leading-tight">
            Transform Ideas into Websites
            <br />
            <div className='flex flex-col'>
            <span className="bg-clip-text text-blue-400 font-semibold bg-gradient-to-r from-blue-400 to-blue-600">
              Powered by <span className='text-blue-500'>A!</span>
            </span>
            </div>
          </h1>

          <p className="text-base  font-normal text-gray-400 max-w-2xl mx-auto">
            Simply describe, create, and customize your website in seconds with
            <span className="text-blue-400 font-semibold"> Bolt</span>
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="mt-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="backdrop-blur-md bg-gray-900/50 rounded-xl shadow-2xl border border-gray-800/80 overflow-hidden">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the website you want to build..."
              className="w-full h-32 p-5 bg-transparent text-gray-100 rounded-lg focus:outline-none resize-none placeholder-gray-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="p-3">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 bg-blue-500/90 hover:bg-blue-600 text-white py-2.5 px-5 rounded-md font-medium text-sm transition-all border border-blue-400/40 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
              >
                <span>Generate Website</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.form>
      </div>
    </header>
  );
}
