import React, { useState, useEffect, forwardRef, createContext, useContext, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowUp, Award, Briefcase, Code, Cloud, Layers, Database, Settings, GitMerge, 
  Warehouse, Zap, Target, Users, BrainCircuit, MessageCircle, BarChart2, Share2, 
  Server, Linkedin, Github, Mail, Menu, X, ArrowRight, ArrowDown
} from 'lucide-react';

// UTILITIES & UI COMPONENTS (Consolidated)
// =================================================================================

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Slot } from '@radix-ui/react-slot';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva } from 'class-variance-authority';

function cn(...inputs) { return twMerge(clsx(inputs)); }

const buttonVariants = cva('inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50', { variants: { variant: { default: 'bg-primary text-primary-foreground hover:bg-primary/90', destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90', outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground', secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80', ghost: 'hover:bg-accent hover:text-accent-foreground', link: 'text-primary underline-offset-4 hover:underline' }, size: { default: 'h-10 px-4 py-2', sm: 'h-9 rounded-md px-3', lg: 'h-11 rounded-md px-8', icon: 'h-10 w-10' } }, defaultVariants: { variant: 'default', size: 'default' } });
const Button = forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';

let toastCount = 0;
const ToastContext = createContext(null);
const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const context = { toasts, setToasts };

    useEffect(() => {
        if (toasts.length > 0) {
            const timer = setTimeout(() => {
                context.setToasts(currentToasts => currentToasts.slice(1));
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [toasts, context]);
    
    return <ToastContext.Provider value={context}>{children}</ToastContext.Provider>;
}

const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within a ToastProvider");
    
    return {
        toasts: context.toasts,
        toast: (props) => {
            const id = (toastCount++).toString();
            const dismiss = () => context.setToasts(toasts => toasts.filter(t => t.id !== id));
            context.setToasts(toasts => [{ ...props, id, dismiss }, ...toasts].slice(0, 1));
        }
    };
};
const ToastPrimitivesProvider = ToastPrimitives.Provider;
const ToastViewport = forwardRef((props, ref) => <ToastPrimitives.Viewport ref={ref} className={cn('fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]', props.className)} {...props} />);
ToastViewport.displayName = "ToastViewport";
const toastVariantsFn = cva('data-[swipe=move]:transition-none group relative pointer-events-auto flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full data-[state=closed]:slide-out-to-right-full', { variants: { variant: { default: 'bg-background border', destructive: 'group destructive border-destructive bg-destructive text-destructive-foreground' } }, defaultVariants: { variant: 'default' } });
const Toast = forwardRef((props, ref) => <ToastPrimitives.Root ref={ref} className={cn(toastVariantsFn(props))} {...props} />);
Toast.displayName = "Toast";
const ToastClose = forwardRef((props, ref) => <ToastPrimitives.Close ref={ref} className={cn('absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600', props.className)} toast-close="" {...props}><X className="h-4 w-4" /></ToastPrimitives.Close>);
ToastClose.displayName = "ToastClose";
const ToastTitle = forwardRef((props, ref) => <ToastPrimitives.Title ref={ref} className={cn('text-sm font-semibold', props.className)} {...props} />);
ToastTitle.displayName = "ToastTitle";
const ToastDescription = forwardRef((props, ref) => <ToastPrimitives.Description ref={ref} className={cn('text-sm opacity-90', props.className)} {...props} />);
ToastDescription.displayName = "ToastDescription";
function Toaster() {
    const { toasts } = useToast();
    return (
        <ToastPrimitivesProvider>
            {toasts.map(({ id, title, description, action, ...props }) => (
                <Toast key={id} {...props}>
                    <div className="grid gap-1">
                        {title && <ToastTitle>{title}</ToastTitle>}
                        {description && <ToastDescription>{description}</ToastDescription>}
                    </div>
                    {action}<ToastClose />
                </Toast>
            ))}
            <ToastViewport />
        </ToastPrimitivesProvider>
    );
}


// PERFORMANCE HOOKS
// =================================================================================

const useOnScreen = (options) => {
    const ref = useRef(null);
    const [isOnScreen, setIsOnScreen] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsOnScreen(true);
                observer.unobserve(entry.target);
            }
        }, options);
        const currentRef = ref.current;
        if (currentRef) observer.observe(currentRef);
        return () => { if (currentRef) observer.unobserve(currentRef); };
    }, [ref, options]);
    return [ref, isOnScreen];
};

// REUSABLE UI COMPONENTS
// =================================================================================

const Section = ({ id, children, className = '' }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.1 });
    return (
        <section id={id} ref={ref} className={`py-20 lg:py-32 ${className}`}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            >
                {children}
            </motion.div>
        </section>
    );
};

const Card = ({ icon: Icon, title, description, index }) => {
    const cardVariants = {
        hidden: { opacity: 0, y: 40, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1 }
    };
    return (
        <motion.div
            variants={cardVariants}
            transition={{ duration: 0.5, delay: index * 0.1, ease: "circOut" }}
            whileHover={{ y: -8 }}
            className="relative rounded-2xl p-px transition-shadow duration-300 group bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-emerald-500/20"
        >
            <div className="relative bg-slate-50 rounded-[15px] p-8 h-full text-center">
                <motion.div whileHover={{ scale: 1.15, rotate: -5 }} className="flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-6 mx-auto shadow-md transition-colors duration-300">
                    <Icon className="w-8 h-8 text-blue-600 transition-transform duration-300" />
                </motion.div>
                <h3 className="font-heading text-xl font-semibold text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{description}</p>
            </div>
        </motion.div>
    );
};

// PORTFOLIO SECTION COMPONENTS
// =================================================================================
const Navigation = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
    useEffect(() => {
      const handleScroll = () => setIsScrolled(window.scrollY > 20);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);
  
    const scrollToSection = (sectionId) => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    };
  
    const navLinks = [
      { id: 'certifications', label: 'Certifications' },
      { id: 'expertise', label: 'Expertise' },
      { id: 'projects', label: 'Projects' },
      { id: 'why-work-with-me', label: 'Why Me?' },
    ];
  
    return (
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || isMobileMenuOpen ? 'bg-white/80 backdrop-blur-lg shadow-md' : 'bg-transparent text-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="font-heading text-2xl font-bold cursor-pointer"
              onClick={() => scrollToSection('hero')}
            >
              <span className={cn('text-gradient', !isScrolled && !isMobileMenuOpen && 'text-white')}>Pradeep</span>
            </motion.div>
  
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`font-medium transition-colors ${isScrolled || isMobileMenuOpen ? 'text-slate-600 hover:text-blue-600' : 'hover:text-cyan-300'}`}
                >
                  {link.label}
                </button>
              ))}
              <Button onClick={() => scrollToSection('contact')} className="btn-primary-gradient text-white font-semibold px-6 rounded-full">
                Let's Connect
              </Button>
            </div>
  
            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={cn("hover:text-blue-600", isScrolled || isMobileMenuOpen ? "text-slate-700" : "text-white")}>
                {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>
            </div>
          </div>
  
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="md:hidden pb-4"
            >
              <div className="flex flex-col space-y-4 pt-2">
                {navLinks.map((link) => (
                  <button key={link.id} onClick={() => scrollToSection(link.id)} className="font-medium text-slate-600 hover:text-blue-600 text-left py-2">
                    {link.label}
                  </button>
                ))}
                <Button onClick={() => scrollToSection('contact')} className="btn-primary-gradient text-white font-semibold px-6 py-3 rounded-full w-full mt-2">
                  Let's Connect
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>
    );
};

const HeroSection = () => {
    const scrollToContact = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    return (
        <section id="hero" className="relative min-h-screen flex items-center justify-center bg-slate-900 text-white overflow-hidden pt-20">
            <div className="absolute inset-0 bg-grid-slate-100/10 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
            <div className="absolute inset-0 z-0">
                <motion.div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-gradient-to-r from-blue-500/50 to-purple-500/50 rounded-full blur-3xl" animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} />
                <motion.div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-gradient-to-r from-cyan-400/50 to-emerald-400/50 rounded-full blur-3xl" animate={{ rotate: -360 }} transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}/>
            </div>
            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
                    <div className="flex items-center justify-center gap-2 font-semibold text-cyan-300 uppercase tracking-wider mb-4">
                        <Award className="w-5 h-5" /><span>Multi-Certified SAP & Cloud Expert</span>
                    </div>
                    <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white mt-4 mb-6 leading-tight">
                        Architecting the Future of Your Business with SAP B1
                    </h1>
                    <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto">I build and integrate robust ERP systems on-premise and in the cloud that drive efficiency, automation, and growth.</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={scrollToContact} size="lg" className="bg-white text-blue-600 font-bold px-8 py-4 text-lg rounded-full hover:bg-slate-100 transition-transform hover:scale-105 shadow-lg">
                        Book a Free Consultation
                    </Button>
                    <Button onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })} size="lg" variant="outline" className="font-semibold px-8 py-4 text-lg rounded-full border-2 border-white/20 text-white hover:bg-white/10 bg-white/5 backdrop-blur-sm">
                        See My Impact
                    </Button>
                </motion.div>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1 }} className="absolute bottom-10 left-1/2 -translate-x-1/2">
                <a href="#certifications" className="flex flex-col items-center text-slate-400 hover:text-white transition-colors">
                    <span className="text-sm">Explore My Work</span><ArrowDown className="w-6 h-6 animate-bounce mt-1" />
                </a>
            </motion.div>
        </section>
    );
};

const CertificationsSection = () => {
    const certifications = [
        { icon: Award, title: "SAP Business One Consultant", issuer: "SAP Certified" },
        { icon: Cloud, title: "AWS Cloud Practitioner", issuer: "Amazon Web Services" },
        { icon: Settings, title: "Boyum IT B1UP Certified", issuer: "Boyum IT Solutions" },
        { icon: Warehouse, title: "Produmex WMS Advance Consultant", issuer: "Produmex" }
    ];
  
    return (
        <Section id="certifications" className="bg-slate-50 section-bg-pattern">
            <div className="text-center">
                <h2 className="font-heading text-3xl lg:text-4xl font-bold text-slate-900">My Certifications</h2>
                <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">Industry-recognized credentials that validate my expertise and commitment to excellence.</p>
            </div>
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ staggerChildren: 0.1 }}
                className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
                {certifications.map((cert, index) => <Card key={index} icon={cert.icon} title={cert.title} description={cert.issuer} index={index} />)}
            </motion.div>
        </Section>
    );
};
  
const ExpertiseSection = () => {
    const expertiseAreas = [
        { icon: Layers, title: "ERP Implementation", description: "15+ successful SAP B1 implementations and 5 migrations from SQL to HANA." },
        { icon: Database, title: "Database Mastery", description: "Deep expertise in HANA and SQL for performance tuning and scalable solutions." },
        { icon: Settings, title: "Boyum IT Customization", description: "Certified in B1UP to design complex macros and dynamic automations." },
        { icon: GitMerge, title: "Seamless Integrations", description: "Expert in connecting SAP B1 with Salesforce, Shopify, and more using BPA." },
        { icon: Warehouse, title: "Advanced WMS Solutions", description: "Implemented Produmex WMS for Packaging, Pharma, and F&B industries." },
    ];
    return (
        <Section id="expertise" className="bg-white">
            <div className="text-center">
                <h2 className="font-heading text-3xl lg:text-4xl font-bold text-slate-900">Core Expertise</h2>
                <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">A decade of delivering high-impact SAP Business One solutions across diverse industries.</p>
            </div>
            <div className="mt-16 relative">
                 <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-slate-200" aria-hidden="true"></div>
                {expertiseAreas.map((item, index) => (
                     <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.6 }}
                        className="relative flex items-start md:grid md:grid-cols-2 gap-6 mb-12"
                     >
                        <div className={`p-6 bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/60 ${index % 2 === 0 ? 'md:col-start-1 md:text-right' : 'md:col-start-2 md:text-left'}`}>
                            <h3 className="font-heading text-xl font-semibold text-slate-800 mb-2">{item.title}</h3>
                            <p className="text-slate-600 leading-relaxed">{item.description}</p>
                        </div>
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 md:left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-slate-50">
                            <item.icon className="w-7 h-7 text-blue-600" />
                        </div>
                     </motion.div>
                ))}
            </div>
        </Section>
    );
};

const SkillTag = ({ skill, index }) => (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { delay: index * 0.05 } }
      }}
      whileHover={{ scale: 1.1, color: '#2563eb', backgroundColor: '#eff6ff' }}
      className="flex items-center bg-white rounded-full px-5 py-3 shadow-md border border-slate-200/80 cursor-pointer"
    >
      <skill.icon className="w-5 h-5 text-blue-500 mr-3" />
      <span className="font-medium text-slate-700">{skill.name}</span>
    </motion.div>
);

const SkillsSection = () => {
    const skills = [
        { name: "SAP Business One", icon: Settings }, { name: "HANA & SQL", icon: Database }, { name: "AWS Cloud", icon: Cloud }, { name: "Boyum IT B1UP", icon: Settings },
        { name: "Produmex WMS", icon: Settings }, { name: "BPA by Codeless Platforms", icon: Settings }, { name: "Node.js", icon: Server }, { name: "React", icon: Code },
        { name: "JavaScript", icon: Code }, { name: "RESTful API & ODATA", icon: Share2 }, { name: "Crystal Reports", icon: BarChart2 }, { name: "Power BI", icon: BarChart2 },
    ];
    return (
        <Section id="skills" className="bg-slate-50 section-bg-pattern">
            <div className="text-center">
                <h2 className="font-heading text-3xl lg:text-4xl font-bold text-slate-900">Technical Skills & Platforms</h2>
                <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">A comprehensive toolset for building scalable enterprise solutions.</p>
            </div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-16 max-w-5xl mx-auto flex flex-wrap justify-center gap-4">
                {skills.map((skill, index) => <SkillTag key={index} skill={skill} index={index} />)}
            </motion.div>
        </Section>
    );
};

const ProjectCard = ({ project, index }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [10, -10]);
    const rotateY = useTransform(x, [-100, 100], [-10, 10]);

    function handleMouse(event) {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(event.clientX - rect.left - rect.width / 2);
        y.set(event.clientY - rect.top - rect.height / 2);
    }
    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    const cardVariants = {
        hidden: { opacity: 0, y: 40, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, delay: index * 0.1, ease: "circOut" } }
    };

    return (
        <motion.div
            ref={ref}
            variants={cardVariants}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouse}
            onMouseLeave={handleMouseLeave}
            className="group relative bg-slate-50/80 backdrop-blur-lg rounded-2xl p-px transition-all duration-300 shadow-lg"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/50 via-cyan-500/50 to-emerald-500/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-slate-50/80 rounded-[15px] p-8 h-full flex flex-col">
                <div style={{ transform: "translateZ(20px)" }}>
                    <div className="flex items-center justify-center w-14 h-14 bg-white rounded-xl mb-6 shadow-md"><project.icon className="w-7 h-7 text-blue-600" /></div>
                    <h3 className="font-heading text-xl font-semibold text-slate-800 mb-3">{project.title}</h3>
                    <p className="text-slate-600 leading-relaxed mb-4 flex-grow">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {project.tech.map(t => <span key={t} className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded">{t}</span>)}
                    </div>
                    <a href="#" className="font-semibold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center group/link">
                        View Project <ArrowRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
                    </a>
                </div>
            </div>
        </motion.div>
    );
};

const ProjectsSection = () => {
    const projects = [
        { icon: MessageCircle, title: "WhatsApp Add-on for SAP B1", description: "Enables automated PDF sharing of key documents directly from SAP Business One.", tech: ["SAP B1 SDK", ".NET", "WhatsApp API"] },
        { icon: BrainCircuit, title: "SAP Business One GPT", description: "AI-powered query tool integrated with SAP B1 and OpenAI for simplified data retrieval.", tech: ["React", "Node.js", "OpenAI API"] },
        { icon: Users, title: "Vendor Portal", description: "Streamlined supplier management portal to reduce manual efforts and administrative overhead.", tech: ["React", "Node.js", "HANA"] },
        { icon: Briefcase, title: "MS Teams Integration", description: "Integrated SAP B1 with Microsoft Teams for seamless Purchase Order approvals.", tech: ["BPA", "MS Graph API", "SAP B1"] },
        { icon: Cloud, title: "SaaS Integration Platform", description: "SaaS application to sync SAP OPPS data with SAP Business One in real-time.", tech: ["AWS Lambda", "Node.js", "API Gateway"] },
    ];
    return (
        <Section id="projects" className="bg-white">
            <div className="text-center">
                <h2 className="font-heading text-3xl lg:text-4xl font-bold text-slate-900">Notable Projects</h2>
                <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">Innovative solutions that solve real-world business challenges.</p>
            </div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8" style={{ perspective: "1000px" }}>
                {projects.map((project, index) => <ProjectCard key={index} project={project} index={index} />)}
            </motion.div>
        </Section>
    );
};

const WhyWorkWithMeSection = () => {
    const values = [
        { icon: Target, title: "Business-Focused Solutions", description: "I solve your core business challenges to ensure technology serves strategic goals." },
        { icon: Zap, title: "Proven & Efficient Process", description: "My refined methodology minimizes disruption and accelerates your time-to-value." },
        { icon: BrainCircuit, title: "Innovative Integration Expert", description: "I build custom, forward-thinking integrations that future-proof your business." },
        { icon: Users, title: "A True Partner", description: "I work as an extension of your team, committed to ensuring your project's success." }
    ];

    const [activeCard, setActiveCard] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveCard(prev => (prev + 1) % values.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [values.length]);

    return (
      <Section id="why-work-with-me" className="bg-slate-50 section-bg-pattern">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
                <h2 className="font-heading text-3xl lg:text-4xl font-bold text-slate-900">More Than a Developer— A Strategic Partner</h2>
                <p className="mt-4 text-lg text-slate-600 max-w-xl">
                    I combine deep technical expertise with a strategic, client-focused approach. My goal is to deliver solutions that not only work flawlessly but also create lasting business value and give you a competitive edge.
                </p>
            </div>
            <div className="relative h-80">
                <AnimatePresence>
                    {values.map((value, index) => (
                        index === activeCard && (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-0 flex items-start gap-6 p-6 bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/60"
                            >
                                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mt-1"><value.icon className="w-6 h-6 text-blue-600" /></div>
                                <div>
                                    <h3 className="font-heading text-xl font-semibold text-slate-800 mb-2">{value.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">{value.description}</p>
                                </div>
                            </motion.div>
                        )
                    ))}
                </AnimatePresence>
            </div>
        </div>
      </Section>
    );
};

const ClientGrowthSection = () => {
    const scrollToContact = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    return (
      <section id="client-growth" className="py-20 lg:py-28 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100/10 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold">Ready to Elevate Your Business Operations?</h2>
            <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">Stop letting inefficient systems hold you back. Let's build a powerful, integrated SAP B1 environment that scales with your ambition and drives real, measurable growth.</p>
            <div className="mt-10">
                <Button onClick={scrollToContact} size="lg" className="bg-white text-blue-600 font-bold px-10 py-4 text-lg rounded-full hover:bg-slate-100 transition-transform hover:scale-105 shadow-xl">
                    Start Your Transformation <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </div>
      </section>
    );
};

const ContactSection = () => {
    useEffect(() => {
        // This is a placeholder for a real form integration like HubSpot, Tally, etc.
        // In a real scenario, you'd load the respective form script here.
        console.log("Contact form script would be loaded here.");
    }, []);

    return (
      <Section id="contact" className="bg-white">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
                 <h2 className="font-heading text-3xl lg:text-4xl font-bold text-slate-900">Get In Touch</h2>
                <p className="mt-4 text-lg text-slate-600 max-w-xl">
                    Have a project in mind or need expert advice? Fill out the form, or reach out directly. I'm looking forward to hearing from you.
                </p>
                <div className="mt-8 space-y-4">
                    <a href="mailto:example@email.com" className="flex items-center gap-4 group">
                        <Mail className="w-6 h-6 text-blue-600" />
                        <span className="font-medium text-slate-700 group-hover:text-blue-600">example@email.com</span>
                    </a>
                    <a href="#" className="flex items-center gap-4 group">
                        <Linkedin className="w-6 h-6 text-blue-600" />
                        <span className="font-medium text-slate-700 group-hover:text-blue-600">linkedin.com/in/your-profile</span>
                    </a>
                </div>
            </div>
            <div className="bg-slate-50/70 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-slate-200/60">
               {/* This is a placeholder for your form. */}
               <form className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                        <input type="text" id="name" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
                        <input type="email" id="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-slate-700">Message</label>
                        <textarea id="message" rows="4" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"></textarea>
                    </div>
                    <Button type="submit" className="w-full btn-primary-gradient text-white">Send Message</Button>
                </form>
            </div>
        </div>
      </Section>
    );
};

const Footer = () => {
    const { toast } = useToast();
    const currentYear = new Date().getFullYear();
    const handleSocialClick = (platform) => {
        toast({ title: `Let's connect on ${platform}!`, description: "This is a demo. In a real app, this would open a new tab." });
    };
    const socialLinks = [ { icon: Linkedin, name: 'LinkedIn' }, { icon: Github, name: 'GitHub' }, { icon: Mail, name: 'Email' } ];
    return (
      <footer className="bg-slate-900 border-t border-slate-200/10 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-center md:text-left">&copy; {currentYear} Pradeep. All rights reserved.</p>
                <div className="flex space-x-6">
                    {socialLinks.map((social) => (
                        <motion.button whileHover={{ scale: 1.2, rotate: 5 }} key={social.name} onClick={() => handleSocialClick(social.name)} className="hover:text-white transition-colors" aria-label={`Connect on ${social.name}`}>
                            <social.icon className="w-6 h-6" />
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
      </footer>
    );
};


const BackToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        const toggleVisibility = () => window.scrollY > 300 ? setIsVisible(true) : setIsVisible(false);
        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    return (
        <motion.div className="fixed bottom-8 right-8 z-50" initial={{ opacity: 0, scale: 0 }} animate={isVisible ? { opacity: 1, scale: 1 } : {}} exit={{ opacity: 0, scale: 0 }}>
            <Button onClick={scrollToTop} size="icon" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg w-12 h-12">
                <ArrowUp className="h-6 w-6" />
            </Button>
        </motion.div>
    );
};

const CursorFollower = () => {
    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);
    const springConfig = { damping: 25, stiffness: 500 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX - 16);
            mouseY.set(e.clientY - 16);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    return <motion.div className="fixed top-0 left-0 w-8 h-8 bg-blue-400/30 rounded-full pointer-events-none z-[100] hidden md:block" style={{ x: springX, y: springY }} />;
}


// MAIN APP COMPONENT
// =================================================================================

function LazySection({ children, className="" }) {
    const [ref, isOnScreen] = useOnScreen({ threshold: 0.1, rootMargin: "-100px" });
    return <div ref={ref} className={className}>{isOnScreen ? children : <div className="h-[60vh]" />}</div>;
}

function App() {
  return (
    <ToastProvider>
        <CursorFollower />
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
            <Navigation />
            <main>
                <HeroSection />
                <LazySection><CertificationsSection /></LazySection>
                <LazySection><ExpertiseSection /></LazySection>
                <LazySection><SkillsSection /></LazySection>
                <LazySection><ProjectsSection /></LazySection>
                <LazySection><WhyWorkWithMeSection /></LazySection>
                <ClientGrowthSection />
                <LazySection><ContactSection /></LazySection>
                <Footer />
            </main>
            <Toaster />
            <BackToTopButton />
        </div>
    </ToastProvider>
  );
}

export default App;