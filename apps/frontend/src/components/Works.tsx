import { motion } from "framer-motion";

function HowItWorksStep({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <motion.div 
      className="flex flex-col items-center text-center"
      initial={{ filter: 'blur(10px)' }}
      animate={{ filter: 'blur(0px)' }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-12 h-12 rounded-full bg-[#E7E9EC] text-slate-900 flex items-center justify-center text-xl font-bold mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-normal px-12">
        {description}
      </p>
    </motion.div>
  );
}

export default function HowitWork() {
  return (
    <section id="howitworks" className="text-center pt-32">
      <motion.div
        initial={{ filter: 'blur(10px)' }}
        animate={{ filter: 'blur(0px)' }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-3xl text-gray-100">
          How Build3 Works!
        </h2>
        <div className="mt-12 sm:px-20">
          <div className="grid md:grid-cols-3 gap-4">
            <HowItWorksStep
              number={1}
              title="Give a Prompt"
              description="Describe your website idea in a few words and let our AI do the rest."
            />
            <HowItWorksStep
              number={2}
              title="Edit and reprompt"
              description=" Edit the generated website to your liking. You can also reprompt to get a different design."
            />
            <HowItWorksStep
              number={3}
              title="Download Zip"
              description="Download the generated website as a zip file and host it anywhere you want."
            />
          </div>
        </div>
      </motion.div>
    </section>  
  );
}
