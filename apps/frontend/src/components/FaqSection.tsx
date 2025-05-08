import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Disclosure } from '@headlessui/react';
import { cn } from '../utils/cn';

export function FaqSection() {
  const faqs = [
    {
      question: 'How does Bolt turn my prompts into a website?',
      answer:
        'Bolt uses advanced AI to interpret your natural language description and generate the necessary code to create a fully functional website. It analyzes your requirements and produces HTML, CSS, and JavaScript files that match your vision.',
    },
    {
      question: 'Can I customize the generated website?',
      answer:
        'Absolutely! Bolt provides a full-featured code editor where you can make precise adjustments to any aspect of your website. The changes are reflected in real-time in the preview window.',
    },
    {
      question: 'What kind of websites can I create with Bolt?',
      answer:
        "Bolt can help you create a wide range of websites, from simple landing pages to complex web applications with dynamic functionality. It's suitable for portfolios, blogs, e-commerce sites, dashboards, and more.",
    },
    {
      question: 'Do I need coding experience to use Bolt?',
      answer:
        'No coding experience is required. Bolt is designed to be accessible to everyone, regardless of technical background. However, if you do have coding experience, you can leverage it to make more advanced customizations.',
    },
    {
      question: 'How do I deploy my website?',
      answer:
        'Bolt allows you to download your generated website as a zip file. You can then host it on any web server or platform of your choice, such as GitHub Pages, Netlify, or Vercel.',
    },
  ];

  return (
    <section id="faq" className="py-20 md:py-30 relative z-10">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ filter: 'blur(10px)' }}
            animate={{ filter: 'blur(0px)' }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl font-semibold text-white mb-4">FAQ's </h2>
            <p className="text-lg text-gray-400">
              Find answers to common questions about Bolt.
            </p>
          </motion.div>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="border border-gray-800 rounded-lg overflow-hidden"
              initial={{ filter: 'blur(10px)' }}
              animate={{ filter: 'blur(0px)' }}
              transition={{ duration: 0.3 }}
            >
              <Disclosure>
                {({ open }) => (
                  <div>
                    <Disclosure.Button className="flex justify-between w-full px-6 py-4 text-left text-white bg-gray-900/50 backdrop-blur-sm hover:bg-gray-900/80 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                      <span className="text-base font-medium">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={cn(
                          'w-5 h-5 text-blue-400 transition-transform',
                          open ? 'transform rotate-180' : ''
                        )}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel className="px-6 py-2 text-sm bg-gray-900/30 backdrop-blur-sm text-gray-300">
                      {faq.answer}
                    </Disclosure.Panel>
                  </div>
                )}
              </Disclosure>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
