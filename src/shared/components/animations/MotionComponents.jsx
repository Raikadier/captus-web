import React from 'react';
import { motion as Motion } from 'framer-motion';

export const FadeIn = ({ children, delay = 0, duration = 0.5, className = '' }) => {
    return (
        <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, delay, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </Motion.div>
    );
};

export const StaggerContainer = ({ children, staggerDelay = 0.1, className = '' }) => {
    return (
        <Motion.div
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
        </Motion.div>
    );
};

export const StaggerItem = ({ children, className = '' }) => {
    return (
        <Motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
            }}
            className={className}
        >
            {children}
        </Motion.div>
    );
};
