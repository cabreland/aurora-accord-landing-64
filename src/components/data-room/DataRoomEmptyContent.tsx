import React from 'react';
import { FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface DataRoomEmptyContentProps {
  folderName: string;
}

export const DataRoomEmptyContent: React.FC<DataRoomEmptyContentProps> = ({
  folderName,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-8"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6"
      >
        <FolderOpen className="h-10 w-10 text-muted-foreground" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-semibold text-foreground mb-2"
      >
        No Documents Yet
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground text-center max-w-md"
      >
        No documents in{' '}
        <span className="font-medium text-foreground">{folderName}</span> yet.
        Use the upload zone above to add files.
      </motion.p>
    </motion.div>
  );
};
