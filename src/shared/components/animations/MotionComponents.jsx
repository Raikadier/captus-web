import React from 'react';
import { motion } from 'framer-motion';

export const FadeIn = ({ children, delay = 0, duration = 0.5, className = '' }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, delay, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const StaggerContainer = ({ children, staggerDelay = 0.1, className = '' }) => {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: staggerDelay
                    }
                }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const StaggerItem = ({ children, className = '' }) => {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};
