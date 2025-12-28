import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

function SortableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="p-2 bg-gray-100 rounded mb-2 cursor-grab">
      {children}
    </div>
  );
}

function CustomNode({ data }) {
  const { label, level, sections, onSectionsChange } = data;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = sections.indexOf(active.id);
      const newIndex = sections.indexOf(over.id);
      onSectionsChange(arrayMove(sections, oldIndex, newIndex));
    }
  };

  return (
    <div className="react-flow__node-custom p-4 rounded shadow-md w-48">
      <Handle type="target" position={Position.Top} />
      <div className="font-bold mb-2">{label} (Level {level})</div>
      {sections && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections} strategy={verticalListSortingStrategy}>
            {sections.map((section) => (
              <SortableItem key={section} id={section}>
                {section}
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default CustomNode;