import { Cpu, Code, Zap, FlaskConical, Layers, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export function FeaturesSection() {
  const features = [
    {
      icon: <Cpu className="w-6 h-6" />,
      title: 'AI-Powered Generation',
      description:
        'Describe your website in natural language and watch as Bolt generates all the code and assets for you.',
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: 'Interactive Editor',
      description:
        'Make precise adjustments with our fully-featured code editor with syntax highlighting and autocompletion.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Reprompt and Edit',
      description:
        'Easily reprompt or edit your website to get the perfect design and functionality you desire.',
    },
    {
      icon: <FlaskConical className="w-6 h-6" />,
      title: 'WebContainer Technology',
      description:
        'Run your web applications directly in the browser with our cutting-edge WebContainer technology.',
    },
    {
      icon: <Layers className="w-6 h-6" />,
      title: 'Step-by-Step Guidance',
      description:
        'Follow our intuitive step-by-step process to bring your web application from concept to completion.',
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Download and Deploy',
      description:
        'Easily download your generated website as a zip file and host it on any platform of your choice.',
    },
  ];

  return (
    <motion.section
      id="features"
      className="relative z-10"
      initial={{ filter: 'blur(10px)' }}
      animate={{ filter: 'blur(0px)' }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-2xl sm:text-3xl text-center text-white font-medium">
          Why Choose Bolt for Creating Website?
        </h2>
        <p className="text-lg text-center mt-4 max-w-lg mx-auto text-gray-400">
          Bolt offers a powerful suite of features to make web development and
          deployment effortless.
        </p>
        <div className="text-center text-3xl text-white font-medium mt-20">
          <h1>Powerful Features!</h1>
        </div>
        <div className="text-center text-lg text-gray-400  mt-4">
          <h3>Bolt is a powerful tool that combines the best of AI and web</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-8 text-center px-4 sm:px-0 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="width-fit text-left md:ml-7 border border-gray-800 rounded-lg p-4"
              initial={{ filter: 'blur(10px)' }}
              animate={{ filter: 'blur(0px)' }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-center gap-2">
                <div className="mb-2 w-fit rounded-lg p-1 text-center text-blue-400">
                  {feature.icon}
                </div>
                <div className="text-md mb-1 font-normal text-gray-900 dark:text-gray-100">
                  {feature.title}
                </div>
              </div>
              <div className="font-regular max-w-sm text-sm text-gray-600 dark:text-gray-400">
                {feature.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
