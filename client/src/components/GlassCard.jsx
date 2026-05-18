/**
 * GlassCard
 * --------------------------------------------
 * The signature Apple-inspired frosted-glass surface used everywhere.
 */

import { motion } from 'framer-motion';
import { clsx } from '../utils/cx';

export default function GlassCard({
  children,
  className = '',
  hover = true,
  as: Tag = 'div',
  ...rest
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -2 } : undefined}
      className={clsx('glass-card', hover && 'glass-card-hover', 'p-6', className)}
      {...rest}
    >
      <Tag>{children}</Tag>
    </motion.div>
  );
}
