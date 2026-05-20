/**
 * @file components/sypho-med/demo/views/pipeline-view.tsx
 * @description Interactive Kanban-style CRM pipeline with drag-and-drop.
 */

'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import { useDemo } from '@/components/sypho-med/demo/demo-context';
import { PIPELINE_COLUMNS } from '@/lib/sypho-med/demo/clinic-presets';
import type { PipelineCard, PipelineColumnId } from '@/lib/sypho-med/demo/types';

/**
 * CRM pipeline board — cards move between columns via drag or tap.
 */
export function PipelineView() {
  const { preset, pipelineCards, movePipelineCard } = useDemo();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<PipelineColumnId | null>(null);

  const cardsByColumn = useCallback(
    (columnId: PipelineColumnId) =>
      pipelineCards.filter((c) => c.columnId === columnId),
    [pipelineCards],
  );

  const handleDragStart = (cardId: string) => {
    setDraggingId(cardId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDropTarget(null);
  };

  const handleDrop = (columnId: PipelineColumnId) => {
    if (draggingId) {
      movePipelineCard(draggingId, columnId);
    }
    handleDragEnd();
  };

  return (
    <motion.div
      key={preset.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-lg font-medium text-white">CRM Pipeline</h2>
        <p className="text-sm text-silver-500 mt-1">
          Drag cards between stages — {preset.city} clinic
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory -mx-1 px-1">
        {PIPELINE_COLUMNS.map((column) => {
          const cards = cardsByColumn(column.id);
          const isDrop = dropTarget === column.id;

          return (
            <motion.div
              key={column.id}
              layout
              onDragOver={(e) => {
                e.preventDefault();
                setDropTarget(column.id);
              }}
              onDragLeave={() => setDropTarget(null)}
              onDrop={() => handleDrop(column.id)}
              className={[
                'flex-shrink-0 w-[min(100%,280px)] snap-center rounded-2xl p-3 min-h-[420px] transition-colors',
                'bg-gradient-to-b border',
                column.accent,
                isDrop
                  ? 'border-neon-400/40 bg-neon-500/5'
                  : 'border-white/[0.06] bg-obsidian-100/40',
              ].join(' ')}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-medium text-silver-300 uppercase tracking-wider">
                  {column.title}
                </h3>
                <span className="text-[10px] text-silver-500 tabular-nums bg-obsidian-200/80 px-2 py-0.5 rounded-full">
                  {cards.length}
                </span>
              </div>

              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {cards.map((card) => (
                    <PipelineCardItem
                      key={card.id}
                      card={card}
                      isDragging={draggingId === card.id}
                      onDragStart={() => handleDragStart(card.id)}
                      onDragEnd={handleDragEnd}
                      onMoveNext={() => {
                        const order: PipelineColumnId[] = [
                          'lead',
                          'qualified',
                          'scheduled',
                          'completed',
                        ];
                        const idx = order.indexOf(card.columnId);
                        if (idx < order.length - 1) {
                          movePipelineCard(card.id, order[idx + 1] as PipelineColumnId);
                        }
                      }}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

interface PipelineCardItemProps {
  card: PipelineCard;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onMoveNext: () => void;
}

function PipelineCardItem({
  card,
  isDragging,
  onDragStart,
  onDragEnd,
  onMoveNext,
}: PipelineCardItemProps) {
  return (
    <motion.div
      layout
      layoutId={card.id}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onMoveNext}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: isDragging ? 0.5 : 1,
        scale: isDragging ? 1.02 : 1,
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.01 }}
      className={[
        'group cursor-grab active:cursor-grabbing rounded-xl p-3',
        'med-glass border border-white/[0.08]',
        'hover:border-neon-400/25 transition-colors',
        card.priority === 'high' ? 'ring-1 ring-neon-400/20' : '',
      ].join(' ')}
    >
      <div className="flex items-start gap-2">
        <GripVertical
          className="w-3.5 h-3.5 text-silver-600 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white truncate">{card.patientName}</p>
          <p className="text-xs text-silver-500 mt-0.5 truncate">{card.service}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-neon-400/90 tabular-nums">{card.valueLabel}</span>
            {card.priority === 'high' && (
              <span className="text-[9px] uppercase tracking-wider text-neon-300/80">
                Priority
              </span>
            )}
          </div>
          <p className="text-[10px] text-silver-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Tap to advance · drag to move
          </p>
        </div>
      </div>
    </motion.div>
  );
}
